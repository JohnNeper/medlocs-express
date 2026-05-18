import { MapPin } from "lucide-react";

export function MapCard({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative w-full overflow-hidden rounded-2xl shadow-card border border-border bg-card text-left active:scale-[0.99] transition-transform"
    >
      <div className="relative h-40 w-full bg-primary-soft overflow-hidden">
        {/* Stylized map */}
        <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0 L0 0 0 40" fill="none" stroke="oklch(0.62 0.13 165 / 0.12)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="200" fill="url(#grid)" />
          {/* roads */}
          <path d="M0 130 Q120 110 200 140 T 400 120" stroke="oklch(0.62 0.13 165 / 0.55)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M60 0 Q80 80 140 120 T 220 200" stroke="oklch(0.62 0.13 165 / 0.4)" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M300 0 L280 200" stroke="oklch(0.62 0.13 165 / 0.35)" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* pins */}
          {[
            [90, 70], [180, 90], [240, 60], [310, 110], [140, 150], [260, 150], [350, 70],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <circle r="10" fill="white" />
              <circle r="6" fill="oklch(0.62 0.13 165)" />
            </g>
          ))}
        </svg>

        {/* Floating badge */}
        <div className="absolute left-3 bottom-3 right-3 flex items-center gap-2 rounded-xl bg-card/95 backdrop-blur px-3 py-2 shadow-card border border-border">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">12 pharmacies synchronisées à proximité</span>
          <MapPin className="ml-auto h-4 w-4 text-primary" />
        </div>
      </div>
    </button>
  );
}
