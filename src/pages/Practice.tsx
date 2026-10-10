import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Search, Swords, CheckCircle2, XCircle, Play, Send, ChevronLeft, Zap,
  FlaskConical, ShieldAlert, MinusCircle, Trophy, History,
} from "lucide-react";
import { CHALLENGES, LANGUAGES } from "../lib/seed";
import type { Challenge } from "../lib/types";
import { useDB } from "../lib/db";
import { currentUser, isChallengePublished, submitChallenge } from "../lib/services";
import { runChallengeTests, resolveEngine, type TestRunResult } from "../lib/exec";
import { Badge, Button, DiffBadge, EmptyState, LangChip, Panel, Reveal, Select, Input, useToast } from "../components/ui";
import { CodeEditor } from "../components/CodeEditor";
import { ExplainerBar } from "../components/Explainer";

/* ================= LIST ================= */

export function PracticePage() {
  const db = useDB();
  const user = currentUser(db);
  const [q, setQ] = useState("");
  const [diff, setDiff] = useState("all");
  const [cat, setCat] = useState("all");

  const challenges = CHALLENGES.filter((c) => isChallengePublished(db, c.id));
  const cats = [...new Set(challenges.map((c) => c.category))];

  const solvedIds = useMemo(() => new Set(
    db.submissions.filter((s) => s.userId === user?.id && s.verdict === "accepted").map((s) => s.challengeId),
  ), [db.submissions, user]);
  const triedIds = useMemo(() => new Set(
    db.submissions.filter((s) => s.userId === user?.id).map((s) => s.challengeId),
  ), [db.submissions, user]);

  const filtered = challenges.filter((c) =>
    (diff === "all" || c.difficulty === diff) &&
    (cat === "all" || c.category === cat) &&
    (q === "" || c.title.toLowerCase().includes(q.toLowerCase()) || c.tags.some((t) => t.includes(q.toLowerCase()))),
  );

  const totalPts = challenges.reduce((a, c) => a + c.points, 0);
  const myPts = challenges.filter((c) => solvedIds.has(c.id)).reduce((a, c) => a + c.points, 0);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-jade">~/practice</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">The arena</h1>
          <p className="mt-2 max-w-xl text-[15px] text-mist">Visible tests run your function for real. Hidden tests decide the verdict. Accepted is earned, never given.</p>
        </div>
        <div className="flex items-center gap-5 rounded-2xl border border-line bg-ink/70 px-5 py-3.5">
          <div><div className="font-display text-2xl font-bold text-jade">{solvedIds.size}<span className="text-base text-dim">/{challenges.length}</span></div><div className="font-mono text-[10px] uppercase tracking-wider text-dim">solved</div></div>
          <div className="h-8 w-px bg-line" />
          <div><div className="font-display text-2xl font-bold text-ember">{myPts}<span className="text-base text-dim">/{totalPts}</span></div><div className="font-mono text-[10px] uppercase tracking-wider text-dim">points</div></div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search challenges…" className="!pl-9" />
        </div>
        <Select value={diff} onChange={(e) => setDiff(e.target.value)} className="w-36">
          <option value="all">All levels</option><option>Easy</option><option>Medium</option><option>Hard</option>
        </Select>
        <Select value={cat} onChange={(e) => setCat(e.target.value)} className="w-44">
          <option value="all">All categories</option>
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      <div className="mt-6 space-y-2.5">
        {filtered.map((c, i) => {
          const lang = LANGUAGES.find((l) => l.slug === c.language);
          const solved = solvedIds.has(c.id);
          const tried = triedIds.has(c.id);
          return (
            <Reveal key={c.id} delay={Math.min(i, 6) * 40}>
              <Link to={`/challenge/${c.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-line bg-ink/70 px-4 py-3.5 transition-all hover:border-jade/35 hover:bg-ink2">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${solved ? "border-jade/40 bg-jade/12 text-jade" : tried ? "border-ember/40 bg-ember/8 text-ember" : "border-line2 text-dim"}`}>
                  {solved ? <CheckCircle2 size={17} /> : tried ? <MinusCircle size={17} /> : <Swords size={16} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-fog group-hover:text-jade">{c.title}</span>
                    <DiffBadge d={c.difficulty} />
                    {resolveEngine(c.language) === "mock" && <Badge tone="ember">simulated judge</Badge>}
                    {c.mode === "io" && <Badge tone="sky">stdin/stdout</Badge>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[11px] text-dim">
                    <span>{c.category}</span>·<span>{c.tests.length} tests</span>·
                    <span className="flex gap-1">{c.tags.slice(0, 3).map((t) => <span key={t}>#{t}</span>)}</span>
                  </div>
                </div>
                <LangChip slug={c.language} name={lang?.short || ""} color={lang?.color || "#fff"} size="sm" />
                <span className="hidden w-16 text-right font-mono text-[12px] font-bold text-ember sm:block">{c.points} pts</span>
              </Link>
            </Reveal>
          );
        })}
        {filtered.length === 0 && <EmptyState icon={<Swords size={28} />} title="No challenges match" desc="Loosen the filters and try again." />}
      </div>
    </div>
  );
}

/* ================= WORKSPACE ================= */

export function ChallengePage() {
  const { id } = useParams();
  const db = useDB();
  const user = currentUser(db);
  const nav = useNavigate();
  const toast = useToast();
  const challenge = CHALLENGES.find((c) => c.slug === id || c.id === id);

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"test" | "submit" | null>(null);
  const [result, setResult] = useState<TestRunResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [explainOn] = useState(() => localStorage.getItem("cv.explain") !== "0");
  const [caret, setCaret] = useState({ line: 1, text: "" });

  const valid = challenge && isChallengePublished(db, challenge.id);
  const lang = challenge ? LANGUAGES.find((l) => l.slug === challenge.language) : undefined;

  useEffect(() => {
    if (!challenge) return;
    const saved = localStorage.getItem(`cv.chal.${challenge.id}`);
    setCode(saved || challenge.starter);
    setResult(null);
    setSubmitted(false);
  }, [challenge?.id]);

  useEffect(() => {
    if (challenge && code) localStorage.setItem(`cv.chal.${challenge.id}`, code);
  }, [code, challenge?.id]);

  if (!challenge || !valid || !lang) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState icon={<Swords size={30} />} title="Challenge not found" desc="It may have been unpublished by an admin."
          action={<Link to="/practice"><Button variant="outline">Back to practice</Button></Link>} />
      </div>
    );
  }

  const mySubs = db.submissions.filter((s) => s.userId === user?.id && s.challengeId === challenge.id).slice(0, 5);
  const alreadySolved = mySubs.some((s) => s.verdict === "accepted");

  const doRun = async (isSubmit: boolean) => {
    if (busy) return;
    setBusy(isSubmit ? "submit" : "test");
    setSubmitted(isSubmit);
    const res = await runChallengeTests(challenge, code);
    setResult(res);
    if (isSubmit && user) {
      const ev = submitChallenge(user.id, challenge, {
        passed: res.passed, total: res.total, verdict: res.verdict, simulated: res.simulated, ms: res.ms, code,
      });
      if (ev.firstSolve) {
        toast.push({ tone: "xp", title: `Accepted · +${ev.xpGained} XP`, desc: `${challenge.title} solved${ev.newAchievements.length ? ` · unlocked: ${ev.newAchievements.map((a) => a.name).join(", ")}` : ""}` });
      } else if (res.verdict === "failed") {
        toast.push({ tone: "error", title: "Not accepted", desc: `${res.outcomes.filter((o) => o.passed).length}/${res.outcomes.filter((o) => !o.hidden).length} visible tests passing — inspect failures below.` });
      } else if (res.verdict === "inconclusive") {
        toast.push({ tone: "info", title: "Inconclusive", desc: "Simulated runtime cannot verify tests for this language." });
      }
    } else if (isSubmit && !user) {
      toast.push({ tone: "info", title: "Sign in to record submissions", desc: "Runs work anonymously; verdicts and XP need an account." });
    }
    setBusy(null);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <Link to="/practice" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-mist hover:text-jade"><ChevronLeft size={14} /> All challenges</Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* problem statement */}
        <div className="min-w-0 space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{challenge.title}</h1>
              <DiffBadge d={challenge.difficulty} />
              {alreadySolved && <Badge tone="jade"><Trophy size={11} />solved</Badge>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2.5 font-mono text-[11px] text-dim">
              <LangChip slug={challenge.language} name={lang.short} color={lang.color} size="sm" />
              <span>{challenge.category}</span>·<span>{challenge.points} pts</span>·
              <span>{challenge.tags.map((t) => `#${t}`).join(" ")}</span>
            </div>
          </div>

          <Panel className="p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-mist">Problem</h3>
            {challenge.description.map((p, i) => <p key={i} className="mt-2.5 text-[14px] leading-relaxed text-mist">{p}</p>)}
            {challenge.sample && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-line bg-[#0a0c10] p-3"><div className="font-mono text-[10px] font-bold uppercase text-dim">input</div><pre className="mt-1 font-mono text-[12px] text-fog">{challenge.sample.input}</pre></div>
                <div className="rounded-lg border border-line bg-[#0a0c10] p-3"><div className="font-mono text-[10px] font-bold uppercase text-dim">output</div><pre className="mt-1 font-mono text-[12px] text-jade">{challenge.sample.output}</pre></div>
              </div>
            )}
            <h3 className="mt-5 font-display text-sm font-bold uppercase tracking-wider text-mist">Constraints</h3>
            <ul className="mt-2 space-y-1">
              {challenge.constraints.map((c, i) => <li key={i} className="font-mono text-[12px] text-dim">• {c}</li>)}
            </ul>
          </Panel>

          <Panel className="p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-mist"><ShieldAlert size={13} className="text-ember" />Judging</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-mist">
              {resolveEngine(challenge.language) === "mock" ? (
                <>This challenge targets <b>{lang.name}</b>, but no runtime is reachable right now — runs show approximate output and the verdict is honestly reported as <b className="text-ember">inconclusive</b>.</>
              ) : challenge.mode === "io" ? (
                <>Each test runs your <b>whole program</b> inside an isolated Docker container with the given <b className="text-sky">stdin</b>, and the printed output must match exactly. {challenge.tests.filter((t) => t.hidden).length} hidden tests guard the verdict.</>
              ) : resolveEngine(challenge.language) === "sandbox" ? (
                <>Visible tests execute your <code className="rounded bg-white/8 px-1 font-mono text-[12px] text-jade">{challenge.fnName}()</code> in an in-browser sandbox worker. {challenge.tests.filter((t) => t.hidden).length} hidden tests guard the verdict. No solution code is ever shown.</>
              ) : (
                <>Visible tests call <code className="rounded bg-white/8 px-1 font-mono text-[12px] text-jade">{challenge.fnName}()</code> inside an isolated Docker container. {challenge.tests.filter((t) => t.hidden).length} hidden tests guard the verdict.</>
              )}
            </p>
          </Panel>

          {mySubs.length > 0 && (
            <Panel className="p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-mist"><History size={13} />Your submissions</h3>
              <div className="mt-3 space-y-1.5">
                {mySubs.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 font-mono text-[11.5px]">
                    <span className={s.verdict === "accepted" ? "text-jade" : s.verdict === "failed" ? "text-rose" : "text-ember"}>● {s.verdict}</span>
                    <span className="text-dim">{s.passed}/{s.total} tests · {s.ms}ms · {new Date(s.at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        {/* editor + results */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-line bg-ink">
            <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
              <span className="font-mono text-[12px] font-semibold text-mist">solution.{lang.extension}</span>
              <Badge tone={resolveEngine(challenge.language) === "mock" ? "ember" : resolveEngine(challenge.language) === "remote" ? "sky" : "jade"}>
                {resolveEngine(challenge.language) === "mock" ? "simulated" : resolveEngine(challenge.language) === "remote" ? "container judge" : "real judge"}
              </Badge>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="subtle" onClick={() => doRun(false)} loading={busy === "test"} icon={<Play size={12} />}>Run tests</Button>
                <Button size="sm" onClick={() => doRun(true)} loading={busy === "submit"} icon={<Send size={12} />}>Submit</Button>
              </div>
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={challenge.language}
              minHeight={320}
              onCaretLine={(line, text) => setCaret({ line, text })}
              inlineExplainer={explainOn}
            />
            {explainOn && <ExplainerBar lang={challenge.language} line={caret.line} text={caret.text} />}
          </div>

          {result && (
            <Panel className="rise-in overflow-hidden">
              <div className={`flex items-center gap-3 border-b px-5 py-3.5 ${
                result.verdict === "accepted" ? "border-jade/25 bg-jade/8" : result.verdict === "failed" ? "border-rose/25 bg-rose/8" : "border-ember/25 bg-ember/8"}`}>
                {result.verdict === "accepted" ? <CheckCircle2 size={20} className="text-jade" /> : result.verdict === "failed" ? <XCircle size={20} className="text-rose" /> : <FlaskConical size={20} className="text-ember" />}
                <div>
                  <div className="font-display text-sm font-bold">
                    {result.verdict === "accepted" ? "Accepted" : result.verdict === "failed" ? "Failed" : "Inconclusive — simulated runtime"}
                  </div>
                  <div className="font-mono text-[11px] text-dim">
                    {result.passed}/{result.total} tests · {result.ms}ms{result.simulated ? " · MockExecutionAdapter" : " · BrowserSandboxAdapter"}
                  </div>
                </div>
                {submitted && result.verdict === "accepted" && <span className="ml-auto flex items-center gap-1 font-mono text-[12px] font-bold text-ember"><Zap size={12} />+{challenge.points} XP</span>}
              </div>

              <div className="divide-y divide-line/70">
                {result.outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-2.5">
                    {o.skipped ? <MinusCircle size={15} className="mt-0.5 shrink-0 text-dim" /> : o.passed ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-jade" /> : <XCircle size={15} className="mt-0.5 shrink-0 text-rose" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-fog">{o.name}</span>
                        {o.hidden && <Badge tone="dim">hidden</Badge>}
                        {o.skipped && <span className="font-mono text-[10px] text-dim">{o.hidden ? "verified server-side in production" : "not reached"}</span>}
                      </div>
                      {o.stdin !== undefined && (
                        <div className="mt-1 font-mono text-[11px] text-sky">stdin&nbsp;: {o.stdin ? o.stdin.replace(/\n/g, " ⏎ ") : "(empty)"}</div>
                      )}
                      {o.error && <div className="mt-0.5 font-mono text-[11px] text-rose">{o.error}</div>}
                      {!o.passed && !o.skipped && o.actual !== undefined && (
                        <div className="mt-1 font-mono text-[11px]">
                          <div className="text-rose">got&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: {o.actual}</div>
                          <div className="text-jade">expected: {o.expected}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {result.stdout && (
                <div className="border-t border-line bg-[#080a0d] px-5 py-3">
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-dim">program output</div>
                  <pre className="term-line mt-1 whitespace-pre-wrap font-mono text-[12px] text-fog">{result.stdout}</pre>
                </div>
              )}
              {result.note && <div className="border-t border-ember/20 bg-ember/5 px-5 py-3 font-mono text-[11px] leading-relaxed text-ember/90">{result.note}</div>}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
