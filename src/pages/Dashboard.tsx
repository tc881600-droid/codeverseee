import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Flame, Zap, BookOpen, Swords, Clock, Terminal, ArrowRight, Trophy, FolderKanban,
  Sparkles, ChevronRight, Play, Target, TrendingUp,
} from "lucide-react";
import { useDB, levelFromXp, levelTitle, timeAgo } from "../lib/db";
import { currentUser, getUserStats, recommendCourses } from "../lib/services";
import { COURSES, LESSONS, LANGUAGES, ACHIEVEMENTS, PROJECTS } from "../lib/seed";
import { Panel, Stat, Bar, Ring, Badge, Button, Avatar, ACH_ICONS, LangChip } from "../components/ui";

export default function Dashboard() {
  const db = useDB();
  const nav = useNavigate();
  const user = currentUser(db);
  if (!user) return null;
  const profile = db.profiles.find((p) => p.userId === user.id);
  const stats = getUserStats(db, user.id);
  const lvl = levelFromXp(stats.xp);
  const lp = db.lessonProgress[user.id] || {};

  const inProgress = COURSES.map((c) => {
    const lessons = LESSONS.filter((l) => l.courseId === c.id);
    const done = lessons.filter((l) => lp[l.id]).length;
    const next = lessons.find((l) => !lp[l.id]);
    return { c, done, total: lessons.length, next };
  }).filter((x) => x.done > 0 && x.done < x.total)
    .sort((a, b) => b.done / b.total - a.done / a.total);

  const recs = recommendCourses(db, user.id);
  const recentNotifs = db.notifs.filter((n) => n.userId === user.id).slice(0, 6);
  const owned = db.achievements[user.id] || {};
  const recentAch = Object.entries(owned).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const langRuns = db.executions.filter((e) => e.userId === user.id)
    .reduce<Record<string, number>>((acc, e) => { acc[e.language] = (acc[e.language] || 0) + 1; return acc; }, {});
  const topLangs = Object.entries(langRuns).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const projectsTouched = PROJECTS.filter((p) => p.tasks.some((t) => (db.tasks[user.id] || []).includes(t.id)));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-jade">~/dashboard</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {greeting}, <span className="text-jade">{profile?.displayName || user.username}</span>
          </h1>
          <p className="mt-1.5 text-sm text-mist">
            {stats.streak > 0
              ? <>Day <span className="font-bold text-ember">{stats.streak}</span> of your streak — one run keeps it alive.</>
              : "Your streak is cold. One lesson or run reignites it."}
          </p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-wider text-dim">level {lvl.level} · {levelTitle(lvl.level)}</div>
            <div className="mt-1 w-44"><Bar value={(lvl.into / lvl.span) * 100} tone="ember" /></div>
            <div className="mt-1 font-mono text-[10px] text-dim">{lvl.into}/{lvl.span} XP to level {lvl.level + 1}</div>
          </div>
          <Ring value={(lvl.into / lvl.span) * 100} size={76} label={lvl.level} sub="level" />
        </div>
      </div>

      {/* stats */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat icon={<Zap size={15} />} label="Total XP" value={stats.xp.toLocaleString()} />
        <Stat icon={<Flame size={15} />} label="Streak" value={`${stats.streak}d`} sub={`best ${stats.bestStreak}d`} />
        <Stat icon={<BookOpen size={15} />} label="Lessons" value={stats.lessons} sub={`${stats.courses} courses done`} />
        <Stat icon={<Swords size={15} />} label="Solved" value={stats.challenges} />
        <Stat icon={<Clock size={15} />} label="Time" value={`${(stats.minutes / 60).toFixed(1)}h`} />
        <Stat icon={<Terminal size={15} />} label="Executions" value={stats.runs} sub={`${stats.languages} languages`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* left column */}
        <div className="space-y-6">
          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Target size={17} className="text-jade" />Continue learning</h2>
              <Link to="/languages" className="flex items-center gap-1 text-[13px] font-bold text-jade hover:underline">All courses <ArrowRight size={12} /></Link>
            </div>
            <div className="mt-4 space-y-3">
              {(inProgress.length ? inProgress : recs.map((c) => ({ c, done: 0, total: LESSONS.filter((l) => l.courseId === c.id).length, next: LESSONS.find((l) => l.courseId === c.id) }))).slice(0, 3).map(({ c, done, total, next }) => {
                const lang = LANGUAGES.find((l) => l.slug === c.language);
                const pct = total ? Math.round((done / total) * 100) : 0;
                return (
                  <div key={c.id} className="group flex items-center gap-4 rounded-xl border border-line bg-ink2/50 p-4 transition-colors hover:border-jade/35">
                    <LangChip slug={c.language} name={lang?.short || ""} color={lang?.color || "#fff"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="truncate font-display text-[15px] font-bold text-fog">{c.title}</span>
                        <span className="font-mono text-[11px] text-dim">{done}/{total} · {pct}%</span>
                      </div>
                      <Bar value={pct} className="mt-2" />
                      <div className="mt-1.5 truncate text-xs text-dim">{next ? `Next: ${next.title}` : "Complete"}</div>
                    </div>
                    <Button size="sm" variant="subtle" className="group-hover:border-jade/40 group-hover:text-jade" onClick={() => nav(next ? `/lesson/${next.id}` : `/learn/${c.slug}`)}>
                      {done > 0 ? "Resume" : "Start"} <Play size={11} />
                    </Button>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold"><TrendingUp size={17} className="text-sky" />Language activity</h2>
            <div className="mt-4 space-y-3">
              {topLangs.length === 0 && <p className="text-sm text-dim">No executions yet — <Link className="text-jade hover:underline" to="/playground">fire up the playground</Link>.</p>}
              {topLangs.map(([slug, n]) => {
                const lang = LANGUAGES.find((l) => l.slug === slug);
                const max = topLangs[0][1];
                return (
                  <div key={slug} className="flex items-center gap-3">
                    <span className="w-28 truncate font-mono text-xs text-mist">{lang?.name || slug}</span>
                    <Bar value={(n / max) * 100} className="flex-1" tone={slug === "javascript" || slug === "typescript" ? "jade" : "ember"} />
                    <span className="w-20 text-right font-mono text-[11px] text-dim">{n} runs</span>
                  </div>
                );
              })}
            </div>
            {topLangs.length > 0 && (
              <p className="mt-3 font-mono text-[10px] text-dim">jade bars = real browser execution · amber = simulated adapter</p>
            )}
          </Panel>

          <Panel className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold"><FolderKanban size={17} className="text-ember" />Projects in motion</h2>
              <Link to="/projects" className="flex items-center gap-1 text-[13px] font-bold text-jade hover:underline">All projects <ArrowRight size={12} /></Link>
            </div>
            <div className="mt-4 space-y-2.5">
              {(projectsTouched.length ? projectsTouched : PROJECTS.slice(0, 2)).map((p) => {
                const done = p.tasks.filter((t) => (db.tasks[user.id] || []).includes(t.id)).length;
                return (
                  <Link key={p.id} to={`/projects/${p.slug}`} className="flex items-center gap-4 rounded-xl border border-line bg-ink2/50 p-3.5 transition-colors hover:border-ember/35">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold text-fog">{p.title}</div>
                      <div className="mt-1.5 flex items-center gap-3"><Bar value={(done / p.tasks.length) * 100} tone="ember" className="flex-1" /><span className="font-mono text-[11px] text-dim">{done}/{p.tasks.length}</span></div>
                    </div>
                    <ChevronRight size={15} className="text-dim" />
                  </Link>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* right column */}
        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold"><Trophy size={17} className="text-ember" />Recent achievements</h2>
            <div className="mt-4 space-y-2.5">
              {recentAch.length === 0 && <p className="text-sm text-dim">None yet — finish a lesson to unlock your first.</p>}
              {recentAch.map(([id, at]) => {
                const a = ACHIEVEMENTS.find((x) => x.id === id);
                if (!a) return null;
                return (
                  <div key={id} className="flex items-center gap-3 rounded-xl border border-ember/25 bg-ember/5 p-3">
                    <span className="text-ember">{ACH_ICONS[a.icon]}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-fog">{a.name}</div>
                      <div className="truncate text-[11px] text-dim">{a.desc}</div>
                    </div>
                    <span className="font-mono text-[10px] text-dim">{timeAgo(at)}</span>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6">
            <h2 className="font-display text-lg font-bold">Activity feed</h2>
            <div className="mt-4 space-y-3.5">
              {recentNotifs.length === 0 && <p className="text-sm text-dim">Quiet so far.</p>}
              {recentNotifs.map((n) => (
                <div key={n.id} className="flex gap-3 border-l-2 border-line pl-3.5">
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold leading-snug text-fog">{n.title}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-mist">{n.body}</div>
                    <div className="mt-1 font-mono text-[10px] text-dim">{timeAgo(n.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-jade/30 bg-jade/10 text-jade"><Sparkles size={18} /></div>
              <div className="flex-1">
                <div className="text-sm font-bold">Stuck on something?</div>
                <div className="text-xs text-mist">The tutor explains, reviews and drills.</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => nav("/ai-tutor")}>Ask</Button>
            </div>
          </Panel>

          <div className="rounded-2xl border border-line bg-ink/60 p-5">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-dim">this week</div>
            <div className="mt-3 flex items-end gap-1.5">
              {Array.from({ length: 7 }, (_, i) => {
                const day = new Date(Date.now() - (6 - i) * 864e5).toISOString().slice(0, 10);
                const active = db.executions.some((e) => e.userId === user.id && new Date(e.at).toISOString().slice(0, 10) === day)
                  || Object.values(lp).some((x) => new Date(x.at).toISOString().slice(0, 10) === day);
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className={`h-10 w-full rounded-md transition-all ${active ? "bg-jade/70 shadow-[0_0_12px_rgba(52,211,153,0.35)]" : "bg-ink3"}`} />
                    <span className="font-mono text-[9px] text-dim">{"MTWTFSS"[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
