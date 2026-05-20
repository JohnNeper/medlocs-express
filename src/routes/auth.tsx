import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronDown, Lock, ShieldCheck, User, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import { store } from "@/lib/store";
import { useT } from "@/lib/i18n";

type Search = { next?: string; mode?: "login" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    next: typeof s.next === "string" ? s.next : undefined,
    mode: s.mode === "login" ? "login" : "signup",
  }),
  head: () => ({ meta: [{ title: "Connexion — MedLocs" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { next, mode = "signup" } = Route.useSearch();
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState<"identity" | "otp">("identity");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [knownName, setKnownName] = useState<string | null>(null);

  // Detect existing accounts as the user types their phone
  useEffect(() => {
    if (phone.length >= 8) {
      const acc = store.findAccount(phone);
      if (acc) {
        setKnownName(acc.name);
        if (mode === "login" || !name.trim()) setName(acc.name);
      } else {
        setKnownName(null);
      }
    } else {
      setKnownName(null);
    }
  }, [phone, mode]);

  const isLogin = mode === "login";
  const canSubmitIdentity = isLogin
    ? phone.length >= 8 && !!knownName
    : name.trim().length >= 2 && phone.length >= 8;

  const goNext = () => {
    if (next) {
      // Use href to preserve query strings — `to:` treats the whole string as a pathname
      router.navigate({ href: next });
    } else {
      router.navigate({ to: "/" });
    }
  };

  const onSubmit = () => {
    store.setUser({ name: name.trim(), phone });
    goNext();
  };

  return (
    <AppShell hideNav>
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Link to="/" className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">{isLogin ? t("log_in") : t("create_account")}</h1>
      </header>

      <div className="px-5 mt-2">
        <div className="grid place-items-center h-16 w-16 rounded-3xl bg-primary-soft text-primary mx-auto mb-4">
          {step === "identity" ? <User className="h-7 w-7" /> : <Lock className="h-7 w-7" />}
        </div>
        <h2 className="text-2xl font-bold text-center leading-tight">
          {step === "identity"
            ? isLogin
              ? t("welcome_back")
              : t("welcome_medlocs")
            : t("verification")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center leading-relaxed max-w-xs mx-auto">
          {step === "identity"
            ? isLogin
              ? t("login_sub")
              : t("signup_sub")
            : `${t("otp_sent")} +237 ${phone}`}
        </p>

        {step === "identity" ? (
          <div className="mt-8 space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-medium text-muted-foreground">{t("full_name")}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("your_name")}
                  className="mt-1.5 w-full rounded-2xl border border-input bg-background px-4 py-3.5 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">{t("phone_number")}</label>
              <div className="mt-1.5 flex items-stretch rounded-2xl border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition">
                <button type="button" className="flex items-center gap-1 px-3 text-sm font-medium border-r border-input">
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
              {knownName && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t("account_recognized")} — {knownName}
                </p>
              )}
            </div>

            <button
              disabled={!canSubmitIdentity}
              onClick={() => setStep("otp")}
              className="mt-2 w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-4 shadow-pop disabled:opacity-40 disabled:shadow-none transition active:scale-[0.99]"
            >
              {t("receive_sms")}
            </button>

            <Link
              to="/auth"
              search={{ next, mode: isLogin ? "signup" : "login" }}
              className="block text-center text-sm font-semibold text-primary py-2"
            >
              {isLogin ? t("no_account_yet") : t("already_account")}
            </Link>

            <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {t("encrypted")}
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
              {t("confirm")}
            </button>
            <button onClick={() => setStep("identity")} className="w-full text-sm text-muted-foreground py-2">
              {t("edit_info")}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
