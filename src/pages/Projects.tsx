import React from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, FolderKanban, Zap, CheckCircle2, Target, Rocket } from "lucide-react";
import { PROJECTS, LANGUAGES } from "../lib/seed";
import { useDB } from "../lib/db";
import { currentUser, toggleProjectTask } from "../lib/services";
import { Badge, Bar, Button, EmptyState, LangChip, Panel, Reveal, Ring, useToast } from "../components/ui";

export function ProjectsPage() {
  const db = useDB();
  const user = currentUser(db);
  const tasks = user ? db.tasks[user.id] || [] : [];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-jade">~/projects</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Build things that outlive the tutorial</h1>
          <p className="mt-2 max-w-xl text-[15px] text-mist">Ten guided builds across ten languages. Each task you ship earns XP and survives on your profile.</p>
        </div>
        <div className="rounded-2xl border border-line bg-ink/70 px-5 py-3.5">
          <div className="font-display text-2xl font-bold text-ember">{tasks.length}</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-dim">tasks shipped</div>
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => {
          const lang = LANGUAGES.find((l) => l.slug === p.language);
          const done = p.tasks.filter((t) => tasks.includes(t.id)).length;
          const pct = Math.round((done / p.tasks.length) * 100);
          const xp = p.tasks.reduce((a, t) => a + t.xp, 0);
          return (
            <Reveal key={p.id} delay={(i % 3) * 70}>
              <Link to={`/projects/${p.slug}`} className="group flex h-full flex-col rounded-2xl border border-line bg-ink/70 p-5 transition-all hover:-translate-y-0.5 hover:border-sky/35 hover:bg-ink2">
                <div className="flex items-center justify-between gap-3">
                  <LangChip slug={p.language} name={lang?.short || ""} color={lang?.color || "#fff"} />
                  <Badge tone={p.level === "Beginner" ? "jade" : p.level === "Intermediate" ? "ember" : "rose"}>{p.level}</Badge>
                </div>
                <h3 className="mt-3.5 font-display text-lg font-bold leading-snug text-fog group-hover:text-sky">{p.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-mist">{p.description}</p>
                <div className="mt-4 flex items-center gap-3 font-mono text-[11px] text-dim">
                  <span className="flex items-center gap-1"><Clock size={11} />~{p.hours}h</span>
                  <span className="flex items-center gap-1"><Target size={11} />{p.tasks.length} tasks</span>
                  <span className="flex items-center gap-1 text-ember"><Zap size={11} />{xp} XP</span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Bar value={pct} tone="sky" className="flex-1" />
                  <span className="font-mono text-[11px] text-dim">{pct}%</span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export function ProjectDetailPage() {
  const { slug } = useParams();
  const db = useDB();
  const user = currentUser(db);
  const toast = useToast();
  const project = PROJECTS.find((p) => p.slug === slug || p.id === slug);

  if (!project) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState icon={<FolderKanban size={30} />} title="Project not found" desc="This build doesn't exist in the verse."
          action={<Link to="/projects"><Button variant="outline">All projects</Button></Link>} />
      </div>
    );
  }

  const lang = LANGUAGES.find((l) => l.slug === project.language);
  const tasks = user ? db.tasks[user.id] || [] : [];
  const done = project.tasks.filter((t) => tasks.includes(t.id)).length;
  const pct = Math.round((done / project.tasks.length) * 100);
  const totalXp = project.tasks.reduce((a, t) => a + t.xp, 0);
  const earnedXp = project.tasks.filter((t) => tasks.includes(t.id)).reduce((a, t) => a + t.xp, 0);

  const toggle = (taskId: string, xp: number) => {
    if (!user) { toast.push({ tone: "error", title: "Sign in to track project progress", desc: "Task XP lands in your account." }); return; }
    const res = toggleProjectTask(user.id, taskId, xp);
    toast.push(res.done
      ? { tone: "xp", title: `+${xp} XP · task shipped`, desc: res.newAchievements.length ? `Unlocked: ${res.newAchievements.map((a) => a.name).join(", ")}` : `${done + 1}/${project.tasks.length} complete` }
      : { tone: "info", title: "Task unmarked", desc: `-${xp} XP rolled back.` });
  };

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 sm:px-6">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-mist hover:text-jade"><ChevronLeft size={14} /> All projects</Link>

      <div className="mt-5 flex flex-wrap items-center gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{project.title}</h1>
            <Badge tone={project.level === "Beginner" ? "jade" : project.level === "Intermediate" ? "ember" : "rose"}>{project.level}</Badge>
          </div>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-mist">{project.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-[12px] text-dim">
            <LangChip slug={project.language} name={lang?.short || ""} color={lang?.color || "#fff"} size="sm" />
            <span>{lang?.name}</span>·<span className="flex items-center gap-1"><Clock size={12} />~{project.hours} hours</span>·
            <span className="flex items-center gap-1 text-ember"><Zap size={12} />{totalXp} XP total</span>
          </div>
        </div>
        <Ring value={pct} size={104} label={`${pct}%`} sub={`${done}/${project.tasks.length}`} />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          {project.tasks.map((t, i) => {
            const isDone = tasks.includes(t.id);
            return (
              <Reveal key={t.id} delay={i * 40}>
                <button onClick={() => toggle(t.id, t.xp)}
                  className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                    isDone ? "border-jade/30 bg-jade/[0.04]" : "border-line bg-ink/70 hover:border-line2 hover:bg-ink2"}`}>
                  <input type="checkbox" className="cv-check mt-1" checked={isDone} readOnly />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[11px] font-bold text-dim">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`text-sm font-bold ${isDone ? "text-jade line-through decoration-jade/50" : "text-fog"}`}>{t.title}</span>
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-mist">{t.desc}</p>
                  </div>
                  <span className={`mt-0.5 shrink-0 rounded-md px-2 py-1 font-mono text-[11px] font-bold ${isDone ? "bg-jade/15 text-jade" : "bg-ink3 text-ember"}`}>+{t.xp} XP</span>
                </button>
              </Reveal>
            );
          })}
        </div>

        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <Panel className="p-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-mist">You will ship</h3>
            <ul className="mt-3 space-y-2.5">
              {project.outcomes.map((o, i) => (
                <li key={i} className="flex gap-2.5 text-[13.5px] leading-relaxed text-mist">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-sky" />{o}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold">XP banked</span>
              <span className="font-mono text-[13px] font-bold text-ember">{earnedXp}/{totalXp}</span>
            </div>
            <Bar value={(earnedXp / totalXp) * 100} tone="ember" className="mt-3" />
            {pct === 100 ? (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-jade/30 bg-jade/8 px-3.5 py-3">
                <Rocket size={17} className="text-jade" />
                <div className="text-[13px] font-bold text-jade">Project complete — share it with the community!</div>
              </div>
            ) : (
              <p className="mt-3 font-mono text-[11px] leading-relaxed text-dim">Check tasks as you ship them. XP adjusts live — uncheck to roll back.</p>
            )}
          </Panel>

          {pct === 100 && (
            <Link to="/community"><Button className="w-full" variant="outline" icon={<Rocket size={14} />}>Share in community</Button></Link>
          )}
          <Link to={`/docs/${project.language}`} className="block"><Button variant="subtle" className="w-full" icon={<ChevronRight size={14} />}>{lang?.name} docs for reference</Button></Link>
        </div>
      </div>
    </div>
  );
}
