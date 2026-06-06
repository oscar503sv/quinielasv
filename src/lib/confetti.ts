import confetti from "canvas-confetti";

/** Flag global para activar/desactivar el confeti (Tweak). */
let enabled = true;

export function setConfettiEnabled(value: boolean): void {
  enabled = value;
}

/**
 * Lanza ~90 piezas multicolor que caen desde `originX` (0–1).
 * Respeta prefers-reduced-motion y el flag global.
 */
export function fireConfetti(originX = 0.5): void {
  if (!enabled) return;
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    gravity: 1,
    ticks: 220,
    origin: { x: originX, y: 0.25 },
    colors: ["#f2c14e", "#f7d27c", "#54e08a", "#5b95ff", "#ff9a66", "#eaf1fb"],
  });
}
