import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Flame, Zap, BookOpen, Swords, Clock, RotateCcw, LogOut, Cpu, MessageCircle, Volume2, VolumeX, Music, ShieldCheck, Terminal } from "lucide-react";
import { getEngineMode, setEngineMode, type EngineMode } from "../lib/exec";
import { useDB, resetAll, levelFromXp, levelTitle, fmtDate, timeAgo } from "../lib/db";
import { login, register, updateProfile, currentUser, getUserStats } from "../lib/services";
import { areSoundsEnabled, toggleSounds } from "../lib/sounds";
import { ACHIEVEMENTS, LANGUAGES } from "../lib/seed";
import { Button, Field, Input, Textarea, Panel, Badge, Avatar, Ring, Bar, EmptyState, Modal, useToast, LangChip, ACH_ICONS } from "../components/ui";
import { TerminalAnimation } from "../components/TerminalAnimation";

/* ================= AUTH ================= */

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const nav = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      const res = mode === "login"
        ? await login(email, password)
        : await register(email, username, password);

      setBusy(false);

      if (!res.ok) {
        setError(res.error);
        return;
      }

      toast.push({
        tone: "success",
        title: mode === "login" ? "Welcome back" : "Account created",
        desc: `Signed in as ${res.user.username}`
      });
      nav("/dashboard");
    } catch (err) {
      setBusy(false);
      setError("An unexpected error occurred. Please try again.");
      console.error("Auth error:", err);
    }
  };

  return (
    <div className="relative grid min-h-[calc(100vh-56px)] lg:grid-cols-2">
      {/* Left side - Terminal Animation */}
      <div className="hidden lg:flex items-center justify-center p-8 bg-ink/50">
        <div className="w-full max-w-2xl">
          <TerminalAnimation />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-md">
          <Panel className="p-8" glow>
            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-2 text-sm text-mist">
                {mode === "login" ? "Sign in to continue your journey" : "Start your coding journey today"}
              </p>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={submit} className="space-y-4">
              {mode === "register" && (
                <Field label="Username">
                  <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" autoComplete="username" />
                </Field>
              )}
              <Field label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </Field>
              <Field label="Password">
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete={mode === "login" ? "current-password" : "new-password"} />
              </Field>

              {error && <div className="rise-in rounded-lg border border-rose/30 bg-rose/10 px-3.5 py-2.5 text-[13px] font-medium text-rose">{error}</div>}

              <Button type="submit" className="w-full" size="lg" loading={busy}>
                {mode === "login" ? "Sign in" : "Create account"}
              </Button>
            </form>

            {/* Switch between login/register */}
            <p className="mt-6 text-center text-[13px] text-mist">
              {mode === "login" ? (
                <>Don't have an account? <Link to="/register" className="font-bold text-jade hover:underline">Sign up</Link></>
              ) : (
                <>Already have an account? <Link to="/login" className="font-bold text-jade hover:underline">Sign in</Link></>
              )}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* ================= SETTINGS ================= */

export function SettingsPage() {
  const db = useDB();
  const user = currentUser(db);
  const toast = useToast();
  const nav = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const profile = db.profiles.find((p) => p.userId === user?.id);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [title, setTitle] = useState(profile?.title || "");
  const [bio, setBio] = useState(profile?.bio || "");

  if (!user || !profile) return null;

  const save = () => {
    updateProfile(user.id, { displayName: displayName.trim() || user.username, title, bio });
    toast.push({ tone: "success", title: "Profile updated" });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-mist">Profile, adapters and local data.</p>

      <Panel className="mt-8 p-6">
        <h2 className="font-display text-base font-bold">Profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr]">
          <Avatar name={displayName || user.username} hue={profile.hue} size={72} />
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Display name"><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></Field>
              <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Backend dev · Go" /></Field>
            </div>
            <Field label="Bio"><Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the verse about yourself" /></Field>
            <Button onClick={save} icon={<ShieldCheck size={14} />}>Save profile</Button>
          </div>
        </div>
      </Panel>

      <EnginePanel />

      <SoundPanel />

      <Panel className="mt-5 p-6">
        <h2 className="font-display text-base font-bold">Adapter status</h2>
        <div className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2">
          {[
            { k: "Authentication", v: "LocalAuthAdapter (Supabase slot ready)", tone: "ember" as const },
            { k: "Database", v: "LocalStorage (Prisma/Postgres slot ready)", tone: "ember" as const },
            { k: "Execution · JS/TS", v: "BrowserSandboxAdapter — real", tone: "jade" as const },
            { k: "Execution · all 13", v: "PistonAdapter — Docker-isolated sandboxes", tone: "sky" as const },
            { k: "Offline fallback", v: "MockExecutionAdapter — labeled simulated", tone: "ember" as const },
            { k: "AI tutor", v: "HeuristicTutorAdapter — local", tone: "sky" as const },
          ].map((a) => (
            <div key={a.k} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-ink2/60 px-3.5 py-2.5">
              <span className="font-semibold text-fog">{a.k}</span>
              <Badge tone={a.tone}>{a.v}</Badge>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="mt-5 border-rose/25 p-6">
        <h2 className="font-display text-base font-bold text-rose">Danger zone</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="danger" onClick={() => setResetOpen(true)} icon={<RotateCcw size={14} />}>Reset local database</Button>
          <Button variant="subtle" onClick={() => { nav("/"); }} icon={<LogOut size={14} />}>Sign out</Button>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-dim">Reseting reseeds all content and demo data. Accounts you created locally will be removed.</p>
      </Panel>

      <Modal open={resetOpen} onClose={() => setResetOpen(false)} title="Reset local database?">
        <p className="text-sm leading-relaxed text-mist">This wipes every local account, all progress, snippets, posts and submissions, then reseeds the demo universe. This cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { resetAll(); setResetOpen(false); toast.push({ tone: "info", title: "Database reset", desc: "Fresh seed loaded." }); nav("/"); }}>Reset everything</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ================= PUBLIC PROFILE ================= */

export function ProfilePage() {
  const { username } = useParams();
  const db = useDB();
  const user = db.users.find((u) => u.username === username);
  const profile = user ? db.profiles.find((p) => p.userId === user.id) : undefined;

  if (!user || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <EmptyState icon={<Flame size={30} />} title="Developer not found" desc={`No profile exists for @${username}.`} action={<Link to="/community"><Button variant="outline">Back to community</Button></Link>} />
      </div>
    );
  }

  const stats = getUserStats(db, user.id);
  const lvl = levelFromXp(stats.xp);
  const owned = db.achievements[user.id] || {};
  const solves = db.submissions.filter((s) => s.userId === user.id && s.verdict === "accepted").slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar name={profile.displayName} hue={profile.hue} size={84} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">{profile.displayName}</h1>
            <Badge tone="jade">Lv {lvl.level} · {levelTitle(lvl.level)}</Badge>
            {user.role === "admin" && <Badge tone="viol">admin</Badge>}
          </div>
          <div className="mt-1 font-mono text-[13px] text-dim">@{user.username} · joined {fmtDate(user.createdAt)}</div>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-mist">{profile.bio}</p>
        </div>
        <Ring value={(lvl.into / lvl.span) * 100} size={92} label={`Lv ${lvl.level}`} sub={`${stats.xp} XP`} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { icon: <Zap size={15} />, l: "XP", v: stats.xp.toLocaleString() },
          { icon: <Flame size={15} />, l: "Streak", v: `${stats.streak}d (best ${stats.bestStreak})` },
          { icon: <BookOpen size={15} />, l: "Lessons", v: stats.lessons },
          { icon: <Swords size={15} />, l: "Solved", v: stats.challenges },
          { icon: <Clock size={15} />, l: "Time", v: `${(stats.minutes / 60).toFixed(1)}h` },
          { icon: <Terminal size={15} />, l: "Runs", v: stats.runs },
        ].map((s) => (
          <div key={s.l} className="rounded-xl border border-line bg-ink/70 p-3.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-dim">{s.icon}{s.l}</div>
            <div className="mt-1.5 font-display text-lg font-bold text-fog">{s.v}</div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-lg font-bold">Achievements <span className="text-dim">· {Object.keys(owned).length}/{ACHIEVEMENTS.length}</span></h2>
      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {ACHIEVEMENTS.map((a) => {
          const at = owned[a.id];
          return (
            <div key={a.id} className={`flex items-center gap-3 rounded-xl border p-3 ${at ? "border-ember/35 bg-ember/6" : "border-line bg-ink/50 opacity-45"}`}>
              <span className={at ? "text-ember" : "text-dim"}>{ACH_ICONS[a.icon]}</span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold text-fog">{a.name}</div>
                <div className="truncate text-[11px] text-dim">{at ? `unlocked ${timeAgo(at)}` : a.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {solves.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-lg font-bold">Recent solves</h2>
          <div className="mt-4 space-y-2">
            {solves.map((s) => (
              <Link key={s.id} to={`/challenge/${s.challengeId}`} className="flex items-center gap-3 rounded-xl border border-line bg-ink/70 px-4 py-3 transition-colors hover:border-jade/40">
                <LangChip slug={s.language} name={LANGUAGES.find((l) => l.slug === s.language)?.short || ""} color={LANGUAGES.find((l) => l.slug === s.language)?.color || "#fff"} size="sm" />
                <span className="flex-1 truncate text-sm font-semibold text-fog">{s.challengeId}</span>
                <Badge tone="jade">{s.passed}/{s.total} tests</Badge>
                <span className="font-mono text-[11px] text-dim">{timeAgo(s.at)}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-10 font-display text-lg font-bold">Language activity</h2>
      <div className="mt-4 space-y-2.5">
        {Object.entries(db.executions.filter((e) => e.userId === user.id).reduce<Record<string, number>>((acc, e) => { acc[e.language] = (acc[e.language] || 0) + 1; return acc; }, {}))
          .sort((a, b) => b[1] - a[1]).slice(0, 6).map(([lang, n]) => {
            const meta = LANGUAGES.find((l) => l.slug === lang);
            const max = Math.max(...Object.values(db.executions.filter((e) => e.userId === user.id).reduce<Record<string, number>>((acc, e) => { acc[e.language] = (acc[e.language] || 0) + 1; return acc; }, {})));
            return (
              <div key={lang} className="flex items-center gap-3">
                <span className="w-24 truncate font-mono text-xs text-mist">{meta?.name || lang}</span>
                <Bar value={(n / max) * 100} className="flex-1" />
                <span className="w-10 text-right font-mono text-[11px] text-dim">{n} runs</span>
              </div>
            );
          })}
        {db.executions.filter((e) => e.userId === user.id).length === 0 && <p className="text-sm text-dim">No runs yet.</p>}
      </div>
    </div>
  );
}

/* ================= Engine preferences ================= */

const ENGINE_OPTS: { id: EngineMode; title: string; desc: string }[] = [
  { id: "judge0", title: "Cloud Execution (Recommended)", desc: "All languages compile and run in secure cloud containers — fast and reliable" },
  { id: "auto", title: "Auto (recommended)", desc: "Smart execution that chooses the best runtime for each language" },
  { id: "sandbox", title: "Browser Execution", desc: "JavaScript and TypeScript run directly in your browser for instant feedback" },
];

function EnginePanel() {
  const toast = useToast();
  const [mode, setMode] = useState<EngineMode>(getEngineMode());
  const [explainOn, setExplainOn] = useState(() => localStorage.getItem("cv.explain") !== "0");
  return (
    <Panel className="mt-5 p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-sky/30 bg-sky/10 text-sky"><Cpu size={16} /></span>
        <div>
          <h2 className="font-display text-base font-bold">Execution engine</h2>
          <p className="text-[12.5px] text-mist">Where your code actually runs — applies to Playground, lessons and challenge judging.</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {ENGINE_OPTS.map((o) => (
          <button key={o.id} onClick={() => { setEngineMode(o.id); setMode(o.id); toast.push({ tone: "success", title: `Engine: ${o.title}` }); }}
            className={`rounded-xl border p-3.5 text-left transition-all duration-200 ${mode === o.id ? "border-jade/50 bg-jade/8 shadow-[0_0_24px_-10px_rgba(52,211,153,0.5)]" : "border-line bg-ink2/50 hover:-translate-y-0.5 hover:border-line2 hover:bg-ink2"}`}>
            <span className="flex items-center gap-2">
              <span className={`h-3.5 w-3.5 rounded-full border-2 transition-colors ${mode === o.id ? "border-jade bg-jade" : "border-line2"}`} />
              <span className={`text-[13px] font-bold ${mode === o.id ? "text-jade" : "text-fog"}`}>{o.title}</span>
            </span>
            <span className="mt-1.5 block pl-[22px] text-[11.5px] leading-relaxed text-mist">{o.desc}</span>
          </button>
        ))}
      </div>
      <button onClick={() => setExplainOn((v) => { localStorage.setItem("cv.explain", v ? "0" : "1"); return !v; })}
        className="mt-4 flex w-full items-center gap-3 rounded-xl border border-line bg-ink2/50 px-4 py-3 text-left transition-colors hover:border-line2">
        <MessageCircle size={16} className={explainOn ? "text-jade" : "text-dim"} />
        <span className="flex-1">
          <span className="block text-[13px] font-bold text-fog">Live line explainer</span>
          <span className="block text-[11.5px] text-mist">Explains the line under your caret as you type — a study buddy inside every editor.</span>
        </span>
        <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${explainOn ? "bg-jade/70" : "border border-line2 bg-ink3"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-fog transition-all ${explainOn ? "left-[22px]" : "left-0.5"}`} />
        </span>
      </button>
    </Panel>
  );
}

/* ================= Sound preferences ================= */

function SoundPanel() {
  const toast = useToast();
  const [soundsOn, setSoundsOn] = useState(areSoundsEnabled());
  const [typingSounds, setTypingSounds] = useState(() => localStorage.getItem("cv.sounds.typing") !== "0");
  const [runSounds, setRunSounds] = useState(() => localStorage.getItem("cv.sounds.run") !== "0");
  const [resultSounds, setResultSounds] = useState(() => localStorage.getItem("cv.sounds.result") !== "0");

  const toggleMain = () => {
    const newState = toggleSounds();
    setSoundsOn(newState);
    toast.push({ tone: newState ? "success" : "info", title: newState ? "Sounds enabled" : "Sounds muted" });
  };

  const toggleTyping = () => {
    const current = localStorage.getItem("cv.sounds.typing") !== "0";
    localStorage.setItem("cv.sounds.typing", current ? "0" : "1");
    setTypingSounds(!current);
  };

  const toggleRun = () => {
    const current = localStorage.getItem("cv.sounds.run") !== "0";
    localStorage.setItem("cv.sounds.run", current ? "0" : "1");
    setRunSounds(!current);
  };

  const toggleResult = () => {
    const current = localStorage.getItem("cv.sounds.result") !== "0";
    localStorage.setItem("cv.sounds.result", current ? "0" : "1");
    setResultSounds(!current);
  };

  return (
    <Panel className="mt-5 p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg border border-ember/30 bg-ember/10 text-ember"><Music size={16} /></span>
        <div>
          <h2 className="font-display text-base font-bold">Sound effects</h2>
          <p className="text-[12.5px] text-mist">Mechanical keyboard sounds, run tension, and result chimes.</p>
        </div>
      </div>

      {/* Master toggle */}
      <button onClick={toggleMain}
        className="mt-4 flex w-full items-center gap-3 rounded-xl border border-line bg-ink2/50 px-4 py-3 text-left transition-colors hover:border-line2">
        {soundsOn ? <Volume2 size={16} className="text-jade" /> : <VolumeX size={16} className="text-dim" />}
        <span className="flex-1">
          <span className="block text-[13px] font-bold text-fog">Master sound toggle</span>
          <span className="block text-[11.5px] text-mist">{soundsOn ? "All sounds are enabled" : "All sounds are muted"}</span>
        </span>
        <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${soundsOn ? "bg-jade/70" : "border border-line2 bg-ink3"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-fog transition-all ${soundsOn ? "left-[22px]" : "left-0.5"}`} />
        </span>
      </button>

      {/* Individual sound toggles */}
      {soundsOn && (
        <div className="mt-3 space-y-2">
          <button onClick={toggleTyping}
            className="flex w-full items-center gap-3 rounded-lg border border-line bg-ink2/30 px-3.5 py-2.5 text-left transition-colors hover:border-line2">
            <span className="text-[12px] text-mist">⌨️ Typing sounds</span>
            <span className="ml-auto text-[11px] text-dim">{typingSounds ? "On" : "Off"}</span>
            <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${typingSounds ? "bg-jade/60" : "border border-line2 bg-ink3"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-fog transition-all ${typingSounds ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </button>
          <button onClick={toggleRun}
            className="flex w-full items-center gap-3 rounded-lg border border-line bg-ink2/30 px-3.5 py-2.5 text-left transition-colors hover:border-line2">
            <span className="text-[12px] text-mist">🚀 Run tension sound</span>
            <span className="ml-auto text-[11px] text-dim">{runSounds ? "On" : "Off"}</span>
            <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${runSounds ? "bg-jade/60" : "border border-line2 bg-ink3"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-fog transition-all ${runSounds ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </button>
          <button onClick={toggleResult}
            className="flex w-full items-center gap-3 rounded-lg border border-line bg-ink2/30 px-3.5 py-2.5 text-left transition-colors hover:border-line2">
            <span className="text-[12px] text-mist">🎵 Result chimes</span>
            <span className="ml-auto text-[11px] text-dim">{resultSounds ? "On" : "Off"}</span>
            <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${resultSounds ? "bg-jade/60" : "border border-line2 bg-ink3"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-fog transition-all ${resultSounds ? "left-[18px]" : "left-0.5"}`} />
            </span>
          </button>
        </div>
      )}
    </Panel>
  );
}
