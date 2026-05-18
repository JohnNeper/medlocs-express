import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Bell, MapPin, Search, Plus, ChevronLeft, Clock, CheckCircle2, Home, Ticket, LifeBuoy,
  ShieldCheck, Phone, Navigation, QrCode as QrIcon, ChevronRight, Sparkles, Loader2,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { PHARMACIES, POPULAR, PROMOS, type Pharmacy } from "@/lib/medlocs-data";
import { MapCard } from "@/components/medlocs/MapCard";
import { AuthSheet } from "@/components/medlocs/AuthSheet";
import { QRCode } from "@/components/medlocs/QRCode";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedLocs — Trouvez vos médicaments à Bafoussam" },
      { name: "description", content: "MedLocs synchronise les pharmacies de Bafoussam en temps réel. Trouvez, réservez et retirez vos médicaments en toute confidentialité." },
      { name: "theme-color", content: "#059669" },
    ],
  }),
  component: MedLocsApp,
});

type View = "home" | "results" | "checkout" | "success";
type Tab = "home" | "reservations" | "help";

function MedLocsApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [view, setView] = useState<View>("home");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "duty" | "near">("all");
  const [selectedMed, setSelectedMed] = useState<string>("");
  const [selectedPharm, setSelectedPharm] = useState<Pharmacy | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [reservations, setReservations] = useState<{ id: string; med: string; pharmacy: Pharmacy; stage: 0 | 1 | 2 }[]>([]);

  const filtered = useMemo(() => {
    let list = [...PHARMACIES].sort((a, b) => a.distanceM - b.distanceM);
    if (filter === "open") list = list.filter((p) => p.open);
    if (filter === "duty") list = list.filter((p) => p.onDuty);
    return list;
  }, [filter]);

  const search = (med: string) => {
    setSelectedMed(med || "Paracétamol 500mg");
    setView("results");
    setTab("home");
  };

  const pickPharmacy = (p: Pharmacy) => {
    setSelectedPharm(p);
    if (authed) setView("checkout");
    else setAuthOpen(true);
  };

  const confirmReservation = () => {
    if (!selectedPharm) return;
    const r = { id: "R-" + Math.random().toString(36).slice(2, 6).toUpperCase(), med: selectedMed, pharmacy: selectedPharm, stage: 0 as const };
    setReservations((rs) => [r, ...rs]);
    setView("success");
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="relative mx-auto max-w-[440px] min-h-screen bg-background pb-24 shadow-card">
        {tab === "home" && view === "home" && (
          <HomeView
            query={query}
            setQuery={setQuery}
            onSearch={search}
            filter={filter}
            setFilter={setFilter}
          />
        )}
        {tab === "home" && view === "results" && (
          <ResultsView
            med={selectedMed}
            pharmacies={filtered}
            onBack={() => setView("home")}
            onPick={pickPharmacy}
          />
        )}
        {tab === "home" && view === "checkout" && selectedPharm && (
          <CheckoutView
            med={selectedMed}
            pharmacy={selectedPharm}
            onBack={() => setView("results")}
            onConfirm={confirmReservation}
          />
        )}
        {tab === "home" && view === "success" && selectedPharm && (
          <SuccessView
            med={selectedMed}
            pharmacy={selectedPharm}
            onDone={() => { setView("home"); setTab("reservations"); }}
          />
        )}

        {tab === "reservations" && (
          <ReservationsView reservations={reservations} />
        )}
        {tab === "help" && <HelpView />}

        <BottomNav tab={tab} setTab={(t) => { setTab(t); if (t === "home") setView("home"); }} />
      </div>

      <AuthSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthenticated={() => { setAuthed(true); setAuthOpen(false); setView("checkout"); }}
      />
    </div>
  );
}

