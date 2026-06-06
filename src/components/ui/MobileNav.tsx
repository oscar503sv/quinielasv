"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface NavItem {
  href: string;
  label: string;
}

/** Menú de navegación para móvil: botón ☰ que abre un panel con los enlaces. */
export function MobileNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="topbar-burger" style={{ position: "relative" }}>
      <button
        type="button"
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menú de navegación"
      >
        ☰
      </button>

      {open && (
        <div
          role="menu"
          className="card"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            minWidth: 200,
            padding: 6,
            zIndex: 40,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            // Fondo sólido (la superficie del .card es translúcida y deja ver atrás).
            background: "var(--bg-solid)",
            boxShadow: "0 20px 50px -16px rgba(0,0,0,.55)",
          }}
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="nav-link"
              data-active={pathname === item.href}
              style={{ display: "block" }}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
