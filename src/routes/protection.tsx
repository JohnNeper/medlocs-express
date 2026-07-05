import { useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ShieldCheck,
  ScanLine,
  FileCheck2,
  MessageCircle,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles,
  Bot,
} from "lucide-react";
import { AppShell } from "@/components/medlocs/AppShell";
import {
  scanMedication,
  verifyPrescription,
  assistantChat,
  type ScanResult,
  type PrescriptionCheck,
} from "@/lib/protection.functions";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/protection")({
  head: () => ({
    meta: [
      { title: "Citizen protection — MedLocs" },
      {
        name: "description",
        content:
          "AI medication scanner, prescription verification and anti-self-medication assistant — health cybersecurity in Cameroon.",
      },
    ],
  }),
  component: ProtectionPage,
});

type Tab = "scan" | "rx" | "chat";

function ProtectionPage() {
  const [tab, setTab] = useState<Tab>("scan");
  const t = useT();
  return (
    <AppShell>
      <header className="px-5 pt-6 pb-3 flex items-center gap-3">
        <Link to="/" className="grid place-items-center h-10 w-10 rounded-xl border border-border bg-card">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">
            {t("cyber_health")}
          </p>
          <h1 className="text-lg font-bold leading-tight">{t("citizen_protection")}</h1>
        </div>
        <div className="grid place-items-center h-10 w-10 rounded-xl bg-primary-soft text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </header>

      <div className="px-5">
        <div className="rounded-2xl bg-gradient-primary p-4 text-primary-foreground shadow-pop relative overflow-hidden">
          <Sparkles className="absolute right-3 top-3 h-4 w-4 opacity-80" />
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-90">
            {t("ai_for_citizen")}
          </p>
          <p className="mt-1 text-sm leading-snug">{t("protection_intro")}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 p-1 rounded-2xl bg-muted">
          {[
            { id: "scan" as const, label: t("tab_scanner"), icon: ScanLine },
            { id: "rx" as const, label: t("tab_prescription"), icon: FileCheck2 },
            { id: "chat" as const, label: t("tab_sentinel"), icon: MessageCircle },
          ].map((it) => {
            const active = tab === it.id;
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                onClick={() => setTab(it.id)}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[11px] font-semibold transition ${
                  active ? "bg-card text-primary shadow-card" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {it.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          {tab === "scan" && <ScanPanel />}
          {tab === "rx" && <RxPanel />}
          {tab === "chat" && <ChatPanel />}
        </div>

        <p className="mt-6 mb-2 text-[11px] text-muted-foreground text-center">
          {t("protection_footer")}
        </p>
      </div>
    </AppShell>
  );
}

// -------- Scan medication --------
function ScanPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lang = useLang();
  const t = useT();

  const onFile = async (f: File | null) => {
    if (!f) return;
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setImg(String(reader.result));
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!img) return;
    setLoading(true);
    setError(null);
    try {
      const r = await scanMedication({ data: { imageDataUrl: img, lang } });
      setResult(r);
    } catch (e: any) {
      setError(e?.message ?? t("analysis_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("scan_intro")}</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {!img ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/40 p-8 flex flex-col items-center gap-3"
        >
          <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground">
            <ScanLine className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="font-semibold">{t("photograph_med")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("photograph_hint")}</p>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-border bg-card">
          <img src={img} alt="" className="w-full max-h-64 object-cover" />
          <div className="p-3 flex gap-2">
            <button
              onClick={() => {
                setImg(null);
                setResult(null);
              }}
              className="flex-1 rounded-xl border border-border py-2 text-sm font-semibold"
            >
              {t("retake")}
            </button>
            <button
              onClick={analyze}
              disabled={loading}
              className="flex-[2] rounded-xl bg-gradient-primary text-primary-foreground py-2 text-sm font-semibold shadow-pop disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("analyzing")}
                </span>
              ) : (
                t("analyze_ai")
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && <ScanResultCard r={result} />}
    </div>
  );
}

function ScanResultCard({ r }: { r: ScanResult }) {
  const t = useT();
  const color =
    r.verdict === "authentique"
      ? "bg-primary-soft border-primary/40 text-primary"
      : r.verdict === "suspect"
        ? "bg-destructive/10 border-destructive/40 text-destructive"
        : "bg-warning/20 border-warning/50 text-warning-foreground";

  const Icon = r.verdict === "authentique" ? CheckCircle2 : AlertTriangle;
  const verdictLabel =
    r.verdict === "authentique"
      ? t("verdict_authentique")
      : r.verdict === "suspect"
        ? t("verdict_suspect")
        : t("verdict_indetermine");

  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest font-bold">{t("verdict_ai")}</p>
          <p className="font-bold capitalize">{verdictLabel}</p>
        </div>
        <span className="text-xs font-mono">{(r.confidence * 100).toFixed(0)}%</span>
      </div>
      {r.name && (
        <p className="mt-2 text-sm">
          {t("med_identified")} : <span className="font-semibold">{r.name}</span>
        </p>
      )}
      {r.redFlags.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wider font-bold opacity-80">
            {t("signals_detected")}
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {r.redFlags.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-3 text-sm leading-snug">{r.advice}</p>
    </div>
  );
}

// -------- Prescription verifier --------
function RxPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PrescriptionCheck | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lang = useLang();
  const t = useT();

  const onFile = (f: File | null) => {
    if (!f) return;
    setError(null);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setImg(String(reader.result));
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!img) return;
    setLoading(true);
    setError(null);
    try {
      const r = await verifyPrescription({ data: { imageDataUrl: img, lang } });
      setResult(r);
    } catch (e: any) {
      setError(e?.message ?? t("analysis_error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("rx_intro")}</p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {!img ? (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/40 p-8 flex flex-col items-center gap-3"
        >
          <div className="grid place-items-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground">
            <Upload className="h-6 w-6" />
          </div>
          <div className="text-center">
            <p className="font-semibold">{t("rx_upload_btn")}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("rx_upload_hint")}</p>
          </div>
        </button>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-border bg-card">
          <img src={img} alt="" className="w-full max-h-64 object-cover" />
          <div className="p-3 flex gap-2">
            <button
              onClick={() => {
                setImg(null);
                setResult(null);
              }}
              className="flex-1 rounded-xl border border-border py-2 text-sm font-semibold"
            >
              {t("change")}
            </button>
            <button
              onClick={analyze}
              disabled={loading}
              className="flex-[2] rounded-xl bg-gradient-primary text-primary-foreground py-2 text-sm font-semibold shadow-pop disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("verifying")}
                </span>
              ) : (
                t("verify_ai")
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && <RxResultCard r={result} />}
    </div>
  );
}

function RxResultCard({ r }: { r: PrescriptionCheck }) {
  const t = useT();
  const good = r.status === "coherente" && r.authenticityScore >= 0.7;
  const bad = r.status === "suspecte" || r.authenticityScore < 0.4;
  const color = good
    ? "bg-primary-soft border-primary/40 text-primary"
    : bad
      ? "bg-destructive/10 border-destructive/40 text-destructive"
      : "bg-warning/20 border-warning/50 text-warning-foreground";
  const Icon = good ? CheckCircle2 : AlertTriangle;

  const statusLabel =
    r.status === "coherente"
      ? t("status_coherente")
      : r.status === "incoherente"
        ? t("status_incoherente")
        : r.status === "suspecte"
          ? t("status_suspecte")
          : t("status_illisible");

  return (
    <div className={`rounded-2xl border p-4 ${color}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest font-bold">{t("rx_status")}</p>
          <p className="font-bold capitalize">{statusLabel}</p>
        </div>
        <span className="text-xs font-mono">{(r.authenticityScore * 100).toFixed(0)}%</span>
      </div>

      {r.medications.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wider font-bold opacity-80">
            {t("meds_detected")}
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {r.medications.map((m, i) => (
              <li key={i}>
                • <span className="font-semibold">{m.name}</span>
                {m.dose ? ` — ${m.dose}` : ""}
                {m.note ? ` (${m.note})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {r.issues.length > 0 && (
        <div className="mt-3">
          <p className="text-[11px] uppercase tracking-wider font-bold opacity-80">
            {t("points_to_check")}
          </p>
          <ul className="mt-1 space-y-1 text-sm">
            {r.issues.map((f, i) => (
              <li key={i} className="flex gap-2">
                <span>•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-sm leading-snug">{r.recommendation}</p>
    </div>
  );
}

// -------- Sentinel chat --------
type ChatMsg = { role: "user" | "assistant"; content: string };

function ChatPanel() {
  const t = useT();
  const lang = useLang();
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { role: "assistant", content: t("sentinel_greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMsg[] = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await assistantChat({ data: { messages: next, lang } });
      setMsgs([...next, { role: "assistant", content: reply }]);
    } catch (e: any) {
      setMsgs([...next, { role: "assistant", content: t("sentinel_error") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-3 space-y-3 max-h-[420px] overflow-y-auto">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="grid place-items-center h-8 w-8 shrink-0 rounded-full bg-primary-soft text-primary">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap leading-snug ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> {t("sentinel_thinking")}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 focus-within:border-primary"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("chat_placeholder")}
          className="flex-1 bg-transparent outline-none text-sm py-1.5"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="grid place-items-center h-9 w-9 rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
          aria-label={t("send")}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      <p className="text-[10px] text-muted-foreground text-center">{t("emergency_footer")}</p>
    </div>
  );
}
