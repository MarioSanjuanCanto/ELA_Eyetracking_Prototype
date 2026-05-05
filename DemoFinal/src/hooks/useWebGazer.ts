import { useState, useEffect, useCallback, useRef } from "react";

export interface GazePosition {
  x: number;
  y: number;
}

export interface GazeZone {
  row: "up" | "down";
  col: "left" | "center" | "right";
}

export interface HeadPosition {
  x: number;
  y: number;
  offset: { x: number; y: number };
}

// --- Tuning constants ---
const SMOOTHING_BUFFER_SIZE = 12;
const ZONE_STABILITY_THRESHOLD = 6;

// Facemesh landmark indices (468-point model)
// Using midpoint of inner eye corners for stable head position tracking
const FACE_LEFT_EYE_INNER = 133;
const FACE_RIGHT_EYE_INNER = 362;
const FACE_NOSE_TIP = 1;

// Number of clicks recorded per calibration point for richer training data
const CLICKS_PER_CALIBRATION_POINT = 5;

// Head drift: if face center moves > this many px from anchor, we consider it "drifted"
const HEAD_DRIFT_THRESHOLD = 8;

// How many frames the head must stay still before we trigger auto-recalibration
const HEAD_STABLE_FRAMES = 30; // ~1s at 30fps

// How close the face center must be frame-to-frame to count as "still"
const HEAD_STILL_EPSILON = 1.5;

// Compensation factor: Shift gaze per pixel of head movement.
// Positive value = if head moves Right, shift Gaze Right.
const HEAD_COMPENSATION_FACTOR = 4.2; // Aumentado para mayor sensibilidad en bordes

