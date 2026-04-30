import { Mic, Play, RotateCw, Trash2, Upload } from "lucide-react";

const audios = ["example1.mp3", "example2.mp3", "example3.mp3"];

export function RecordScreen() {
  return (
    <div className="flex w-full flex-col items-center">
      <div
        className="relative flex h-64 w-64 items-center justify-center rounded-full text-white shadow-[0_20px_60px_-15px_rgba(120,80,220,0.55)] ring-8 ring-white/70"
        style={{
          background:
            "linear-gradient(160deg, var(--brand-from), var(--brand-via), var(--brand-to))",
        }}
      >
        <Mic className="h-24 w-24" strokeWidth={2} />
      </div>

      <div className="mt-10 w-full max-w-5xl rounded-2xl border border-border bg-background/80 p-6 shadow-md backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-foreground">Recorded audios</h3>
          <button className="flex items-center gap-2 rounded-full bg-[oklch(0.92_0.05_220)] px-5 py-2 text-sm font-semibold text-foreground hover:bg-[oklch(0.88_0.06_220)]">
            <Upload className="h-4 w-4" />
            Upload audio file
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {audios.map((a) => (
            <div
              key={a}
              className="flex items-center justify-between rounded-full border border-border bg-background px-6 py-4 shadow-sm"
            >
              <span className="font-semibold text-foreground">{a}</span>
              <div className="flex items-center gap-4 text-foreground/70">
                <button className="hover:text-foreground"><Play className="h-5 w-5" /></button>
                <button className="hover:text-foreground"><RotateCw className="h-5 w-5" /></button>
                <button className="hover:text-destructive"><Trash2 className="h-5 w-5" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full w-2/3 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--brand-from), var(--brand-to))" }}
            />
          </div>
          <p className="mt-3 text-base font-semibold text-foreground">
            Total data provided: <span className="font-normal">60 secs (min 10 secs)</span>
          </p>
        </div>
      </div>

      <div className="mt-8 flex w-full max-w-5xl justify-end">
        <button
          className="rounded-full px-10 py-4 text-lg font-semibold text-foreground shadow-lg transition hover:opacity-90"
          style={{
            background: "linear-gradient(90deg, var(--cta-from), var(--cta-to))",
          }}
        >
          Start Cloning
        </button>
      </div>
    </div>
  );
}