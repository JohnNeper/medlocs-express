import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, MapPin, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { getPharmacy, findMedication } from "@/lib/medlocs-data";
import { AppShell } from "@/components/medlocs/AppShell";
import { store, useStore } from "@/lib/store";

type Search = { q: string };

export const Route = createFileRoute("/reservation/$pharmacyId")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" && s.q.length > 0 ? s.q : "Paracétamol 500mg",
  }),
  head: () => ({ meta: [{ title: "Confirmation — MedLocs" }] }),
  component: ReservationPage,
});

function ReservationPage() {
  const { pharmacyId } = Route.useParams();
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const prescription = useStore((s) => s.prescription);

  const pharmacy = getPharmacy(pharmacyId);
  const med = findMedication(q);

  if (!pharmacy) {
    return <Navigate to="/" />;
  }

  if (!user) {
    const next = `/reservation/${pharmacyId}?q=${encodeURIComponent(q)}`;
    return <Navigate to="/auth" search={{ next }} />;
  }

  if (med.prescription && !prescription) {
    const next = `/reservation/${pharmacyId}?q=${encodeURIComponent(q)}`;
    return <Navigate to="/ordonnance" search={{ q, next }} />;
  }

  const onConfirm = () => {
    const r = store.addReservation({
      med: med.name,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      price: pharmacy.price,
      hasPrescription: !!prescription,
      prescriptionName: prescription?.name,
    });
    // Clear prescription so it isn't reused silently for next reservation
    if (prescription) store.setPrescription(null);
    navigate({ to: "/confirmation/$reservationId", params: { reservationId: r.id } });
  };

  return (
    <AppShell hideNav>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/recherche" search={{ q }} className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">Confirmation</h1>
      </header>

      <div className="px-5 space-y-4">
        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          <div className="relative h-32 bg-primary-soft">
            <svg viewBox="0 0 400 160" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
              <path d="M0 110 Q120 90 200 120 T 400 100" stroke="oklch(0.62 0.13 165 / 0.5)" strokeWidth="6" fill="none" />
              <path d="M80 0 Q100 60 160 100 T 240 160" stroke="oklch(0.62 0.13 165 / 0.35)" strokeWidth="4" fill="none" />
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <div className="grid place-items-center h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-pop">
                <MapPin className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Officine sélectionnée</p>
            <h3 className="mt-0.5 font-semibold">{pharmacy.name}</h3>
            <p className="text-xs text-muted-foreground">{pharmacy.address} · {pharmacy.distance}</p>
            <p className="text-xs text-muted-foreground mt-1">{pharmacy.landmark}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-xs text-muted-foreground">Médicament</p>
          <p className="font-semibold">{med.name}</p>
          <div className="my-4 h-px bg-border" />
          <p className="text-xs text-muted-foreground">Montant de votre ordonnance</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">
            {pharmacy.price.toLocaleString("fr-FR")} <span className="text-lg font-semibold text-muted-foreground">FCFA</span>
          </p>
          <div className="my-4 h-px bg-border" />
          <div className="flex items-start gap-3 text-sm">
            <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <p className="text-muted-foreground leading-relaxed">
              Tarif confidentiel négocié avec <span className="text-foreground font-medium">{pharmacy.name}</span>. Stock réservé pendant 2h.
            </p>
          </div>
        </div>

        {prescription && (
          <div className="rounded-2xl border border-primary/30 bg-primary-soft/60 p-4 flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary text-primary-foreground">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-primary font-bold">Ordonnance jointe</p>
              <p className="text-sm font-semibold truncate">{prescription.name}</p>
            </div>
            <Link to="/ordonnance" search={{ q, next: `/reservation/${pharmacyId}?q=${encodeURIComponent(q)}` }} className="text-xs font-semibold text-primary">
              Changer
            </Link>
          </div>
        )}

        {med.prescription && !prescription && (
          <Link
            to="/ordonnance"
            search={{ q, next: `/reservation/${pharmacyId}?q=${encodeURIComponent(q)}` }}
            className="flex items-center gap-3 rounded-2xl border border-warning/50 bg-warning/15 p-4"
          >
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-warning text-warning-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Ordonnance requise</p>
              <p className="text-xs text-muted-foreground">Téléversez votre prescription</p>
            </div>
          </Link>
        )}

        <button
          onClick={onConfirm}
          className="w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-4 shadow-pop active:scale-[0.99] transition"
        >
          Confirmer et Bloquer mon Ordonnance
        </button>

        <p className="text-center text-xs text-muted-foreground leading-relaxed px-4">
          Frais de service d'ordonnance : <span className="font-semibold text-foreground">200 FCFA</span> payables via
          <span className="font-semibold text-foreground"> MTN MoMo / Orange Money</span> lors de la validation.
        </p>
      </div>
    </AppShell>
  );
}
