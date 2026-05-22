import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck, Navigation, Clock, Info, FileText } from "lucide-react";
import { PHARMACIES, findMedication, type Pharmacy } from "@/lib/medlocs-data";
import { AppShell } from "@/components/medlocs/AppShell";
import { PharmacyInfoDrawer } from "@/components/medlocs/PharmacyInfoDrawer";
import { store, useStore } from "@/lib/store";
import { pharmacyApi } from "@/lib/api";
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
  const t = useT();
  const med = useMemo(() => findMedication(q), [q]);
  const prescription = useStore((s) => s.prescription);
  const [infoFor, setInfoFor] = useState<Pharmacy | null>(null);
  const [filter, setFilter] = useState<"open" | "duty" | "near" | null>(initialFilter ?? null);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Utiliser les 5 premiers caractères du premier mot sans accent pour une recherche plus robuste (ex: Paracétamol -> Parac)
    const apiQuery = q.split(" ")[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").substring(0, 5);

    pharmacyApi.searchProducts(apiQuery)
      .then(data => {
        if (data && data.code === "done" && data.products) {
          const mapped = data.products.map((prod: any) => ({
            productId: prod._id,
            name: prod.name,
            dosage: prod.dosage,
            form: prod.form,
            price: prod.price,
            pharmacy: {
              id: prod.pharmacy?._id || Math.random().toString(),
              name: prod.pharmacy?.name || "Pharmacie inconnue",
              address: prod.pharmacy?.address?.street || "Bafoussam",
              distance: `À ${prod.distanceKm ? prod.distanceKm.toFixed(1) : 1.5} km`,
              distanceM: (prod.distanceKm || 1.5) * 1000,
              open: prod.pharmacy?.isActive !== false,
              onDuty: prod.pharmacy?.services?.includes("Garde") || false,
              phone: prod.pharmacy?.contactPhone || "+237 670 00 00 00",
              hours: prod.pharmacy?.openingHours || "08:00 - 22:00",
              closesAt: "22:00",
              landmark: "Près du centre-ville",
              lat: 5.4800,
              lng: 10.4200,
            }
          }));
          // Merge with existing store pharmacies so they are available in reservation view
          const existing = store.get().pharmacies;
          const mergedMap = new Map(existing.map(p => [p.id, p]));
          mapped.forEach((r: any) => {
            if (!mergedMap.has(r.pharmacy.id)) {
              mergedMap.set(r.pharmacy.id, r.pharmacy);
            } else {
              // Ensure price is updated
              mergedMap.set(r.pharmacy.id, { ...mergedMap.get(r.pharmacy.id)!, price: r.price });
            }
          });
          store.setPharmacies(Array.from(mergedMap.values()));
          setSearchResults(mapped); // Restoring this crucial line!
        }
      })
      .catch(err => console.error("Erreur de recherche dynamique:", err))
      .finally(() => setIsLoading(false));
  }, [q]);

  const filteredResults = useMemo(() => {
    // Fallback to PHARMACIES mock data if DB returns no results for this query
    let list = searchResults.length > 0 ? [...searchResults] : [...PHARMACIES].map(p => ({
      productId: "mock-" + p.id,
      name: med.name,
      price: p.price,
      pharmacy: p
    }));

    if (filter === "open") list = list.filter((r) => r.pharmacy.open);
    if (filter === "duty") list = list.filter((r) => r.pharmacy.onDuty);
    list = list.sort((a, b) => a.pharmacy.distanceM - b.pharmacy.distanceM);
    return list;
  }, [searchResults, filter, med.name]);

  const needsPrescription = med.prescription && !prescription;

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/" className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{t("results_for")}</p>
          <h1 className="text-base font-bold leading-tight truncate">{med.name}</h1>
        </div>
        {med.prescription && (
          <span className="text-[10px] font-bold uppercase text-warning-foreground bg-warning/40 rounded-full px-2 py-1">
            {t("prescription_badge")}
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
              <p className="text-sm font-semibold leading-tight">{t("rx_required")}</p>
              <p className="text-xs text-muted-foreground">{t("rx_upload")}</p>
            </div>
            <span className="text-xs font-bold text-warning-foreground">{t("attach")}</span>
          </Link>
        )}

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 mb-3">
          {[
            { id: null, label: t("all") },
            { id: "open" as const, label: t("filter_open") },
            { id: "duty" as const, label: t("filter_duty") },
            { id: "near" as const, label: t("filter_near") },
          ].map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={String(f.id)}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition border ${active ? "bg-primary text-primary-foreground border-primary shadow-pop" : "bg-card text-foreground border-border"
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
            <p className="text-sm font-semibold leading-tight">{isLoading ? "Recherche en cours..." : `${filteredResults.length} résultats trouvés`}</p>
            <p className="text-xs text-muted-foreground">{t("sorted_by_dist")}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {filteredResults.map((r) => (
            <article key={r.productId + r.pharmacy.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="grid place-items-center h-12 w-12 rounded-2xl bg-primary-soft text-primary text-lg font-bold">
                  {r.pharmacy.name.split(" ").slice(-1)[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold leading-tight truncate">{r.pharmacy.name}</h3>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${r.pharmacy.open ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {r.pharmacy.open ? t("open") : t("closed")}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{r.pharmacy.address}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs flex-wrap">
                    <span className="inline-flex items-center gap-1 text-foreground font-medium">
                      <Navigation className="h-3.5 w-3.5 text-primary" /> {r.pharmacy.distance}
                    </span>
                    {r.pharmacy.onDuty && (
                      <span className="inline-flex items-center gap-1 text-warning-foreground bg-warning/30 rounded-full px-2 py-0.5 font-semibold">
                        <Clock className="h-3 w-3" /> {t("on_duty")}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => navigate({ to: "/reservation/$pharmacyId", params: { pharmacyId: r.pharmacy.id }, search: { q: r.name, price: r.price } })}
                  className="flex-1 rounded-xl bg-gradient-primary text-primary-foreground font-semibold py-3 shadow-pop active:scale-[0.99] transition"
                >
                  {t("see_price_book")}
                </button>
                <button
                  onClick={() => setInfoFor(r.pharmacy)}
                  aria-label="Informations sur l'officine"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition"
                >
                  <Info className="h-3.5 w-3.5" />
                  {t("infos")}
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
