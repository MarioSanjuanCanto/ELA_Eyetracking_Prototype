import { Globe, Settings, LogOut } from "lucide-react";

type OnboardingTexts = {
  headerTitle: string;
  headerSubtitle: string;
};

type SiteHeaderProps = {
  lang: "es" | "en";
  onToggleLang: () => void;
  onToggleAdmin: () => void;
  isAdmin: boolean;
  t: OnboardingTexts;
};

export function SiteHeader({
  lang,
  onToggleLang,
  onToggleAdmin,
  isAdmin,
  t,
}: SiteHeaderProps) {
  return (
    <header className="w-full border-b border-border/60 bg-background">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-8 py-5">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {t.headerTitle}
          </h1>
          <p className="text-sm text-muted-foreground">{t.headerSubtitle}</p>
        </div>

        <div className="hidden items-center gap-10 md:flex">
          <img src="/valgrai.png" alt="valgrAI" className="h-12 object-contain" />
          <img src="/vrain.png" alt="VRAIN" className="h-12 object-contain" />
          <img src="/vertexlit.png" alt="vertexlit" className="h-10 object-contain" />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Globe className="h-4 w-4" />
            {lang.toUpperCase()}
          </button>
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium shadow-sm transition-all ${isAdmin ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted"}`}
          >
            <Settings className="h-4 w-4" />
            Admin
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted">
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
