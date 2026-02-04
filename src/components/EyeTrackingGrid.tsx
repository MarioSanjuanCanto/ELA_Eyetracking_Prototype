import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface EyeTrackingGridProps {
  gridSize: number;
  isTracking: boolean;
  onCellChange?: (row: number, col: number) => void;
}

// More samples → smoother, more stable gaze
const GAZE_BUFFER_SIZE = 25;
const STABLE_FRAMES = 5;

type Cell = { row: number; col: number };

const EyeTrackingGrid = ({ gridSize, isTracking, onCellChange }: EyeTrackingGridProps) => {
  const [activeCell, setActiveCell] = useState<Cell | null>(null);
  const [gazePoint, setGazePoint] = useState<{ x: number; y: number } | null>(null); // punto suavizado, normalizado 0-1
  const gridRef = useRef<HTMLDivElement>(null);
  const gazeBufferRef = useRef<{ x: number; y: number }[]>([]);
  const activeCellRef = useRef<Cell | null>(null);
  const gazePointRef = useRef<{ x: number; y: number } | null>(null);
  const pendingCellRef = useRef<Cell | null>(null);
  const pendingCountRef = useRef(0);

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
    const alpha = 0.18; // más pequeño → más estable pero más lento
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
      pendingCellRef.current = null;
      pendingCountRef.current = 0;
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

      const current = activeCellRef.current;

      // Si aún no hay celda activa, activamos directamente la mejor
      if (!current && bestCell) {
        commitActiveCell(bestCell);
        pendingCellRef.current = null;
        pendingCountRef.current = 0;
        return;
      }

      // Si seguimos en la misma celda, reseteamos candidato
      if (
        current &&
        bestCell &&
        current.row === bestCell.row &&
        current.col === bestCell.col
      ) {
        pendingCellRef.current = null;
        pendingCountRef.current = 0;
        return;
      }

      // Histéresis: exigimos varios frames consecutivos antes de cambiar de celda
      if (bestCell) {
        const pending = pendingCellRef.current;
        if (
          pending &&
          pending.row === bestCell.row &&
          pending.col === bestCell.col
        ) {
          pendingCountRef.current += 1;
        } else {
          pendingCellRef.current = bestCell;
          pendingCountRef.current = 1;
        }

        if (pendingCountRef.current >= STABLE_FRAMES) {
          commitActiveCell(bestCell);
          pendingCellRef.current = null;
          pendingCountRef.current = 0;
        }
      }
    } else {
      // Si el usuario mira fuera de la cuadrícula, limpiamos la celda activa
      // pero dejamos el último punto de mirada dibujado.
      setActiveCell(null);
      activeCellRef.current = null;
      pendingCellRef.current = null;
      pendingCountRef.current = 0;
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
    // Para una cuadrícula 3x3 usamos las etiquetas de la imagen
    if (gridSize === 3) {
      const labels = [
        ['Saludos', 'Despedidas', 'Frases Importantes'],
        ['Preguntas', '[Salir]', 'Control del entorno'],
        ['Frases sociales básicas', 'Necesidades', 'Emergencias'],
      ];
      return labels[row][col];
    }

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
        className="w-full h-full grid gap-6 p-8"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const isActive = activeCell?.row === row && activeCell?.col === col;
          const label = getCellLabel(row, col);
          const isEmergency = label === 'Emergencias';

          return (
            <div
              key={`${row}-${col}`}
              className={cn(
                "rounded-[26px] flex items-center justify-center text-center px-4 transition-all duration-200 ease-out select-none",
                isEmergency
                  ? "bg-[#ff5b5b] text-white"
                  : "bg-[#c9d4ff] text-[#111827]",
                isActive && "ring-4 ring-[#4f8cff] scale-[1.03] shadow-lg"
              )}
            >
              <span
                className={cn(
                  "font-semibold transition-all duration-200 leading-snug",
                  gridSize === 3 ? "text-base md:text-lg" : "font-mono text-base md:text-lg",
                  isActive && "scale-105"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EyeTrackingGrid;
