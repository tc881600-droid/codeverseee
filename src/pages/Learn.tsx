import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Search, Play, CheckCircle2, Clock, Zap, ChevronLeft, ChevronRight, BookOpen,
  ArrowRight, FileText, Lightbulb, Circle, FlaskConical, Info,
} from "lucide-react";
import { LANGUAGES, COURSES, LESSONS } from "../lib/seed";
import type { Lesson, LessonSection } from "../lib/types";
import { useDB } from "../lib/db";
import { currentUser, isLangEnabled, isCoursePublished, completeLesson, recordLessonRun } from "../lib/services";
import { execute, engineLabel, isRealRuntime, type StageEvent } from "../lib/exec";
import { openInPlayground, Badge, Bar, Button, EmptyState, LangChip, Panel, Reveal, Ring, useToast } from "../components/ui";
import { CodeEditor } from "../components/CodeEditor";
import { ExplainerBar } from "../components/Explainer";

/* ================= LANGUAGES ================= */

export function LanguagesPage() {
  const db = useDB();
  const user = currentUser(db);
  const [q, setQ] = useState("");
  const lp = user ? db.lessonProgress[user.id] || {} : {};

  const langs = LANGUAGES.filter((l) => isLangEnabled(db, l.slug) &&
    (l.name.toLowerCase().includes(q.toLowerCase()) || l.tagline.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-jade">~/learn</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Choose your language</h1>
          <p className="mt-2 max-w-xl text-[15px] text-mist">Every language has courses, docs, playground templates and challenges. Start anywhere — progress follows you.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter languages…"
            className="w-full rounded-xl border border-line bg-ink2 py-2.5 pl-10 pr-4 text-sm text-fog placeholder:text-dim outline-none focus:border-jade/50" />
        </div>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {langs.map((l, i) => {
          const courses = COURSES.filter((c) => c.language === l.slug && isCoursePublished(db, c.id));
          const lessons = LESSONS.filter((x) => courses.some((c) => c.id === x.courseId));
          const done = lessons.filter((x) => lp[x.id]).length;
          return (
            <Reveal key={l.slug} delay={(i % 3) * 70}>
              <Link to={`/languages/${l.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-ink/70 p-5 transition-all hover:-translate-y-0.5 hover:border-line2 hover:bg-ink2 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-3.5">
                  <LangChip slug={l.slug} name={l.short} color={l.color} size="lg" />
                  <div>
                    <div className="font-display text-lg font-bold text-fog group-hover:text-jade">{l.name}</div>
                    <div className="font-mono text-[11px] text-dim">{l.version} · est. {l.firstYear}</div>
                  </div>
                  <span className="ml-auto rounded-md px-2 py-1 font-mono text-[10px] font-bold" style={{ background: `${l.color}15`, color: l.color }}>
                    {isRealRuntime(l.slug) ? "REAL" : "SIM"}
                  </span>
                </div>
                <p className="mt-3.5 flex-1 text-[13px] leading-relaxed text-mist">{l.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {l.paradigms.map((p) => <Badge key={p} tone="dim">{p}</Badge>)}
                </div>
                <div className="mt-4 border-t border-line pt-3.5">
                  {lessons.length > 0 ? (
                    <>
                      <div className="flex justify-between font-mono text-[10px] text-dim"><span>{courses.length} course{courses.length > 1 ? "s" : ""} · {lessons.length} lessons</span><span>{done}/{lessons.length} done</span></div>
                      <Bar value={lessons.length ? (done / lessons.length) * 100 : 0} className="mt-2" />
                    </>
                  ) : (
                    <div className="font-mono text-[10px] text-dim">Playground + docs available · course in production</div>
                  )}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
      {langs.length === 0 && <div className="mt-10"><EmptyState icon={<Search size={28} />} title="No languages match" desc={`Nothing found for "${q}".`} /></div>}
    </div>
  );
}

/* ================= LANGUAGE DETAIL ================= */

export function LanguageDetailPage() {
  const { slug } = useParams();
  const db = useDB();
  const user = currentUser(db);
  const nav = useNavigate();
  const lang = LANGUAGES.find((l) => l.slug === slug);
  if (!lang) return <NotFoundBlock label="language" />;
  if (!isLangEnabled(db, lang.slug)) return <NotFoundBlock label="language (disabled by admin)" />;

  const lp = user ? db.lessonProgress[user.id] || {} : {};
  const courses = COURSES.filter((c) => c.language === slug && isCoursePublished(db, c.id));

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6">
      <Link to="/languages" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-mist hover:text-jade"><ChevronLeft size={14} /> All languages</Link>
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <LangChip slug={lang.slug} name={lang.short} color={lang.color} size="lg" />
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">{lang.name}</h1>
          <div className="mt-1 font-mono text-[12px] text-dim">{lang.version} · first released {lang.firstYear} · {lang.paradigms.join(" · ")}</div>
        </div>
        <div className="ml-auto flex gap-2.5">
          <Button variant="outline" size="sm" onClick={() => { openInPlayground("", lang.slug); sessionStorage.removeItem("cv.pg.draft"); nav("/playground", { state: { language: lang.slug } }); }} icon={<Play size={13} />}>Open playground</Button>
          <Link to={`/docs/${lang.slug}`}><Button variant="subtle" size="sm" icon={<FileText size={13} />}>Docs</Button></Link>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-mist">{lang.tagline}</p>

      <h2 className="mt-10 font-display text-xl font-bold">Courses</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {courses.map((c) => {
          const lessons = LESSONS.filter((l) => l.courseId === c.id);
          const done = lessons.filter((l) => lp[l.id]).length;
          const pct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
          return (
            <Link key={c.id} to={`/learn/${c.slug}`} className="group rounded-2xl border border-line bg-ink/70 p-5 transition-all hover:border-jade/35 hover:bg-ink2">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-fog group-hover:text-jade">{c.title}</h3>
                <Badge tone={c.level === "Beginner" ? "jade" : c.level === "Intermediate" ? "ember" : "rose"}>{c.level}</Badge>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-mist">{c.description}</p>
              <div className="mt-4 flex items-center gap-3">
                <Bar value={pct} className="flex-1" />
                <span className="font-mono text-[11px] text-dim">{done}/{lessons.length} · {pct}%</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">{c.skills.slice(0, 4).map((s) => <Badge key={s} tone="dim">{s}</Badge>)}</div>
            </Link>
          );
        })}
        {courses.length === 0 && (
          <div className="md:col-span-2"><EmptyState icon={<BookOpen size={28} />} title="No course published yet"
            desc={`${lang.name} is available in the Playground and Docs right now. Structured course content ships through the admin console.`}
            action={<Button variant="outline" onClick={() => nav("/playground")}>Try it in the playground</Button>} /></div>
        )}
      </div>
    </div>
  );
}

/* ================= COURSE ================= */

export function CoursePage() {
  const { slug } = useParams();
  const db = useDB();
  const user = currentUser(db);
  const nav = useNavigate();
  const course = COURSES.find((c) => c.slug === slug);
  if (!course || !isCoursePublished(db, course.id)) return <NotFoundBlock label="course" />;
  const lang = LANGUAGES.find((l) => l.slug === course.language);
  const lessons = LESSONS.filter((l) => l.courseId === course.id);
  const lp = user ? db.lessonProgress[user.id] || {} : {};
  const done = lessons.filter((l) => lp[l.id]).length;
  const pct = Math.round((done / lessons.length) * 100);
  const modules = [...new Set(lessons.map((l) => l.module))];
  const next = lessons.find((l) => !lp[l.id]);

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6">
      <Link to={`/languages/${course.language}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-mist hover:text-jade"><ChevronLeft size={14} /> {lang?.name}</Link>
      <div className="mt-5 flex flex-wrap items-center gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
            <Badge tone={course.level === "Beginner" ? "jade" : course.level === "Intermediate" ? "ember" : "rose"}>{course.level}</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-mist">{course.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">{course.skills.map((s) => <Badge key={s} tone="dim">{s}</Badge>)}</div>
        </div>
        <div className="flex items-center gap-5">
          <Ring value={pct} size={96} label={`${pct}%`} sub={`${done}/${lessons.length}`} />
          <div>
            <Button onClick={() => nav(next ? `/lesson/${next.id}` : `/lesson/${lessons[0].id}`)} icon={<Play size={14} />}>
              {done === 0 ? "Start course" : next ? "Continue" : "Review"}
            </Button>
            <div className="mt-2 font-mono text-[11px] text-dim">{lessons.reduce((a, l) => a + l.xp, 0)} XP available</div>
          </div>
        </div>
      </div>

      <div className="mt-12 space-y-8">
        {modules.map((mod, mi) => (
          <Reveal key={mod}>
            <div className="mb-3 flex items-center gap-3">
              <span className="font-mono text-[11px] font-bold text-jade">{String(mi + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-lg font-bold">{mod}</h2>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="space-y-2">
              {lessons.filter((l) => l.module === mod).map((l) => {
                const prog = lp[l.id];
                const isNext = next?.id === l.id;
                return (
                  <Link key={l.id} to={`/lesson/${l.id}`}
                    className={`group flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all hover:bg-ink2 ${
                      prog ? "border-jade/25 bg-jade/[0.03]" : isNext ? "border-ember/35 bg-ember/[0.04]" : "border-line bg-ink/60"}`}>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border font-mono text-[11px] font-bold ${
                      prog ? "border-jade/40 bg-jade/15 text-jade" : isNext ? "border-ember/40 bg-ember/10 text-ember" : "border-line2 text-dim"}`}>
                      {prog ? <CheckCircle2 size={15} /> : String(l.order).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-fog group-hover:text-jade">{l.title}</div>
                      <div className="mt-0.5 truncate text-xs text-dim">{l.summary}</div>
                    </div>
                    <div className="hidden items-center gap-4 font-mono text-[11px] text-dim sm:flex">
                      <span className="flex items-center gap-1"><Clock size={11} />{l.minutes}m</span>
                      <span className="flex items-center gap-1 text-ember"><Zap size={11} />{l.xp} XP</span>
                      {prog && prog.runs > 0 && <span className="flex items-center gap-1"><FlaskConical size={11} />{prog.runs} runs</span>}
                    </div>
                    <ChevronRight size={15} className="text-dim transition-transform group-hover:translate-x-1 group-hover:text-jade" />
                  </Link>
                );
              })}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ================= LESSON ================= */

function SectionBlock({ s, langSlug }: { s: LessonSection; langSlug: string }) {
  const nav = useNavigate();
  return (
    <div>
      {s.h && <h2 className="mt-7 font-display text-xl font-bold text-fog">{s.h}</h2>}
      {s.p && <p className="mt-2.5 text-[14.5px] leading-relaxed text-mist">{s.p}</p>}
      {s.list && (
        <ul className="mt-3 space-y-2">
          {s.list.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-mist">
              <ChevronRight size={15} className="mt-0.5 shrink-0 text-jade/70" />{it}
            </li>
          ))}
        </ul>
      )}
      {s.code && (
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-[#0a0c10]">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-dim">{s.lang || langSlug}</span>
            <button onClick={() => { openInPlayground(s.code!, s.lang || langSlug); nav("/playground"); }}
              className="focusable inline-flex items-center gap-1.5 rounded-md border border-jade/30 bg-jade/10 px-2 py-0.5 text-[10px] font-bold text-jade hover:bg-jade/20">
              <Play size={9} /> RUN IN PLAYGROUND
            </button>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-[#c8d3df]">{s.code}</pre>
        </div>
      )}
    </div>
  );
}

export function LessonPage() {
  const { lessonId } = useParams();
  const db = useDB();
  const user = currentUser(db);
  const nav = useNavigate();
  const toast = useToast();

  const lesson = LESSONS.find((l) => l.id === lessonId);
  const course = lesson ? COURSES.find((c) => c.id === lesson.courseId) : undefined;
  const lang = course ? LANGUAGES.find((l) => l.slug === course.language) : undefined;

  const [code, setCode] = useState("");
  const [ranOnce, setRanOnce] = useState(false);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageEvent["stage"] | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof execute>> | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [explainOn] = useState(() => localStorage.getItem("cv.explain") !== "0");
  const [caret, setCaret] = useState({ line: 1, text: "" });

  const lessons = course ? LESSONS.filter((l) => l.courseId === course.id) : [];
  const idx = lesson ? lessons.findIndex((l) => l.id === lesson.id) : -1;
  const lp = user ? db.lessonProgress[user.id] || {} : {};
  const prog = lesson ? lp[lesson.id] : undefined;
  const courseDone = lessons.filter((l) => lp[l.id]).length;

  const starter = useMemo(() => lesson?.exercise?.starter || (lang ? lesson?.sections.find((s) => s.code)?.code || "" : ""), [lesson, lang]);
  React.useEffect(() => { setCode(starter); setResult(null); setRanOnce(false); setShowHint(false); }, [lessonId, starter]);

  if (!lesson || !course || !lang) return <NotFoundBlock label="lesson" />;

  const run = async () => {
    setRunning(true);
    setResult(null);
    const res = await execute(
      { language: lang.slug, files: [{ name: `main.${lang.extension}`, content: code }], stdin: "", userId: user?.id, source: "lesson" },
      (e) => setStage(e.stage),
    );
    recordLessonRun(user?.id ?? null, lesson.id);
    setResult(res);
    setRanOnce(true);
    setRunning(false);
    setStage(null);
  };

  const complete = () => {
    if (!user) { toast.push({ tone: "error", title: "Sign in required", desc: "Create an account to bank XP and progress." }); nav("/login"); return; }
    const ev = completeLesson(user.id, lesson);
    if (ev.xpGained === 0) { toast.push({ tone: "info", title: "Already completed", desc: "XP was awarded the first time." }); return; }
    toast.push({ tone: "xp", title: `+${ev.xpGained} XP earned`, desc: `Streak: ${ev.streak} day${ev.streak > 1 ? "s" : ""}${ev.newAchievements.length ? ` · unlocked ${ev.newAchievements.map((a) => a.name).join(", ")}` : ""}` });
  };

  const stageLabel = stage === "queued" ? "Preparing environment…" : stage === "compile" ? "Compiling in container…" : stage === "running" ? "Running code…" : stage === "collecting" ? "Collecting output…" : null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <Link to={`/learn/${course.slug}`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-mist hover:text-jade"><ChevronLeft size={14} /> {course.title}</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* content */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[12px] font-bold text-jade">{lesson.module} · lesson {String(lesson.order).padStart(2, "0")}</span>
            {prog && <Badge tone="jade"><CheckCircle2 size={11} /> completed</Badge>}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-mist">{lesson.summary}</p>
          <div className="mt-4 flex items-center gap-4 font-mono text-[11px] text-dim">
            <span className="flex items-center gap-1.5"><Clock size={12} />{lesson.minutes} min</span>
            <span className="flex items-center gap-1.5 text-ember"><Zap size={12} />{lesson.xp} XP</span>
            <span className="flex items-center gap-1.5"><LangChip slug={lang.slug} name={lang.short} color={lang.color} size="sm" />{lang.name} {lang.version}</span>
          </div>

          <div className="mt-6">
            {lesson.sections.map((s, i) => <SectionBlock key={i} s={s} langSlug={lang.slug} />)}
          </div>

          {/* try it */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-line2 bg-ink">
            <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
              <span className="flex items-center gap-2 font-display text-sm font-bold"><FlaskConical size={15} className="text-jade" />Try it yourself</span>
              <Badge tone={isRealRuntime(lang.slug) ? "jade" : "ember"}>{isRealRuntime(lang.slug) ? "real execution" : "simulated runtime"}</Badge>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setCode(starter)}>Reset</Button>
                <Button size="sm" onClick={run} loading={running} icon={<Play size={12} />}>Run</Button>
              </div>
            </div>
            <CodeEditor
              value={code}
              onChange={setCode}
              language={lang.slug}
              minHeight={200}
              onCaretLine={(line, text) => setCaret({ line, text })}
              inlineExplainer={explainOn}
            />
            {explainOn && <ExplainerBar lang={lang.slug} line={caret.line} text={caret.text} />}
            <div className="border-t border-line bg-[#080a0d] px-4 py-3.5 font-mono text-[12.5px]">
              {running && stageLabel && (
                <div className="flex items-center gap-2.5 text-sky">
                  <span className="pulse-dot h-2 w-2 rounded-full bg-sky" />{stageLabel}
                </div>
              )}
              {!running && !result && <span className="text-dim">$ output will appear here — press Run</span>}
              {!running && result && (
                <div className="space-y-1">
                  {result.stdout && <pre className="term-line whitespace-pre-wrap text-fog">{result.stdout}</pre>}
                  {result.stderr && <pre className={`term-line whitespace-pre-wrap ${result.simulated ? "text-ember/90" : "text-rose"}`}>{result.stderr}</pre>}
                  {!result.stdout && !result.stderr && <span className="text-dim">(no output)</span>}
                  <div className="mt-2 flex flex-wrap items-center gap-2 pt-1 text-[11px] text-dim">
                    <span className={result.status === "success" ? "text-jade" : "text-rose"}>● {result.status}</span>
                    <span>{result.ms}ms</span>
                    {result.memoryKB && <span>{(result.memoryKB / 1024).toFixed(1)}MB</span>}
                    <span>{result.engine}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* takeaways */}
          <div className="mt-8 rounded-2xl border border-jade/20 bg-jade/[0.04] p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-bold text-jade"><Info size={14} />Key takeaways</h3>
            <ul className="mt-3 space-y-1.5">
              {lesson.takeaways.map((t, i) => <li key={i} className="flex gap-2.5 text-[13.5px] text-mist"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-jade/70" />{t}</li>)}
            </ul>
          </div>
        </div>

        {/* rail */}
        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold">Course progress</span>
              <span className="font-mono text-[11px] text-dim">{courseDone}/{lessons.length}</span>
            </div>
            <Bar value={(courseDone / lessons.length) * 100} className="mt-3" />
            <div className="mt-5 space-y-3">
              <Button className="w-full" size="lg" onClick={complete} disabled={!!prog} icon={prog ? <CheckCircle2 size={15} /> : <Zap size={15} />}>
                {prog ? "Completed" : `Complete · +${lesson.xp} XP`}
              </Button>
              {!ranOnce && !prog && (
                <p className="text-center font-mono text-[10px] text-dim">tip: run the exercise first — it sticks better</p>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-4">
              <button disabled={idx <= 0} onClick={() => nav(`/lesson/${lessons[idx - 1].id}`)}
                className="flex items-center justify-center gap-1 rounded-lg border border-line py-2 text-xs font-semibold text-mist transition-colors hover:border-line2 hover:text-fog disabled:opacity-35">
                <ChevronLeft size={12} /> Previous
              </button>
              <button disabled={idx >= lessons.length - 1} onClick={() => nav(`/lesson/${lessons[idx + 1].id}`)}
                className="flex items-center justify-center gap-1 rounded-lg border border-line py-2 text-xs font-semibold text-mist transition-colors hover:border-line2 hover:text-fog disabled:opacity-35">
                Next <ChevronRight size={12} />
              </button>
            </div>
          </Panel>

          {lesson.exercise && (
            <Panel className="p-5">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold"><Lightbulb size={14} className="text-ember" />Exercise</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-mist">{lesson.exercise.prompt}</p>
              <button onClick={() => setShowHint((v) => !v)} className="mt-3 text-[12px] font-bold text-ember hover:underline">
                {showHint ? "Hide hint" : "Need a hint?"}
              </button>
              {showHint && <p className="rise-in mt-2 rounded-lg border border-ember/25 bg-ember/8 px-3 py-2 font-mono text-[12px] text-ember">{lesson.exercise.hint}</p>}
            </Panel>
          )}

          <Panel className="p-5">
            <h3 className="font-display text-sm font-bold">Up next</h3>
            <div className="mt-3 space-y-2">
              {lessons.slice(idx + 1, idx + 3).map((l) => (
                <Link key={l.id} to={`/lesson/${l.id}`} className="group flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 transition-colors hover:border-jade/35">
                  <Circle size={8} className="text-dim group-hover:text-jade" />
                  <span className="flex-1 truncate text-[13px] font-semibold text-mist group-hover:text-fog">{l.title}</span>
                  <span className="font-mono text-[10px] text-dim">{l.xp}xp</span>
                </Link>
              ))}
              {idx === lessons.length - 1 && (
                <Link to="/practice" className="group flex items-center gap-2.5 rounded-lg border border-jade/25 bg-jade/5 px-3 py-2.5">
                  <ArrowRight size={13} className="text-jade" />
                  <span className="flex-1 text-[13px] font-semibold text-jade">Course done — test yourself in Practice</span>
                </Link>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function NotFoundBlock({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <EmptyState icon={<BookOpen size={30} />} title="Nothing here" desc={`This ${label} doesn't exist or was unpublished.`}
        action={<Link to="/languages"><Button variant="outline">Browse languages</Button></Link>} />
    </div>
  );
}