/* -------------------- Home -------------------- */
function HomeView({
  query, setQuery, onSearch, filter, setFilter,
}: {
  query: string;
  setQuery: (s: string) => void;
  onSearch: (s: string) => void;
  filter: "all" | "open" | "duty" | "near";
  setFilter: (f: "all" | "open" | "duty" | "near") => void;
}) {
  return (
    <div>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <img src={logo} alt="MedLocs" className="h-10 w-10 rounded-xl" />
        <div className="flex-1">
          <h1 className="text-lg font-bold leading-none">MedLocs</h1>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 text-primary" />
            Bafoussam, Cameroun
          </p>
        </div>
        <button className="relative grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <Bell className="h-4.5 w-4.5 text-foreground" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </button>
      </header>

      <div className="px-5">
        <form
          onSubmit={(e) => { e.preventDefault(); onSearch(query); }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un médicament..."
            className="flex-1 bg-transparent outline-none text-[15px]"
          />
          {query && (
            <button type="submit" className="text-xs font-semibold text-primary px-2 py-1 rounded-lg">
              Chercher
            </button>
          )}
        </form>

        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {[
            { id: "open", label: "🟢 Ouvert" },
            { id: "duty", label: "⏰ De garde" },
            { id: "near", label: "📍 Les plus proches" },
          ].map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(active ? "all" : (f.id as any))}
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

        <div className="mt-5">
          <MapCard onClick={() => onSearch(query || "Paracétamol 500mg")} />
        </div>

        <section className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Promotions parapharmacie</h2>
            <span className="text-xs text-muted-foreground">Sans ordonnance</span>
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
                  Découvrir <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Produits populaires</h2>
            <button className="text-xs font-semibold text-primary">Voir tout</button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {POPULAR.map((p) => (
              <button
                key={p.id}
                onClick={() => onSearch(p.name)}
                className="text-left rounded-2xl border border-border bg-card p-4 shadow-card active:scale-[0.99] transition"
              >
                <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary-soft text-2xl">
                  {p.emoji}
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{p.category}</p>
                <p className="mt-0.5 text-sm font-semibold leading-tight">{p.name}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Disponible à proximité
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sur réservation</span>
                  <span className="grid place-items-center h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-pop">
                    <Plus className="h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* -------------------- Results -------------------- */
function ResultsView({
  med, pharmacies, onBack, onPick,
}: {
  med: string;
  pharmacies: Pharmacy[];
  onBack: () => void;
  onPick: (p: Pharmacy) => void;
}) {
  return (
    <div>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Résultats pour</p>
          <h1 className="text-base font-bold leading-tight">{med}</h1>
        </div>
      </header>

      <div className="px-5">
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
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      p.open ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {p.open ? "Ouvert" : "Fermé"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground truncate">{p.address}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs">
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
              <button
                onClick={() => onPick(p)}
                className="mt-4 w-full rounded-xl bg-gradient-primary text-primary-foreground font-semibold py-3 shadow-pop active:scale-[0.99] transition"
              >
                Voir le prix & Réserver
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Checkout -------------------- */
function CheckoutView({
  med, pharmacy, onBack, onConfirm,
}: {
  med: string;
  pharmacy: Pharmacy;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <ChevronLeft className="h-5 w-5" />
        </button>
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
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
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
    </div>
  );
}

/* -------------------- Success -------------------- */
function SuccessView({
  med, pharmacy, onDone,
}: {
  med: string;
  pharmacy: Pharmacy;
  onDone: () => void;
}) {
  return (
    <div>
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
          <QRCode />
          <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Code de retrait</p>
          <p className="text-lg font-bold tracking-widest">MDL-7H3K</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Officine</p>
          <h3 className="mt-0.5 font-semibold">{pharmacy.name}</h3>
          <p className="text-xs text-muted-foreground">{med}</p>

          <div className="mt-5">
            <Timeline stage={0} />
          </div>
        </div>

        <button
          onClick={onDone}
          className="w-full rounded-2xl bg-foreground text-background font-semibold py-4 active:scale-[0.99] transition"
        >
          Voir mes réservations
        </button>
      </div>
    </div>
  );
}

function Timeline({ stage }: { stage: 0 | 1 | 2 }) {
  const steps = [
    { label: "Réservé", icon: CheckCircle2 },
    { label: "En préparation", icon: Loader2 },
    { label: "Prêt pour retrait", icon: QrIcon },
  ];
  return (
    <div className="relative">
      <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />
      <div className="absolute left-4 top-4 w-px bg-primary transition-all" style={{ height: `${stage * 50}%` }} />
      <ol className="space-y-5">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = i <= stage;
          const current = i === stage;
          return (
            <li key={s.label} className="relative pl-12">
              <div className={`absolute left-0 top-0 grid place-items-center h-8 w-8 rounded-full border-2 ${
                done ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"
              }`}>
                <Icon className={`h-4 w-4 ${current && i === 1 ? "animate-spin" : ""}`} />
              </div>
              <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
              <p className="text-xs text-muted-foreground">
                {i === 0 && "Confirmation reçue · à l'instant"}
                {i === 1 && (stage >= 1 ? "Pharmacien en cours" : "En attente")}
                {i === 2 && (stage >= 2 ? "Disponible au comptoir" : "Notification SMS à venir")}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* -------------------- Reservations -------------------- */
function ReservationsView({ reservations }: { reservations: { id: string; med: string; pharmacy: Pharmacy; stage: 0 | 1 | 2 }[] }) {
  return (
    <div>
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
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{r.id}</p>
                    <h3 className="font-semibold mt-0.5">{r.med}</h3>
                    <p className="text-xs text-muted-foreground">{r.pharmacy.name}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-primary-soft text-primary">
                    Actif
                  </span>
                </div>
                <div className="mt-4">
                  <Timeline stage={r.stage} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- Help -------------------- */
function HelpView() {
  const items = [
    { q: "Pourquoi les prix ne sont-ils pas affichés publiquement ?", a: "MedLocs respecte la déontologie pharmaceutique locale. Le tarif confidentiel est dévoilé après authentification." },
    { q: "Comment fonctionne le retrait ?", a: "Présentez votre QR Code à l'officine. Le pharmacien scanne et délivre votre ordonnance." },
    { q: "Quels modes de paiement acceptez-vous ?", a: "MTN Mobile Money et Orange Money sont supportés pour les frais de service." },
  ];
  return (
    <div>
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">Aide & Support</h1>
        <p className="text-xs text-muted-foreground mt-1">Nous sommes là pour vous</p>
      </header>
      <div className="px-5 space-y-3">
        <button className="w-full flex items-center gap-3 rounded-2xl bg-gradient-primary text-primary-foreground p-4 shadow-pop active:scale-[0.99] transition">
          <div className="grid place-items-center h-11 w-11 rounded-2xl bg-white/20">
            <Phone className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold">Appeler le support</p>
            <p className="text-xs opacity-90">Disponible 7j/7 · 8h-22h</p>
          </div>
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          {items.map((it, i) => (
            <details key={i} className="group border-b border-border last:border-0">
              <summary className="cursor-pointer list-none flex items-center gap-3 p-4">
                <span className="grid place-items-center h-8 w-8 rounded-full bg-primary-soft text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{it.q}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition" />
              </summary>
              <p className="px-4 pb-4 pl-15 text-sm text-muted-foreground leading-relaxed">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Bottom Nav -------------------- */
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "home", label: "Accueil", icon: Home },
    { id: "reservations", label: "Mes Réservations", icon: Ticket },
    { id: "help", label: "Aide", icon: LifeBuoy },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-[440px] px-4 pb-4 pointer-events-auto">
        <div className="rounded-3xl bg-card/95 backdrop-blur border border-border shadow-pop p-2 flex items-center justify-between">
          {items.map((it) => {
            const Icon = it.icon;
            const active = tab === it.id;
            return (
              <button
                key={it.id}
                onClick={() => setTab(it.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-2xl transition ${
                  active ? "bg-primary-soft text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.4]" : ""}`} />
                <span className="text-[10px] font-semibold">{it.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
