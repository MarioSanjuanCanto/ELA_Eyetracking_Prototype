import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EyeTrackingGridProps {
  gridSize: number;
  isTracking: boolean;
  onCellChange?: (row: number, col: number) => void;
}

const GAZE_BUFFER_SIZE = 10;

const EyeTrackingGrid = ({ gridSize, isTracking, onCellChange }: EyeTrackingGridProps) => {
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const gazeBufferRef = useRef<{ x: number; y: number }[]>([]);

  const handleGazeUpdate = useCallback((data: { x: number; y: number } | null) => {
    if (!data || !gridRef.current || !isTracking) {
      setActiveCell(null);
      gazeBufferRef.current = [];
      return;
    }

    const buffer = gazeBufferRef.current;
    buffer.push({ x: data.x, y: data.y });
    if (buffer.length > GAZE_BUFFER_SIZE) {
      buffer.shift();
    }

    const n = buffer.length;
    const meanX = buffer.reduce((s, p) => s + p.x, 0) / n;
    const meanY = buffer.reduce((s, p) => s + p.y, 0) / n;

    console.log('[Gaze] Last points:', [...buffer]);
    console.log('[Gaze] Average:', { x: meanX, y: meanY });

    const rect = gridRef.current.getBoundingClientRect();
    const cellWidth = rect.width / gridSize;
    const cellHeight = rect.height / gridSize;

    const relativeX = meanX - rect.left;
    const relativeY = meanY - rect.top;

    if (relativeX >= 0 && relativeX < rect.width && relativeY >= 0 && relativeY < rect.height) {
      const col = Math.floor(relativeX / cellWidth);
      const row = Math.floor(relativeY / cellHeight);

      setActiveCell({ row, col });
      onCellChange?.(row, col);
    } else {
      setActiveCell(null);
    }
  }, [gridSize, isTracking, onCellChange]);

  useEffect(() => {
    if (!isTracking) {
      setActiveCell(null);
      gazeBufferRef.current = [];
      return;
    }

    const webgazer = (window as any).webgazer;
    if (webgazer) {
      webgazer.setGazeListener((data: { x: number; y: number } | null) => {
        handleGazeUpdate(data);
      });
    }

    return () => {
      if (webgazer) {
        webgazer.clearGazeListener();
      }
    };
  }, [isTracking, handleGazeUpdate]);

  const getCellLabel = (row: number, col: number) => {
    const letter = String.fromCharCode(65 + col);
    return `${letter}${row + 1}`;
  };

  return (
    <div
      ref={gridRef}
      className="w-full h-full grid gap-1 p-2"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;
        const isActive = activeCell?.row === row && activeCell?.col === col;

        return (
          <div
            key={`${row}-${col}`}
            className={cn(
              "rounded-lg border-2 flex items-center justify-center transition-all duration-200 ease-out",
              isActive
                ? "grid-cell-active animate-pulse-glow"
                : "grid-cell-inactive hover:border-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "font-mono text-sm font-medium transition-all duration-200",
                isActive
                  ? "text-primary glow-text scale-110"
                  : "text-muted-foreground/50"
              )}
            >
              {getCellLabel(row, col)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default EyeTrackingGrid;
