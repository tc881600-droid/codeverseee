import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Zap, BookOpen, Bug, Binary, Trophy, Star, Flame, CalendarDays,
  TerminalSquare, Globe, Layers, Save, MessageSquare, Hammer, GraduationCap,
  Copy, Check, X, Play, AlertTriangle, Info, ChevronRight, Loader2,
} from "lucide-react";

/* ================= Toasts ================= */

export interface Toast { id: string; title: string; desc?: string; tone: "success" | "error" | "info" | "xp" }
const ToastCtx = createContext<{ push: (t: Omit<Toast, "id">) => void }>({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((cur) => [...cur.slice(-3), { ...t, id }]);
    window.setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[90] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-in relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md ${
            t.tone === "success" ? "border-jade/30 bg-[#0c1a14]/95" :
            t.tone === "error" ? "border-rose/30 bg-[#1c0f12]/95" :
            t.tone === "xp" ? "border-ember/40 bg-[#1a150a]/95" :
            "border-line bg-ink2/95"}`}>
            <span className={`mt-0.5 ${t.tone === "success" ? "text-jade" : t.tone === "error" ? "text-rose" : t.tone === "xp" ? "text-ember" : "text-sky"}`}>
              {t.tone === "xp" ? <Star size={17} /> : t.tone === "error" ? <AlertTriangle size={17} /> : t.tone === "success" ? <Check size={17} /> : <Info size={17} />}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-fog">{t.title}</div>
              {t.desc && <div className="mt-0.5 text-xs leading-relaxed text-mist">{t.desc}</div>}
            </div>
            <span className={`toast-bar absolute bottom-0 left-0 h-[2px] w-full ${t.tone === "success" ? "bg-jade/70" : t.tone === "xp" ? "bg-ember/70" : t.tone === "error" ? "bg-rose/70" : "bg-sky/70"}`} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ================= Buttons ================= */

type BtnVariant = "primary" | "ghost" | "outline" | "danger" | "subtle";
export function Button({
  variant = "primary", size = "md", loading, icon, className = "", children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant; size?: "sm" | "md" | "lg"; loading?: boolean; icon?: React.ReactNode;
}) {
  const base = "focusable inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none whitespace-nowrap";
  const sizes = { sm: "h-8 px-3 text-xs rounded-lg", md: "h-9.5 px-4 text-sm rounded-lg", lg: "h-11 px-6 text-[15px] rounded-xl" };
  const variants: Record<BtnVariant, string> = {
    primary: "bg-jade text-[#04170e] hover:bg-[#4ade9f] shadow-[0_4px_20px_-6px_rgba(52,211,153,0.5)]",
    ghost: "text-mist hover:text-fog hover:bg-white/5",
    outline: "border border-line2 text-fog hover:border-jade/50 hover:text-jade bg-transparent",
    danger: "bg-rose/15 text-rose border border-rose/30 hover:bg-rose/25",
    subtle: "bg-ink3 text-fog border border-line hover:border-line2 hover:bg-ink2",
  };
  return (
    <button className={`btn-sheen press ${base} ${sizes[size]} ${variants[variant]} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 size={15} className="spin" /> : icon}
      {children}
    </button>
  );
}

/* ================= Badges & chips ================= */

