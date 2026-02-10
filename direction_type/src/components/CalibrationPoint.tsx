import { cn } from "@/lib/utils";

interface CalibrationPointProps {
  x: number;
  y: number;
  onClick: () => void;
  isClicked: boolean;
  isActive: boolean;
  progress?: number;
}

export const CalibrationPoint = ({
  x,
  y,
  onClick,
  isClicked,
  isActive,
  progress = 0,
}: CalibrationPointProps) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "absolute w-12 h-12 rounded-full transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 z-[99999]",
        "flex items-center justify-center cursor-pointer",
        isClicked
          ? "bg-primary/30 border-2 border-primary scale-75"
          : isActive
            ? "bg-primary glow-primary hover:scale-110"
            : "bg-muted border-2 border-border opacity-50 pointer-events-none"
      )}
      style={{ left: `${x}%`, top: `${y}%` }}
      disabled={isClicked}
    >
      {isActive && !isClicked && (
        <>
          <span className="absolute w-full h-full rounded-full border-2 border-primary/20 animate-pulse-ring" />
          <svg className="absolute w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-primary"
              strokeDasharray={circumference}
              style={{
                strokeDashoffset: strokeDashoffset,
                transition: "stroke-dashoffset 100ms linear",
              }}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground pointer-events-none">
            {Math.max(1, Math.ceil((2000 * (100 - progress)) / 100 / 1000))}
          </span>
        </>
      )}
      {!isActive && (
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            isClicked ? "bg-primary" : "bg-primary-foreground/50"
          )}
        />
      )}
    </button>
  );
};