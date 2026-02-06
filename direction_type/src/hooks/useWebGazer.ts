import { useState, useEffect, useCallback, useRef } from "react";

export interface GazePosition {
  x: number;
  y: number;
}

export interface GazeZone {
  row: "up" | "middle" | "down";
  col: "left" | "center" | "right";
}

export interface HeadPosition {
  x: number;
  y: number;
  offset: { x: number; y: number };
}

const SMOOTHING_BUFFER_SIZE = 10; // Number of samples to average
const ZONE_STABILITY_THRESHOLD = 5; // Number of consistent readings before switching zones

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

  const calculateZone = useCallback((x: number, y: number): GazeZone => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let col: "left" | "center" | "right";
    if (x < width / 3) col = "left";
    else if (x < (2 * width) / 3) col = "center";
    else col = "right";

    let row: "up" | "middle" | "down";
    if (y < height / 3) row = "up";
    else if (y < (2 * height) / 3) row = "middle";
    else row = "down";

    return { row, col };
  }, []);

  const smoothPosition = useCallback((newPos: GazePosition): GazePosition => {
    const buffer = positionBufferRef.current;
    buffer.push(newPos);

    if (buffer.length > SMOOTHING_BUFFER_SIZE) {
      buffer.shift();
    }

    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;

    buffer.forEach((pos, index) => {
      const weight = index + 1;
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

  const initialize = useCallback(async () => {
    if (webgazerRef.current) return;

    setIsLoading(true);
    positionBufferRef.current = [];
    zoneCounterRef.current = { zone: null, count: 0 };
    currentStableZoneRef.current = null;
    faceAnchorRef.current = null;

    try {
      const webgazerModule = await import("webgazer");
      const webgazer = (webgazerModule as any).default || webgazerModule;
      webgazerRef.current = webgazer;

      try {
        webgazer.saveDataAcrossSessions(true);
      } catch (e) {
        console.warn("Could not set local persistence:", e);
      }

      await webgazer
        .setGazeListener((data: { x: number; y: number } | null) => {
          if (data) {
            // Head tracking distance check
            try {
              const tracker = webgazer.getTracker();
              const points = tracker.getCurrentPosition();
              if (points && points[62]) {
                const currentNose = { x: points[62][0], y: points[62][1] };

                if (!faceAnchorRef.current) {
                  faceAnchorRef.current = currentNose;
                }

                const offset = {
                  x: currentNose.x - faceAnchorRef.current.x,
                  y: currentNose.y - faceAnchorRef.current.y
                };

                setHeadPosition({
                  x: currentNose.x,
                  y: currentNose.y,
                  offset
                });
              }
            } catch (e) { /* ignore */ }

            // Apply smoothing
            const smoothedPos = smoothPosition({ x: data.x, y: data.y });
            setGazePosition(smoothedPos);

            // Calculate and stabilize zone
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
  }, [calculateZone, smoothPosition, stabilizeZone]);

  const stop = useCallback(() => {
    if (webgazerRef.current) {
      webgazerRef.current.end();
      webgazerRef.current = null;
      setIsTracking(false);
      setGazePosition(null);
      setGazeZone(null);
      setHeadPosition(null);
      faceAnchorRef.current = null;
      positionBufferRef.current = [];
      zoneCounterRef.current = { zone: null, count: 0 };
      currentStableZoneRef.current = null;
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

  const recordClick = useCallback((x: number, y: number) => {
    if (webgazerRef.current) {
      webgazerRef.current.recordScreenPosition(x, y, "click");
    }
  }, []);

  const setFaceAnchor = useCallback(() => {
    if (webgazerRef.current) {
      const tracker = webgazerRef.current.getTracker();
      const points = tracker.getCurrentPosition();
      if (points && points[62]) {
        faceAnchorRef.current = { x: points[62][0], y: points[62][1] };
      }
    }
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
  };
};