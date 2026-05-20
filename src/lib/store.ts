import { useSyncExternalStore } from "react";

export type User = { name: string; phone: string } | null;

export type Reservation = {
  id: string;
  med: string;
  pharmacyId: string;
  pharmacyName: string;
  price: number;
  stage: 0 | 1 | 2;
  createdAt: number;
  hasPrescription: boolean;
  prescriptionName?: string;
};

export type Prescription = { name: string; uploadedAt: number } | null;

export type KnownAccount = { name: string; phone: string };

type State = {
  user: User;
  reservations: Reservation[];
  prescription: Prescription;
  knownAccounts: KnownAccount[];
};

const KEY = "medlocs-state-v1";
const initial: State = { user: null, reservations: [], prescription: null, knownAccounts: [] };

let state: State = initial;
const listeners = new Set<() => void>();

function load(): State {
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

function persist() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }
  listeners.forEach((l) => l());
}

let hydrated = false;
function ensureHydrated() {
  if (!hydrated && typeof window !== "undefined") {
    state = load();
    hydrated = true;
  }
}

export const store = {
  get(): State {
    ensureHydrated();
    return state;
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  setUser(user: User) {
    if (user) {
      const exists = state.knownAccounts.some((a) => a.phone === user.phone);
      const knownAccounts = exists
        ? state.knownAccounts.map((a) => (a.phone === user.phone ? { ...a, name: user.name } : a))
        : [...state.knownAccounts, { name: user.name, phone: user.phone }];
      state = { ...state, user, knownAccounts };
    } else {
      state = { ...state, user };
    }
    persist();
  },
  findAccount(phone: string): KnownAccount | undefined {
    ensureHydrated();
    return state.knownAccounts.find((a) => a.phone === phone);
  },
  signOut() {
    state = { ...state, user: null };
    persist();
  },
  setPrescription(prescription: Prescription) {
    state = { ...state, prescription };
    persist();
  },
  addReservation(r: Omit<Reservation, "id" | "createdAt" | "stage">): Reservation {
    const full: Reservation = {
      ...r,
      id: "MDL-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      createdAt: Date.now(),
      stage: 0,
    };
    state = { ...state, reservations: [full, ...state.reservations] };
    persist();
    return full;
  },
  getReservation(id: string) {
    return state.reservations.find((r) => r.id === id);
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.get()),
    () => selector(initial),
  );
}
