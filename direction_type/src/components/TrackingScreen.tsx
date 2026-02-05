import { GazeGrid } from "./GazeGrid";
import { Button } from "@/components/ui/button";
import { Settings, Activity, Play, Pause } from "lucide-react";
import { GazeZone } from "@/hooks/useWebGazer";

interface TrackingScreenProps {
  gazeZone: GazeZone | null;
  isTracking: boolean;
  onRecalibrate: () => void;
  onTogglePause: () => void;
}

export const TrackingScreen = ({
  gazeZone,
  isTracking,
  onRecalibrate,
  onTogglePause,
}: TrackingScreenProps) => {
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

      {/* Status Footer - Keeping it subtle/hidden if not needed but useful for debugging/feedback */}
      <div className="hidden">
        {isTracking ? "Tracking Active" : "Tracking Paused"}
      </div>
    </div>
  );
};