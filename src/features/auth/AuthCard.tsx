"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { fireConfetti } from "@/lib/confetti";
import {
  authErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from "./auth-client";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "./schemas";

type Mode = "login" | "register";

export function AuthCard() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const login = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const register = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

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

  return (
    <Card style={{ padding: 26, width: "100%", maxWidth: 420 }}>
      <div className="tabs" style={{ width: "100%", marginBottom: 20 }}>
        <button
          type="button"
          className="tab"
          data-active={mode === "login"}
          style={{ flex: 1 }}
          onClick={() => setMode("login")}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          className="tab"
          data-active={mode === "register"}
          style={{ flex: 1 }}
          onClick={() => setMode("register")}
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
            <input
              id="login-password"
              type="password"
              className="input"
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
            <input
              id="reg-password"
              type="password"
              className="input"
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
            <input
              id="reg-confirm"
              type="password"
              className="input"
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
