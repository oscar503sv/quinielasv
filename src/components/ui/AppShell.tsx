import type { ReactNode } from "react";
import { Topbar } from "./Topbar";
import { Footer } from "./Footer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-bg">
      <Topbar />
      <main className="shell fade-up">{children}</main>
      <Footer />
    </div>
  );
}
