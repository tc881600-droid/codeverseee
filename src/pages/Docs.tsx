import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FileText, Play, ChevronLeft, ChevronRight, Clock, BookOpen, Download } from "lucide-react";
import { DOCS, LANGUAGES } from "../lib/seed";
import type { LessonSection } from "../lib/types";
import { useDB } from "../lib/db";
import { isLangEnabled } from "../lib/services";
import { openInPlayground, Badge, Button, EmptyState, LangChip, Panel } from "../components/ui";
import { DocumentViewer } from "../components/DocumentViewer";
import { LANGUAGE_DOCS } from "../lib/languageDocs";

export default function Docs() {
  const { lang, topic } = useParams();
  const db = useDB();
  const nav = useNavigate();

  // Check if viewing full course documentation
  const isFullCourse = topic === 'full';
  const hasFullDoc = lang && LANGUAGE_DOCS[lang];

  const langs = LANGUAGES.filter((l) => isLangEnabled(db, l.slug) && (DOCS[l.slug]?.length || LANGUAGE_DOCS[l.slug]));
  const activeLang = langs.find((l) => l.slug === lang) || (lang ? undefined : langs[0]);
  const topics = activeLang ? DOCS[activeLang.slug] || [] : [];
  const activeTopic = topic && topic !== 'full' ? topics.find((t) => t.slug === topic) : undefined;
  const tIdx = activeTopic ? topics.findIndex((t) => t.slug === topic) : -1;

  if (lang && !activeLang) {
    return <div className="mx-auto max-w-2xl px-4 py-24"><EmptyState icon={<FileText size={30} />} title="No docs for this language" desc="Reference material ships progressively — check the Playground meanwhile." action={<Link to="/docs"><Button variant="outline">All docs</Button></Link>} /></div>;
  }

  // Show full course documentation
  if (isFullCourse && hasFullDoc) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <Link to={`/docs/${lang}`} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6">
            <ChevronLeft className="w-5 h-5" />
            Back to Reference
          </Link>
          <DocumentViewer language={lang!} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-jade">~/docs</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Reference</h1>
          <p className="mt-2 text-[15px] text-mist">Syntax, concepts and patterns — every example opens straight into the Playground.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* sidebar */}
        <div className="rounded-2xl border border-line bg-ink/70 p-3 lg:sticky lg:top-20 lg:self-start">
          <div className="px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-dim">languages</div>
          <div className="mt-1 space-y-0.5">
            {langs.map((l) => (
              <Link key={l.slug} to={`/docs/${l.slug}`}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold transition-colors ${activeLang?.slug === l.slug ? "bg-jade/10 text-jade" : "text-mist hover:bg-white/4 hover:text-fog"}`}>
                <LangChip slug={l.slug} name={l.short} color={l.color} size="sm" />
                {l.name}
                <span className="ml-auto font-mono text-[10px] text-dim">{(DOCS[l.slug] || []).length}</span>
              </Link>
            ))}
          </div>

          {activeLang && (
            <>
              {/* Full Course Button */}
              {LANGUAGE_DOCS[activeLang.slug] && (
                <div className="mt-4 border-t border-line px-2 pb-1.5 pt-3.5">
                  <Link
                    to={`/docs/${activeLang.slug}/full`}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2.5 text-[13px] font-bold text-white transition-all hover:from-indigo-700 hover:to-purple-700 shadow-md"
                  >
                    <BookOpen size={16} />
                    <span>Full Course</span>
                    <Download size={14} className="ml-auto" />
                  </Link>
                </div>
              )}

              <div className="mt-4 border-t border-line px-2 pb-1.5 pt-3.5 font-mono text-[10px] font-bold uppercase tracking-wider text-dim">{activeLang.name} topics</div>
              <div className="space-y-0.5">
                {topics.map((t, i) => (
                  <Link key={t.slug} to={`/docs/${activeLang.slug}/${t.slug}`}
                    className={`block rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${activeTopic?.slug === t.slug ? "bg-jade/10 text-jade" : "text-mist hover:bg-white/4 hover:text-fog"}`}>
                    <span className="mr-2 font-mono text-[10px] text-dim">{String(i + 1).padStart(2, "0")}</span>{t.title}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* content */}
        <div className="min-w-0">
          {!activeTopic && activeLang && (
            <div className="space-y-3">
              {topics.map((t, i) => (
                <Link key={t.slug} to={`/docs/${activeLang.slug}/${t.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-line bg-ink/70 px-5 py-4 transition-all hover:border-jade/35 hover:bg-ink2">
                  <span className="font-mono text-[12px] font-bold text-jade">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-bold text-fog group-hover:text-jade">{t.title}</div>
                    <div className="mt-0.5 truncate text-[13px] text-mist">{t.intro}</div>
                  </div>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-dim"><Clock size={11} />{t.minutes}m</span>
                  <ChevronRight size={15} className="text-dim group-hover:text-jade" />
                </Link>
              ))}
            </div>
          )}

          {activeTopic && activeLang && (
            <Panel className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <LangChip slug={activeLang.slug} name={activeLang.short} color={activeLang.color} size="sm" />
                <Badge tone="dim">{activeLang.name} {activeLang.version}</Badge>
                <span className="flex items-center gap-1 font-mono text-[11px] text-dim"><Clock size={11} />{activeTopic.minutes} min read</span>
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">{activeTopic.title}</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-mist">{activeTopic.intro}</p>

              {activeTopic.sections.map((s, i) => <DocSection key={i} s={s} lang={activeLang.slug} />)}

              <div className="mt-8 rounded-2xl border border-jade/25 bg-jade/[0.04] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-display text-sm font-bold text-jade"><Play size={14} />Runnable example — {activeTopic.example.name}</div>
                  <Button size="sm" onClick={() => { openInPlayground(activeTopic.example.code, activeLang.slug, activeTopic.example.name); nav("/playground"); }} icon={<Play size={12} />}>
                    Open in Playground
                  </Button>
                </div>
                <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-[#0a0c10] p-4 font-mono text-[12.5px] leading-relaxed text-[#c8d3df]">{activeTopic.example.code}</pre>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-2.5 border-t border-line pt-5">
                <button disabled={tIdx <= 0} onClick={() => nav(`/docs/${activeLang.slug}/${topics[tIdx - 1].slug}`)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-[13px] font-semibold text-mist transition-colors hover:border-line2 hover:text-fog disabled:opacity-35">
                  <ChevronLeft size={13} />{tIdx > 0 ? topics[tIdx - 1].title : "Start"}
                </button>
                <button disabled={tIdx >= topics.length - 1} onClick={() => nav(`/docs/${activeLang.slug}/${topics[tIdx + 1].slug}`)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-line py-2.5 text-[13px] font-semibold text-mist transition-colors hover:border-line2 hover:text-fog disabled:opacity-35">
                  {tIdx < topics.length - 1 ? topics[tIdx + 1].title : "End"}<ChevronRight size={13} />
                </button>
              </div>
            </Panel>
          )}

          {!activeLang && (
            <EmptyState icon={<BookOpen size={28} />} title="Pick a language" desc="Reference docs live in the sidebar." />
          )}
        </div>
      </div>
    </div>
  );
}

function DocSection({ s, lang }: { s: LessonSection; lang: string }) {
  const nav = useNavigate();
  return (
    <div>
      {s.h && <h2 className="mt-7 font-display text-xl font-bold text-fog">{s.h}</h2>}
      {s.p && <p className="mt-2.5 text-[14.5px] leading-relaxed text-mist">{s.p}</p>}
      {s.list && (
        <ul className="mt-3 space-y-2">
          {s.list.map((it, i) => <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-mist"><ChevronRight size={15} className="mt-0.5 shrink-0 text-jade/70" />{it}</li>)}
        </ul>
      )}
      {s.code && (
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-[#0a0c10]">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-1.5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-dim">{s.lang || lang}</span>
            <button onClick={() => { openInPlayground(s.code!, s.lang || lang); nav("/playground"); }}
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
