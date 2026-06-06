import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
}

const variantClass: Record<Variant, string> = {
  gold: "btn-gold",
  outline: "btn-outline",
  ghost: "btn-ghost",
};

export function Button({
  variant = "gold",
  block,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn("btn", variantClass[variant], block && "btn-block", className)}
      {...props}
    />
  );
}
