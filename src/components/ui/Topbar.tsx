"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";

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
        <span className="logo-year" style={{ color: "var(--gold)" }}>2026</span>
      </Link>

      <nav className="topbar-nav">
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

      <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 16 }}>
        <ThemeToggle />
        <NotificationBell />
        <MobileNav nav={NAV} />
        <UserMenu />
      </div>
    </header>
  );
}