export function Badge({ tone = "dim", children, className = "", title }: { tone?: "jade" | "ember" | "rose" | "sky" | "dim" | "viol" | "neutral"; children: React.ReactNode; className?: string; title?: string }) {
  const tones = {
    jade: "bg-jade/12 text-jade border-jade/25",
    ember: "bg-ember/12 text-ember border-ember/25",
    rose: "bg-rose/12 text-rose border-rose/25",
    sky: "bg-sky/12 text-sky border-sky/25",
    viol: "bg-viol/12 text-viol border-viol/25",
    dim: "bg-white/4 text-mist border-line",
    neutral: "bg-white/8 text-fog border-line2",
  };
  return <span title={title} className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${tones[tone]} ${className}`}>{children}</span>;
}

/* Official language logos via the Devicon CDN (real SVG marks). Falls back to a
   colored monogram if the network mark can't load — the chip never breaks. */
const D = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";
export const LANG_LOGOS: Record<string, string> = {
  python: `${D}/python/python-original.svg`,
  javascript: `${D}/javascript/javascript-original.svg`,
  typescript: `${D}/typescript/typescript-original.svg`,
  c: `${D}/c/c-original.svg`,
  cpp: `${D}/cplusplus/cplusplus-original.svg`,
  java: `${D}/java/java-original.svg`,
  go: `${D}/go/go-original.svg`,
  rust: `${D}/rust/rust-original.svg`,
  php: `${D}/php/php-original.svg`,
  csharp: `${D}/csharp/csharp-original.svg`,
  kotlin: `${D}/kotlin/kotlin-original.svg`,
  dart: `${D}/dart/dart-original.svg`,
  sql: `${D}/postgresql/postgresql-original.svg`,
};

export function LangLogo({ slug, className = "", style }: { slug: string; className?: string; style?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);
  const url = LANG_LOGOS[slug];
  if (!url || failed) {
    return (
      <span className={`grid place-items-center rounded-md bg-white/8 font-mono font-bold text-fog ${className}`} style={style}>
        {slug.slice(0, 2)}
      </span>
    );
  }
  return <img src={url} alt={slug} loading="lazy" draggable={false} onError={() => setFailed(true)} className={className} style={style} />;
}

export function LangChip({ slug, name, color, size = "md" }: { slug: string; name: string; color: string; size?: "sm" | "md" | "lg" }) {
  const sz = size === "lg" ? "w-10 h-10 rounded-xl" : size === "sm" ? "w-6 h-6 rounded-md" : "w-8 h-8 rounded-lg";
  const img = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const [failed, setFailed] = useState(false);
  const url = LANG_LOGOS[slug];
  return (
    <span className={`${sz} grid shrink-0 place-items-center font-mono text-[10px] font-bold transition-transform duration-300 group-hover:scale-105`}
      style={{ background: `${color}17`, color, border: `1px solid ${color}3d`, boxShadow: `0 0 22px -6px ${color}55` }}>
      {url && !failed ? (
        <img src={url} alt="" draggable={false} loading="lazy" onError={() => setFailed(true)} className={`${img} select-none`} style={{ filter: `drop-shadow(0 0 8px ${color}66)` }} />
      ) : (
        <span style={{ textShadow: `0 0 14px ${color}88` }}>{name ? name.slice(0, 2).toUpperCase() : slug.slice(0, 2)}</span>
      )}
    </span>
  );
}

export function DiffBadge({ d }: { d: "Easy" | "Medium" | "Hard" }) {
  return <Badge tone={d === "Easy" ? "jade" : d === "Medium" ? "ember" : "rose"}>{d}</Badge>;
}

export function Avatar({ name, hue, size = 36 }: { name: string; hue: number; size?: number }) {
  return (
    <span className="grid place-items-center rounded-full font-display font-bold shrink-0 select-none"
      style={{
        width: size, height: size, fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 65% 22%), hsl(${(hue + 40) % 360} 60% 16%))`,
        border: `1px solid hsl(${hue} 60% 34%)`, color: `hsl(${hue} 80% 72%)`,
      }}>
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0f1512" stroke="#34d399" strokeOpacity="0.35" />
        <path d="M12 10l-6 6 6 6M20 10l6 6-6 6" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-fog" style={{ fontFamily: "'Roboto', sans-serif" }}>
        Code<span className="text-jade">Verse</span>
      </span>
    </span>
  );
}

/* ================= Panels / stats / progress ================= */

export function Panel({ className = "", children, glow }: { className?: string; children: React.ReactNode; glow?: boolean }) {
  return <div className={`rounded-2xl border border-line bg-ink/80 ${glow ? "glow-jade" : ""} ${className}`}>{children}</div>;
}

function useCountUp(target: number, dur = 850): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

function StatValue({ value }: { value: React.ReactNode }) {
  if (typeof value === "number") return <AnimatedNumber n={value} />;
  return <>{value}</>;
}
function AnimatedNumber({ n }: { n: number }) {
  const v = useCountUp(n);
  return <>{v.toLocaleString()}</>;
}

export function Stat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="group rounded-xl border border-line bg-ink2/60 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-jade/30 hover:shadow-[0_10px_30px_-14px_rgba(52,211,153,0.25)]">
      <div className="flex items-center gap-2 text-mist"><span className="text-jade/80 transition-transform duration-300 group-hover:scale-110">{icon}</span><span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span></div>
      <div className="mt-2 font-display text-2xl font-bold text-fog"><StatValue value={value} /></div>
      {sub && <div className="mt-0.5 text-xs text-dim">{sub}</div>}
    </div>
  );
}

