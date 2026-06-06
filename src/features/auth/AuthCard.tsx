"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { PasswordField } from "@/components/ui/PasswordField";
import { fireConfetti } from "@/lib/confetti";
import {
  authErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  resetPassword,
} from "./auth-client";
import {
  loginSchema,
  recoverSchema,
  registerSchema,
  type LoginValues,
  type RecoverValues,
  type RegisterValues,
} from "./schemas";

type Mode = "login" | "register" | "recover";

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recoverSent, setRecoverSent] = useState(false);

  const login = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const register = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });
  const recover = useForm<RecoverValues>({
    resolver: zodResolver(recoverSchema),
  });

  function goMode(m: Mode) {
    setFormError(null);
    setRecoverSent(false);
    setMode(m);
  }

  async function onSuccess() {
    fireConfetti();
    router.replace("/dashboard");
    router.refresh();
  }

  async function handleLogin(values: LoginValues) {
    setFormError(null);
    setBusy(true);
    try {
      await loginWithEmail(values.email, values.password);
      await onSuccess();
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(values: RegisterValues) {
    setFormError(null);
    setBusy(true);
    try {
      await registerWithEmail(values.name, values.email, values.password);
      await onSuccess();
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setFormError(null);
    setBusy(true);
    try {
      await loginWithGoogle();
      await onSuccess();
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleRecover(values: RecoverValues) {
    setFormError(null);
    setBusy(true);
    try {
      await resetPassword(values.email);
      setRecoverSent(true);
    } catch (err) {
      setFormError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (mode === "recover") {
    return (
      <Card style={{ padding: 26, width: "100%", maxWidth: 420 }}>
        <h2 style={{ margin: "0 0 6px", fontSize: "1.2rem" }}>Recuperar contraseña</h2>
        <p style={{ color: "var(--text-dim)", fontSize: "0.9rem", margin: "0 0 18px" }}>
          Ingresá tu correo y te enviamos un enlace para restablecerla.
        </p>

        {recoverSent ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              className="card"
              style={{
                padding: 14,
                background: "var(--gold-soft)",
                borderColor: "var(--gold-border)",
                fontSize: "0.9rem",
              }}
            >
              📧 Si el correo está registrado, te enviamos un enlace para
              restablecer tu contraseña. Revisá tu bandeja (y el spam).
            </div>
            <Button type="button" variant="outline" block onClick={() => goMode("login")}>
              ← Volver a iniciar sesión
            </Button>
          </div>
        ) : (
          <form
            onSubmit={recover.handleSubmit(handleRecover)}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div className="field">
              <label htmlFor="recover-email">Correo</label>
              <input
                id="recover-email"
                type="email"
                className="input"
                placeholder="tu@correo.com"
                autoComplete="email"
                {...recover.register("email")}
              />
              {recover.formState.errors.email && (
                <span className="field-err">{recover.formState.errors.email.message}</span>
              )}
            </div>
            {formError && <span className="field-err">{formError}</span>}
            <Button type="submit" block disabled={busy}>
              {busy ? "Enviando…" : "Enviar enlace de recuperación"}
            </Button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => goMode("login")}
            >
              ← Volver a iniciar sesión
            </button>
          </form>
        )}
      </Card>
    );
  }

  return (
    <Card style={{ padding: 26, width: "100%", maxWidth: 420 }}>
      <div className="tabs" style={{ width: "100%", marginBottom: 20 }}>
        <button
          type="button"
          className="tab"
          data-active={mode === "login"}
          style={{ flex: 1 }}
          onClick={() => goMode("login")}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          className="tab"
          data-active={mode === "register"}
          style={{ flex: 1 }}
          onClick={() => goMode("register")}
        >
          Crear cuenta
        </button>
      </div>

      <Button
        type="button"
        variant="outline"
        block
        disabled={busy}
        onClick={handleGoogle}
      >
        <GoogleIcon />
        Continuar con Google
      </Button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "18px 0",
          color: "var(--text-faint)",
          fontSize: "0.8rem",
        }}
      >
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
        o con tu correo
        <span style={{ flex: 1, height: 1, background: "var(--border)" }} />
      </div>

      {mode === "login" ? (
        <form
          onSubmit={login.handleSubmit(handleLogin)}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div className="field">
            <label htmlFor="login-email">Correo</label>
            <input
              id="login-email"
              type="email"
              className="input"
              placeholder="tu@correo.com"
              autoComplete="email"
              {...login.register("email")}
            />
            {login.formState.errors.email && (
              <span className="field-err">
                {login.formState.errors.email.message}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="login-password">Contraseña</label>
            <PasswordField
              id="login-password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...login.register("password")}
            />
            {login.formState.errors.password && (
              <span className="field-err">
                {login.formState.errors.password.message}
              </span>
            )}
          </div>
          {formError && <span className="field-err">{formError}</span>}
          <button
            type="button"
            onClick={() => goMode("recover")}
            style={{
              alignSelf: "flex-start",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--gold)",
              fontSize: "0.84rem",
              fontWeight: 600,
              padding: 0,
            }}
          >
            ¿Olvidaste tu contraseña?
          </button>
          <Button type="submit" block disabled={busy}>
            {busy ? "Entrando…" : "Iniciar sesión"}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={register.handleSubmit(handleRegister)}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div className="field">
            <label htmlFor="reg-name">Nombre o apodo</label>
            <input
              id="reg-name"
              type="text"
              className="input"
              placeholder="Cómo te dicen"
              autoComplete="nickname"
              {...register.register("name")}
            />
            {register.formState.errors.name && (
              <span className="field-err">
                {register.formState.errors.name.message}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="reg-email">Correo</label>
            <input
              id="reg-email"
              type="email"
              className="input"
              placeholder="tu@correo.com"
              autoComplete="email"
              {...register.register("email")}
            />
            {register.formState.errors.email && (
              <span className="field-err">
                {register.formState.errors.email.message}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="reg-password">Contraseña</label>
            <PasswordField
              id="reg-password"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              {...register.register("password")}
            />
            {register.formState.errors.password && (
              <span className="field-err">
                {register.formState.errors.password.message}
              </span>
            )}
          </div>
          <div className="field">
            <label htmlFor="reg-confirm">Confirmar contraseña</label>
            <PasswordField
              id="reg-confirm"
              placeholder="Repetí la contraseña"
              autoComplete="new-password"
              {...register.register("confirm")}
            />
            {register.formState.errors.confirm && (
              <span className="field-err">
                {register.formState.errors.confirm.message}
              </span>
            )}
          </div>
          {formError && <span className="field-err">{formError}</span>}
          <Button type="submit" block disabled={busy}>
            {busy ? "Creando…" : "Crear cuenta"}
          </Button>
        </form>
      )}
    </Card>
  );
}
