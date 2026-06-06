import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { DataProvider } from "@/features/data/DataProvider";
import { AppShell } from "@/components/ui/AppShell";

// Vistas privadas (tras login): no indexar.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <AuthProvider
      initialName={user.name}
      initialEmail={user.email}
      initialIsAdmin={user.isAdmin}
    >
      <DataProvider>
        <AppShell>{children}</AppShell>
      </DataProvider>
    </AuthProvider>
  );
}
