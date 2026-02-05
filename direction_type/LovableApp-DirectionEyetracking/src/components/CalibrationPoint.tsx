 import { cn } from "@/lib/utils";
 
 interface CalibrationPointProps {
   x: number;
   y: number;
   onClick: () => void;
   isClicked: boolean;
   isActive: boolean;
 }
 
 export const CalibrationPoint = ({
   x,
   y,
   onClick,
   isClicked,
   isActive,
 }: CalibrationPointProps) => {
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
          ? "bg-primary glow-primary animate-pulse-slow hover:scale-110"
          : "bg-muted border-2 border-border opacity-50 pointer-events-none"
       )}
       style={{ left: `${x}%`, top: `${y}%` }}
      disabled={isClicked}
     >
       {isActive && !isClicked && (
         <span className="absolute w-full h-full rounded-full border-2 border-primary animate-pulse-ring" />
       )}
       <span
         className={cn(
          "w-3 h-3 rounded-full",
           isClicked ? "bg-primary" : "bg-primary-foreground"
         )}
       />
     </button>
   );
 };