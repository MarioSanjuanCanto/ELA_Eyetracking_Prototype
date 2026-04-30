import { ReactNode } from "react";

export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-90px)] bg-[var(--app-bg)] px-6 py-8">
      <div className="mx-auto max-w-[1400px]">
        <div
          className="rounded-3xl p-10 shadow-[0_10px_40px_-20px_rgba(120,100,200,0.25)] ring-1 ring-white/60"
          style={{
            background:
              "linear-gradient(135deg, var(--panel-from), var(--panel-via) 50%, var(--panel-to))",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}