export const useWebGazer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [gazePosition, setGazePosition] = useState<GazePosition | null>(null);
  const [gazeZone, setGazeZone] = useState<GazeZone | null>(null);
  const [headPosition, setHeadPosition] = useState<HeadPosition | null>(null);

  const webgazerRef = useRef<any>(null);
  const faceAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const positionBufferRef = useRef<GazePosition[]>([]);
  const zoneCounterRef = useRef<{ zone: GazeZone | null; count: number }>({
    zone: null,
    count: 0,
  });
  const currentStableZoneRef = useRef<GazeZone | null>(null);

  // Stores the calibration screen positions so we can re-inject them
  const calibrationDataRef = useRef<{ x: number; y: number }[]>([]);

  // Head stability tracking for auto-recalibration
  const headStableRef = useRef({
    lastPos: { x: 0, y: 0 },
    stableCount: 0,
    hasRecalibrated: false, // prevents repeated recalibrations at same position
  });

  const webgazerModuleRef = useRef<any>(null);

  // Preload WebGazer script on mount to reduce wait time
  useEffect(() => {
    const preload = async () => {
      try {
        const module = await import("webgazer");
        webgazerModuleRef.current = (module as any).default || module;
      } catch (e) {
        console.warn("Failed to preload WebGazer:", e);
      }
    };
    preload();
  }, []);

  const calculateZone = useCallback((x: number, y: number): GazeZone => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let col: "left" | "center" | "right";
    if (x < width / 3) col = "left";
    else if (x < (2 * width) / 3) col = "center";
    else col = "right";

    let row: "up" | "down";
    // Split screen vertically in half for 2-row layout
    if (y < height / 2) row = "up";
    else row = "down";

    return { row, col };
  }, []);

  const smoothPosition = useCallback((newPos: GazePosition): GazePosition => {
    const buffer = positionBufferRef.current;
    buffer.push(newPos);

    if (buffer.length > SMOOTHING_BUFFER_SIZE) {
      buffer.shift();
    }

    // Exponential weighted moving average — more recent frames count more
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    buffer.forEach((pos, index) => {
      const weight = Math.pow(1.5, index); // Exponential weighting
      weightedX += pos.x * weight;
      weightedY += pos.y * weight;
      totalWeight += weight;
    });

    return {
      x: weightedX / totalWeight,
      y: weightedY / totalWeight,
    };
  }, []);

  const stabilizeZone = useCallback((rawZone: GazeZone): GazeZone | null => {
    const counter = zoneCounterRef.current;
    const currentStable = currentStableZoneRef.current;

    const isSameZone =
      counter.zone &&
      counter.zone.row === rawZone.row &&
      counter.zone.col === rawZone.col;

    if (isSameZone) {
      counter.count++;
    } else {
      counter.zone = rawZone;
      counter.count = 1;
    }

    if (counter.count >= ZONE_STABILITY_THRESHOLD) {
      currentStableZoneRef.current = rawZone;
      return rawZone;
    }

    return currentStable || rawZone;
  }, []);

  /**
   * Re-injects all stored calibration data points into WebGazer's model.
   * This teaches the regression model the new face position → screen mapping
   * without changing the predicted gaze coordinates at all.
   */
  const reinjectCalibrationData = useCallback(() => {
    const wg = webgazerRef.current;
    if (!wg || calibrationDataRef.current.length === 0) return;

    // Feed each stored calibration point back into the model
    for (const point of calibrationDataRef.current) {
      wg.recordScreenPosition(point.x, point.y, "click");
    }

    // Update the face anchor to the current face center
    try {
      const tracker = wg.getTracker();
      const positions = tracker.getPositions();
      if (positions && positions.length > 0) {
        const leftEye = positions[FACE_LEFT_EYE_INNER];
        const rightEye = positions[FACE_RIGHT_EYE_INNER];
        if (leftEye && rightEye) {
          faceAnchorRef.current = {
            x: (leftEye[0] + rightEye[0]) / 2,
            y: (leftEye[1] + rightEye[1]) / 2,
          };
        }
      }
    } catch (e) { /* ignore */ }

    console.log(
      "Auto head-centering: re-injected",
      calibrationDataRef.current.length,
      "calibration points"
    );
  }, []);

  const initialize = useCallback(async () => {
    if (webgazerRef.current) return;

    setIsLoading(true);
    positionBufferRef.current = [];
    zoneCounterRef.current = { zone: null, count: 0 };
    currentStableZoneRef.current = null;
    faceAnchorRef.current = null;
    calibrationDataRef.current = [];
    headStableRef.current = { lastPos: { x: 0, y: 0 }, stableCount: 0, hasRecalibrated: false };

    try {
      // Use preloaded module if available, otherwise fetch it
      let webgazer = webgazerModuleRef.current;
      if (!webgazer) {
        const webgazerModule = await import("webgazer");
        webgazer = (webgazerModule as any).default || webgazerModule;
        webgazerModuleRef.current = webgazer;
      }

      webgazerRef.current = webgazer;

      try {
        webgazer.saveDataAcrossSessions(true);
      } catch (e) {
        console.warn("Could not set local persistence:", e);
      }

      await webgazer
        .setGazeListener((data: { x: number; y: number } | null) => {
          if (data) {
            let liveOffset = { x: 0, y: 0 };

            // --- Head tracking (TFFaceMesh: getPositions() returns 468 landmarks as [x,y,z] arrays) ---
            try {
              const tracker = webgazer.getTracker();
              const positions = tracker.getPositions();
              if (positions && positions.length > 0) {
                // Use midpoint between inner eye corners for stable head tracking
                const leftEye = positions[FACE_LEFT_EYE_INNER];
                const rightEye = positions[FACE_RIGHT_EYE_INNER];

                if (leftEye && rightEye) {
                  const faceCenter = {
                    x: (leftEye[0] + rightEye[0]) / 2,
                    y: (leftEye[1] + rightEye[1]) / 2,
                  };

                  if (!faceAnchorRef.current) {
                    faceAnchorRef.current = faceCenter;
                  }

                  liveOffset = {
                    x: faceCenter.x - faceAnchorRef.current.x,
                    y: faceCenter.y - faceAnchorRef.current.y,
                  };

                  setHeadPosition({
                    x: faceCenter.x,
                    y: faceCenter.y,
                    offset: liveOffset,
                  });

                  // Stability check for visual feedback
                  const hs = headStableRef.current;
                  const frameDelta = Math.sqrt(
                    (faceCenter.x - hs.lastPos.x) ** 2 +
                    (faceCenter.y - hs.lastPos.y) ** 2
                  );

                  if (frameDelta < HEAD_STILL_EPSILON) {
                    hs.stableCount++;
                    // "Elastic Anchor": El ancla sigue a la cara muy sutilmente si estás quieto
                    // Esto absorbe minidesviaciones sin saltos bruscos.
                    if (faceAnchorRef.current) {
                      faceAnchorRef.current.x = faceAnchorRef.current.x * 0.998 + faceCenter.x * 0.002;
                      faceAnchorRef.current.y = faceAnchorRef.current.y * 0.998 + faceCenter.y * 0.002;
                    }
                  } else {
                    hs.stableCount = 0;
                    hs.hasRecalibrated = false;
                  }
                  hs.lastPos = { ...faceCenter };
                }
              }
            } catch (e) {
              console.warn("Head tracking error:", e);
            }

            // --- Gaze processing (with dynamic head compensation) ---
            const compensatedRaw = {
              x: data.x + (liveOffset.x * HEAD_COMPENSATION_FACTOR),
              y: data.y + (liveOffset.y * HEAD_COMPENSATION_FACTOR)
            };

            const smoothedPos = smoothPosition(compensatedRaw);
            setGazePosition(smoothedPos);

            const rawZone = calculateZone(smoothedPos.x, smoothedPos.y);
            const stableZone = stabilizeZone(rawZone);
            setGazeZone(stableZone);
          }
        })
        .begin();

      webgazer.showVideoPreview(false).showPredictionPoints(false);
      setIsTracking(true);
    } catch (error) {
      console.error("Failed to initialize WebGazer:", error);
    } finally {
      setIsLoading(false);
    }
  }, [calculateZone, smoothPosition, stabilizeZone, reinjectCalibrationData]);

  const stop = useCallback(() => {
    if (webgazerRef.current) {
      try {
        webgazerRef.current.end();
      } catch (e) {
        console.warn("Error stopping WebGazer:", e);
      }
      webgazerRef.current = null;
      setIsTracking(false);
      setGazePosition(null);
      setGazeZone(null);
      setHeadPosition(null);
      faceAnchorRef.current = null;
      positionBufferRef.current = [];
      zoneCounterRef.current = { zone: null, count: 0 };
      currentStableZoneRef.current = null;
      calibrationDataRef.current = [];
    }
  }, []);

  const pause = useCallback(() => {
    if (webgazerRef.current) {
      webgazerRef.current.pause();
      setIsTracking(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (webgazerRef.current) {
      webgazerRef.current.resume();
      setIsTracking(true);
    }
  }, []);

  /**
   * Records a calibration click AND stores it for future re-injection.
   * Fires multiple clicks per point for richer training data.
   */
  const recordClick = useCallback((x: number, y: number) => {
    if (webgazerRef.current) {
      for (let i = 0; i < CLICKS_PER_CALIBRATION_POINT; i++) {
        webgazerRef.current.recordScreenPosition(x, y, "click");
      }
      // Store the point for later re-training
      calibrationDataRef.current.push({ x, y });
    }
  }, []);

  const setFaceAnchor = useCallback(() => {
    if (webgazerRef.current) {
      try {
        const tracker = webgazerRef.current.getTracker();
        const positions = tracker.getPositions();
        if (positions && positions.length > 0) {
          const leftEye = positions[FACE_LEFT_EYE_INNER];
          const rightEye = positions[FACE_RIGHT_EYE_INNER];
          if (leftEye && rightEye) {
            faceAnchorRef.current = {
              x: (leftEye[0] + rightEye[0]) / 2,
              y: (leftEye[1] + rightEye[1]) / 2,
            };
          }
        }
      } catch (e) {
        console.warn("setFaceAnchor error:", e);
      }
    }
  }, []);

  const clearCalibration = useCallback(() => {
    if (webgazerRef.current) {
      try {
        webgazerRef.current.clearData();
      } catch (e) {
        console.warn("Failed to clear webgazer data:", e);
      }
    }
    calibrationDataRef.current = [];
    faceAnchorRef.current = null;
    setHeadPosition(null);
  }, []);

  useEffect(() => {
    return () => {
      // end() removed from here for persistence
    };
  }, []);

  return {
    isLoading,
    isTracking,
    gazePosition,
    gazeZone,
    headPosition,
    initialize,
    stop,
    pause,
    resume,
    recordClick,
    setFaceAnchor,
    clearCalibration,
  };
};