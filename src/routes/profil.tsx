import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { User as UserIcon, Phone, LogOut, Heart, Bell, ShieldCheck, ChevronRight, FileText } from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import { useStore, store } from "@/lib/store";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [{ title: "Profil — MedLocs" }] }),
  component: ProfilPage,
});

function ProfilPage() {
  const user = useStore((s) => s.user);
  const reservations = useStore((s) => s.reservations);
  const prescription = useStore((s) => s.prescription);
  const navigate = useNavigate();

  if (!user) {
    return (
      <AppShell>
        <header className="px-5 pt-6 pb-4">
          <h1 className="text-xl font-bold">Profil</h1>
        </header>
        <div className="px-5">
          <div className="rounded-3xl bg-gradient-primary p-6 text-primary-foreground shadow-pop">
            <div className="grid place-items-center h-14 w-14 rounded-2xl bg-white/20 backdrop-blur">
              <UserIcon className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold">Connectez-vous</h2>
            <p className="mt-1 text-sm opacity-90">Accédez à vos réservations, ordonnances et au suivi santé.</p>
            <Link to="/auth" className="mt-4 inline-flex items-center gap-1 rounded-2xl bg-white text-primary font-semibold px-4 py-2.5">
              Créer un compte / Se connecter <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">Profil</h1>
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
              <p className="text-[11px] uppercase tracking-wider opacity-90">Réservations</p>
            </div>
            <div className="rounded-2xl bg-white/15 backdrop-blur p-3">
              <p className="text-2xl font-bold">{prescription ? 1 : 0}</p>
              <p className="text-[11px] uppercase tracking-wider opacity-90">Ordonnance active</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary-soft/40 p-4">
          <div className="flex items-start gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary text-primary-foreground">
              <Heart className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Suivi santé (bientôt)</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rappels traitements, suivi des maladies chroniques et notifications pour vos proches âgés.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {[
            { icon: FileText, label: "Mon ordonnance active", sub: prescription?.name ?? "Aucune", to: "/ordonnance" as const },
            { icon: Bell, label: "Notifications", sub: "Activées" },
            { icon: ShieldCheck, label: "Confidentialité", sub: "Données chiffrées" },
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
          <LogOut className="h-4 w-4" /> Se déconnecter
        </button>
      </div>
    </AppShell>
  );
}
