import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PHARMACIES, type Pharmacy } from "@/lib/medlocs-data";

export default function LeafletMapInner({
  height = "h-64",
  onPharmacyClick,
  pharmacies = PHARMACIES,
  center = [5.4781, 10.4180],
}: {
  height?: string;
  onPharmacyClick?: (p: Pharmacy) => void;
  pharmacies?: Pharmacy[];
  center?: [number, number];
}) {
  const icons = useMemo(() => ({
    pharmacy: L.divIcon({
      className: "medlocs-pin",
      html: `<div style="width:32px;height:32px;border-radius:50%;background:white;border:3px solid oklch(0.62 0.13 165);display:grid;place-items:center;box-shadow:0 4px 12px rgba(0,0,0,.2);font-size:16px;">💊</div>`,
      iconSize: [32, 32], iconAnchor: [16, 16],
    }),
    duty: L.divIcon({
      className: "medlocs-pin",
      html: `<div style="width:34px;height:34px;border-radius:50%;background:oklch(0.62 0.13 165);border:3px solid white;display:grid;place-items:center;color:white;box-shadow:0 4px 14px oklch(0.62 0.13 165 / .6);font-size:14px;font-weight:bold;">⏰</div>`,
      iconSize: [34, 34], iconAnchor: [17, 17],
    }),
  }), []);

  return (
    <div className={`relative w-full ${height} rounded-2xl overflow-hidden border border-border shadow-card`}>
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={center}
          radius={8}
          pathOptions={{ color: "oklch(0.62 0.13 165)", fillColor: "oklch(0.62 0.13 165)", fillOpacity: 1, weight: 3 }}
        >
          <Popup>Vous êtes ici</Popup>
        </CircleMarker>
        {pharmacies.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={p.onDuty ? icons.duty : icons.pharmacy}
            eventHandlers={{ click: () => onPharmacyClick?.(p) }}
          >
            <Popup>
              <div className="text-xs">
                <strong>{p.name}</strong>
                <br />
                {p.distance} · {p.open ? "Ouvert" : "Fermé"}
                {p.onDuty && " · De garde"}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full bg-card/95 backdrop-blur px-3 py-1.5 shadow-card border border-border">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="text-[11px] font-semibold">{pharmacies.length} officines en temps réel</span>
      </div>
    </div>
  );
}
