import { AudioLines, User, ShieldCheck, Sparkles, LucideIcon } from "lucide-react";

export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex w-full flex-col items-center">
      <button
        onClick={onStart}
        className="group relative flex h-[340px] w-[340px] items-center justify-center rounded-full text-white shadow-[0_20px_60px_-15px_rgba(120,80,220,0.55)] ring-8 ring-white/60 transition-transform hover:scale-105"
        style={{
          background:
            "linear-gradient(160deg, var(--brand-from), var(--brand-via), var(--brand-to))",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <AudioLines className="h-16 w-16" strokeWidth={2.5} />
          <span className="text-4xl font-bold">Start Demo</span>
        </div>
      </button>

      <p className="mt-8 text-xl font-medium text-foreground">Experience personalized voice synthesis</p>

      <div className="mt-12 grid w-full max-w-[1100px] gap-6 md:grid-cols-3">
        <FeatureCard 
          icon={User}
          title="Personalized" 
          desc="Clone you unique voice characteristics" 
        />
        <FeatureCard 
          icon={ShieldCheck}
          title="Secure & Private" 
          desc="Your data is encrypted and handled with care" 
        />
        <FeatureCard 
          icon={Sparkles}
          title="AI Powered" 
          desc="State-of-the-art AI for natural and expressive speech" 
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/70 bg-background/70 p-5 shadow-sm backdrop-blur">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[oklch(0.95_0.04_290)] text-[oklch(0.55_0.2_280)]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}