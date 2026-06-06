import { flagUrl } from "@/lib/utils";

interface AvatarProps {
  /** Código del equipo del corazón; su bandera es la foto. */
  code: string | null;
  size?: number;
}

/** Avatar = bandera del equipo del corazón (spec §5/§6.6). */
export function Avatar({ code, size = 40 }: AvatarProps) {
  if (!code) {
    return (
      <span
        className="avatar"
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-2)",
          fontSize: size * 0.5,
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
      className="avatar"
      width={size}
      height={size}
      style={{ width: size, height: size }}
    />
  );
}
