import { MapPin, LocateFixed, Loader2 } from "lucide-react";
import { useGeolocation } from "@/lib/useGeolocation";
import { useEffect } from "react";
import { useT } from "@/lib/i18n";

export function GeolocationBanner({
  onCoords,
}: {
  onCoords?: (coords: { lat: number; lng: number }) => void;
}) {
  const geo = useGeolocation(true);
  const t = useT();

  useEffect(() => {
    if (geo.status === "granted" && geo.coords) onCoords?.(geo.coords);
  }, [geo.status, geo.coords, onCoords]);

  if (geo.status === "granted") {
    return (
      <button
        onClick={geo.request}
        className="flex items-center gap-2 rounded-full bg-primary-soft text-primary px-3 py-1.5 text-xs font-semibold shadow-sm"
      >
        <LocateFixed className="h-3.5 w-3.5" />
        {t("location_on")}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-3 flex items-center gap-3 shadow-card">
      <div className="h-10 w-10 rounded-full bg-primary-soft text-primary grid place-items-center shrink-0">
        <MapPin className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{t("enable_geoloc")}</p>
        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
          {t("geoloc_sub")}
        </p>
      </div>
      <button
        onClick={geo.request}
        disabled={geo.status === "prompting"}
        className="rounded-full bg-primary text-primary-foreground px-3 py-2 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
      >
        {geo.status === "prompting" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <LocateFixed className="h-3.5 w-3.5" />
        )}
        {t("enable")}
      </button>
    </div>
  );
}
