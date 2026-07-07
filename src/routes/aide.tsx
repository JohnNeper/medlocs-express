import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Phone } from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/aide")({
  head: () => ({ meta: [{ title: "Aide & Support — MedLocs" }] }),
  component: HelpPage,
});

function HelpPage() {
  const t = useT();
  const items = [
    { q: t("faq_1_q"), a: t("faq_1_a") },
    { q: t("faq_2_q"), a: t("faq_2_a") },
    { q: t("faq_3_q"), a: t("faq_3_a") },
    { q: t("faq_4_q"), a: t("faq_4_a") },
  ];
  return (
    <AppShell>
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">{t("help_title")}</h1>
        <p className="text-xs text-muted-foreground mt-1">{t("help_sub")}</p>
      </header>
      <div className="px-5 space-y-3">
        <a
          href="tel:+237233440000"
          className="w-full flex items-center gap-3 rounded-2xl bg-gradient-primary text-primary-foreground p-4 shadow-pop active:scale-[0.99] transition"
        >
          <div className="grid place-items-center h-11 w-11 rounded-2xl bg-white/20">
            <Phone className="h-5 w-5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold">{t("call_support")}</p>
            <p className="text-xs opacity-90">{t("support_hours")}</p>
          </div>
          <ChevronRight className="h-5 w-5" />
        </a>

        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          {items.map((it, i) => (
            <details key={i} className="group border-b border-border last:border-0">
              <summary className="cursor-pointer list-none flex items-center gap-3 p-4">
                <span className="grid place-items-center h-8 w-8 rounded-full bg-primary-soft text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{it.q}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition" />
              </summary>
              <p className="px-4 pb-4 pl-14 text-sm text-muted-foreground leading-relaxed">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
