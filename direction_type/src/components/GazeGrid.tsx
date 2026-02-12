import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { phrases, CATEGORY_MAP } from "@/lib/phrases";

interface GazeGridProps {
  activeZone: { row: string; col: string } | null;
  onExit?: () => void;
  onSelectText?: (text: string, isPhrase?: boolean) => void;
  selectedText: string;
}

const mainGrid = [
  [
    { label: "Saludos", type: "default" },
    { label: "Preguntas", type: "default" },
    { label: "Frases Importantes", type: "default" },
  ],
  [
    { label: "TECLADO", type: "default" },
    { label: "ENVIAR", type: "action" },
    { label: "Emergencias", type: "danger" },
  ],
];

// Top level keyboard menu
// Layout:
// [VOCALES] [B-L]     [M-Z]
// [ESPACIO] [BORRAR]  [ATRÁS]
const keyboardMainGrid = [
  [
    { label: "VOCALES", type: "default" },
    { label: "B-L", type: "default" },
    { label: "M-Z", type: "default" },
  ],
  [
    { label: "ESPACIO", type: "success" },
    { label: "BORRAR", type: "danger" },
    { label: "[ATRÁS]", type: "action" },
  ],
];

// Sub-menu for Vowels (Direct Access)
// A E I
// O U [ATRÁS]
const keyboardVowelsGrid = [
  [
    { label: "A", type: "default" },
    { label: "E", type: "default" },
    { label: "I", type: "default" },
  ],
  [
    { label: "O", type: "default" },
    { label: "U", type: "default" },
    { label: "[ATRÁS]", type: "action" },
  ],
];

// Sub-menu for Consonants B-L
// [B-G] [H-L] [-]
// [-]   [-]   [ATRÁS]
const keyboardConsonants1Grid = [
  [
    { label: "B-G", type: "default" },
    { label: "H-L", type: "default" },
    { label: "-", type: "disabled" },
  ],
  [
    { label: "-", type: "disabled" },
    { label: "-", type: "disabled" },
    { label: "[ATRÁS]", type: "action" },
  ],
];

// Sub-menu for Consonants M-Z
// [M-Q] [R-W] [X-Z]
// [-]   [-]   [ATRÁS]
const keyboardConsonants2Grid = [
  [
    { label: "M-Q", type: "default" },
    { label: "R-W", type: "default" },
    { label: "X-Z", type: "default" },
  ],
  [
    { label: "-", type: "disabled" },
    { label: "-", type: "disabled" },
    { label: "[ATRÁS]", type: "action" },
  ],
];

