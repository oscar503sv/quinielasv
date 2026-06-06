import type { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";
import { ShellGate } from "./ShellGate";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-bg">
      <Topbar />
      <main className="shell fade-up">
        <ShellGate>{children}</ShellGate>
      </main>
      <Footer />
    </div>
  );
}
