import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { useT } from "@/lib/i18n";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "medlocs-install-dismissed";

export function InstallPrompt() {
  const t = useT();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Already installed → don't show
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
    if (Date.now() - dismissedAt < 3 * 24 * 3600 * 1000) return; // 3 days cooldown

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);

    // iOS fallback: no beforeinstallprompt event
    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    if (isIOS) {
      const timer = setTimeout(() => {
        setIosHint(true);
        setShow(true);
      }, 1500);
      return () => {
        window.removeEventListener("beforeinstallprompt", onBIP);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  const onInstall = async () => {
    if (deferred) {
      await deferred.prompt();
      await deferred.userChoice;
      setShow(false);
      setDeferred(null);
    }
  };

  const onDismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-24 inset-x-0 z-50 pointer-events-none">
      <div className="mx-auto max-w-[440px] px-3 pointer-events-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="rounded-3xl bg-card border border-border shadow-pop p-4 flex items-center gap-3">
          <div className="grid place-items-center h-12 w-12 rounded-2xl bg-gradient-primary text-primary-foreground shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight">{t("install_app")}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
              {iosHint ? t("install_ios_hint") : t("install_sub")}
            </p>
          </div>
          {!iosHint && (
            <button
              onClick={onInstall}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-2xl bg-gradient-primary text-primary-foreground px-3.5 py-2.5 text-xs font-bold shadow-pop active:scale-95 transition"
            >
              <Download className="h-3.5 w-3.5" />
              {t("install_now")}
            </button>
          )}
          <button
            onClick={onDismiss}
            aria-label="Fermer"
            className="shrink-0 grid place-items-center h-8 w-8 rounded-full border border-border text-muted-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
