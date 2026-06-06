import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FbUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/client";
import { ensureUserDoc } from "@/repositories/users.client";

/** Intercambia el idToken por una session cookie httpOnly en el servidor. */
async function establishSession(user: FbUser): Promise<void> {
  const idToken = await user.getIdToken();
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) throw new Error("No se pudo iniciar la sesión.");
  await ensureUserDoc(user.uid, {
    name: user.displayName ?? "Jugador",
    email: user.email ?? "",
  });
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<void> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  await establishSession(cred.user);
}

export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await establishSession(cred.user);
}

export async function loginWithGoogle(): Promise<void> {
  const cred = await signInWithPopup(auth, googleProvider);
  await establishSession(cred.user);
}

/** Envía el correo para restablecer la contraseña. */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/** Cierra sesión en el cliente y borra la session cookie. */
export async function logout(): Promise<void> {
  await signOut(auth);
  await fetch("/api/auth/session", { method: "DELETE" });
}

/** Traduce códigos de error de Firebase Auth a mensajes en español. */
export function authErrorMessage(err: unknown): string {
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code: unknown }).code)
      : "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos.";
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/invalid-email":
      return "Ingresá un correo válido.";
    case "auth/weak-password":
      return "La contraseña es muy débil.";
    case "auth/popup-closed-by-user":
      return "Cerraste la ventana de Google antes de terminar.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Probá de nuevo en un rato.";
    default:
      return "Algo salió mal. Probá de nuevo.";
  }
}
