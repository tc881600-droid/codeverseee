import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, Play, Terminal, Lock, MessageCircle, ChevronRight,
  Flame, Swords, FolderKanban, Sparkles, Cpu, ArrowUpRight, Heart,
} from "lucide-react";
import { LANGUAGES, CHALLENGES, PROJECTS, LESSONS } from "../lib/seed";
import { useDB } from "../lib/db";
import { Reveal, Badge, Button, Kbd, LangLogo, DiffBadge } from "../components/ui";
import { highlight } from "../components/CodeEditor";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Landing() {
  const db = useDB();
  return (
    <div>
      <Hero />
      <LogoMarquee />
      <WhySection />
      <LanguagesSection />
      <PlaygroundSection />
      <PracticeSection />
      <ProjectsSection />
      <CommunitySection db={db} />
      <FinalCTA />
    </div>
  );
}

/* ================= HERO — a live compile, not a billboard ================= */

const SCENES = [
  {
    file: "fib.py", lang: "python",
    code: `# python 3.12
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print([fib(i) for i in range(9)])`,
    output: "[0, 1, 1, 2, 3, 5, 8, 13, 21]",
  },
  {
    file: "main.go", lang: "go",
    code: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
    output: "Hello, World!",
  },
  {
    file: "query.sql", lang: "sql",
    code: `SELECT name, xp
FROM users
WHERE streak >= 7
ORDER BY xp DESC
LIMIT 3;`,
    output: " ada   | 1240\n mira  |  986\n kenji |  871\n(3 rows · 0.4 ms)",
  },
];

