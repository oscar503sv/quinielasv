import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { DataProvider } from "@/features/data/DataProvider";
import { AdminShell } from "@/components/ui/AdminShell";

// Panel admin: no indexar.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (!user.isAdmin) redirect("/dashboard");

  return (
    <AuthProvider
      initialName={user.name}
      initialEmail={user.email}
      initialIsAdmin={user.isAdmin}
    >
      <DataProvider>
        <AdminShell>{children}</AdminShell>
      </DataProvider>
    </AuthProvider>
  );
}
