import { Link, useLocation } from "@tanstack/react-router";
import { Home, Ticket, LifeBuoy, User } from "lucide-react";
import { useT } from "@/lib/i18n";
import { InstallPrompt } from "./InstallPrompt";

export function BottomNav() {
  const { pathname } = useLocation();
  const t = useT();
  const items = [
    { to: "/", label: t("nav_home"), icon: Home },
    { to: "/reservations", label: t("nav_reservations"), icon: Ticket },
    { to: "/aide", label: t("nav_help"), icon: LifeBuoy },
    { to: "/profil", label: t("nav_profile"), icon: User },
  ] as const;
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
        <InstallPrompt />
      </div>
    </div>
  );
}