function CompileDemo() {
  const [scene, setScene] = useState(0);
  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "compile" | "run" | "done">("typing");
  const [outLines, setOutLines] = useState<string[]>([]);
  const [ms, setMs] = useState(41);
  const s = SCENES[scene];
  const langMeta = LANGUAGES.find((l) => l.slug === s.lang);

  useEffect(() => {
    let dead = false;
    (async () => {
      setTyped(""); setPhase("typing"); setOutLines([]);
      for (let i = 1; i <= s.code.length; i++) {
        if (dead) return;
        setTyped(s.code.slice(0, i));
        await sleep(s.code[i - 1] === "\n" ? 48 : 13);
      }
      if (dead) return;
      setPhase("compile"); await sleep(780);
      if (dead) return;
      setPhase("run");
      for (const line of s.output.split("\n")) {
        if (dead) return;
        setOutLines((cur) => [...cur, line]);
        await sleep(140);
      }
      setMs(26 + Math.floor(Math.random() * 38));
      setPhase("done"); await sleep(2200);
      if (!dead) setScene((sc) => (sc + 1) % SCENES.length);
    })();
    return () => { dead = true; };
  }, [scene, s]);

  const steps: { id: typeof phase | "queued"; label: string }[] = [
    { id: "queued", label: "queue" }, { id: "compile", label: "compile" }, { id: "run", label: "run" }, { id: "done", label: "exit 0" },
  ];
  const order = ["queued", "compile", "run", "done"];
  const cur = order.indexOf(phase);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line2 bg-ink/90 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85),0_0_0_1px_rgba(52,211,153,0.06)]">
      {/* chrome */}
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose/70" /><span className="h-2.5 w-2.5 rounded-full bg-ember/70" /><span className="h-2.5 w-2.5 rounded-full bg-jade/70" />
        <span className="ml-3 flex items-center gap-2 font-mono text-[11px] font-semibold text-mist">
          <LangLogo slug={s.lang} className="h-4 w-4" /> {s.file}
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] text-dim">
          <span className={`pulse-dot h-1.5 w-1.5 rounded-full ${phase === "done" ? "bg-jade" : "bg-sky"}`} />
          docker sandbox · {langMeta?.version}
        </span>
      </div>
      {/* body */}
      <div className="relative min-h-[248px] bg-[#0a0d13] p-4 font-mono text-[12.5px] leading-[1.7]">
        <pre className="whitespace-pre-wrap text-[#c9d4e3]" dangerouslySetInnerHTML={{ __html: highlight(typed + (phase === "typing" ? "▌" : ""), s.lang) }} />
        {(phase === "run" || phase === "done") && (
          <div className="mt-3 border-t border-line/70 pt-3">
            <div className="text-[10.5px] text-dim">$ run {s.file} — stdin: none</div>
            {outLines.map((l, i) => <div key={i} className="out-line mt-1 whitespace-pre text-jade" style={{ animationDelay: `${i * 60}ms` }}>{l}</div>)}
          </div>
        )}
        {phase === "compile" && (
          <div className="mt-3 flex items-center gap-2 border-t border-line/70 pt-3 font-mono text-[11px] text-sky">
            <span className="spin inline-block h-3 w-3 rounded-full border-2 border-sky/30 border-t-sky" />
            compiling {s.file} in container…
          </div>
        )}
      </div>
      {/* pipeline */}
      <div className="flex items-center gap-1.5 border-t border-line bg-ink2/70 px-4 py-2.5">
        {steps.map((st, i) => {
          const done = i <= cur;
          const active = i === cur && phase !== "done";
          return (
            <span key={st.id} className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold transition-all duration-300 ${
              done ? (st.id === "done" ? "border-jade/50 text-jade" : "border-sky/40 text-sky") : "border-line text-dim"}`}>
              {active && <span className="pulse-dot h-1 w-1 rounded-full bg-current" />}{st.label}
            </span>
          );
        })}
        <span className="ml-auto font-mono text-[10px] text-dim">{phase === "done" ? `${ms} ms · 2.1 MB` : "—"}</span>
      </div>
    </div>
  );
}

function GlyphCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const parent = cv?.parentElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !parent || !ctx) return;
    let w = 0, h = 0, raf = 0;
    const glyphs = "{}[]()<>=+*/;:#&$".split("");
    const colors = ["52,211,153", "56,189,248", "240,180,41", "163,173,189"];
    type P = { x: number; y: number; s: number; v: number; c: string; g: string; a: number };
    const spawn = (H: number, anywhere = false): P => ({
      x: Math.random() * (w / (window.devicePixelRatio || 1)),
      y: anywhere ? Math.random() * H : H + 24,
      s: 10 + Math.random() * 10, v: 0.14 + Math.random() * 0.38,
      c: colors[(Math.random() * colors.length) | 0],
      g: glyphs[(Math.random() * glyphs.length) | 0],
      a: 0.035 + Math.random() * 0.09,
    });
    let parts: P[] = [];
    const resize = () => {
      const r = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      w = cv.width = r.width * dpr; h = cv.height = r.height * dpr;
      cv.style.width = r.width + "px"; cv.style.height = r.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: Math.min(64, Math.floor((r.width * r.height) / 24000)) }, () => spawn(r.height, true));
    };
    let active = true;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!active || document.hidden) return; // paused off-screen — zero cost
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, w / dpr, h / dpr);
      for (const p of parts) {
        p.y -= p.v;
        if (p.y < -26) Object.assign(p, spawn(h / dpr));
        ctx.font = `500 ${p.s}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.fillText(p.g, p.x, p.y);
      }
    };
    resize(); tick();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);
    const io = new IntersectionObserver(([e]) => { active = e.isIntersecting; }, { threshold: 0 });
    io.observe(parent);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none absolute inset-0" aria-hidden />;
}

