import { Globe, Settings, LogOut } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border/60 bg-background">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-8 py-5">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Recovering my voice
          </h1>
          <p className="text-sm text-muted-foreground">Personalized voice synthesis</p>
        </div>

        <div className="hidden items-center gap-10 md:flex">
          <LogoText title="valgrAI" subtitle={"Valencian Graduate School\nand Research Network\nof Artificial Intelligence"} accent />
          <LogoText title="VRAIN" subtitle={"Valencian Research Institute\nfor Artificial Intelligence"} prefix="UPV" />
          <LogoText title="vertexlit" shieldIcon />
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted">
            <Globe className="h-4 w-4" />
            ES
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted">
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

function LogoText({
  title,
  subtitle,
  prefix,
  accent,
  shieldIcon,
}: {
  title: string;
  subtitle?: string;
  prefix?: string;
  accent?: boolean;
  shieldIcon?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {prefix && (
        <div className="border-r border-foreground/40 pr-2 text-xs font-bold tracking-wider text-foreground">
          {prefix}
        </div>
      )}
      {shieldIcon && (
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[oklch(0.65_0.18_160)] to-[oklch(0.55_0.2_240)] text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3z"/></svg>
        </div>
      )}
      <div className="flex flex-col leading-tight">
        <span className={`text-lg font-extrabold ${accent ? "text-[oklch(0.6_0.2_265)]" : "text-foreground"}`}>
          {title}
        </span>
        {subtitle && (
          <span className="whitespace-pre-line text-[9px] leading-tight text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}