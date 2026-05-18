import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import { QRCode } from "@/components/medlocs/QRCode";
import { Timeline } from "@/components/medlocs/Timeline";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/confirmation/$reservationId")({
  head: () => ({ meta: [{ title: "Réservation confirmée — MedLocs" }] }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { reservationId } = Route.useParams();
  const reservation = useStore((s) => s.reservations.find((r) => r.id === reservationId));

  if (!reservation) return <Navigate to="/reservations" />;

  return (
    <AppShell hideNav>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary-soft text-primary">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-base font-bold leading-tight">Ordonnance réservée</h1>
          <p className="text-xs text-muted-foreground">Présentez ce QR à l'officine</p>
        </div>
      </header>

      <div className="px-5 space-y-5">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col items-center">
          <QRCode seed={reservation.id} />
          <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Code de retrait</p>
          <p className="text-lg font-bold tracking-widest">{reservation.id}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Officine</p>
          <h3 className="mt-0.5 font-semibold">{reservation.pharmacyName}</h3>
          <p className="text-xs text-muted-foreground">{reservation.med}</p>
          {reservation.hasPrescription && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft text-primary text-[11px] font-semibold px-2 py-0.5">
              <CheckCircle2 className="h-3 w-3" /> Ordonnance jointe
            </p>
          )}

          <div className="mt-5">
            <Timeline stage={reservation.stage} />
          </div>
        </div>

        <Link
          to="/reservations"
          className="block text-center w-full rounded-2xl bg-foreground text-background font-semibold py-4 active:scale-[0.99] transition"
        >
          Voir mes réservations
        </Link>
        <Link to="/" className="block text-center w-full text-sm text-muted-foreground py-2">
          Retour à l'accueil
        </Link>
      </div>
    </AppShell>
  );
}
