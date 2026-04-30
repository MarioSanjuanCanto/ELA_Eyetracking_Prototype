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
  return (
    <div className="min-h-screen bg-[var(--app-bg)]">
      <SiteHeader />
      <PanelShell>
        {step === "start" && <StartScreen onStart={() => setStep("name")} />}
        {step === "name" && <NameScreen onContinue={() => setStep("record")} />}
        {step === "record" && <RecordScreen />}
      </PanelShell>
    </div>
  );
}
