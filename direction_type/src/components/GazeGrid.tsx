import { cn } from "@/lib/utils";

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
        row.map((item, colIndex) => {
          const active = isActive(rowIndex, colIndex);
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={cn(
                "rounded-2xl transition-all duration-300 flex items-center justify-center p-4 text-center cursor-pointer shadow-sm hover:shadow-md",
                "text-base md:text-lg lg:text-xl font-bold tracking-tight select-none",
                item.type === "danger"
                  ? "bg-[#FF5A5A] text-white hover:bg-[#FF4040]"
                  : "bg-[#D0D9FC] text-slate-900 hover:bg-[#C0CBFC]",
                active && "ring-4 ring-primary ring-offset-2 scale-[1.02]",
                active && item.type === "danger" && "ring-[#FF5A5A]",
                !active && "opacity-90 hover:opacity-100"
              )}
            >
              {item.label}
            </div>
          );
        })
      )}
    </div>
  );
};