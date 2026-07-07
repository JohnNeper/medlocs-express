import { useMemo, useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Bell, MapPin, Search, FileText, ChevronRight, Sparkles, SlidersHorizontal, Navigation, Clock, X, ShieldCheck, ScanLine, Lightbulb, AlertTriangle, Info } from "lucide-react";
import { ALERTS } from "@/lib/alerts";
import logo from "@/assets/logo.png";
import { POPULAR, PROMOS, PHARMACIES, CITIES, CATEGORIES } from "@/lib/medlocs-data";
import { LeafletMap } from "@/components/medlocs/LeafletMap";
import { AppShell } from "@/components/medlocs/AppShell";
import { GeolocationBanner } from "@/components/medlocs/GeolocationBanner";
import { useLang, useT } from "@/lib/i18n";
import { store, useStore } from "@/lib/store";
import { pharmacyApi } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedLocs — Pharmacies à Bafoussam" },
      { name: "description", content: "Trouvez vos médicaments à Bafoussam en temps réel." },
    ],
  }),
  component: HomePage,
});

type Filter = "open" | "duty" | "near" | null;

function HomePage() {
  const navigate = useNavigate();
  const t = useT();
  const lang = useLang();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>(null);
  const [city, setCity] = useState<string>("Bafoussam");
  const [category, setCategory] = useState<string | null>(null);
  const [maxDist, setMaxDist] = useState(5000);
  const [showFilters, setShowFilters] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const storePharmacies = useStore((s) => s.pharmacies);

  useEffect(() => {
    const lat = userCoords?.lat ?? 5.4800;
    const lng = userCoords?.lng ?? 10.4200;
    pharmacyApi.getNearby(lat, lng, city)
      .then(data => {
        if (data && data.code === "done" && data.pharmacies) {
          const mapped = data.pharmacies.map((p: any) => ({
            id: p._id,
            name: p.name,
            landmark: p.address?.street || city,
            distance: `À ${p.distanceKm ? p.distanceKm.toFixed(1) : 1.5} km`,
            distanceM: (p.distanceKm || 1.5) * 1000,
            hours: p.openingHours || "08:00 - 20:00",
            closesAt: "20:00",
            onDuty: p.services?.includes("Garde") || false,
            open: p.isActive !== false,
            lat: p.address?.coordinates?.lat || lat,
            lng: p.address?.coordinates?.lng || lng,
            city: p.address?.city || city,
            address: p.address?.street || city,
            price: 2500,
            phone: p.owner?.phone || "+237 000 00 00 00"
          }));
          store.setPharmacies(mapped);
        }
      })
      .catch(err => console.error("Erreur de chargement des pharmacies:", err));
  }, [city, userCoords]);

  const filteredPharmacies = useMemo(() => {
    const sourceList = storePharmacies.length > 0 ? storePharmacies : PHARMACIES;
    let list = sourceList.filter((p) => p.city === city && p.distanceM <= maxDist);
    if (filter === "open") list = list.filter((p) => p.open);
    if (filter === "duty") list = list.filter((p) => p.onDuty);
    list = [...list].sort((a, b) => a.distanceM - b.distanceM);
    return list;
  }, [storePharmacies, filter, city, maxDist]);

  const filteredProducts = useMemo(() => {
    return category ? POPULAR.filter((p) => p.category === category) : POPULAR;
  }, [category]);

  const goSearch = (q: string) => {
    navigate({ to: "/recherche", search: { q: q || "Paracétamol 500mg", filter: filter ?? undefined } });
  };

  const activeChips = [
    city !== "Bafoussam" && { k: "city", label: city, clear: () => setCity("Bafoussam") },
    category && { k: "cat", label: category, clear: () => setCategory(null) },
    maxDist !== 5000 && { k: "dist", label: `≤ ${(maxDist / 1000).toFixed(1)}km`, clear: () => setMaxDist(5000) },
  ].filter(Boolean) as { k: string; label: string; clear: () => void }[];

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <img src={logo} alt="MedLocs" className="h-10 w-10 rounded-xl" />
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-none">MedLocs</h1>
          <button onClick={() => setShowFilters(true)} className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary" />
            {city}, Cameroun
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <button className="relative grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </button>
      </header>

      <div className="px-5">
        <form
          onSubmit={(e) => { e.preventDefault(); goSearch(query); }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            className="flex-1 bg-transparent outline-none text-[15px]"
          />
          <button type="button" onClick={() => setShowFilters(true)} className="grid place-items-center h-9 w-9 rounded-xl bg-primary-soft text-primary" aria-label="Filtres">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <Link
            to="/ordonnance"
            className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground"
            title={t("have_prescription")}
          >
            <FileText className="h-4 w-4" />
          </Link>
        </form>

        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {[
            { id: "open" as const, label: t("filter_open") },
            { id: "duty" as const, label: t("filter_duty") },
            { id: "near" as const, label: t("filter_near") },
          ].map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(active ? null : f.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-pop"
                    : "bg-card text-foreground border-border hover:border-primary/40"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {activeChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeChips.map((c) => (
              <button key={c.k} onClick={c.clear} className="inline-flex items-center gap-1 rounded-full bg-primary-soft text-primary text-xs font-semibold px-3 py-1">
                {c.label} <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}

        {/* Bandeau Protection citoyenne — repositionnement cybersécurité sanitaire */}
        <Link
          to="/protection"
          className="mt-4 block rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-pop relative overflow-hidden active:scale-[0.99] transition"
        >
          <Sparkles className="absolute right-3 top-3 h-4 w-4 opacity-70" />
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-11 w-11 rounded-2xl bg-white/20 backdrop-blur">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-90">
                {t("protection_card_kicker")}
              </p>
              <p className="text-sm font-semibold leading-tight">
                {t("protection_card_title")}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 opacity-80" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-semibold">
            <div className="rounded-xl bg-white/15 backdrop-blur py-2 flex flex-col items-center gap-1">
              <ScanLine className="h-3.5 w-3.5" /> {t("tab_scan_short")}
            </div>
            <div className="rounded-xl bg-white/15 backdrop-blur py-2 flex flex-col items-center gap-1">
              <FileText className="h-3.5 w-3.5" /> {t("tab_rx_short")}
            </div>
            <div className="rounded-xl bg-white/15 backdrop-blur py-2 flex flex-col items-center gap-1">
              <Lightbulb className="h-3.5 w-3.5" /> {t("tab_tips")}
            </div>
          </div>
        </Link>



        <div className="mt-4">
          <GeolocationBanner onCoords={setUserCoords} />
        </div>

        <div className="mt-5">
          <LeafletMap
            height="h-56"
            pharmacies={filteredPharmacies}
            center={userCoords ? [userCoords.lat, userCoords.lng] : undefined}
            onPharmacyClick={(p) => navigate({ to: "/reservation/$pharmacyId", params: { pharmacyId: p.id }, search: { q: query || "Paracétamol 500mg" } })}
          />
        </div>

        <Link
          to="/ordonnance"
          className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary-soft/50 p-4 active:scale-[0.99] transition"
        >
          <div className="grid place-items-center h-11 w-11 rounded-2xl bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{t("have_prescription")}</p>
            <p className="text-xs text-muted-foreground">{t("have_prescription_sub")}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-primary" />
        </Link>

        {/* Pharmacies — list filtered by the pills above */}
        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">
              {filter === "open" ? t("pharmacies_open") : filter === "duty" ? t("pharmacies_duty") : filter === "near" ? t("pharmacies_near") : t("pharmacies_around")}
            </h2>
            <span className="text-xs text-muted-foreground">{filteredPharmacies.length} {t("found")}</span>
          </div>
          <div className="mt-3 space-y-3">
            {filteredPharmacies.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                {t("none_match")}
              </div>
            )}
            {filteredPharmacies.slice(0, filter ? 8 : 4).map((p) => (
              <button
                key={p.id}
                onClick={() => navigate({ to: "/reservation/$pharmacyId", params: { pharmacyId: p.id }, search: { q: query || "Paracétamol 500mg" } })}
                className="w-full text-left rounded-2xl border border-border bg-card p-4 shadow-card active:scale-[0.99] transition flex items-center gap-3"
              >
                <div className="grid place-items-center h-12 w-12 rounded-2xl bg-primary-soft text-primary text-lg font-bold shrink-0">
                  {p.name.split(" ").slice(-1)[0][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm leading-tight truncate">{p.name}</h3>
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full ${p.open ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"}`}>
                      {p.open ? t("open") : t("closed")}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{p.landmark}</p>
                  <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                    <span className="inline-flex items-center gap-1 font-medium"><Navigation className="h-3 w-3 text-primary" /> {p.distance}</span>
                    {p.onDuty && (
                      <span className="inline-flex items-center gap-1 text-warning-foreground bg-warning/30 rounded-full px-1.5 py-0.5 font-semibold">
                        <Clock className="h-2.5 w-2.5" /> {t("on_duty")}
                      </span>
                    )}
                    <span className="text-muted-foreground">· {p.hours}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{t("alerts_and_tips")}</h2>
            <Link to="/protection" className="text-xs font-semibold text-primary inline-flex items-center gap-1">
              {t("protection_link")} <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {ALERTS.map((a) => {
              const tone =
                a.severity === "danger"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : a.severity === "warning"
                    ? "border-warning/50 bg-warning/20 text-warning-foreground"
                    : "border-primary/30 bg-primary-soft text-primary";
              const Icon = a.severity === "info" ? Info : AlertTriangle;
              return (
                <div key={a.id} className={`rounded-2xl border p-3 ${tone}`}>
                  <div className="flex items-start gap-2.5">
                    <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[9px] uppercase tracking-widest font-bold opacity-80">
                          {a.tag[lang]}
                        </p>
                      </div>
                      <p className="font-semibold text-sm leading-tight mt-0.5">{a.title[lang]}</p>
                      <p className="text-xs opacity-90 leading-snug mt-1">{a.body[lang]}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>



        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{t("promos")}</h2>
            <span className="text-xs text-muted-foreground">{t("no_prescription")}</span>
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
            {PROMOS.map((p) => (
              <div
                key={p.id}
                className="min-w-[260px] rounded-2xl bg-gradient-primary p-5 text-primary-foreground shadow-pop relative overflow-hidden"
              >
                <Sparkles className="absolute right-4 top-4 h-5 w-5 opacity-70" />
                <span className="inline-block text-[10px] tracking-wider uppercase font-semibold bg-white/20 backdrop-blur rounded-full px-2 py-1">
                  {p.tag}
                </span>
                <h3 className="mt-3 text-lg font-bold leading-tight">{p.title}</h3>
                <p className="mt-1 text-sm opacity-90">{p.subtitle}</p>
                <button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                  {t("discover")} <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{t("popular_products")}</h2>
            {category && (
              <button onClick={() => setCategory(null)} className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                {category} <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {filteredProducts.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => goSearch(p.name)}
                className="text-left rounded-2xl border border-border bg-card p-4 shadow-card active:scale-[0.99] transition"
              >
                <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary-soft text-2xl">
                  {p.emoji}
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{p.category}</p>
                  {p.prescription && (
                    <span className="text-[9px] font-bold uppercase text-warning-foreground bg-warning/40 rounded px-1.5 py-0.5">
                      RX
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm font-semibold leading-tight">{p.name}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {t("available_nearby")}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Filters drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} aria-label="Fermer" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[440px] rounded-t-3xl bg-card p-5 shadow-pop">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{t("advanced_filters")}</h3>
              <button onClick={() => setShowFilters(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("city")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium border ${city === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("category")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory(null)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium border ${!category ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}
                >
                  {t("all")}
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium border ${category === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("max_distance")}</p>
                <span className="text-sm font-bold text-primary">{(maxDist / 1000).toFixed(1)} km</span>
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={500}
                value={maxDist}
                onChange={(e) => setMaxDist(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>500m</span><span>2.5km</span><span>5km</span>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(false)}
              className="mt-6 w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-3.5 shadow-pop"
            >
              {t("see")} {filteredPharmacies.length} {filteredPharmacies.length > 1 ? t("pharmacies") : t("pharmacy")}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
