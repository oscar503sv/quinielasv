import type { ReactNode } from "react";
import { AdminTopbar } from "./AdminTopbar";
import { Footer } from "./Footer";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-bg">
      <AdminTopbar />
      <main className="shell fade-up">{children}</main>
      <Footer />
    </div>
  );
}
