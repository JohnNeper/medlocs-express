import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck, Navigation, Clock, Info, FileText } from "lucide-react";
import { PHARMACIES, findMedication, type Pharmacy } from "@/lib/medlocs-data";
import { AppShell } from "@/components/medlocs/AppShell";
import { PharmacyInfoDrawer } from "@/components/medlocs/PharmacyInfoDrawer";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

type Search = { q: string; filter?: "open" | "duty" | "near" };

export const Route = createFileRoute("/recherche")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" && s.q.length > 0 ? s.q : "Paracétamol 500mg",
    filter: s.filter === "open" || s.filter === "duty" || s.filter === "near" ? s.filter : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Résultats — MedLocs" },
      { name: "description", content: "Pharmacies de Bafoussam ayant votre médicament en stock." },
    ],
  }),
  component: SearchResultsPage,
});

function SearchResultsPage() {
  const { q, filter: initialFilter } = Route.useSearch();
  const navigate = useNavigate();
  const med = useMemo(() => findMedication(q), [q]);
  const prescription = useStore((s) => s.prescription);
  const [infoFor, setInfoFor] = useState<Pharmacy | null>(null);
  const [filter, setFilter] = useState<"open" | "duty" | "near" | null>(initialFilter ?? null);

  const pharmacies = useMemo(() => {
    let list = [...PHARMACIES].sort((a, b) => a.distanceM - b.distanceM);
    if (filter === "open") list = list.filter((p) => p.open);
    if (filter === "duty") list = list.filter((p) => p.onDuty);
    return list;
  }, [filter]);

  const needsPrescription = med.prescription && !prescription;

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/" className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Résultats pour</p>
          <h1 className="text-base font-bold leading-tight truncate">{med.name}</h1>
        </div>
        {med.prescription && (
          <span className="text-[10px] font-bold uppercase text-warning-foreground bg-warning/40 rounded-full px-2 py-1">
            Ordonnance
          </span>
        )}
      </header>

      <div className="px-5">
        {needsPrescription && (
          <Link
            to="/ordonnance"
            search={{ q }}
            className="flex items-center gap-3 rounded-2xl border border-warning/50 bg-warning/15 p-4 mb-4 active:scale-[0.99] transition"
          >
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-warning text-warning-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold leading-tight">Médicament sur ordonnance</p>
              <p className="text-xs text-muted-foreground">Téléversez votre ordonnance pour réserver</p>
            </div>
            <span className="text-xs font-bold text-warning-foreground">Joindre</span>
          </Link>
        )}

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 mb-3">
          {[
            { id: null, label: "Toutes" },
            { id: "open" as const, label: "🟢 Ouvert" },
            { id: "duty" as const, label: "⏰ De garde" },
            { id: "near" as const, label: "📍 Proches" },
          ].map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={String(f.id)}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition border ${
                  active ? "bg-primary text-primary-foreground border-primary shadow-pop" : "bg-card text-foreground border-border"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-primary-soft/60 p-4 flex items-center gap-3">
          <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold leading-tight">{pharmacies.length} officines synchronisées</p>
            <p className="text-xs text-muted-foreground">Triées par distance — données temps réel</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {pharmacies.map((p) => (
            <article key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="grid place-items-center h-12 w-12 rounded-2xl bg-primary-soft text-primary text-lg font-bold">
                  {p.name.split(" ").slice(-1)[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold leading-tight truncate">{p.name}</h3>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                        p.open ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.open ? "Ouvert" : "Fermé"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{p.address}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs flex-wrap">
                    <span className="inline-flex items-center gap-1 text-foreground font-medium">
                      <Navigation className="h-3.5 w-3.5 text-primary" /> {p.distance}
                    </span>
                    {p.onDuty && (
                      <span className="inline-flex items-center gap-1 text-warning-foreground bg-warning/30 rounded-full px-2 py-0.5 font-semibold">
                        <Clock className="h-3 w-3" /> De garde
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => navigate({ to: "/reservation/$pharmacyId", params: { pharmacyId: p.id }, search: { q } })}
                  className="flex-1 rounded-xl bg-gradient-primary text-primary-foreground font-semibold py-3 shadow-pop active:scale-[0.99] transition"
                >
                  Voir le prix &amp; Réserver
                </button>
                <button
                  onClick={() => setInfoFor(p)}
                  aria-label="Informations sur l'officine"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                >
                  <Info className="h-3.5 w-3.5" />
                  Infos
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <PharmacyInfoDrawer pharmacy={infoFor} open={!!infoFor} onClose={() => setInfoFor(null)} />
    </AppShell>
  );
}