const DwellButton = ({
  label,
  type,
  active,
  onAction,
  isDisabled = false,
  className,
}: {
  label: string;
  type: string;
  active: boolean;
  onAction: (label: string) => void;
  isDisabled?: boolean;
  className?: string;
}) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const dwellTime = 2500;
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
      onClick={handleAction}
      className={cn(
        "relative rounded-2xl transition-all duration-300 flex p-4 cursor-pointer shadow-sm hover:shadow-md h-full w-full",
        // Default centering if no className provided
        !className && "items-center justify-center text-center",
        // Custom alignment classes
        className,
        "text-base md:text-lg lg:text-xl font-bold tracking-tight select-none border-2 border-transparent",
        type === "danger"
          ? "bg-[#FF5A5A] text-white hover:bg-[#FF4040]"
          : type === "action"
            ? "bg-[#8B9CFF] text-white hover:bg-[#7A8BEE]"
            : type === "success"
              ? "bg-[#6EE7B7] text-slate-900 hover:bg-[#5EEAD4]"
              : type === "disabled"
                ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-[#D0D9FC] text-slate-900 hover:bg-[#C0CBFC]",
        active && "ring-4 ring-primary ring-offset-2 scale-[1.01] border-white/20",
        active && (type === "danger" || type === "success") && (type === "danger" ? "ring-[#FF5A5A]" : "ring-[#6EE7B7]"),
        (isDisabled || !active) && "opacity-90 hover:opacity-100",
        isDisabled && "opacity-50 hover:opacity-50 hover:shadow-none"
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

const KEYBOARD_LETTERS: Record<string, string[]> = {
  "B-G": ["B", "C", "D", "F", "G"],
  "H-L": ["H", "J", "K", "L"], // I is a vowel
  "M-Q": ["M", "N", "Ñ", "P", "Q"],
  "R-W": ["R", "S", "T", "V", "W"], // U is a vowel
  "X-Z": ["X", "Y", "Z"],
};

export const GazeGrid = ({ activeZone, onExit, onSelectText, selectedText }: GazeGridProps) => {
  const [viewState, setViewState] = useState<"main" | "keyboard" | "category" | "keyboardLetters" | "confirmation" | "keyboardVowels" | "keyboardCons1" | "keyboardCons2">("main");
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [selectedKeyboardGroup, setSelectedKeyboardGroup] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAction = (label: string) => {
    if (label === "ENVIAR") {
      if (selectedText.trim()) {
        setViewState("confirmation");
      }
      return;
    }

    if (label === "EXIT") {
      if (onExit) onExit();
      return;
    }

    if (label === "BACK TO KEYBOARD") {
      if (onSelectText) onSelectText("", true);
      setViewState("main");
      return;
    }

    if (label === "WAIT" || label === "-") {
      // Do nothing
      return;
    }

    if (label === "[ATRÁS]") {
      if (viewState === "keyboardLetters") {
        // Go back to the appropriate sub-menu
        if (["B-G", "H-L"].includes(selectedKeyboardGroup || "")) {
          setViewState("keyboardCons1");
        } else if (["M-Q", "R-W", "X-Z"].includes(selectedKeyboardGroup || "")) {
          setViewState("keyboardCons2");
        } else {
          setViewState("keyboard");
        }
        setSelectedKeyboardGroup(null);
      } else if (viewState === "keyboardVowels" || viewState === "keyboardCons1" || viewState === "keyboardCons2") {
        setViewState("keyboard");
      } else {
        setViewState("main");
        setCurrentCategory(null);
      }
      return;
    }

    // Update text bar for non-keypad options related to text
    if (label === "ESPACIO") {
      if (onSelectText) onSelectText(" ", false);
      return;
    }
    if (label === "BORRAR") {
      if (onSelectText) onSelectText("BACKSPACE", false);
      return;
    }

    // Handle direct vowel selection
    if (["A", "E", "I", "O", "U"].includes(label)) {
      if (onSelectText) onSelectText(label, false);
      return;
    }

    if (label !== "TECLADO" && label !== "VOCALES" && label !== "B-L" && label !== "M-Z" && !Object.keys(KEYBOARD_LETTERS).includes(label) && onSelectText) {
      if (viewState === "keyboardLetters") {
        onSelectText(label, false);
      } else if (viewState !== "keyboard" && viewState !== "keyboardVowels" && viewState !== "keyboardCons1" && viewState !== "keyboardCons2" && viewState !== "main") {
        // If it's a category phrase, we want to replace the current text
        onSelectText(label, true);
      }
    }

    if (viewState === "main") {
      if (label === "TECLADO") {
        setViewState("keyboard");
      } else if (CATEGORY_MAP[label]) {
        setViewState("category");
        setCurrentCategory(label);
      }
    } else if (viewState === "keyboard") {
      if (label === "VOCALES") {
        setViewState("keyboardVowels");
      } else if (label === "B-L") {
        setViewState("keyboardCons1");
      } else if (label === "M-Z") {
        setViewState("keyboardCons2");
      }
    } else if (viewState === "keyboardCons1" || viewState === "keyboardCons2") {
      if (KEYBOARD_LETTERS[label]) {
        setSelectedKeyboardGroup(label);
        setViewState("keyboardLetters");
      }
    } else if (viewState === "category" || viewState === "keyboardLetters") {
      toast({
        title: "Activado",
        description: label,
        className: "bg-primary text-white font-bold",
      });
    }
  };

  const getGridItems = () => {
    if (viewState === "main") return mainGrid;
    if (viewState === "keyboard") return keyboardMainGrid;
    if (viewState === "keyboardVowels") return keyboardVowelsGrid;
    if (viewState === "keyboardCons1") return keyboardConsonants1Grid;
    if (viewState === "keyboardCons2") return keyboardConsonants2Grid;

    if (viewState === "keyboardLetters" && selectedKeyboardGroup) {
      const letters = KEYBOARD_LETTERS[selectedKeyboardGroup] || [];
      const items: { label: string; type: string }[][] = [[], []];

      // 2x3 Grid: 6 slots.
      // Slot (1, 2) is Always Back.
      // 5 Slots for letters.
      let letterIdx = 0;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          if (r === 1 && c === 2) {
            items[r][c] = { label: "[ATRÁS]", type: "action" };
          } else {
            if (letterIdx < letters.length) {
              items[r][c] = { label: letters[letterIdx], type: "default" };
              letterIdx++;
            } else {
              items[r][c] = { label: "-", type: "disabled" };
            }
          }
        }
      }
      return items;
    }

    // Create 2x3 grid for category phrases
    if (viewState === "category" && currentCategory) {
      const key = CATEGORY_MAP[currentCategory];
      const categoryPhrases = phrases[key] || [];
      const items: { label: string; type: string }[][] = [[], []];

      // 6 slots. (1, 2) is Back. 5 phrases max.
      let phraseIdx = 0;
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 3; c++) {
          if (r === 1 && c === 2) {
            items[r][c] = { label: "[ATRÁS]", type: "action" };
          } else {
            const phrase = categoryPhrases[phraseIdx] || "-";
            items[r][c] = { label: phrase, type: phrase === "-" ? "disabled" : "default" };
            phraseIdx++;
          }
        }
      }
      return items;
    }

    if (viewState === "confirmation") {
      return [
        [
          { label: "EXIT", type: "danger" },
          { label: "WAIT", type: "action" },
          { label: "BACK TO KEYBOARD", type: "success" },
        ]
      ];
    }

    return mainGrid;
  };

  const gridItems = getGridItems();

  const isActive = (row: number, col: number) => {
    if (!activeZone) return false;

    if (viewState === "confirmation") {
      // 1x3 Grid mapping
      if (row !== 0) return false;
      const colMatch =
        (activeZone.col === "left" && col === 0) ||
        (activeZone.col === "center" && col === 1) ||
        (activeZone.col === "right" && col === 2);
      return colMatch;
    }

    // Map active zones to 2 rows
    // Up -> Row 0
    // Down -> Row 1

    let targetRow = -1;
    if (activeZone.row === "up") targetRow = 0;
    if (activeZone.row === "down") targetRow = 1;

    const rowMatch = row === targetRow;

    const colMatch =
      (activeZone.col === "left" && col === 0) ||
      (activeZone.col === "center" && col === 1) ||
      (activeZone.col === "right" && col === 2);
    return rowMatch && colMatch;
  };

  const getAlignmentClass = (rowIndex: number, colIndex: number) => {
    // Confirmation view
    if (viewState === "confirmation") return "items-center justify-center";

    // 2x3 Grid Alignment
    const isTop = rowIndex === 0;

    const isLeft = colIndex === 0;
    const isRight = colIndex === 2;

    const vClass = isTop ? "items-start pt-8" : "items-end pb-8";
    const hClass = isLeft ? "justify-start pl-8 text-left" : isRight ? "justify-end pr-8 text-right" : "justify-center text-center";

    return `${vClass} ${hClass}`;
  };

  return (
    <div className="flex flex-col w-full h-full gap-4">
      {viewState === "confirmation" && (
        <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 rounded-3xl mb-4 border-2 border-slate-100 min-h-[200px]">
          <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 text-center break-words max-w-4xl">
            {selectedText}
          </p>
        </div>
      )}
      <div className={cn(
        "grid gap-4 w-full",
        viewState === "confirmation" ? "grid-cols-3 grid-rows-1 h-32 md:h-40" : "grid-cols-3 grid-rows-2 flex-1"
      )}>
        {gridItems.map((row, rowIndex) =>
          row.map((item, colIndex) => {
            const isBtnDisabled = (item.label === "ENVIAR" && (!selectedText || !selectedText.trim())) || item.type === "disabled";
            return (
              <DwellButton
                key={`${viewState}-${currentCategory}-${rowIndex}-${colIndex}`}
                label={item.label}
                type={isBtnDisabled ? "disabled" : item.type}
                active={!isBtnDisabled && isActive(rowIndex, colIndex)}
                onAction={(lbl) => !isBtnDisabled && handleAction(lbl)}
                isDisabled={isBtnDisabled}
                className={getAlignmentClass(rowIndex, colIndex)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};