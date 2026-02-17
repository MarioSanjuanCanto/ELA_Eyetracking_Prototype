import { useState, useCallback, useEffect, useRef } from "react";
import { CalibrationPoint } from "./CalibrationPoint";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";

interface CalibrationScreenProps {
  onComplete: () => void;
  onRecordClick: (x: number, y: number) => void;
  setFaceAnchor: () => void;
  isLoading: boolean;
}

const calibrationPoints = [
  { x: 10, y: 20 },
  { x: 50, y: 20 },
  { x: 90, y: 20 },
  { x: 10, y: 50 },
  { x: 50, y: 50 },
  { x: 90, y: 50 },
  { x: 10, y: 80 },
  { x: 50, y: 80 },
  { x: 90, y: 80 },
];

const DWELL_TIME = 2000; // 2 seconds

export const CalibrationScreen = ({
  onComplete,
  onRecordClick,
  setFaceAnchor,
  isLoading,
}: CalibrationScreenProps) => {
  const [clickedPoints, setClickedPoints] = useState<number[]>([]);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [progress, setProgress] = useState(0);

  const handlePointClick = useCallback(
    (index: number, x: number, y: number) => {
      const screenX = (x / 100) * window.innerWidth;
      const screenY = (y / 100) * window.innerHeight;

      // Reset progress BEFORE recording/advancing
      setProgress(0);

      onRecordClick(screenX, screenY);
      setClickedPoints((prev) => [...prev, index]);

      if (index === calibrationPoints.length - 1) {
        try {
          setFaceAnchor();
        } catch (e) {
          console.warn("Failed to set face anchor, transitioning anyway:", e);
        }
        console.log("LAST POINT CLICKED: Triggering onComplete...");
        // Minor delay to let the click registration finish
        setTimeout(onComplete, 200);
      } else {
        setCurrentPoint(index + 1);
      }
    },
    [onComplete, onRecordClick, setFaceAnchor]
  );

  useEffect(() => {
    if (isLoading) return;

    const interval = 50; // Quicker update for smoother animation
    const increment = (interval / DWELL_TIME) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentPoint, isLoading]);

  useEffect(() => {
    if (progress >= 100) {
      const point = calibrationPoints[currentPoint];
      if (point) {
        handlePointClick(currentPoint, point.x, point.y);
      }
    }
  }, [progress, currentPoint, handlePointClick]);

  const totalProgress = (clickedPoints.length / calibrationPoints.length) * 100;

  return (
    <div className="fixed inset-0 bg-background grid-bg flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Calibration</h1>
            <p className="text-sm text-muted-foreground">
              Keep looking at the point until the ring completes
            </p>
          </div>
        </div>

        {/* Total Progress */}
        <div className="flex items-center gap-3">
          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            {clickedPoints.length}/{calibrationPoints.length}
          </span>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-foreground font-medium">Initializing camera...</p>
          </div>
        </div>
      )}

      {/* Calibration points */}
      {calibrationPoints.map((point, index) => (
        <CalibrationPoint
          key={index}
          x={point.x}
          y={point.y}
          onClick={() => handlePointClick(index, point.x, point.y)}
          isClicked={clickedPoints.includes(index)}
          isActive={index === currentPoint && !isLoading}
          progress={index === currentPoint ? progress : 0}
        />
      ))}

      {/* Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg px-4 py-3">
          <p className="text-sm text-muted-foreground text-center">
            {isLoading
              ? "Please allow camera access when prompted"
              : `Look at the glowing point`}
          </p>
        </div>
      </div>

      {/* Decorative Branding */}
      <img
        src="/VRAIN_Logo.png"
        alt="VRAIN"
        className="absolute bottom-4 left-4 h-6 w-auto opacity-20 hover:opacity-100 transition-opacity"
      />
      <img
        src="/vertexlit_logo.png"
        alt="VertexLit"
        className="absolute bottom-4 right-4 h-6 w-auto opacity-20 hover:opacity-100 transition-opacity"
      />
    </div>
  );
};