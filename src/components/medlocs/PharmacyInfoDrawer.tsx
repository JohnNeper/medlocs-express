import { useEffect } from "react";
import { X, Phone, Clock, MapPin, Navigation, ShieldCheck } from "lucide-react";
import type { Pharmacy } from "@/lib/medlocs-data";
import { useT } from "@/lib/i18n";

export function PharmacyInfoDrawer({
  pharmacy,
  open,
  onClose,
}: {
  pharmacy: Pharmacy | null;
  open: boolean;
  onClose: () => void;
}) {
  const t = useT();
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-foreground/40 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 rounded-t-3xl bg-card shadow-pop transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-border" />
        {pharmacy && (
          <div className="px-6 pb-8 pt-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center h-12 w-12 rounded-2xl bg-primary-soft text-primary text-lg font-bold">
                  {pharmacy.name.split(" ").slice(-1)[0][0]}
                </div>
                <div>
                  <h3 className="font-semibold leading-tight">{pharmacy.name}</h3>
                  <p className="text-xs text-muted-foreground">{pharmacy.address}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid place-items-center h-9 w-9 rounded-full border border-border"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-2">
              <a
                href={`tel:${pharmacy.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 active:scale-[0.99] transition"
              >
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary text-primary-foreground">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{t("phone")}</p>
                  <p className="text-sm font-semibold">{pharmacy.phone}</p>
                </div>
                <span className="text-xs font-semibold text-primary">{t("call")}</span>
              </a>

              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary-soft text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{t("hours_label")}</p>
                  <p className="text-sm font-semibold">{pharmacy.hours}</p>
                </div>
                {pharmacy.open && pharmacy.closesAt !== "—" && (
                  <span className="text-[11px] font-semibold text-primary bg-primary-soft rounded-full px-2 py-1">
                    {t("closes_at")} {pharmacy.closesAt}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary-soft text-primary">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{t("landmark")}</p>
                  <p className="text-sm font-semibold">{pharmacy.landmark}</p>
                </div>
                <Navigation className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {t("verified_partner")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
