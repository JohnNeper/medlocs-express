import { Link, useLocation } from "@tanstack/react-router";
import { Home, Ticket, LifeBuoy, User } from "lucide-react";

const items = [
  { to: "/", label: "Accueil", icon: Home },
  { to: "/reservations", label: "Réservations", icon: Ticket },
  { to: "/aide", label: "Aide", icon: LifeBuoy },
  { to: "/profil", label: "Profil", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      <div className="mx-auto max-w-[440px] px-3 pb-3 pointer-events-auto">
        <div className="rounded-3xl bg-card/95 backdrop-blur border border-border shadow-pop p-1.5 flex items-center justify-between">
          {items.map((it) => {
            const Icon = it.icon;
            const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-2xl transition ${
                  active ? "bg-primary-soft text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.4]" : ""}`} />
                <span className="text-[10px] font-semibold">{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function AppShell({ children, hideNav = false }: { children: React.ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className={`relative mx-auto max-w-[440px] min-h-screen bg-background shadow-card ${hideNav ? "pb-8" : "pb-28"}`}>
        {children}
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
