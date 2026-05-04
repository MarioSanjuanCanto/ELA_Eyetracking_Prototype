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

function Index() {
  const [step, setStep] = useState<"start" | "name" | "record">("start");
  const [userName, setUserName] = useState("");

  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <SiteHeader />
      <PanelShell>
        {step === "start" && <StartScreen onStart={() => setStep("name")} />}
        {step === "name" && (
          <NameScreen 
            onContinue={(name) => {
              setUserName(name);
              setStep("record");
            }} 
            onBack={() => setStep("start")} 
          />
        )}
        {step === "record" && (
          <RecordScreen 
            userName={userName}
            onBack={() => setStep("name")} 
          />
        )}
      </PanelShell>
    </div>
  );
}
