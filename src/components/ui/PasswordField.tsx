"use client";

import { forwardRef, useState, type InputHTMLAttributes } from "react";

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement>;

/** Input de contraseña con toggle mostrar/ocultar. Compatible con react-hook-form. */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(props, ref) {
    const [show, setShow] = useState(false);
    return (
      <div style={{ position: "relative" }}>
        <input
          {...props}
          ref={ref}
          type={show ? "text" : "password"}
          className="input"
          style={{ paddingRight: 44 }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          title={show ? "Ocultar" : "Mostrar"}
          style={{
            position: "absolute",
            right: 6,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: "1.05rem",
            lineHeight: 1,
            padding: 6,
            color: "var(--text-dim)",
          }}
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>
    );
  },
);
