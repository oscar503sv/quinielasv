"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Pill } from "./Pill";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/partidos", label: "Partidos" },
  { href: "/admin/resultados", label: "Resultados" },
  { href: "/admin/jugadores", label: "Jugadores" },
  { href: "/admin/ligas", label: "Ligas" },
  { href: "/admin/torneo", label: "Torneo" },
];

export function AdminTopbar() {
  const pathname = usePathname();

  return (
    <header
      className="topbar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(12px)",
      }}
    >
      <Link
        href="/admin/dashboard"
        className="display"
        style={{
          fontSize: "1.15rem",
          fontWeight: 800,
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
        }}
      >
        <Image src="/quinielasv-logo.png" alt="" width={32} height={32} priority />
        <span>Quiniela</span>
        <Pill tone="gold">ADMIN</Pill>
      </Link>

      <nav style={{ display: "flex", gap: 2, marginLeft: 8, flex: 1, overflowX: "auto" }}>
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link"
            data-active={pathname === item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link href="/dashboard" className="nav-link" style={{ whiteSpace: "nowrap" }}>
        ← App
      </Link>
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
