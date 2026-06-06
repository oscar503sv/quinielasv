"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User as FbUser } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { ensureUserDoc, subscribeUser } from "@/repositories/users.client";
import type { User } from "@/types";

interface AuthContextValue {
  uid: string | null;
  email: string | null;
  /** Doc de perfil en Firestore (support, championPrediction, name). */
  profile: User | null;
  /** Rol admin resuelto en el servidor (ADMIN_EMAILS). */
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /** Datos del usuario resueltos en el servidor (gating ya hecho). */
  initialName: string;
  initialEmail: string;
  initialIsAdmin: boolean;
}

export function AuthProvider({
  children,
  initialName,
  initialEmail,
  initialIsAdmin,
}: AuthProviderProps) {
  const [fbUser, setFbUser] = useState<FbUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setFbUser(u);
      if (u) {
        await ensureUserDoc(u.uid, {
          name: u.displayName ?? initialName,
          email: u.email ?? initialEmail,
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, [initialName, initialEmail]);

  useEffect(() => {
    if (!fbUser) return;
    return subscribeUser(fbUser.uid, setProfile);
  }, [fbUser]);

  return (
    <AuthContext.Provider
      value={{
        uid: fbUser?.uid ?? null,
        email: fbUser?.email ?? initialEmail,
        profile,
        isAdmin: initialIsAdmin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
