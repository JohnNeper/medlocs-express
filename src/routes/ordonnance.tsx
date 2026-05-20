import { useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, FileText, Upload, CheckCircle2, ShieldCheck, X } from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import { store, useStore } from "@/lib/store";

type Search = { q?: string; next?: string };

export const Route = createFileRoute("/ordonnance")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  head: () => ({
    meta: [{ title: "Téléverser une ordonnance — MedLocs" }],
  }),
  component: OrdonnancePage,
});

function OrdonnancePage() {
  const { q, next } = Route.useSearch();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const prescription = useStore((s) => s.prescription);
  const [picked, setPicked] = useState<string | null>(prescription?.name ?? null);

  const onPick = (file: File | null) => {
    if (!file) return;
    setPicked(file.name);
    store.setPrescription({ name: file.name, uploadedAt: Date.now() });
  };

  const onContinue = () => {
    if (next) navigate({ to: next as any });
    else navigate({ to: "/recherche", search: { q: q || "Amoxicilline 1g" } });
  };

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/" className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold leading-tight">Ordonnance médicale</h1>
          <p className="text-xs text-muted-foreground">Téléversez votre prescription</p>
        </div>
      </header>

      <div className="px-5 space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center h-11 w-11 rounded-2xl bg-primary-soft text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Confidentialité garantie</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Votre ordonnance est chiffrée et transmise uniquement à l'officine choisie pour préparer votre commande.
              </p>
            </div>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        {picked ? (
          <div className="rounded-2xl border border-primary/40 bg-primary-soft p-5">
            <div className="flex items-start gap-3">
              <div className="grid place-items-center h-11 w-11 rounded-2xl bg-primary text-primary-foreground">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-primary font-bold">Ordonnance reçue</p>
                <p className="font-semibold text-sm truncate">{picked}</p>
                <p className="text-xs text-muted-foreground">Prête à être transmise</p>
              </div>
              <button
                onClick={() => { setPicked(null); store.setPrescription(null); }}
                aria-label="Retirer"
                className="grid place-items-center h-8 w-8 rounded-full border border-border bg-card"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/40 p-8 flex flex-col items-center gap-3 active:scale-[0.99] transition"
          >
            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground">
              <Upload className="h-6 w-6" />
            </div>
            <div className="text-center">
              <p className="font-semibold">Téléverser ou photographier</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou PDF — 10 Mo max</p>
            </div>
          </button>
        )}

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Pourquoi ?</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              Certains médicaments (antibiotiques, anxiolytiques...) nécessitent une prescription valide.
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              Le pharmacien vérifie l'ordonnance avant la délivrance.
            </li>
          </ul>
        </div>

        <button
          onClick={onContinue}
          disabled={!picked}
          className="w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-4 shadow-pop disabled:opacity-40 disabled:shadow-none transition active:scale-[0.99]"
        >
          Continuer
        </button>
      </div>
    </AppShell>
  );
}
