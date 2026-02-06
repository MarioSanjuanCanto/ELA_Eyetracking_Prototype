import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface GazeGridProps {
  activeZone: { row: string; col: string } | null;
}

const mainGrid = [
  [
    { label: "Saludos", type: "default" },
    { label: "Despedidas", type: "default" },
    { label: "Frases Importantes", type: "default" },
  ],
  [
    { label: "Preguntas", type: "default" },
    { label: "TECLADO", type: "action" }, // New action button
    { label: "Control del entorno", type: "default" },
  ],
  [
    { label: "Frases sociales básicas", type: "default" },
    { label: "Necesidades", type: "default" },
    { label: "Emergencias", type: "danger" },
  ],
];

const keyboardGrid = [
  [
    { label: "ABC", type: "default" },
    { label: "DEF", type: "default" },
    { label: "GHI", type: "default" },
  ],
  [
    { label: "JKL", type: "default" },
    { label: "MNO", type: "default" },
    { label: "PQR", type: "default" },
  ],
  [
    { label: "STU", type: "default" },
    { label: "VWXYZ", type: "default" },
    { label: "[ATRÁS]", type: "action" }, // Back button
  ],
];

const DwellButton = ({
  label,
  type,
  active,
  onAction,
}: {
  label: string;
  type: string;
  active: boolean;
  onAction: (label: string) => void;
}) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const dwellTime = 2500; // slightly faster for letters
  const gracePeriod = 400;
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
    onAction(label);

    // Pulse animation
    const btnId = `btn-${label.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const btn = document.getElementById(btnId);
    if (btn) {
      btn.style.transform = 'scale(1.05)';
      setTimeout(() => { if (btn) btn.style.transform = ''; }, 200);
    }
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      id={`btn-${label.replace(/[^a-zA-Z0-9]/g, '-')}`}
      className={cn(
        "relative rounded-2xl transition-all duration-300 flex items-center justify-center p-4 text-center cursor-pointer shadow-sm hover:shadow-md h-full w-full",
        "text-base md:text-lg lg:text-xl font-bold tracking-tight select-none border-2 border-transparent",
        type === "danger"
          ? "bg-[#FF5A5A] text-white hover:bg-[#FF4040]"
          : type === "action"
            ? "bg-[#8B9CFF] text-white hover:bg-[#7A8BEE]"
            : "bg-[#D0D9FC] text-slate-900 hover:bg-[#C0CBFC]",
        active && "ring-4 ring-primary ring-offset-2 scale-[1.01] border-white/20",
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
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="0.5"
              fill="transparent"
              className="opacity-20"
            />
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
  const [currentGridType, setCurrentGridType] = useState<"main" | "keyboard">("main");
  const { toast } = useToast();

  const handleAction = (label: string) => {
    if (label === "TECLADO") {
      setCurrentGridType("keyboard");
      toast({ title: "Modo Teclado", description: "Cambiando a rejilla de letras" });
    } else if (label === "[ATRÁS]") {
      setCurrentGridType("main");
      toast({ title: "Frases", description: "Volviendo al menú principal" });
    } else {
      toast({
        title: "Seleccionado",
        description: label,
        className: "bg-primary text-white font-bold",
      });
    }
  };

  const currentItems = currentGridType === "main" ? mainGrid : keyboardGrid;

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
      {currentItems.map((row, rowIndex) =>
        row.map((item, colIndex) => (
          <DwellButton
            key={`${currentGridType}-${rowIndex}-${colIndex}`}
            label={item.label}
            type={item.type}
            active={isActive(rowIndex, colIndex)}
            onAction={handleAction}
          />
        ))
      )}
    </div>
  );
};