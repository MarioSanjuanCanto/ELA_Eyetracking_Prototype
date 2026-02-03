import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CalibrationOverlayProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CALIBRATION_POINTS = [
  { x: 10, y: 10 },
  { x: 50, y: 10 },
  { x: 90, y: 10 },
  { x: 10, y: 50 },
  { x: 50, y: 50 },
  { x: 90, y: 50 },
  { x: 10, y: 90 },
  { x: 50, y: 90 },
  { x: 90, y: 90 },
];

const CalibrationOverlay = ({ onComplete, onCancel }: CalibrationOverlayProps) => {
  const [currentPoint, setCurrentPoint] = useState(0);
  const [clicks, setClicks] = useState(0);
  const requiredClicks = 5;

  const handlePointClick = useCallback(() => {
    const newClicks = clicks + 1;
    setClicks(newClicks);

    if (newClicks >= requiredClicks) {
      if (currentPoint >= CALIBRATION_POINTS.length - 1) {
        onComplete();
      } else {
        setCurrentPoint(currentPoint + 1);
        setClicks(0);
      }
    }
  }, [clicks, currentPoint, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const point = CALIBRATION_POINTS[currentPoint];
  const progress = ((currentPoint * requiredClicks + clicks) / (CALIBRATION_POINTS.length * requiredClicks)) * 100;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Instructions */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 text-center animate-fade-in">
        <h2 className="text-xl font-semibold text-foreground mb-2">Calibration</h2>
        <p className="text-muted-foreground text-sm">
          Click the dot {requiredClicks} times while looking at it • Point {currentPoint + 1} of {CALIBRATION_POINTS.length}
        </p>
        <p className="text-muted-foreground/60 text-xs mt-2">Press ESC to cancel</p>
      </div>

      {/* Calibration point */}
      <div
        className="absolute cursor-pointer transition-all duration-500 ease-out"
        style={{
          left: `${point.x}%`,
          top: `${point.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={handlePointClick}
      >
        <div className="relative">
          {/* Outer ring */}
          <div 
            className={cn(
              "w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center",
              "animate-pulse"
            )}
          >
            {/* Inner dot */}
            <div 
              className={cn(
                "w-6 h-6 rounded-full bg-primary transition-transform duration-200",
                "hover:scale-125"
              )}
              style={{
                boxShadow: '0 0 20px hsl(var(--primary) / 0.6), 0 0 40px hsl(var(--primary) / 0.3)',
              }}
            />
          </div>
          
          {/* Click counter */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
            {Array.from({ length: requiredClicks }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  i < clicks ? "bg-primary" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationOverlay;
