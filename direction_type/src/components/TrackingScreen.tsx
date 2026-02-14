import { useState, useRef, useEffect } from "react";
import { GazeGrid } from "./GazeGrid";
import { Button } from "@/components/ui/button";
import { Settings, Activity, Pause, Eraser, LogOut } from "lucide-react";
import { GazeZone, HeadPosition } from "@/hooks/useWebGazer";
import { cn } from "@/lib/utils";
import { playClickSound } from "@/lib/sounds";

interface TrackingScreenProps {
  gazeZone: GazeZone | null;
  isTracking: boolean;
  headPosition: HeadPosition | null;
  onRecalibrate: () => void;
  onTogglePause: () => void;
  onStop: () => void;
}

export const TrackingScreen = ({
  gazeZone,
  isTracking,
  headPosition,
  onRecalibrate,
  onTogglePause,
  onStop,
}: TrackingScreenProps) => {
  const [selectedText, setSelectedText] = useState("");
  console.log("Rendering TrackingScreen, HeadPosition:", headPosition);

  // Movement thresholds for visual feedback (match HEAD_DRIFT_THRESHOLD in useWebGazer)
  const offset = headPosition?.offset || { x: 0, y: 0 };
  const distance = Math.sqrt(offset.x ** 2 + offset.y ** 2);
  const isMisaligned = distance > 12;
  const isCriticallyMisaligned = distance > 25;

  const handleSelectText = (text: string, isPhrase: boolean = false) => {
    setSelectedText(prev => {
      if (text === "ESPACIO") return prev + " ";
      if (text === "BORRAR") return prev.slice(0, -1);

      // If it's a phrase, replace the current text
      if (isPhrase) return text;

      // If it's a letter (from keyboard), append
      return prev + text;
    });
  };

  const handleClear = () => {
    setSelectedText("");
  };

  // Auto-recalibrate if head is misaligned for > 2 seconds
  const misalignmentTimerRef = useRef<NodeJS.Timeout | null>(null);

  const playWarningSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio warning failed:", e);
    }
  };

  useEffect(() => {
    const isUnstable = isMisaligned || isCriticallyMisaligned;

    if (isUnstable) {
      if (!misalignmentTimerRef.current) {
        console.log("Head misalignment detected. Starting 2s timer...");
        playWarningSound(); // Warn the user immediately

        misalignmentTimerRef.current = setTimeout(() => {
          console.log("Timer finished. Recalibrating...");
          onRecalibrate();
        }, 2000);
      }
    } else {
      if (misalignmentTimerRef.current) {
        console.log("Head realigned. Cancelling timer.");
        clearTimeout(misalignmentTimerRef.current);
        misalignmentTimerRef.current = null;
      }
    }

    return () => {
      // Clean up timer on unmount, but NOT on every render if state hasn't changed
      if (misalignmentTimerRef.current && !isUnstable) {
        clearTimeout(misalignmentTimerRef.current);
        misalignmentTimerRef.current = null;
      }
    };
  }, [isMisaligned, isCriticallyMisaligned, onRecalibrate]);

  return (
    <div className="h-screen w-screen bg-[#F1F5F9] flex flex-col p-4 md:p-6 gap-4">
      {/* Top Bar */}
      <div className="flex items-center gap-4 w-full">
        <div className="flex-1 bg-white rounded-2xl h-14 md:h-16 px-6 flex items-center shadow-sm relative overflow-hidden">
          <span className={cn(
            "text-lg md:text-xl font-medium truncate",
            selectedText ? "text-slate-900" : "text-gray-400"
          )}>
            {selectedText || "Selecciona una frase..."}
          </span>

          {selectedText && (
            <button
              onClick={handleClear}
              className="absolute right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Eraser className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Head Centering status */}
          <div className={cn(
            "h-14 px-4 rounded-xl bg-white border shadow-sm flex items-center gap-3 transition-colors duration-300",
            isCriticallyMisaligned ? "border-red-200 bg-red-50" :
              isMisaligned ? "border-amber-200 bg-amber-50" : "border-white"
          )}>
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className={cn(
                "absolute inset-0 rounded-full border-2 transition-all duration-300",
                isCriticallyMisaligned ? "border-red-400 animate-pulse" :
                  isMisaligned ? "border-amber-400" : "border-emerald-400"
              )} />
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isCriticallyMisaligned ? "bg-red-500" :
                    isMisaligned ? "bg-amber-500" : "bg-emerald-500"
                )}
                style={{
                  transform: `translate(${offset.x / 1.5}px, ${offset.y / 1.5}px)`
                }}
              />
            </div>
            <div className="hidden lg:flex flex-col justify-center">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 leading-none mb-1">
                Head Centering
              </span>
              <span className={cn(
                "text-sm font-semibold leading-none",
                isCriticallyMisaligned ? "text-red-600" :
                  isMisaligned ? "text-amber-600" : "text-emerald-600"
              )}>
                {isCriticallyMisaligned ? "Recentering..." : isMisaligned ? "Adjusting..." : "Centered"}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="h-14 px-6 rounded-xl bg-white border-white shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-700 font-semibold gap-2"
            onClick={() => {
              playClickSound();
              onStop();
            }}
          >
            <LogOut className="w-5 h-5" />
            Exit
          </Button>

          <Button
            variant="outline"
            className="h-14 px-6 rounded-xl bg-white border-white shadow-sm hover:bg-white/90 text-slate-700 font-semibold gap-2"
            onClick={() => {
              playClickSound();
              onRecalibrate();
            }}
          >
            <Settings className="w-5 h-5" />
            Calibrate
          </Button>

          <Button
            className="h-14 px-8 rounded-xl bg-[#8B9CFF] hover:bg-[#7A8BEE] text-white font-semibold shadow-sm gap-2 min-w-[120px]"
            onClick={() => {
              playClickSound();
              onTogglePause();
            }}
          >
            {isTracking ? (
              <>
                <Pause className="w-5 h-5" />
                Stop
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                Start
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 w-full bg-white rounded-3xl shadow-sm p-4 md:p-6 overflow-hidden">
        <GazeGrid activeZone={gazeZone} onExit={onStop} onSelectText={handleSelectText} selectedText={selectedText} />
      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-end gap-6 px-4 py-1 opacity-40 hover:opacity-100 transition-opacity duration-300">
        <img
          src="/VRAIN_Logo.png"
          alt="VRAIN"
          className="h-5 w-auto object-contain grayscale"
        />
        <img
          src="/vertexlit_logo.png"
          alt="VertexLit"
          className="h-5 w-auto object-contain grayscale"
        />
      </div>
    </div>
  );
};