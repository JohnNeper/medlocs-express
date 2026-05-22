import { useCallback, useEffect, useState } from "react";

export type GeoState = {
  status: "idle" | "prompting" | "granted" | "denied" | "unavailable" | "error";
  coords: { lat: number; lng: number } | null;
  error?: string;
};

const STORAGE_KEY = "medlocs.geo.lastCoords";

export function useGeolocation(autoRequest = false) {
  const [state, setState] = useState<GeoState>({ status: "idle", coords: null });

  // Hydrate last known coords from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const c = JSON.parse(raw);
        if (c?.lat && c?.lng) setState((s) => ({ ...s, coords: c }));
      }
    } catch {}
  }, []);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setState({ status: "unavailable", coords: null, error: "Géolocalisation non disponible" });
      return;
    }
    setState((s) => ({ ...s, status: "prompting" }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(coords)); } catch {}
        setState({ status: "granted", coords });
      },
      (err) => {
        setState({
          status: err.code === err.PERMISSION_DENIED ? "denied" : "error",
          coords: null,
          error: err.message,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    if (!autoRequest) return;
    // Auto-request only if Permissions API says granted (no surprise prompt)
    if (typeof navigator !== "undefined" && (navigator as any).permissions?.query) {
      (navigator as any).permissions
        .query({ name: "geolocation" })
        .then((p: PermissionStatus) => {
          if (p.state === "granted") request();
        })
        .catch(() => {});
    }
  }, [autoRequest, request]);

  return { ...state, request };
}
