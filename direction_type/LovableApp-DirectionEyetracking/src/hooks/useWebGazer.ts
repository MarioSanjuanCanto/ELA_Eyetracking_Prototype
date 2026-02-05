 import { useState, useEffect, useCallback, useRef } from "react";
 
 export interface GazePosition {
   x: number;
   y: number;
 }
 
 export interface GazeZone {
   row: "up" | "middle" | "down";
   col: "left" | "center" | "right";
 }
 
const SMOOTHING_BUFFER_SIZE = 10; // Number of samples to average
const ZONE_STABILITY_THRESHOLD = 5; // Number of consistent readings before switching zones

 export const useWebGazer = () => {
   const [isLoading, setIsLoading] = useState(false);
   const [isTracking, setIsTracking] = useState(false);
   const [gazePosition, setGazePosition] = useState<GazePosition | null>(null);
   const [gazeZone, setGazeZone] = useState<GazeZone | null>(null);
   const webgazerRef = useRef<typeof import("webgazer") | null>(null);
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
    
    // Keep buffer at fixed size
    if (buffer.length > SMOOTHING_BUFFER_SIZE) {
      buffer.shift();
    }
    
    // Calculate weighted moving average (more recent = higher weight)
    let totalWeight = 0;
    let weightedX = 0;
    let weightedY = 0;
    
    buffer.forEach((pos, index) => {
      const weight = index + 1; // Linear weighting
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
    
    // Check if the raw zone matches the current counting zone
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
    
    // Only update stable zone if we've hit the threshold
    if (counter.count >= ZONE_STABILITY_THRESHOLD) {
      currentStableZoneRef.current = rawZone;
      return rawZone;
    }
    
    // Return the current stable zone (or raw if none yet)
    return currentStable || rawZone;
  }, []);

   const initialize = useCallback(async () => {
     setIsLoading(true);
    // Reset buffers
    positionBufferRef.current = [];
    zoneCounterRef.current = { zone: null, count: 0 };
    currentStableZoneRef.current = null;
    
     try {
       const webgazer = await import("webgazer");
       webgazerRef.current = webgazer.default;
 
       await webgazer.default
         .setGazeListener((data: { x: number; y: number } | null) => {
           if (data) {
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
 
      webgazer.default.showVideoPreview(false).showPredictionPoints(false);
      
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
       setIsTracking(false);
       setGazePosition(null);
       setGazeZone(null);
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
 
   useEffect(() => {
     return () => {
       if (webgazerRef.current) {
         webgazerRef.current.end();
       }
     };
   }, []);
 
   return {
     isLoading,
     isTracking,
     gazePosition,
     gazeZone,
     initialize,
     stop,
     pause,
     resume,
     recordClick,
   };
 };