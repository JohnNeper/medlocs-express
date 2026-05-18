import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronDown, Lock, ShieldCheck, User } from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import { store } from "@/lib/store";

type Search = { next?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  head: () => ({ meta: [{ title: "Connexion — MedLocs" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState<"identity" | "otp">("identity");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  const onSubmit = () => {
    store.setUser({ name: name.trim(), phone });
    if (next) navigate({ to: next as any });
    else navigate({ to: "/" });
  };

  return (
    <AppShell hideNav>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/" className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">Créer mon compte</h1>
      </header>

      <div className="px-5 mt-2">
        <div className="grid place-items-center h-16 w-16 rounded-3xl bg-primary-soft text-primary mx-auto mb-4">
          {step === "identity" ? <User className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
        </div>
        <h2 className="text-2xl font-bold text-center leading-tight">
          {step === "identity" ? "Bienvenue sur MedLocs" : "Vérification"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center leading-relaxed max-w-xs mx-auto">
          {step === "identity"
            ? "Inscrivez-vous en 30 secondes pour réserver vos médicaments en toute confidentialité."
            : `Entrez le code SMS envoyé au +237 ${phone}`}
        </p>

        {step === "identity" ? (
          <div className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nom complet</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Numéro de téléphone</label>
              <div className="mt-1.5 flex items-stretch rounded-2xl border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                <button className="flex items-center gap-1 px-3 text-sm font-medium border-r border-input">
                  🇨🇲 +237 <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  inputMode="numeric"
                  placeholder="6 XX XX XX XX"
                  className="flex-1 bg-transparent px-3 py-3.5 text-base outline-none"
                />
              </div>
            </div>

            <button
              disabled={name.trim().length < 2 || phone.length < 8}
              onClick={() => setStep("otp")}
              className="mt-2 w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-4 shadow-pop disabled:opacity-40 disabled:shadow-none transition active:scale-[0.99]"
            >
              Recevoir le code par SMS
            </button>

            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Vos données sont chiffrées de bout en bout
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            <div className="flex justify-between gap-3">
              {otp.map((v, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={v}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(-1);
                    const nxt = [...otp];
                    nxt[i] = val;
                    setOtp(nxt);
                    if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  className="h-16 w-full rounded-2xl border border-input bg-background text-center text-2xl font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              ))}
            </div>

            <button
              disabled={otp.some((o) => !o)}
              onClick={onSubmit}
              className="w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-4 shadow-pop disabled:opacity-40 disabled:shadow-none transition active:scale-[0.99]"
            >
              Confirmer
            </button>
            <button onClick={() => setStep("identity")} className="w-full text-sm text-muted-foreground py-2">
              Modifier mes informations
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
