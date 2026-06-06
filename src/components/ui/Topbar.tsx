"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/partidos", label: "Partidos" },
  { href: "/reglas", label: "Cómo se juega" },
  { href: "/ranking", label: "Ranking" },
  { href: "/estadisticas", label: "Estadísticas" },
];

export function Topbar() {
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
        href="/dashboard"
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
        <Image
          src="/quinielasv-logo.png"
          alt="Quiniela Mundial 2026"
          width={32}
          height={32}
          priority
        />
        <span>Quiniela</span>
        <span style={{ color: "var(--gold)" }}>2026</span>
      </Link>

      <nav style={{ display: "flex", gap: 2, marginLeft: 8, flex: 1, overflowX: "auto" }}>
        {NAV.map((item) => (
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

      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
