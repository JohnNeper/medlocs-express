import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ChevronLeft, ChevronDown, Lock, ShieldCheck, User, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import { store } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { authApi, reservationApi } from "@/lib/api";

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
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [knownName, setKnownName] = useState<string | null>(null);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

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
    ? phone.length >= 8
    : name.trim().length >= 2 && phone.length >= 8;

  const goNext = () => {
    if (next) {
      // Use href to preserve query strings — `to:` treats the whole string as a pathname
      router.navigate({ href: next });
    } else {
      router.navigate({ to: "/" });
    }
  };

  const handleSendOtp = async () => {
    if (!canSubmitIdentity || isSendingOtp) return;
    setIsSendingOtp(true);
    setSendError(null);
    setDevOtp(null);

    try {
      const fullPhone = "+237" + phone;
      const data = await authApi.sendPhoneVerificationCode(fullPhone);

      if (data.dev && data.message) {
        const match = data.message.match(/use\s*:\s*(\d{6})/i);
        if (match && match[1]) {
          setDevOtp(match[1]);
        } else {
          setDevOtp(data.message);
        }
      }

      setOtp(["", "", "", "", "", ""]);
      setStep("otp");
    } catch (err: any) {
      setSendError(err.message || "Impossible de se connecter au serveur d'authentification.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.some((o) => !o) || isVerifying) return;
    setIsVerifying(true);
    setVerificationError(null);

    try {
      const fullPhone = "+237" + phone;
      const codeStr = otp.join("");

      let data;
      try {
        data = await authApi.verifyPhoneCode(fullPhone, codeStr);
      } catch (e: any) {
        throw new Error(e.message || "Code OTP incorrect ou expiré.");
      }

      // Success! Resolve the user name
      let resolvedName = name.trim();
      if (isLogin) {
        // 1. Try local store known accounts
        const localAcc = store.findAccount(phone);
        if (localAcc) {
          resolvedName = localAcc.name;
        } else {
          // 2. Try fetching from MongoDB database collection MobileCustomers
          try {
            const dbData = await authApi.getCustomer(phone);
            if (dbData && dbData.customer && dbData.customer.name) {
              resolvedName = dbData.customer.name;
            }
          } catch (e) {
            console.warn("Failed to lookup name by database:", e);
          }

          // 3. Try fetching from reservations on backend (legacy fallback)
          if (!resolvedName) {
            try {
              const rData = await reservationApi.getReservationsByPhone(phone);
              if (rData.reservations && rData.reservations.length > 0) {
                resolvedName = rData.reservations[0].customerName;
              }
            } catch (e) {
              console.warn("Failed to lookup name by short phone:", e);
            }
          }

          // 4. Try fetching from reservations with fullPhone prefix +237 (full legacy fallback)
          if (!resolvedName) {
            try {
              const rData2 = await reservationApi.getReservationsByPhone(fullPhone);
              if (rData2.reservations && rData2.reservations.length > 0) {
                resolvedName = rData2.reservations[0].customerName;
              }
            } catch (e) {
              console.warn("Failed to lookup name by full phone:", e);
            }
          }
        }
      }

      if (!resolvedName) {
        resolvedName = name.trim() || `Patient ${phone.slice(-4)}`;
      }

      // 5. Save registration or update/sync account profile in MongoDB database
      try {
        await authApi.registerCustomer({ name: resolvedName, phone });
      } catch (e) {
        console.warn("Failed to register/sync mobile user in database:", e);
      }

      store.setUser({ name: resolvedName, phone });
      goNext();
    } catch (err: any) {
      setVerificationError(err.message || "Une erreur est survenue lors de la vérification.");
    } finally {
      setIsVerifying(false);
    }
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

            {sendError && (
              <p className="text-xs font-semibold text-destructive text-center mt-2 p-3 bg-destructive/5 rounded-xl border border-destructive/10">
                {sendError}
              </p>
            )}

            <button
              disabled={!canSubmitIdentity || isSendingOtp}
              onClick={handleSendOtp}
              className="mt-2 w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-4 shadow-pop disabled:opacity-40 disabled:shadow-none transition active:scale-[0.99] flex justify-center items-center gap-2"
            >
              {isSendingOtp && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              )}
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
            {devOtp && (
              <div className="mb-2 p-3.5 rounded-2xl border border-primary/25 bg-primary/5 text-primary text-center flex flex-col items-center gap-1.5 animate-in fade-in slide-in-from-top duration-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary/75">Assistance Sandbox / Dev</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold tracking-widest font-mono">{devOtp}</span>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(devOtp);
                      if (devOtp.length === 6) {
                        setOtp(devOtp.split(""));
                        setTimeout(() => {
                          document.getElementById("otp-5")?.focus();
                        }, 50);
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 transition active:scale-95 shadow-sm"
                  >
                    Remplir & Copier
                  </button>
                </div>
                <span className="text-[9px] text-muted-foreground/90">Code généré automatiquement par le backend.</span>
              </div>
            )}

            <div className="flex justify-between gap-1.5">
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
                    if (val && i < 5) {
                      document.getElementById(`otp-${i + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) {
                      const nxt = [...otp];
                      nxt[i - 1] = "";
                      setOtp(nxt);
                      document.getElementById(`otp-${i - 1}`)?.focus();
                    }
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  className="h-14 w-full rounded-xl border border-input bg-background text-center text-xl font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
              ))}
            </div>

            {verificationError && (
              <p className="text-xs font-semibold text-destructive text-center p-3 bg-destructive/5 rounded-xl border border-destructive/10 animate-in fade-in duration-250">
                {verificationError}
              </p>
            )}

            <button
              disabled={otp.some((o) => !o) || isVerifying}
              onClick={handleVerifyOtp}
              className="w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-4 shadow-pop disabled:opacity-40 disabled:shadow-none transition active:scale-[0.99] flex justify-center items-center gap-2"
            >
              {isVerifying && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              )}
              {t("confirm")}
            </button>
            <button 
              disabled={isVerifying}
              onClick={() => {
                setStep("identity");
                setDevOtp(null);
                setVerificationError(null);
              }} 
              className="w-full text-sm text-muted-foreground py-2 hover:text-foreground transition"
            >
              {t("edit_info")}
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
