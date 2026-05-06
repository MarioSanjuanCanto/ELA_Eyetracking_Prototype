import { ArrowLeft, ArrowRight, Lock, User, Eye } from "lucide-react";
import { useState } from "react";
import { deleteVoiceAction, getClonedVoicesAction } from "@/lib/voice-actions";

type OnboardingTexts = {
  nameTitle: string;
  nameDesc: string;
  nameLabel: string;
  namePlaceholder: string;
  nameDisclaimer: string;
  back: string;
  continue: string;
};

type NameScreenProps = {
  t: OnboardingTexts;
  onContinue: (name: string) => void;
  onBack: () => void;
  isAdmin?: boolean;
};

export function NameScreen({ t, onContinue, onBack, isAdmin }: NameScreenProps) {
  const [name, setName] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteVoice = async () => {
    if (!deleteId.trim()) return;
    setIsDeleting(true);
    try {
      await deleteVoiceAction({ voiceId: deleteId.trim() });
      alert("Voice deleted successfully");
      setDeleteId("");
    } catch (error) {
      console.error(error);
      alert("Error deleting voice");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGetVoices = async () => {
    try {
      const voices = await getClonedVoicesAction();
      const clonedVoices = voices.filter(
        (voice) => voice.category === "cloned" || voice.category === "professional" || (voice.samples?.length ?? 0) > 0,
      );
      console.log("Cloned voices:", clonedVoices);
      alert(
        clonedVoices.length
          ? `Voces encontradas: ${clonedVoices.map((voice) => voice.name).join(", ")}`
          : "No se encontraron voces clonadas."
      );
    } catch (error) {
      console.error("Error getting voices:", error);
      alert("No se pudieron cargar las voces.");
    }
  };

  return (
    <div className="relative flex w-full flex-col items-center px-6 py-4">
      <div
        className="flex h-52 w-52 items-center justify-center rounded-full text-white shadow-[0_20px_60px_-15px_rgba(120,80,220,0.55)] ring-8 ring-white/60"
        style={{
          background:
            "linear-gradient(160deg, var(--brand-from), var(--brand-via), var(--brand-to))",
        }}
      >
        <User className="h-24 w-24" strokeWidth={1.8} />
      </div>

      <h2 className="mt-8 text-3xl font-bold text-foreground">{t.nameTitle}</h2>
      <p className="mt-2 text-base text-foreground/80">{t.nameDesc}</p>

      <div className="mt-10 w-full max-w-3xl">
        <label className="mb-3 block text-base font-bold text-foreground">{t.nameLabel}</label>
        <div className="relative">
          <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.namePlaceholder}
            className="w-full rounded-2xl border border-border bg-background py-5 pl-12 pr-4 text-lg outline-none focus:ring-2 focus:ring-[oklch(0.7_0.18_280)]"
          />
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm text-foreground/80">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[oklch(0.95_0.04_290)] text-[oklch(0.55_0.2_280)]">
            <Lock className="h-4 w-4" />
          </span>
          {t.nameDisclaimer}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-3 rounded-full border border-border bg-background px-10 py-4 text-lg font-semibold text-foreground shadow-sm transition hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" /> {t.back}
          </button>
          <button
            disabled={!name.trim()}
            onClick={() => onContinue(name)}
            className="flex items-center gap-3 rounded-full px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(90deg, var(--brand-from), var(--brand-to))",
            }}
          >
            {t.continue} <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {isAdmin && (
          <div className="mt-16 flex w-full flex-col items-center border-t border-border pt-8">
            <h3 className="mb-6 text-sm font-bold text-foreground/50 uppercase tracking-widest">Admin Panel</h3>
            
            <div className="flex w-full max-w-sm flex-col gap-6">
              <button
                onClick={handleGetVoices}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                <Eye className="h-4 w-4" />
                Ver Voces Clonadas
              </button>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-foreground/60">Borrar Voz por ID</span>
                <div className="flex w-full gap-3">
                  <input
                    value={deleteId}
                    onChange={(e) => setDeleteId(e.target.value)}
                    placeholder="ID de la Voz"
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                  />
                  <button
                    onClick={handleDeleteVoice}
                    disabled={isDeleting || !deleteId.trim()}
                    className="rounded-xl bg-red-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                  >
                    {isDeleting ? "Borrando..." : "Borrar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
