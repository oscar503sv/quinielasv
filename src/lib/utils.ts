import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** URL de bandera por código ISO (flagcdn). Inglaterra = "gb-eng". */
export function flagUrl(code: string, w = 160): string {
  return `https://flagcdn.com/w${w}/${code}.png`;
}

/** "Cierra en 3 h 40 m" / "Cerrado" a partir del timestamp de cierre. */
export function lockLabel(lockAt: number, now = Date.now()): string {
  const diff = lockAt - now;
  if (diff <= 0) return "Cerrado";
  const mins = Math.floor(diff / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `Cierra en ${d} d ${h % 24} h`;
  }
  if (h > 0) return `Cierra en ${h} h ${m} m`;
  return `Cierra en ${m} m`;
}
