import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield, ShieldAlert, Users, BarChart3, BookOpen, Swords, Globe, Flag,
  CheckCircle2, XCircle, Activity, Database,
} from "lucide-react";
import { useDB, timeAgo, levelFromXp } from "../lib/db";
import {
  currentUser, adminSetSuspended, adminSetRole, adminToggleCourse, adminToggleChallenge,
  adminToggleLanguage, adminResolveReport, getUserStats,
} from "../lib/services";
import { COURSES, CHALLENGES, LANGUAGES, LESSONS, PROJECTS } from "../lib/seed";
import { isCoursePublished, isChallengePublished } from "../lib/services";
import { Badge, Button, EmptyState, Panel, Stat, Tabs, useToast, LangChip, Bar } from "../components/ui";

export default function Admin() {
  const db = useDB();
  const user = currentUser(db);
  const toast = useToast();
  const [tab, setTab] = useState("analytics");

  if (!user || user.role !== "admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState icon={<ShieldAlert size={30} />} title="Admin area restricted"
          desc="Server-side authorization applies in production. Here, sign in as admin@codeverse.dev (password: admin123) to explore the console."
          action={<Link to="/login"><Button variant="outline">Sign in</Button></Link>} />
      </div>
    );
  }

  const execs = db.executions;
  const successRate = execs.length ? Math.round((execs.filter((e) => e.status === "success").length / execs.length) * 100) : 0;
  const byLang = Object.entries(execs.reduce<Record<string, number>>((a, e) => { a[e.language] = (a[e.language] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);
  const byStatus = Object.entries(execs.reduce<Record<string, number>>((a, e) => { a[e.status] = (a[e.status] || 0) + 1; return a; }, {})).sort((a, b) => b[1] - a[1]);
  const errors = execs.filter((e) => e.status !== "success").slice(0, 8);
  const maxLang = byLang[0]?.[1] || 1;
  const openReports = db.reports.filter((r) => !r.resolved);

  const coursePopularity = COURSES.map((c) => {
    const lessons = LESSONS.filter((l) => l.courseId === c.id);
    let completions = 0;
    Object.values(db.lessonProgress).forEach((lp) => { lessons.forEach((l) => { if (lp[l.id]) completions++; }); });
    return { c, completions };
  }).sort((a, b) => b.completions - a.completions);
  const maxCourse = coursePopularity[0]?.completions || 1;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-viol/35 bg-viol/10 text-viol"><Shield size={20} /></span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Admin console</h1>
          <p className="text-sm text-mist">Users, content, runtimes and platform telemetry — scoped to the local database.</p>
        </div>
        <Badge tone="viol" className="ml-auto">RBAC: admin only</Badge>
      </div>

      <div className="mt-7 overflow-x-auto">
        <Tabs active={tab} onChange={setTab} tabs={[
          { id: "analytics", label: <span className="flex items-center gap-1.5"><BarChart3 size={13} />Analytics</span> },
          { id: "users", label: <span className="flex items-center gap-1.5"><Users size={13} />Users</span> },
          { id: "content", label: <span className="flex items-center gap-1.5"><BookOpen size={13} />Content</span> },
          { id: "languages", label: <span className="flex items-center gap-1.5"><Globe size={13} />Languages</span> },
          { id: "reports", label: <span className="flex items-center gap-1.5"><Flag size={13} />Reports{openReports.length > 0 ? ` (${openReports.length})` : ""}</span> },
        ]} />
      </div>

      {/* ============ ANALYTICS ============ */}
      {tab === "analytics" && (
        <div className="mt-7 space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Stat icon={<Users size={15} />} label="Users" value={db.users.length} sub={`${db.users.filter((u) => u.suspended).length} suspended`} />
            <Stat icon={<Activity size={15} />} label="Executions" value={execs.length} />
            <Stat icon={<CheckCircle2 size={15} />} label="Success rate" value={`${successRate}%`} />
            <Stat icon={<Swords size={15} />} label="Submissions" value={db.submissions.length} sub={`${db.submissions.filter((s) => s.verdict === "accepted").length} accepted`} />
            <Stat icon={<BookOpen size={15} />} label="Posts" value={db.posts.length} sub={`${db.comments.length} comments`} />
            <Stat icon={<Database size={15} />} label="Simulated runs" value={execs.filter((e) => e.simulated).length} sub="dev adapter" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel className="p-6">
              <h3 className="font-display text-base font-bold">Executions by language</h3>
              <div className="mt-4 space-y-3">
                {byLang.map(([slug, n]) => {
                  const lang = LANGUAGES.find((l) => l.slug === slug);
                  return (
                    <div key={slug} className="flex items-center gap-3">
                      <LangChip slug={slug} name={lang?.short || slug.slice(0, 2)} color={lang?.color || "#888"} size="sm" />
                      <Bar value={(n / maxLang) * 100} className="flex-1" tone={slug === "javascript" || slug === "typescript" ? "jade" : "ember"} />
                      <span className="w-10 text-right font-mono text-[11px] text-dim">{n}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 font-mono text-[10px] text-dim">jade = real sandbox · ember = simulated adapter</p>
            </Panel>

            <Panel className="p-6">
              <h3 className="font-display text-base font-bold">Execution outcomes</h3>
              <div className="mt-4 space-y-2">
                {byStatus.map(([st, n]) => (
                  <div key={st} className="flex items-center justify-between rounded-lg border border-line bg-ink2/50 px-3.5 py-2">
                    <span className={`font-mono text-[12px] font-bold ${st === "success" ? "text-jade" : st === "timeout" ? "text-ember" : "text-rose"}`}>● {st}</span>
                    <span className="font-mono text-[12px] text-mist">{n} <span className="text-dim">({execs.length ? Math.round((n / execs.length) * 100) : 0}%)</span></span>
                  </div>
                ))}
              </div>
              <h3 className="mt-6 font-display text-base font-bold">Recent failures</h3>
              <div className="mt-3 space-y-1.5">
                {errors.length === 0 && <p className="text-sm text-dim">No failures recorded. Suspiciously clean.</p>}
                {errors.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 font-mono text-[11px]">
                    <XCircle size={12} className="shrink-0 text-rose" />
                    <span className="text-mist">{e.language}</span>
                    <span className={e.status === "timeout" ? "text-ember" : "text-rose"}>{e.status}</span>
                    <span className="text-dim">{e.ms}ms · {timeAgo(e.at)}{e.simulated ? " · sim" : ""}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel className="p-6">
            <h3 className="font-display text-base font-bold">Course completions (lesson-level)</h3>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {coursePopularity.map(({ c, completions }) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-44 truncate text-[13px] font-semibold text-mist">{c.title}</span>
                  <Bar value={(completions / maxCourse) * 100} tone="sky" className="flex-1" />
                  <span className="w-8 text-right font-mono text-[11px] text-dim">{completions}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ============ USERS ============ */}
      {tab === "users" && (
        <Panel className="mt-7 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[10px] uppercase tracking-wider text-dim">
                <th className="px-5 py-3.5">User</th><th className="px-3 py-3.5">Email</th><th className="px-3 py-3.5">XP / Level</th>
                <th className="px-3 py-3.5">Role</th><th className="px-3 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {db.users.map((u) => {
                const st = getUserStats(db, u.id);
                const self = u.id === user.id;
                return (
                  <tr key={u.id} className="border-b border-line/60 transition-colors hover:bg-white/2">
                    <td className="px-5 py-3"><Link to={`/profile/${u.username}`} className="font-bold text-fog hover:text-jade">@{u.username}</Link><div className="font-mono text-[10px] text-dim">{u.provider} · {timeAgo(u.createdAt)}</div></td>
                    <td className="px-3 py-3 font-mono text-[12px] text-mist">{u.email}</td>
                    <td className="px-3 py-3 font-mono text-[12px]"><span className="text-ember">{st.xp} XP</span> <span className="text-dim">· Lv{levelFromXp(st.xp).level}</span></td>
                    <td className="px-3 py-3">
                      <select value={u.role} disabled={self} onChange={(e) => { adminSetRole(u.id, e.target.value as "user" | "admin"); toast.push({ tone: "success", title: `@${u.username} is now ${e.target.value}` }); }}
                        className="cursor-pointer rounded-md border border-line bg-ink2 px-2 py-1 font-mono text-[11px] text-fog outline-none disabled:opacity-40">
                        <option value="user">user</option><option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-3 py-3">{u.suspended ? <Badge tone="rose">suspended</Badge> : <Badge tone="jade">active</Badge>}</td>
                    <td className="px-5 py-3 text-right">
                      {!self && (
                        <Button size="sm" variant={u.suspended ? "subtle" : "danger"} onClick={() => { adminSetSuspended(u.id, !u.suspended); toast.push({ tone: "info", title: `@${u.username} ${u.suspended ? "reinstated" : "suspended"}` }); }}>
                          {u.suspended ? "Reinstate" : "Suspend"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}

      {/* ============ CONTENT ============ */}
      {tab === "content" && (
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          <Panel className="p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-bold"><BookOpen size={16} className="text-jade" />Courses</h3>
            <div className="mt-4 space-y-2">
              {COURSES.map((c) => {
                const pub = isCoursePublished(db, c.id);
                const n = LESSONS.filter((l) => l.courseId === c.id).length;
                return (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-ink2/50 px-4 py-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-fog">{c.title}</div>
                      <div className="font-mono text-[10px] text-dim">{n} lessons · {c.level}</div>
                    </div>
                    <button onClick={() => { adminToggleCourse(c.id, !pub); toast.push({ tone: "info", title: `${c.title} ${pub ? "unpublished" : "published"}` }); }}
                      className={`relative h-6 w-11 rounded-full transition-colors ${pub ? "bg-jade/70" : "bg-ink3 border border-line2"}`} aria-label="Toggle publish">
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-fog transition-all ${pub ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-6">
            <h3 className="flex items-center gap-2 font-display text-base font-bold"><Swords size={16} className="text-sky" />Challenges</h3>
            <div className="mt-4 max-h-[480px] space-y-2 overflow-y-auto pr-1">
              {CHALLENGES.map((c) => {
                const pub = isChallengePublished(db, c.id);
                return (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-ink2/50 px-4 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-bold text-fog">{c.title}</div>
                      <div className="font-mono text-[10px] text-dim">{c.language} · {c.difficulty} · {c.tests.length} tests</div>
                    </div>
                    <button onClick={() => { adminToggleChallenge(c.id, !pub); toast.push({ tone: "info", title: `${c.title} ${pub ? "unpublished" : "published"}` }); }}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${pub ? "bg-jade/70" : "bg-ink3 border border-line2"}`} aria-label="Toggle publish">
                      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-fog transition-all ${pub ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-dim">Challenge & lesson authoring forms write through the same service contracts in production; toggles here are fully live against the client database.</p>
          </Panel>
        </div>
      )}

      {/* ============ LANGUAGES ============ */}
      {tab === "languages" && (
        <Panel className="mt-7 p-6">
          <h3 className="flex items-center gap-2 font-display text-base font-bold"><Globe size={16} className="text-jade" />Runtimes</h3>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {LANGUAGES.map((l) => {
              const enabled = db.admin.languages[l.slug] ?? l.enabled;
              return (
                <div key={l.slug} className="flex items-center gap-3 rounded-xl border border-line bg-ink2/50 px-4 py-3">
                  <LangChip slug={l.slug} name={l.short} color={l.color} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold text-fog">{l.name} <span className="font-mono text-[10px] text-dim">{l.version}</span></div>
                    <div className="font-mono text-[10px] text-dim">{l.slug === "javascript" || l.slug === "typescript" ? "BrowserSandboxAdapter · real" : "MockExecutionAdapter · simulated"}</div>
                  </div>
                  <button onClick={() => { adminToggleLanguage(l.slug, !enabled); toast.push({ tone: "info", title: `${l.name} ${enabled ? "disabled" : "enabled"}` }); }}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? "bg-jade/70" : "bg-ink3 border border-line2"}`} aria-label="Toggle language">
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-fog transition-all ${enabled ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* ============ REPORTS ============ */}
      {tab === "reports" && (
        <div className="mt-7 space-y-3">
          {db.reports.length === 0 && <EmptyState icon={<Flag size={26} />} title="No reports" desc="The commons is behaving itself." />}
          {db.reports.map((r) => {
            const post = db.posts.find((p) => p.id === r.postId);
            const by = db.users.find((u) => u.id === r.byId);
            return (
              <Panel key={r.id} className={`p-5 ${r.resolved ? "opacity-55" : ""}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <Flag size={16} className={r.resolved ? "text-dim" : "text-rose"} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-fog">{post ? post.title : "(deleted post)"}</div>
                    <div className="mt-0.5 text-[13px] text-mist">"{r.reason}" — reported by @{by?.username || "?"} · {timeAgo(r.at)}</div>
                  </div>
                  {post && <Link to={`/community/${post.id}`}><Button size="sm" variant="subtle">View post</Button></Link>}
                  {!r.resolved && <Button size="sm" onClick={() => { adminResolveReport(r.id); toast.push({ tone: "success", title: "Report resolved" }); }}>Resolve</Button>}
                  {r.resolved && <Badge tone="jade">resolved</Badge>}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
