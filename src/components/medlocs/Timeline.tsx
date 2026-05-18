import { CheckCircle2, Loader2, QrCode as QrIcon } from "lucide-react";

export function Timeline({ stage }: { stage: 0 | 1 | 2 }) {
  const steps = [
    { label: "Réservé", icon: CheckCircle2, sub: ["Confirmation reçue", "Confirmation reçue", "Confirmation reçue"] },
    { label: "En préparation", icon: Loader2, sub: ["En attente", "Pharmacien en cours", "Terminé"] },
    { label: "Prêt pour retrait", icon: QrIcon, sub: ["Notification SMS à venir", "Bientôt prêt", "Disponible au comptoir"] },
  ];
  return (
    <div className="relative">
      <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />
      <div
        className="absolute left-4 top-4 w-px bg-primary transition-all"
        style={{ height: `${stage * 50}%` }}
      />
      <ol className="space-y-5">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const done = i <= stage;
          const current = i === stage;
          return (
            <li key={s.label} className="relative pl-12">
              <div
                className={`absolute left-0 top-0 grid place-items-center h-8 w-8 rounded-full border-2 ${
                  done ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${current && i === 1 ? "animate-spin" : ""}`} />
              </div>
              <p className={`text-sm font-semibold ${done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.sub[stage]}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
