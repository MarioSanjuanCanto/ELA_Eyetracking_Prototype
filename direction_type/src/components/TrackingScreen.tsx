import { GazeGrid } from "./GazeGrid";
import { Button } from "@/components/ui/button";
import { Settings, Activity, Pause } from "lucide-react";
import { GazeZone, HeadPosition } from "@/hooks/useWebGazer";
import { cn } from "@/lib/utils";

interface TrackingScreenProps {
  gazeZone: GazeZone | null;
  isTracking: boolean;
  headPosition: HeadPosition | null;
  onRecalibrate: () => void;
  onTogglePause: () => void;
}

export const TrackingScreen = ({
  gazeZone,
  isTracking,
  headPosition,
  onRecalibrate,
  onTogglePause,
}: TrackingScreenProps) => {
  console.log("Rendering TrackingScreen, HeadPosition:", headPosition);
  // Movement thresholds for visual feedback
  const offset = headPosition?.offset || { x: 0, y: 0 };
  const distance = Math.sqrt(offset.x ** 2 + offset.y ** 2);
  const isMisaligned = distance > 50;
  const isCriticallyMisaligned = distance > 100;

  return (
    <div className="h-screen w-screen bg-[#F1F5F9] flex flex-col p-4 md:p-6 gap-4">
      {/* Top Bar */}
      <div className="flex items-center gap-4 w-full">
        <div className="flex-1 bg-white rounded-2xl h-14 md:h-16 px-6 flex items-center shadow-sm">
          <span className="text-gray-400 text-lg md:text-xl font-medium truncate">
            Hola buenos día...
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-14 px-6 rounded-xl bg-white border-white shadow-sm hover:bg-white/90 text-slate-700 font-semibold gap-2"
            onClick={onRecalibrate}
          >
            <Settings className="w-5 h-5" />
            Calibrate
          </Button>

          <Button
            className="h-14 px-8 rounded-xl bg-[#8B9CFF] hover:bg-[#7A8BEE] text-white font-semibold shadow-sm gap-2 min-w-[120px]"
            onClick={onTogglePause}
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
        <GazeGrid activeZone={gazeZone} />
      </div>
    </div>
  );
};