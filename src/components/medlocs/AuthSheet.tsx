import { useEffect, useState } from "react";
import { ChevronDown, Lock, ShieldCheck } from "lucide-react";

export function AuthSheet({
  open,
  onClose,
  onAuthenticated,
}: {
  open: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}) {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  useEffect(() => {
    if (open) {
      setStep("phone");
      setPhone("");
      setOtp(["", "", "", ""]);
    }
  }, [open]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-foreground/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      {/* Sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl bg-card shadow-pop p-6 pb-8 transition-transform duration-300 ease-out ${open ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" />

        {step === "phone" ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="grid place-items-center h-11 w-11 rounded-2xl bg-primary-soft text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Tarif confidentiel</h3>
                <p className="text-xs text-muted-foreground">Authentification rapide</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Pour débloquer le tarif confidentiel et sécuriser votre réservation auprès de l'officine, connectez-vous en 30 secondes.
            </p>

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

            <button
              disabled={phone.length < 8}
              onClick={() => setStep("otp")}
              className="mt-5 w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-4 shadow-pop disabled:opacity-40 disabled:shadow-none transition active:scale-[0.99]"
            >
              Recevoir le code par SMS
            </button>

            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Vos données sont chiffrées de bout en bout
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="grid place-items-center h-11 w-11 rounded-2xl bg-primary-soft text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Entrez le code</h3>
                <p className="text-xs text-muted-foreground">SMS envoyé au +237 {phone}</p>
              </div>
            </div>

            <div className="flex justify-between gap-3 my-5">
              {otp.map((v, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  value={v}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(-1);
                    const next = [...otp];
                    next[i] = val;
                    setOtp(next);
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
              onClick={onAuthenticated}
              className="w-full rounded-2xl bg-gradient-primary text-primary-foreground font-semibold py-4 shadow-pop disabled:opacity-40 disabled:shadow-none transition active:scale-[0.99]"
            >
              Confirmer
            </button>

            <button onClick={() => setStep("phone")} className="mt-3 w-full text-sm text-muted-foreground py-2">
              Modifier le numéro
            </button>
          </>
        )}
      </div>
    </div>
  );
}