function Hero() {
  const floats: { slug: string; cls: string }[] = [
    { slug: "python", cls: "left-[-14px] top-10 floaty" },
    { slug: "rust", cls: "right-[-10px] top-24 floaty2" },
    { slug: "go", cls: "bottom-16 left-[-26px] floaty2" },
    { slug: "typescript", cls: "bottom-6 right-10 floaty" },
    { slug: "java", cls: "top-[-16px] right-24 floaty" },
  ];
  return (
    <section className="vignette relative overflow-hidden border-b border-line/70">
      <GlyphCanvas />
      <div className="drift-a pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full bg-jade/[0.07] blur-[130px]" />
      <div className="drift-b pointer-events-none absolute bottom-[-30%] left-[-8%] h-[480px] w-[480px] rounded-full bg-sky/[0.05] blur-[120px]" />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-12 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-6">
          <Reveal>
            <div className="flex items-center gap-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-jade">
              <span className="pulse-dot h-2 w-2 rounded-full bg-jade" />
              learn · code · run · build · master
            </div>
          </Reveal>
          <h1 className="mt-6 font-display text-[44px] font-bold leading-[1.02] tracking-tight text-fog sm:text-6xl xl:text-[76px]">
            <span className="mask-line"><span style={{ animationDelay: "0.05s" }}>Learn every language</span></span>
            <span className="mask-line"><span style={{ animationDelay: "0.16s" }}>against a <span className="text-jade">real</span></span></span>
            <span className="mask-line"><span style={{ animationDelay: "0.27s" }}>compiler.</span></span>
          </h1>
          <Reveal delay={200}>
            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-mist">
              CodeVerse is a working environment, not a lecture hall. Thirteen languages compile and run in
              <b className="text-fog"> isolated Docker sandboxes</b>, every editor line explains itself as you type,
              and challenges are judged by <b className="text-fog">real test runs</b> — visible and hidden.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link to="/register"><Button size="lg" icon={<Play size={16} />}>Start learning</Button></Link>
              <Link to="/playground">
                <Button size="lg" variant="outline" icon={<Terminal size={15} />}>
                  Open the playground <Kbd>⌘K</Kbd>
                </Button>
              </Link>
            </div>
          </Reveal>
          <Reveal delay={380}>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11.5px] text-dim">
              <span><b className="text-mist">13</b> languages</span><span className="h-3 w-px bg-line2" />
              <span><b className="text-mist">{LESSONS.length}</b> lessons</span><span className="h-3 w-px bg-line2" />
              <span><b className="text-mist">{CHALLENGES.length}</b> judged challenges</span><span className="h-3 w-px bg-line2" />
              <span className="flex items-center gap-1.5"><Cpu size={12} className="text-sky" /> docker-isolated runs</span>
            </div>
          </Reveal>
        </div>

        <div className="relative lg:col-span-6">
          <svg className="slow-spin pointer-events-none absolute -inset-10 -z-10 m-auto opacity-40" width="100%" height="100%" viewBox="0 0 100 100" fill="none" aria-hidden>
            <circle cx="50" cy="50" r="48" stroke="#2f3b52" strokeWidth="0.3" strokeDasharray="2 5" />
          </svg>
          <Reveal delay={150}><CompileDemo /></Reveal>
          {floats.map((f) => (
            <span key={f.slug} className={`absolute z-10 hidden md:block ${f.cls}`}>
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-line2 bg-ink/90 shadow-xl backdrop-blur-sm">
                <LangLogo slug={f.slug} className="h-6 w-6" />
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function LogoMarquee() {
  return (
    <div className="relative overflow-hidden border-b border-line/70 bg-ink/50 py-4">
      <div className="marquee-track flex w-max items-center gap-14 px-7">
        {[...LANGUAGES, ...LANGUAGES].map((l, i) => (
          <span key={i} className="flex items-center gap-2.5 font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-mist/90 transition-colors hover:text-fog">
            <LangLogo slug={l.slug} className="h-5 w-5" />{l.name}
          </span>
        ))}
      </div>
      <span className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-void to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-void to-transparent" />
    </div>
  );
}

/* ================= WHY — editorial rows, not a card row ================= */

function WhySection() {
  const rows = [
    {
      n: "01", icon: <Cpu size={17} />, title: "Compile everything, everywhere",
      body: "Python, Rust, Go, C++, Java, SQL — your code builds and runs inside an isolated container with real compilers, real errors, real exit codes. JS and TS run instantly in your browser too.",
      visual: (
        <div className="flex flex-wrap items-center gap-1.5">
          {["queue", "compile", "run", "exit 0"].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <ChevronRight size={12} className="text-dim" />}
              <span className={`rounded-md border px-2 py-1 font-mono text-[10.5px] font-bold ${i < 3 ? "border-sky/40 text-sky" : "border-jade/50 text-jade"}`}>{s}</span>
            </React.Fragment>
          ))}
          <div className="mt-2 flex w-full items-center gap-2">
            {["python", "rust", "go", "cpp", "java", "sql"].map((l) => <LangLogo key={l} slug={l} className="h-5 w-5 opacity-80 transition-all hover:scale-125 hover:opacity-100" />)}
            <span className="font-mono text-[10px] text-dim">+ 7 more</span>
          </div>
        </div>
      ),
    },
    {
      n: "02", icon: <MessageCircle size={17} />, title: "Every line explains itself",
      body: "A live explainer tracks your caret and narrates the line you're on — loops, comprehensions, pointers, joins — with hoverable glosses for every token. It's a study buddy wired into every editor.",
      visual: (
        <div className="rounded-xl border border-line bg-[#0a0d13] p-3">
          <div className="flex items-center gap-2 font-mono text-[11px]"><span className="rounded bg-jade/12 px-1.5 py-0.5 text-[9.5px] font-bold text-jade">L04</span><span className="text-fog">for attempt in range(1, tries + 1):</span></div>
          <div className="mt-2 text-[11.5px] leading-relaxed text-mist">Loop — repeats the block <b className="text-fog">tries</b> times; <span className="font-mono text-sky">attempt</span> counts 1…tries</div>
          <div className="mt-2 flex gap-1.5">
            <span className="rounded border border-line bg-ink2 px-1.5 py-0.5 font-mono text-[10px]"><b className="text-sky">for</b> <span className="text-dim">loop keyword</span></span>
            <span className="rounded border border-line bg-ink2 px-1.5 py-0.5 font-mono text-[10px]"><b className="text-sky">range</b> <span className="text-dim">0…n−1</span></span>
          </div>
        </div>
      ),
    },
    {
      n: "03", icon: <Swords size={17} />, title: "Judged honestly, rewarded loudly",
      body: "Challenges run your code against visible tests and masked hidden ones — real pass/fail, never faked. XP, streaks, achievements and a dashboard that only ever shows what you actually did.",
      visual: (
        <div className="space-y-1.5 rounded-xl border border-line bg-[#0a0d13] p-3 font-mono text-[11.5px]">
          <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-jade" /><span className="text-fog">basic pair</span><span className="ml-auto text-jade">pass · 3ms</span></div>
          <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-jade" /><span className="text-fog">negatives</span><span className="ml-auto text-jade">pass · 2ms</span></div>
          <div className="flex items-center gap-2"><Lock size={12} className="text-dim" /><span className="text-dim">hidden case</span><span className="ml-auto text-dim">masked</span></div>
          <div className="mt-1 border-t border-line pt-1.5 text-[10.5px] text-ember">verdict: accepted · +50 XP</div>
        </div>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6">
      <Reveal>
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-jade">01 — the difference</div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-fog sm:text-5xl">
              Not a video course.<br />A <span className="text-jade">toolchain</span> for learning.
            </h2>
          </div>
          <p className="mb-2 hidden max-w-xs text-sm leading-relaxed text-dim lg:block">Everything below is live in this build — open any language and watch a container do the work.</p>
        </div>
      </Reveal>

      <div className="mt-14">
        {rows.map((r, i) => (
          <Reveal key={r.n}>
            <div className={`group grid items-start gap-6 border-t border-line py-10 transition-colors hover:bg-white/[0.015] lg:grid-cols-12 ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}>
              <div className="lg:col-span-2 lg:[direction:ltr]">
                <span className="stroke-num text-7xl font-bold leading-none transition-opacity duration-300 group-hover:opacity-100 lg:opacity-80">{r.n}</span>
              </div>
              <div className="lg:col-span-5 lg:[direction:ltr]">
                <h3 className="flex items-center gap-2.5 font-display text-2xl font-bold text-fog">
                  <span className="text-jade">{r.icon}</span>{r.title}
                </h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-mist">{r.body}</p>
              </div>
              <div className="lg:col-span-5 lg:[direction:ltr]">{r.visual}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================= LANGUAGES ================= */

function LanguagesSection() {
  return (
    <section className="border-y border-line/70 bg-ink/40 py-24">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-jade">02 — the verse</div>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Thirteen languages.<br />One <span className="text-sky">playground</span>.</h2>
            </div>
            <Link to="/languages" className="group flex items-center gap-2 font-mono text-[13px] font-bold text-jade">
              <span className="link-slide">browse all courses</span><ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
          {LANGUAGES.map((l, i) => (
            <Reveal key={l.slug} delay={(i % 7) * 50}>
              <Link to={`/languages/${l.slug}`}
                className="tilt group flex h-full flex-col items-center gap-3 rounded-2xl border border-line bg-ink/70 px-3 py-6 text-center">
                <LangLogo slug={l.slug} className="h-10 w-10 transition-transform duration-300 group-hover:scale-110" style={{ filter: `drop-shadow(0 0 14px ${l.color}55)` }} />
                <div>
                  <div className="font-display text-[15px] font-bold text-fog group-hover:text-jade">{l.name}</div>
                  <div className="mt-0.5 font-mono text-[10px] text-dim">{l.version}</div>
                </div>
                <span className="rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider" style={{ background: `${l.color}14`, color: l.color }}>
                  sandbox ready
                </span>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={13 * 50}>
            <Link to="/languages" className="tilt group flex h-full min-h-[150px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line2 bg-transparent px-3 py-6 text-center transition-colors hover:border-jade/50">
              <span className="font-display text-3xl font-bold text-dim transition-colors group-hover:text-jade">+</span>
              <span className="font-mono text-[11px] font-bold text-dim group-hover:text-mist">your next language</span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= PLAYGROUND ================= */

const MOCK_CODE = `def retry(fn, tries=3):
    for attempt in range(1, tries + 1):
        try:
            return fn()
        except Exception:
            if attempt == tries:
                raise`;

function PlaygroundSection() {
  const lines = MOCK_CODE.split("\n");
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-jade">03 — the workspace</div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">An editor that<br /><span className="text-ember">talks back</span>.</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-mist">
              Multi-file projects, tabs, stdin, staged execution with honest status reporting — and a live explainer
              narrating the line under your caret. Snippets persist across sessions; every run feeds your streak.
            </p>
          </Reveal>
          <div className="mt-8 space-y-3">
            {[
              "Compile & run all 13 languages in isolated containers",
              "Live line explainer with token-level glosses",
              "stdin panel for interactive programs",
              "Pipeline: queue → compile → run → collecting",
              "Save, load, reset — your work survives refresh",
            ].map((f, i) => (
              <Reveal key={f} delay={i * 60}>
                <div className="flex items-center gap-3 text-sm text-mist">
                  <CheckCircle2 size={16} className="shrink-0 text-jade" />{f}
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={320}>
            <Link to="/playground" className="group mt-9 inline-flex items-center gap-2 font-mono text-[13px] font-bold text-jade">
              <span className="link-slide">launch the playground</span><ArrowUpRight size={15} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-2xl border border-line2 bg-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose/70" /><span className="h-2.5 w-2.5 rounded-full bg-ember/70" /><span className="h-2.5 w-2.5 rounded-full bg-jade/70" />
              <span className="ml-3 flex items-center gap-2 font-mono text-[11px] font-semibold text-mist"><LangLogo slug="python" className="h-4 w-4" /> retry.py</span>
              <span className="ml-auto flex items-center gap-1.5 rounded-md border border-jade/40 bg-jade/10 px-2 py-0.5 font-mono text-[9.5px] font-bold text-jade"><MessageCircle size={10} /> EXPLAIN ON</span>
            </div>
            <div className="bg-[#0a0d13] py-3 font-mono text-[12.5px] leading-[1.75]">
              {lines.map((l, i) => (
                <div key={i} className={`px-4 ${i === 1 ? "caret-line" : ""}`}>
                  <span className="mr-4 inline-block w-5 select-none text-right text-[11px] text-dim">{i + 1}</span>
                  <span dangerouslySetInnerHTML={{ __html: highlight(l || " ", "python") }} />
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-[#0b0e13] px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md border border-jade/35 bg-jade/10 px-2 py-0.5 font-mono text-[10px] font-bold text-jade"><MessageCircle size={11} /> L02</span>
                <span className="text-[12.5px] leading-relaxed text-fog">Loop — repeats the block <b>tries</b> times; <span className="font-mono text-sky">attempt</span> counts 1…tries</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 pl-[52px]">
                <span className="rounded-md border border-line bg-ink2 px-2 py-0.5 font-mono text-[10.5px]"><b className="text-sky">for</b> <span className="text-dim">→ loop keyword</span></span>
                <span className="rounded-md border border-line bg-ink2 px-2 py-0.5 font-mono text-[10.5px]"><b className="text-sky">range</b> <span className="text-dim">→ start…stop−1</span></span>
                <span className="rounded-md border border-line bg-ink2 px-2 py-0.5 font-mono text-[10.5px]"><b className="text-sky">in</b> <span className="text-dim">→ membership</span></span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= PRACTICE + PROJECTS ================= */

function PracticeSection() {
  const picks = ["js-two-sum", "py-io-sum", "cpp-io-max3", "rust-io-len", "go-io-sum"];
  return (
    <section className="border-y border-line/70 bg-ink/40 py-24">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <Reveal>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-jade">04 — the arena</div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Challenges with<br /><span className="text-rose">teeth</span>.</h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-mist">
              {CHALLENGES.length} seeded across algorithms, strings, recursion, SQL and real stdin/stdout I/O —
              judged inside containers with hidden tests. Accepted verdicts earn XP, feed streaks, unlock achievements.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-line bg-ink/70 p-4">
              <Flame size={22} className="text-ember" />
              <div className="text-sm text-mist"><b className="text-fog">First blood bonus:</b> your first accepted submission in a language pays double XP.</div>
            </div>
          </Reveal>
          <Reveal delay={250}>
            <Link to="/practice" className="group mt-9 inline-flex items-center gap-2 font-mono text-[13px] font-bold text-jade">
              <span className="link-slide">enter the arena</span><ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
          </Reveal>
        </div>
        <div className="space-y-2.5">
          {picks.map((id, i) => {
            const c = CHALLENGES.find((x) => x.id === id);
            if (!c) return null;
            const lang = LANGUAGES.find((l) => l.slug === c.language);
            return (
              <Reveal key={id} delay={i * 70}>
                <Link to={`/challenge/${id}`} className="group flex items-center gap-4 rounded-xl border border-line bg-ink/70 px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-jade/35 hover:bg-ink2">
                  <LangLogo slug={c.language} className="h-7 w-7 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-fog group-hover:text-jade">{c.title}</div>
                    <div className="mt-0.5 font-mono text-[10.5px] text-dim">{lang?.name} · {c.category} · {c.tests.length} tests {c.mode === "io" ? "· stdin/stdout" : ""}</div>
                  </div>
                  <DiffBadge d={c.difficulty} />
                  <span className="font-mono text-[11px] font-bold text-ember">+{c.points}</span>
                  <ChevronRight size={15} className="text-dim transition-transform duration-300 group-hover:translate-x-1 group-hover:text-jade" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  const picks = PROJECTS.slice(0, 4);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-24 sm:px-6">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-jade">05 — the shipyard</div>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Build things that<br />outlive the <span className="text-jade">tutorial</span>.</h2>
          </div>
          <Link to="/projects" className="group flex items-center gap-2 font-mono text-[13px] font-bold text-jade">
            <span className="link-slide">all {PROJECTS.length} projects</span><ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {picks.map((p, i) => {
          const lang = LANGUAGES.find((l) => l.slug === p.language);
          return (
            <Reveal key={p.id} delay={i * 70}>
              <Link to={`/projects/${p.slug}`} className="tilt group flex h-full items-start gap-5 rounded-2xl border border-line bg-ink/70 p-6">
                <LangLogo slug={p.language} className="h-10 w-10 shrink-0" style={{ filter: `drop-shadow(0 0 16px ${lang?.color}55)` }} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-lg font-bold text-fog group-hover:text-jade">{p.title}</h3>
                    <Badge tone={p.level === "Beginner" ? "jade" : p.level === "Intermediate" ? "ember" : "rose"}>{p.level}</Badge>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-mist">{p.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-dim">
                    <span className="flex items-center gap-1.5"><FolderKanban size={12} />{p.tasks.length} tasks</span>
                    <span className="flex items-center gap-1.5"><Flame size={12} />~{p.hours}h</span>
                    <span className="flex items-center gap-1.5 text-ember"><Sparkles size={12} />{p.tasks.reduce((a, t) => a + t.xp, 0)} XP</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function CommunitySection({ db }: { db: ReturnType<typeof useDB> }) {
  const picks = ["p-sqljoins", "p-closures"];
  return (
    <section className="border-t border-line/70 bg-ink/40 py-24">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6">
        <Reveal>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-jade">06 — the commons</div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Learn louder, <span className="text-sky">together</span>.</h2>
        </Reveal>
        <div className="mt-12 space-y-4">
          {picks.map((pid, i) => {
            const post = db.posts.find((p) => p.id === pid);
            if (!post) return null;
            const author = db.users.find((u) => u.id === post.authorId);
            const prof = db.profiles.find((p) => p.userId === post.authorId);
            const comments = db.comments.filter((c) => c.postId === post.id).length;
            const likes = db.likes.filter((l) => l.endsWith(`:${pid}`)).length;
            return (
              <Reveal key={pid} delay={i * 90}>
                <Link to={`/community/${post.id}`} className="group block rounded-2xl border border-line bg-ink/80 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky/35">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] text-dim">
                    <span className="rounded-md px-2 py-0.5 font-bold uppercase tracking-wider" style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8" }}>{post.kind}</span>
                    {post.tags.slice(0, 3).map((t) => <span key={t}>#{t}</span>)}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold text-fog transition-colors group-hover:text-sky">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist">{post.body}</p>
                  <div className="mt-4 flex items-center gap-4 font-mono text-[11px] text-dim">
                    <span>@{author?.username || "?"} · {prof?.title || "coder"}</span>
                    <span className="flex items-center gap-1"><Heart size={11} />{likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle size={11} />{comments}</span>
                    <span className="ml-auto text-sky opacity-0 transition-opacity duration-300 group-hover:opacity-100">read thread →</span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ================= FINAL CTA ================= */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-28">
      <div className="drift-a pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-jade/[0.05] blur-[140px]" />
      <div className="relative mx-auto max-w-[1100px] px-4 sm:px-6">
        <Reveal>
          <div className="stroke-num pointer-events-none absolute -top-10 right-0 hidden select-none text-[180px] font-bold leading-none opacity-60 lg:block">{"</>"}</div>
          <div className="max-w-3xl">
            <h2 className="font-display text-5xl font-bold leading-[1.04] tracking-tight sm:text-6xl">
              Stop watching.<br />Start <span className="text-jade">compiling</span>.
            </h2>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-mist">
              Pick a language, write three lines, watch a container return real output.
              That's the whole onboarding — the rest is momentum.
            </p>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <Link to="/register"><Button size="lg" icon={<Play size={16} />}>Start learning</Button></Link>
            <Link to="/languages"><Button size="lg" variant="outline">Explore languages</Button></Link>
          </div>
          <div className="mt-10 inline-flex items-center gap-3 rounded-xl border border-line bg-ink/80 px-4 py-2.5 font-mono text-[12px]">
            <span className="text-jade">$</span>
            <span className="text-mist">codeverse run hello.py</span>
            <span className="text-dim">→</span>
            <span className="text-fog">Hello, CodeVerse!</span>
            <span className="rounded bg-jade/12 px-1.5 py-0.5 text-[10px] font-bold text-jade">exit 0 · 41ms</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
