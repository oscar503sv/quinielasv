import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "gold" | "blue" | "good" | "bad" | "dim";

interface PillProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  live?: boolean;
}

const toneClass: Record<Tone, string> = {
  default: "",
  gold: "pill-gold",
  blue: "pill-blue",
  good: "pill-good",
  bad: "pill-bad",
  dim: "pill-dim",
};

export function Pill({ tone = "default", live, className, ...props }: PillProps) {
  return (
    <span
      className={cn("pill", toneClass[tone], live && "pill-live", className)}
      {...props}
    />
  );
}
