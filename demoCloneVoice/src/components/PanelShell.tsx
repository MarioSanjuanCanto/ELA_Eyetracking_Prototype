import { ReactNode } from "react";

export function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div 
      className="flex min-h-[calc(100vh-90px)] flex-col"
      style={{
        background:
          "linear-gradient(135deg, var(--panel-from), var(--panel-via) 50%, var(--panel-to))",
      }}
    >
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col items-center justify-center p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}