export function Bar({ value, tone = "jade", className = "" }: { value: number; tone?: "jade" | "ember" | "sky" | "rose"; className?: string }) {
  const colors = { jade: "bg-jade", ember: "bg-ember", sky: "bg-sky", rose: "bg-rose" };
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-white/6 ${className}`}>
      <div className={`h-full rounded-full ${colors[tone]} transition-all duration-700 ease-out`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Ring({ value, size = 84, stroke = 7, label, sub }: { value: number; size?: number; stroke?: number; label?: React.ReactNode; sub?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1e232c" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#34d399" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * Math.min(100, Math.max(0, value))) / 100}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.2,0.65,0.25,1)", filter: "drop-shadow(0 0 6px rgba(52,211,153,0.45))" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display font-bold text-fog" style={{ fontSize: size * 0.2 }}>{label}</div>
          {sub && <div className="text-[10px] text-dim">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

/* ================= Modal ================= */

export function Modal({ open, onClose, title, children, width = "max-w-lg" }: { open: boolean; onClose: () => void; title: React.ReactNode; children: React.ReactNode; width?: string }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`pop-in relative w-full ${width} rounded-2xl border border-line2 bg-ink shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-base font-bold text-fog">{title}</h3>
          <button onClick={onClose} className="focusable rounded-lg p-1.5 text-mist hover:bg-white/5 hover:text-fog"><X size={17} /></button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ================= Tabs ================= */

export function Tabs({ tabs, active, onChange, size = "md" }: { tabs: { id: string; label: React.ReactNode }[]; active: string; onChange: (id: string) => void; size?: "sm" | "md" }) {
  return (
    <div className="flex gap-1 rounded-lg border border-line bg-ink2/70 p-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`focusable rounded-md font-semibold transition-all ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} ${
            active === t.id ? "bg-ink3 text-fog shadow-sm border border-line2" : "text-mist hover:text-fog border border-transparent"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ================= Forms ================= */

export function Field({ label, error, children, hint }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-[11px] text-dim">{hint}</span>}
      {error && <span className="mt-1 block text-[11px] font-medium text-rose">{error}</span>}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-line bg-ink2 px-3.5 py-2.5 text-sm text-fog placeholder:text-dim outline-none transition-colors focus:border-jade/60 focus:ring-2 focus:ring-jade/15";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-y font-mono text-[13px] leading-relaxed ${props.className || ""}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} appearance-none cursor-pointer ${props.className || ""}`} />;
}

/* ================= Empty / skeleton ================= */

export function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line2 bg-ink/40 px-6 py-14 text-center">
      <div className="mb-3 text-dim">{icon}</div>
      <div className="font-display text-base font-bold text-fog">{title}</div>
      <div className="mt-1 max-w-sm text-sm text-mist">{desc}</div>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skel({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-md border border-line2 bg-ink3 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-mist">{children}</kbd>;
}

/* ================= Reveal on scroll ================= */

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add("on"); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`rv ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ================= Achievement icon map ================= */

export const ACH_ICONS: Record<string, React.ReactNode> = {
  sparkles: <Sparkles size={18} />, zap: <Zap size={18} />, book: <BookOpen size={18} />,
  bug: <Bug size={18} />, binary: <Binary size={18} />, trophy: <Trophy size={18} />,
  star: <Star size={18} />, flame: <Flame size={18} />, calendar: <CalendarDays size={18} />,
  terminal: <TerminalSquare size={18} />, globe: <Globe size={18} />, layers: <Layers size={18} />,
  save: <Save size={18} />, message: <MessageSquare size={18} />, hammer: <Hammer size={18} />,
  graduation: <GraduationCap size={18} />,
};

/* ================= Markdown + code blocks ================= */

const FENCE_LANG_TO_PLAYGROUND: Record<string, string> = {
  js: "javascript", javascript: "javascript", ts: "typescript", typescript: "typescript",
  py: "python", python: "python", cpp: "cpp", c: "c", java: "java", go: "go",
  rust: "rust", sql: "sql", php: "php", csharp: "csharp", cs: "csharp", kotlin: "kotlin", dart: "dart",
};
const MAIN_FILE: Record<string, string> = {
  javascript: "main.js", typescript: "main.ts", python: "main.py", cpp: "main.cpp", c: "main.c",
  java: "Main.java", go: "main.go", rust: "main.rs", sql: "query.sql", php: "index.php",
  csharp: "Program.cs", kotlin: "main.kt", dart: "main.dart",
};

export function openInPlayground(code: string, lang: string, name?: string) {
  const pgLang = FENCE_LANG_TO_PLAYGROUND[lang] || lang;
  const draft = {
    language: pgLang,
    name: name || `example.${(MAIN_FILE[pgLang] || "main.txt").split(".").pop()}`,
    files: [{ name: MAIN_FILE[pgLang] || "main.txt", content: code }],
    stdin: "",
  };
  sessionStorage.setItem("cv.pg.draft", JSON.stringify(draft));
}

function CodeBlock({ code, lang, withRunner }: { code: string; lang: string; withRunner: boolean }) {
  const [copied, setCopied] = useState(false);
  const nav = useNavigate();
  const pgLang = FENCE_LANG_TO_PLAYGROUND[lang];
  return (
    <div className="my-3 overflow-hidden rounded-xl border border-line bg-[#0a0c10]">
      <div className="flex items-center justify-between border-b border-line px-3.5 py-1.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-dim">{lang || "code"}</span>
        <span className="flex items-center gap-1">
          {withRunner && pgLang && (
            <button
              onClick={() => { openInPlayground(code, lang); nav("/playground"); }}
              className="focusable inline-flex items-center gap-1.5 rounded-md border border-jade/30 bg-jade/10 px-2 py-0.5 text-[10px] font-bold text-jade transition-colors hover:bg-jade/20">
              <Play size={9} /> RUN IN PLAYGROUND
            </button>
          )}
          <button
            onClick={() => { navigator.clipboard?.writeText(code).catch(() => {}); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }}
            className="focusable inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold text-mist transition-colors hover:text-fog">
            {copied ? <Check size={11} className="text-jade" /> : <Copy size={11} />} {copied ? "copied" : "copy"}
          </button>
        </span>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-[12.5px] leading-relaxed text-[#c8d3df]">{code}</pre>
    </div>
  );
}

function inline(s: string, key: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push(s.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("**")) parts.push(<strong key={`${key}-${i++}`} className="font-semibold text-fog">{tok.slice(2, -2)}</strong>);
    else parts.push(<code key={`${key}-${i++}`} className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[0.85em] text-jade">{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < s.length) parts.push(s.slice(last));
  return parts;
}

export function Markdown({ text, withRunner = true }: { text: string; withRunner?: boolean }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let i = 0, key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { buf.push(lines[i]); i++; }
      i++;
      out.push(<CodeBlock key={key++} code={buf.join("\n")} lang={lang} withRunner={withRunner} />);
      continue;
    }
    if (line.trim() === "") { i++; continue; }
    if (/^[-*] /.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) { items.push(lines[i].trim().slice(2)); i++; }
      out.push(
        <ul key={key++} className="my-2 space-y-1.5 pl-1">
          {items.map((it, j) => (
            <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-mist">
              <ChevronRight size={14} className="mt-0.5 shrink-0 text-jade/70" />
              <span>{inline(it, j)}</span>
            </li>
          ))}
        </ul>,
      );
      continue;
    }
    if (/^\d+\. /.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+\. /, "")); i++; }
      out.push(
        <ol key={key++} className="my-2 space-y-1.5 pl-1">
          {items.map((it, j) => (
            <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-mist">
              <span className="mt-px shrink-0 font-mono text-[11px] font-bold text-jade/80">{j + 1}.</span>
              <span>{inline(it, j)}</span>
            </li>
          ))}
        </ol>,
      );
      continue;
    }
    out.push(<p key={key++} className="my-2 text-sm leading-relaxed text-mist">{inline(line, key)}</p>);
    i++;
  }
  return <div>{out}</div>;
}

/* ================= misc ================= */

export function SectionHead({ kicker, title, desc, align = "left" }: { kicker: string; title: React.ReactNode; desc?: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <div className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-jade">
        <span className="h-px w-6 bg-jade/60" />{kicker}
      </div>
      <h2 className="font-display text-3xl font-bold tracking-tight text-fog sm:text-4xl">{title}</h2>
      {desc && <p className="mt-3 text-[15px] leading-relaxed text-mist">{desc}</p>}
    </div>
  );
}
