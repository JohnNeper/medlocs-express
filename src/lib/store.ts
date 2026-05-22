import { useSyncExternalStore } from "react";
import { reservationApi } from "./api";
import type { Pharmacy } from "./medlocs-data";

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

export type Prescription = { name: string; uploadedAt: number; relativePath?: string } | null;

export type KnownAccount = { name: string; phone: string };

type State = {
  user: User;
  reservations: Reservation[];
  prescription: Prescription;
  knownAccounts: KnownAccount[];
  pharmacies: Pharmacy[];
};

const KEY = "medlocs-state-v1";
const initial: State = { user: null, reservations: [], prescription: null, knownAccounts: [], pharmacies: [] };

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
  setPharmacies(pharmacies: Pharmacy[]) {
    state = { ...state, pharmacies };
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

    // Sync to Express backend in the background (local-first / offline fallback)
    const body = {
      reservationId: full.id,
      customerName: state.user?.name || "Anonyme",
      customerPhone: state.user?.phone || "",
      items: [{
        name: r.med,
        quantity: 1,
        price: r.price,
        medicineId: r.med
      }],
      totalAmount: r.price,
      pharmacyId: r.pharmacyId,
      pharmacyName: r.pharmacyName,
      prescriptionAttachment: state.prescription?.relativePath || undefined,
      prescriptionFromApp: r.hasPrescription,
      notes: r.hasPrescription ? `Ordonnance jointe: ${state.prescription?.name}` : undefined
    };

    reservationApi.createReservation(body)
    .then(data => {
      console.log("Reservation successfully synced with Express backend:", data);
      store.syncReservations();
    })
    .catch(err => {
      console.warn("Reservation saved locally (offline mode). Background sync failed:", err);
    });

    return full;
  },
  async syncReservations() {
    ensureHydrated();
    const phone = state.user?.phone;
    if (!phone) return;
    try {
      const data = await reservationApi.getReservationsByPhone(phone);
      if (data && data.code === "done" && Array.isArray(data.reservations)) {
        const updatedReservations: Reservation[] = data.reservations.map((srv: any) => {
          let stage: 0 | 1 | 2 = 0;
          if (srv.status === "pending") stage = 1;
          else if (srv.status === "ready" || srv.status === "delivered") stage = 2;

          return {
            id: srv.reservationId,
            med: srv.items?.[0]?.name || "Médicament",
            pharmacyId: srv.pharmacyId,
            pharmacyName: srv.pharmacyName,
            price: srv.totalAmount,
            stage,
            createdAt: new Date(srv.createdAt).getTime(),
            hasPrescription: srv.prescriptionFromApp,
            prescriptionName: srv.prescriptionFromApp ? "Ordonnance médicale" : undefined
          };
        });

        // Merge keeping local reservations that aren't on the server yet
        const serverIds = new Set(updatedReservations.map(r => r.id));
        const localsNotOnServer = state.reservations.filter(r => !serverIds.has(r.id));
        
        state = {
          ...state,
          reservations: [...localsNotOnServer, ...updatedReservations]
        };
        persist();
      }
    } catch (e) {
      console.error("Failed to sync reservations from server:", e);
    }
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
