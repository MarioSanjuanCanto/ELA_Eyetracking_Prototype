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
    <div className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.35)] backdrop-blur flex">
      {/* Full-screen white panel */}
      <div className="relative w-full h-full bg-white rounded-none md:rounded-[32px] md:m-6 shadow-2xl overflow-hidden">
        {/* Progress bar */}
        <div className="absolute top-4 left-10 right-10 h-1 rounded-full bg-[#e5e7eb] overflow-hidden">
          <div
            className="h-full bg-[#3b82f6] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="absolute top-8 left-10 right-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#111827]">Calibración</h2>
            <p className="text-sm text-[#6b7280]">
              Haz clic en el punto {requiredClicks} veces mientras lo miras
            </p>
            <p className="text-xs text-[#9ca3af] mt-1">
              Punto {currentPoint + 1} de {CALIBRATION_POINTS.length} • Pulsa ESC para cancelar
            </p>
          </div>
        </div>

        {/* Calibration area taking almost the whole screen */}
        <div className="absolute inset-x-10 top-28 bottom-16">
          <div className="w-full h-full rounded-3xl bg-[#f3f4f6] border border-[#e5e7eb] relative overflow-hidden">
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
                    'w-16 h-16 rounded-full border-2 border-[#93c5fd] bg-white/60 flex items-center justify-center',
                    'animate-pulse'
                  )}
                >
                  {/* Inner dot */}
                  <div
                    className="w-6 h-6 rounded-full bg-[#3b82f6] transition-transform duration-200 hover:scale-125"
                    style={{
                      boxShadow:
                        '0 0 20px rgba(59,130,246,0.6), 0 0 40px rgba(59,130,246,0.3)',
                    }}
                  />
                </div>

                {/* Click counter */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
                  {Array.from({ length: requiredClicks }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-200',
                        i < clicks ? 'bg-[#3b82f6]' : 'bg-[#d1d5db]'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalibrationOverlay;
