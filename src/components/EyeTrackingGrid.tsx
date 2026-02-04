import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EyeTrackingGridProps {
  gridSize: number;
  isTracking: boolean;
  onCellChange?: (row: number, col: number) => void;
}

const GAZE_BUFFER_SIZE = 15;

type Cell = { row: number; col: number };

const EyeTrackingGrid = ({ gridSize, isTracking, onCellChange }: EyeTrackingGridProps) => {
  const [activeCell, setActiveCell] = useState<Cell | null>(null);
  const [gazePoint, setGazePoint] = useState<{ x: number; y: number } | null>(null); // punto suavizado, normalizado 0-1
  const gridRef = useRef<HTMLDivElement>(null);
  const gazeBufferRef = useRef<{ x: number; y: number }[]>([]);
  const activeCellRef = useRef<Cell | null>(null);
  const gazePointRef = useRef<{ x: number; y: number } | null>(null);

  const commitActiveCell = useCallback(
    (cell: Cell | null) => {
      setActiveCell(cell);
      activeCellRef.current = cell;
      if (cell && onCellChange) {
        onCellChange(cell.row, cell.col);
      }
    },
    [onCellChange]
  );

  // Suaviza el punto de mirada en el tiempo para que no tiemble tanto
  const commitGazePoint = useCallback((normalizedX: number, normalizedY: number) => {
    const prev = gazePointRef.current;

    // Primera muestra: se coloca directamente
    if (!prev) {
      const next = { x: normalizedX, y: normalizedY };
      gazePointRef.current = next;
      setGazePoint(next);
      return;
    }

    // Filtro exponencial simple (low-pass)
    const alpha = 0.25; // cuanto más pequeño, más estable pero más lento
    const x = prev.x + alpha * (normalizedX - prev.x);
    const y = prev.y + alpha * (normalizedY - prev.y);

    const next = { x, y };
    gazePointRef.current = next;
    setGazePoint(next);
  }, []);

  const handleGazeUpdate = useCallback((data: { x: number; y: number } | null) => {
    if (!data || !gridRef.current || !isTracking) {
      setActiveCell(null);
      activeCellRef.current = null;
      setGazePoint(null);
      gazePointRef.current = null;
      gazeBufferRef.current = [];
      return;
    }

    const buffer = gazeBufferRef.current;
    buffer.push({ x: data.x, y: data.y });
    if (buffer.length > GAZE_BUFFER_SIZE) {
      buffer.shift();
    }

    const n = buffer.length;
    // Usamos mediana para filtrar outliers
    const sortedX = [...buffer].sort((a, b) => a.x - b.x);
    const sortedY = [...buffer].sort((a, b) => a.y - b.y);
    const medianX =
      n % 2 === 1
        ? sortedX[(n - 1) / 2].x
        : (sortedX[n / 2 - 1].x + sortedX[n / 2].x) / 2;
    const medianY =
      n % 2 === 1
        ? sortedY[(n - 1) / 2].y
        : (sortedY[n / 2 - 1].y + sortedY[n / 2].y) / 2;

    const rect = gridRef.current.getBoundingClientRect();
    const cellWidth = rect.width / gridSize;
    const cellHeight = rect.height / gridSize;

    const relativeX = medianX - rect.left;
    const relativeY = medianY - rect.top;

    if (relativeX >= 0 && relativeX < rect.width && relativeY >= 0 && relativeY < rect.height) {
      // Guardamos el punto de mirada normalizado a [0,1] dentro del contenedor, suavizado
      commitGazePoint(relativeX / rect.width, relativeY / rect.height);

      // Buscar la celda cuyo CENTRO esté más cerca del punto de mirada
      let bestCell: Cell | null = null;
      let bestDistSq = Infinity;

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const centerX = col * cellWidth + cellWidth / 2;
          const centerY = row * cellHeight + cellHeight / 2;
          const dx = relativeX - centerX;
          const dy = relativeY - centerY;
          const distSq = dx * dx + dy * dy;

          if (distSq < bestDistSq) {
            bestDistSq = distSq;
            bestCell = { row, col };
          }
        }
      }

      // Solo actualizamos si realmente cambia de celda
      const current = activeCellRef.current;
      if (
        !current ||
        !bestCell ||
        current.row !== bestCell.row ||
        current.col !== bestCell.col
      ) {
        commitActiveCell(bestCell);
      }
    } else {
      // Si el usuario mira fuera de la cuadrícula, limpiamos la celda activa
      // pero dejamos el último punto de mirada dibujado.
      setActiveCell(null);
      activeCellRef.current = null;
    }
  }, [gridSize, isTracking, commitActiveCell, commitGazePoint]);

  useEffect(() => {
    if (!isTracking) {
      setActiveCell(null);
      setGazePoint(null);
      gazePointRef.current = null;
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
    <div ref={gridRef} className="relative w-full h-full">
      {/* Punto de mirada */}
      {isTracking && gazePoint && (
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary shadow-[0_0_0_4px_rgba(56,189,248,0.5)] -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${gazePoint.x * 100}%`,
              top: `${gazePoint.y * 100}%`,
            }}
          />
        </div>
      )}

      {/* Cuadrícula */}
      <div
        className="w-full h-full grid gap-4 md:gap-6 p-4 md:p-6"
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
                "rounded-2xl border-2 flex items-center justify-center transition-all duration-200 ease-out",
                isActive
                  ? "grid-cell-active animate-pulse-glow"
                  : "grid-cell-inactive hover:border-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "font-mono text-base md:text-lg font-medium transition-all duration-200",
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
    </div>
  );
};

export default EyeTrackingGrid;
