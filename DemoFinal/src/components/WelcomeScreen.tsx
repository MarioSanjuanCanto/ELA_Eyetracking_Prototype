import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, ScanEye, LogOut, Globe, Settings } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
  onExit: () => void;
  usePictograms: boolean;
  onTogglePictograms: () => void;
}

const TRANSLATIONS = {
  en: {
    title: "Eye Tracking System",
    subtitle: "Control your keyboard with your gaze",
    webcam: "Webcam Access",
    calibration: "Smart Calibration",
    calibrationDesc: "9-point precision grid",
    pictograms: "Pictograms",
    visualMode: "Visual Mode",
    start: "Start Calibration",
    exit: "Exit",
    disclaimer: "Remember to be centered and have good lightning for a better performance",
    admin: "Admin",
    logout: "Log out",
    recovering: "Recovering my voice",
    synthesis: "Personalized voice synthesis"
  },
  es: {
    title: "Sistema de Seguimiento Ocular",
    subtitle: "Controla el teclado con tu mirada",
    webcam: "Acceso a la Cámara",
    calibration: "Calibración Inteligente",
    calibrationDesc: "Cuadrícula de precisión de 9 puntos",
    pictograms: "Pictogramas",
    visualMode: "Modo Visual",
    start: "Iniciar Calibración",
    exit: "Salir",
    disclaimer: "Recuerda estar centrado y tener buena iluminación para un mejor rendimiento",
    admin: "Admin",
    logout: "Cerrar sesión",
    recovering: "Recuperando mi voz",
    synthesis: "Sintesis de voz personalizada"
  }
};

export const WelcomeScreen = ({ onStart, onExit, usePictograms, onTogglePictograms }: WelcomeScreenProps) => {
  const [lang, setLang] = useState<"es" | "en">("es");
  const t = TRANSLATIONS[lang];

  const toggleLang = () => {
    setLang(prev => prev === "es" ? "en" : "es");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F6FA] to-[#E3EBF5] grid-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 w-full flex items-center justify-between px-6 md:px-12 py-4 z-50 bg-white shadow-sm border-b border-slate-100">
        {/* Left: Titles */}
        <div className="flex flex-col">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{t.recovering}</h2>
          <p className="text-sm md:text-base text-slate-500 font-medium">{t.synthesis}</p>
        </div>

        {/* Center: Logos */}
        <div className="hidden lg:flex items-center gap-8">
          <img src="/valgrai.png" alt="Valgrai Logo" className="h-10 md:h-12 w-auto object-contain" />
          <img src="/vrain.png" alt="VRAIN Logo" className="h-10 md:h-12 w-auto object-contain" />
          <img src="/vertexlit.png" alt="VertexLit Logo" className="h-8 md:h-10 w-auto object-contain" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleLang}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{lang.toUpperCase()}</span>
          </button>
          <Button variant="outline" size="sm" className="rounded-full bg-white/50 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4">
            <Settings className="w-4 h-4 mr-2" />
            {t.admin}
          </Button>
          <Button variant="outline" size="sm" onClick={onExit} className="rounded-full bg-white/50 backdrop-blur-sm border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4">
            <LogOut className="w-4 h-4 mr-2" />
            {t.logout}
          </Button>
        </div>
      </header>

      <div className="max-w-2xl w-full flex flex-col items-center space-y-12 relative z-10 mt-20">

        {/* Header Section */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative group cursor-default">
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900 tracking-tight">
              {t.title}
            </h1>
            <p className="text-slate-500 font-medium">
              {t.subtitle}
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
                <h3 className="font-semibold text-slate-800">{t.webcam}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 transition-colors duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center border border-blue-100/50 group-hover:scale-110 transition-transform duration-300">
                <ScanEye className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{t.calibration}</h3>
                <p className="text-sm text-slate-500">{t.calibrationDesc}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                  <ImageIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="pictograms-mode" className="font-semibold text-slate-800 cursor-pointer">{t.pictograms}</Label>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t.visualMode}</span>
                </div>
              </div>
              <Switch
                id="pictograms-mode"
                checked={usePictograms}
                onCheckedChange={onTogglePictograms}
              />
            </div>
          </div>

          <Button
            onClick={onStart}
            size="lg"
            className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-blue-500/40 transition-all duration-300 group"
          >
            {t.start}
          </Button>
          <Button
            onClick={onExit}
            variant="outline"
            size="lg"
            className="w-full h-12 rounded-2xl text-base font-semibold border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t.exit}
          </Button>
          <p className="text-xs text-center text-slate-400 font-medium">
            {t.disclaimer}
          </p>
        </div>

      </div>
    </div>
  );
};