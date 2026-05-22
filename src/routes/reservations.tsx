import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Ticket } from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import { Timeline } from "@/components/medlocs/Timeline";
import { store, useStore } from "@/lib/store";

export const Route = createFileRoute("/reservations")({
  head: () => ({ meta: [{ title: "Mes réservations — MedLocs" }] }),
  component: ReservationsPage,
});

function ReservationsPage() {
  const reservations = useStore((s) => s.reservations);
  const user = useStore((s) => s.user);

  useEffect(() => {
    store.syncReservations();
    const interval = setInterval(() => {
      store.syncReservations();
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">Mes réservations</h1>
        <p className="text-xs text-muted-foreground mt-1">Suivi en temps réel de vos ordonnances</p>
      </header>
      <div className="px-5">
        {reservations.length === 0 ? (
          <div className="mt-12 text-center px-6">
            <div className="mx-auto grid place-items-center h-20 w-20 rounded-3xl bg-primary-soft text-primary">
              <Ticket className="h-8 w-8" />
            </div>
            <h3 className="mt-5 font-semibold">Aucune réservation</h3>
            <p className="mt-1 text-sm text-muted-foreground">Recherchez un médicament pour commencer.</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-2xl bg-gradient-primary text-primary-foreground font-semibold px-5 py-3 shadow-pop"
            >
              Rechercher
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => (
              <Link
                key={r.id}
                to="/confirmation/$reservationId"
                params={{ reservationId: r.id }}
                className="block rounded-2xl border border-border bg-card p-5 shadow-card active:scale-[0.99] transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{r.id}</p>
                    <h3 className="font-semibold mt-0.5">{r.med}</h3>
                    <p className="text-xs text-muted-foreground">{r.pharmacyName}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-primary-soft text-primary">
                    Actif
                  </span>
                </div>
                <div className="mt-4">
                  <Timeline stage={r.stage} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
