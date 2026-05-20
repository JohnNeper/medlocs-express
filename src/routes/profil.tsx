import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User as UserIcon, Phone, LogOut, Heart, Bell, ShieldCheck, ChevronRight, FileText, Languages } from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import { useStore, store } from "@/lib/store";
import { i18n, useT, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [{ title: "Profil — MedLocs" }] }),
  component: ProfilPage,
});

function LanguageRow() {
  const lang = useLang();
  const t = useT();
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary-soft text-primary">
          <Languages className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{t("language")}</p>
          <p className="text-xs text-muted-foreground">Français · English</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-muted p-1">
          {(["fr", "en"] as const).map((l) => (
            <button
              key={l}
              onClick={() => i18n.set(l)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                lang === l ? "bg-primary text-primary-foreground shadow-pop" : "text-muted-foreground"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilPage() {
  const user = useStore((s) => s.user);
  const reservations = useStore((s) => s.reservations);
  const prescription = useStore((s) => s.prescription);
  const navigate = useNavigate();
  const t = useT();

  if (!user) {
    return (
      <AppShell>
        <header className="px-5 pt-6 pb-4">
          <h1 className="text-xl font-bold">{t("profile")}</h1>
        </header>
        <div className="px-5 space-y-4">
          <div className="rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-pop">
            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-white/20 backdrop-blur">
              <UserIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold">{t("log_in_short")}</h2>
            <p className="mt-1 text-sm opacity-90">{t("profile_cta_sub")}</p>
            <Link to="/auth" className="mt-4 inline-flex items-center gap-1 rounded-2xl bg-white text-primary font-semibold px-4 py-2.5">
              {t("log_in_signup")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <LanguageRow />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("profile")}</h1>
      </header>
      <div className="px-5 space-y-4">
        <div className="rounded-3xl bg-gradient-primary p-5 text-primary-foreground shadow-pop">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-white/20 backdrop-blur text-xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg leading-tight">{user.name}</p>
              <p className="text-xs opacity-90 flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3" /> {user.phone}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
              <p className="text-2xl font-bold">{reservations.length}</p>
              <p className="text-[11px] uppercase tracking-wider opacity-90">{t("bookings")}</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
              <p className="text-2xl font-bold">{prescription ? 1 : 0}</p>
              <p className="text-[11px] uppercase tracking-wider opacity-90">{t("active_rx")}</p>
            </div>
          </div>
        </div>

        <LanguageRow />

        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary-soft/40 p-4">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary text-primary-foreground">
              <Heart className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{t("health_soon")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("health_soon_sub")}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {[
            { icon: FileText, label: t("my_active_rx"), sub: prescription?.name ?? t("none"), to: "/ordonnance" as const },
            { icon: Bell, label: t("notifications"), sub: t("enabled") },
            { icon: ShieldCheck, label: t("privacy"), sub: t("data_encrypted") },
          ].map((row, i) => {
            const Icon = row.icon;
            const content = (
              <div className="flex items-center gap-3 p-4">
                <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{row.label}</p>
                  <p className="text-xs text-muted-foreground">{row.sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            );
            return row.to ? (
              <Link key={i} to={row.to}>{content}</Link>
            ) : (
              <div key={i}>{content}</div>
            );
          })}
        </div>

        <button
          onClick={() => { store.signOut(); navigate({ to: "/" }); }}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-destructive/30 text-destructive bg-card py-3 font-semibold"
        >
          <LogOut className="h-4 w-4" /> {t("sign_out")}
        </button>
      </div>
    </AppShell>
  );
}
