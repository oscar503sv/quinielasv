"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { subscribeMatches } from "@/repositories/matches.client";
import { subscribeAllPredictions } from "@/repositories/predictions.client";
import { subscribeAllUsers } from "@/repositories/users.client";
import { subscribeTournament } from "@/repositories/tournament.client";
import {
  computeStandings,
  positionOf,
} from "@/services/standings.service";
import { useAuth } from "@/features/auth/AuthProvider";
import type { Match, Prediction, Standing, Tournament, User } from "@/types";

interface DataContextValue {
  matches: Match[];
  predictions: Prediction[]; // todos
  myPredictions: Map<string, Prediction>; // por matchId
  users: User[];
  tournament: Tournament | null;
  standings: Standing[];
  myPosition: number;
  loading: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { uid } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [ready, setReady] = useState({ m: false, p: false, u: false, t: false });

  useEffect(() => {
    const unsubs = [
      subscribeMatches((m) => {
        setMatches(m);
        setReady((r) => ({ ...r, m: true }));
      }),
      subscribeAllPredictions((p) => {
        setPredictions(p);
        setReady((r) => ({ ...r, p: true }));
      }),
      subscribeAllUsers((u) => {
        setUsers(u);
        setReady((r) => ({ ...r, u: true }));
      }),
      subscribeTournament((t) => {
        setTournament(t);
        setReady((r) => ({ ...r, t: true }));
      }),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, []);

  const standings = useMemo(
    () =>
      computeStandings(matches, predictions, users, uid ?? undefined, tournament),
    [matches, predictions, users, uid, tournament],
  );

  const myPredictions = useMemo(() => {
    const map = new Map<string, Prediction>();
    if (uid) {
      for (const p of predictions) {
        if (p.userId === uid) map.set(p.matchId, p);
      }
    }
    return map;
  }, [predictions, uid]);

  const myPosition = useMemo(
    () => (uid ? positionOf(standings, uid) : 0),
    [standings, uid],
  );

  const loading = !(ready.m && ready.p && ready.u && ready.t);

  return (
    <DataContext.Provider
      value={{
        matches,
        predictions,
        myPredictions,
        users,
        tournament,
        standings,
        myPosition,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de DataProvider");
  return ctx;
}
