import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PanelShell } from "@/components/PanelShell";
import { StartScreen } from "@/components/StartScreen";
import { NameScreen } from "@/components/NameScreen";
import { RecordScreen } from "@/components/RecordScreen";

export const Route = createFileRoute("/")({
  component: Index,
});

const translations = {
  es: {
    headerTitle: "Recuperando mi voz",
    headerSubtitle: "Síntesis de voz personalizada",
    startDemo: "Empezar Demo",
    personalizedTitle: "Personalizado",
    personalizedDesc: "Clona las características únicas de tu voz",
    secureTitle: "Seguro y Privado",
    secureDesc: "Tus datos están cifrados y se manejan con cuidado",
    aiPoweredTitle: "Potenciado por IA",
    aiPoweredDesc: "IA de última generación para un habla natural y expresiva",
    experience: "Experimenta la síntesis de voz personalizada",
    nameTitle: "Vamos a conocerte",
    nameDesc: "Tu nombre nos ayudará a personalizar tu experiencia",
    nameLabel: "¿Cómo te llamas?",
    namePlaceholder: "Introduce tu nombre",
    nameDisclaimer: "Esta información solo se usa para personalizar tu experiencia",
    back: "Atrás",
    continue: "Continuar",
    recordedAudios: "Audios grabados",
    uploadAudio: "Subir archivo de audio",
    noAudios: "No hay audios grabados. Empieza a grabar o sube un archivo.",
    totalData: "Total de datos proporcionados",
    minSecs: "min 10 seg",
    startCloning: "Empezar Clonación",
    cloning: "Clonando...",
    success: "¡Éxito! El proceso de clonación de voz ha comenzado para",
    fail: "Error al iniciar el proceso de clonación.",
    viewVoices: "Ver voces clonadas",
  },
  en: {
    headerTitle: "Recovering my voice",
    headerSubtitle: "Personalized voice synthesis",
    startDemo: "Start Demo",
    personalizedTitle: "Personalized",
    personalizedDesc: "Clone you unique voice characteristics",
    secureTitle: "Secure & Private",
    secureDesc: "Your data is encrypted and handled with care",
    aiPoweredTitle: "AI Powered",
    aiPoweredDesc: "State-of-the-art AI for natural and expressive speech",
    experience: "Experience personalized voice synthesis",
    nameTitle: "Lets get to know you",
    nameDesc: "Your name will help us to personalized your experience",
    nameLabel: "What's your name?",
    namePlaceholder: "Enter your name",
    nameDisclaimer: "This information is only used to personalize your experience",
    back: "Back",
    continue: "Continue",
    recordedAudios: "Recorded audios",
    uploadAudio: "Upload audio file",
    noAudios: "No audios recorded yet. Start recording or upload a file.",
    totalData: "Total data provided",
    minSecs: "min 10 secs",
    startCloning: "Start Cloning",
    cloning: "Cloning...",
    success: "Success! Voice cloning process started for",
    fail: "Failed to start cloning process.",
    viewVoices: "See cloned voices",
  }
};

function Index() {
  const [step, setStep] = useState<"start" | "name" | "record">("start");
  const [userName, setUserName] = useState("");
  const [lang, setLang] = useState<"es" | "en">("es");

  const [isAdmin, setIsAdmin] = useState(false);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <SiteHeader 
        lang={lang} 
        onToggleLang={() => setLang(prev => prev === "es" ? "en" : "es")} 
        onToggleAdmin={() => setIsAdmin(prev => !prev)}
        isAdmin={isAdmin}
        t={t}
      />
      <PanelShell>
        {step === "start" && <StartScreen t={t} onStart={() => setStep("name")} />}
        {step === "name" && (
          <NameScreen 
            t={t}
            onContinue={(name) => {
              setUserName(name);
              setStep("record");
            }} 
            onBack={() => setStep("start")} 
          />
        )}
        {step === "record" && (
          <RecordScreen 
            t={t}
            lang={lang}
            userName={userName}
            isAdmin={isAdmin}
            onBack={() => setStep("name")} 
          />
        )}
      </PanelShell>
    </div>
  );
}
