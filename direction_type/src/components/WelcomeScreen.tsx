import { Button } from "@/components/ui/button";
import { Eye, Camera, MousePointer, ScanEye } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F6FA] to-[#E3EBF5] grid-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-2xl w-full flex flex-col items-center space-y-12 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group cursor-default">
            <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <img
              src="/valgraiLogo.png"
              alt="Valgrai Logo"
              className="w-64 md:w-80 h-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-500 relative z-10"
            />
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 tracking-tight">
              Eye Tracking System
            </h1>
            <p className="text-slate-500 font-medium">
              Control your keyboard with your gaze
            </p>
          </div>
        </div>

        {/* Action Card */}
        <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-8">

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 transition-colors duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center border border-blue-100/50 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Webcam Access</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 transition-colors duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center border border-blue-100/50 group-hover:scale-110 transition-transform duration-300">
                <ScanEye className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Smart Calibration</h3>
                <p className="text-sm text-slate-500">9-point precision grid</p>
              </div>
            </div>
          </div>

          <Button
            onClick={onStart}
            size="lg"
            className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-blue-500/40 transition-all duration-300 group"
          >
            Start Calibration
          </Button>
          <p className="text-xs text-center text-slate-400 font-medium">
            Remember to be centered and have good lightning for a better performance
          </p>
        </div>
      </div>
    </div>
  );
};