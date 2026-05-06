import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/voiceOnboarding/SiteHeader";
import { PanelShell } from "@/components/voiceOnboarding/PanelShell";
import { StartScreen } from "@/components/voiceOnboarding/StartScreen";
import { NameScreen } from "@/components/voiceOnboarding/NameScreen";
import { RecordScreen } from "@/components/voiceOnboarding/RecordScreen";

const translations = {
  es: {
    headerTitle: "Recuperando mi voz",
    headerSubtitle: "Sintesis de voz personalizada",
    startDemo: "Empezar Demo",
    personalizedTitle: "Personalizado",
    personalizedDesc: "Clona las caracteristicas unicas de tu voz",
    secureTitle: "Seguro y Privado",
    secureDesc: "Tus datos estan cifrados y se manejan con cuidado",
    aiPoweredTitle: "Potenciado por IA",
    aiPoweredDesc: "IA de ultima generacion para un habla natural y expresiva",
    experience: "Experimenta la sintesis de voz personalizada",
    nameTitle: "Vamos a conocerte",
    nameDesc: "Tu nombre nos ayudara a personalizar tu experiencia",
    nameLabel: "Como te llamas?",
    namePlaceholder: "Introduce tu nombre",
    nameDisclaimer: "Esta informacion solo se usa para personalizar tu experiencia",
    back: "Atras",
    continue: "Continuar",
    recordedAudios: "Audios grabados",
    uploadAudio: "Subir archivo de audio",
    noAudios: "No hay audios grabados. Empieza a grabar o sube un archivo.",
    totalData: "Total de datos proporcionados",
    minSecs: "min 10 seg",
  },
  en: {
    headerTitle: "Recovering my voice",
    headerSubtitle: "Personalized voice synthesis",
    startDemo: "Start Demo",
    personalizedTitle: "Personalized",
    personalizedDesc: "Clone your unique voice characteristics",
    secureTitle: "Secure & Private",
    secureDesc: "Your data is encrypted and handled with care",
    aiPoweredTitle: "AI Powered",
    aiPoweredDesc: "State-of-the-art AI for natural and expressive speech",
    experience: "Experience personalized voice synthesis",
    nameTitle: "Lets get to know you",
    nameDesc: "Your name will help us personalize your experience",
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
  },
};

type Step = "start" | "name" | "record";

const VoiceOnboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("start");
  const [lang, setLang] = useState<"es" | "en">("es");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <SiteHeader
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === "es" ? "en" : "es"))}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        isAdmin={isAdmin}
        t={t}
      />
      <PanelShell>
        {step === "start" && <StartScreen t={t} onStart={() => setStep("name")} />}
        {step === "name" && (
          <NameScreen
            t={t}
            isAdmin={isAdmin}
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
            onContinue={() => navigate("/eyetracking")}
          />
        )}
      </PanelShell>
    </div>
  );
};

export default VoiceOnboarding;
