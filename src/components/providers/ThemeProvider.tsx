"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { setConfettiEnabled } from "@/lib/confetti";

type Theme = "dark" | "light";
type Accent = "dorado" | "azul" | "esmeralda" | "coral";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
  confetti: boolean;
  setConfetti: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_KEY = "q26_theme";
const ACCENT_KEY = "q26_accent";
const CONFETTI_KEY = "q26_confetti";

/** Lee el valor inicial en el cliente (el themeScript ya seteó data-theme). */
function readInitial<T>(read: () => T, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    return read();
  } catch {
    return fallback;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() =>
    readInitial<Theme>(
      () =>
        (document.documentElement.getAttribute("data-theme") as Theme | null) ??
        (localStorage.getItem(THEME_KEY) as Theme | null) ??
        "dark",
      "dark",
    ),
  );
  const [accent, setAccentState] = useState<Accent>(() =>
    readInitial<Accent>(
      () => (localStorage.getItem(ACCENT_KEY) as Accent | null) ?? "dorado",
      "dorado",
    ),
  );
  const [confetti, setConfettiState] = useState(() =>
    readInitial(() => localStorage.getItem(CONFETTI_KEY) !== "false", true),
  );

  // Reflejar en el <html> y persistir.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (accent === "dorado") root.removeAttribute("data-accent");
    else root.setAttribute("data-accent", accent);
    localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  useEffect(() => {
    setConfettiEnabled(confetti);
    localStorage.setItem(CONFETTI_KEY, String(confetti));
  }, [confetti]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        accent,
        setAccent: setAccentState,
        confetti,
        setConfetti: setConfettiState,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return ctx;
}
