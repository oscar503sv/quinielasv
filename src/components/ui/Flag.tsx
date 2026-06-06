import { flagUrl } from "@/lib/utils";

interface FlagProps {
  code: string | null | undefined;
  /** ancho en px */
  w?: number;
  /** alto en px */
  h?: number;
  /** border-radius en px */
  r?: number;
  className?: string;
}

/** Bandera real por código ISO (flagcdn), con anillo de 1px. */
export function Flag({ code, w = 32, h = 22, r = 5, className }: FlagProps) {
  if (!code) {
    return (
      <span
        className={className}
        style={{
          width: w,
          height: h,
          borderRadius: r,
          background: "var(--surface-2)",
          boxShadow: "0 0 0 1px var(--border)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: Math.min(w, h) * 0.62,
          flexShrink: 0,
        }}
      >
        ⚽
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagUrl(code)}
      alt={code}
      width={w}
      height={h}
      className={className}
      style={{
        width: w,
        height: h,
        borderRadius: r,
        objectFit: "cover",
        boxShadow: "0 0 0 1px var(--border)",
        flexShrink: 0,
      }}
    />
  );
}
