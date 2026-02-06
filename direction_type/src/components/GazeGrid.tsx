import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface GazeGridProps {
  activeZone: { row: string; col: string } | null;
}

const gridItems = [
  [
    { label: "Saludos", type: "default" },
    { label: "Despedidas", type: "default" },
    { label: "Frases Importantes", type: "default" },
  ],
  [
    { label: "Preguntas", type: "default" },
    { label: "[Salir]", type: "default" },
    { label: "Control del entorno", type: "default" },
  ],
  [
    { label: "Frases sociales básicas", type: "default" },
    { label: "Necesidades", type: "default" },
    { label: "Emergencias", type: "danger" },
  ],
];

const DwellButton = ({
  label,
  type,
  active,
}: {
  label: string;
  type: string;
  active: boolean;
}) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const dwellTime = 3000; // 3 seconds
  const gracePeriod = 400; // ms of "mercy" before reset
  const startTimeRef = useRef<number | null>(null);
  const lastActiveTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (active) {
      lastActiveTimeRef.current = Date.now();
      setIsResetting(false);

      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      if (!timerRef.current) {
        const update = () => {
          if (!startTimeRef.current) return;
          const now = Date.now();
          const elapsed = now - startTimeRef.current;
          const newProgress = Math.min((elapsed / dwellTime) * 100, 100);
          setProgress(newProgress);

          if (elapsed >= dwellTime) {
            handleAction();
            resetTimer();
          } else {
            timerRef.current = requestAnimationFrame(update);
          }
        };
        timerRef.current = requestAnimationFrame(update);
      }
    } else {
      // Grace period logic
      const checkGrace = () => {
        const now = Date.now();
        if (now - lastActiveTimeRef.current > gracePeriod) {
          resetTimer();
        } else {
          timerRef.current = requestAnimationFrame(checkGrace);
        }
      };

      if (!isResetting && startTimeRef.current) {
        timerRef.current = requestAnimationFrame(checkGrace);
      }
    }

    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [active]);

  const resetTimer = () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    timerRef.current = null;
    startTimeRef.current = null;
    setProgress(0);
    setIsResetting(true);
  };

  const handleAction = () => {
    toast({
      title: "Activado",
      description: label,
      className: "bg-primary text-white font-bold",
    });

    // Pulse animation on the button itself
    const btn = document.getElementById(`btn-${label.replace(/\s+/g, '-')}`);
    if (btn) {
      btn.style.transform = 'scale(1.05)';
      setTimeout(() => btn.style.transform = '', 200);
    }
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      id={`btn-${label.replace(/\s+/g, '-')}`}
      className={cn(
        "relative rounded-2xl transition-all duration-300 flex items-center justify-center p-4 text-center cursor-pointer shadow-sm hover:shadow-md h-full w-full",
        "text-base md:text-lg lg:text-xl font-bold tracking-tight select-none",
        type === "danger"
          ? "bg-[#FF5A5A] text-white hover:bg-[#FF4040]"
          : "bg-[#D0D9FC] text-slate-900 hover:bg-[#C0CBFC]",
        active && "ring-4 ring-primary ring-offset-2 scale-[1.01]",
        active && type === "danger" && "ring-[#FF5A5A]",
        !active && "opacity-90 hover:opacity-100"
      )}
    >
      <span className="relative z-10">{label}</span>

      {progress > 0 && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300",
          active ? "opacity-40" : "opacity-15"
        )}>
          <svg className="w-3/4 h-3/4 transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="0.5"
              fill="transparent"
              className="opacity-20"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="2"
              fill="transparent"
              strokeDasharray={circumference}
              style={{
                strokeDashoffset: strokeDashoffset,
              }}
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export const GazeGrid = ({ activeZone }: GazeGridProps) => {
  const isActive = (row: number, col: number) => {
    if (!activeZone) return false;
    const rowMatch =
      (activeZone.row === "up" && row === 0) ||
      (activeZone.row === "middle" && row === 1) ||
      (activeZone.row === "down" && row === 2);
    const colMatch =
      (activeZone.col === "left" && col === 0) ||
      (activeZone.col === "center" && col === 1) ||
      (activeZone.col === "right" && col === 2);
    return rowMatch && colMatch;
  };

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-4 w-full h-full">
      {gridItems.map((row, rowIndex) =>
        row.map((item, colIndex) => (
          <DwellButton
            key={`${rowIndex}-${colIndex}`}
            label={item.label}
            type={item.type}
            active={isActive(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
};