import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Play, Save, RotateCcw, FilePlus2, Trash2, FolderOpen, Terminal,
  AlertTriangle, ChevronDown, Check, Folder, MessageCircle, Volume2, VolumeX,
} from "lucide-react";
import { LANGUAGES } from "../lib/seed";
import type { ExecutionResult } from "../lib/types";
import { useDB } from "../lib/db";
import { currentUser, isLangEnabled, saveSnippet, deleteSnippet, PLAYGROUND_TEMPLATES } from "../lib/services";
import { execute, engineLabel, resolveEngine, type StageEvent } from "../lib/exec";
import { Badge, Button, Input, Kbd, Modal, Textarea, useToast, LangChip, EmptyState } from "../components/ui";
import { CodeEditor } from "../components/CodeEditor";
import { ExplainerBar } from "../components/Explainer";
import { playRunSound, playSuccessSound, playErrorSound, areSoundsEnabled, toggleSounds } from "../lib/sounds";

interface DraftFile { name: string; content: string }

export default function Playground() {
  const db = useDB();
  const user = currentUser(db);
  const toast = useToast();
  const loc = useLocation();

  const [language, setLanguage] = useState("javascript");
  const [files, setFiles] = useState<DraftFile[]>(PLAYGROUND_TEMPLATES.javascript);
  const [active, setActive] = useState(0);
  const [stdin, setStdin] = useState("");
  const [name, setName] = useState("untitled");
  const [snippetId, setSnippetId] = useState<string | undefined>();
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<StageEvent["stage"] | null>(null);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loadOpen, setLoadOpen] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [explainOn, setExplainOn] = useState(() => localStorage.getItem("cv.explain") !== "0");
  const [caret, setCaret] = useState({ line: 1, text: "" });
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const loaded = useRef(false);

  // Check if current language is HTML/CSS (needs preview instead of execution)
  const isPreviewMode = language === "html" || language === "css";

  // Auto-generate preview for HTML/CSS when language changes or content updates
  useEffect(() => {
    if (isPreviewMode && files[active]?.content) {
      const timeoutId = setTimeout(() => {
        let htmlContent = "";

        if (language === "html") {
          htmlContent = files[active]?.content || "";
        } else if (language === "css") {
          const cssContent = files[active]?.content || "";
          htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>${cssContent}</style>
</head>
<body>
  <div class="container">
    <h1>CSS Preview</h1>
    <div class="box">
      <h2>Styled Box</h2>
      <p>This is a preview of your CSS styles.</p>
      <a href="#" class="btn">Sample Button</a>
    </div>
  </div>
</body>
</html>`;
        }

        setPreviewHtml(htmlContent);
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [language, files, active, isPreviewMode]);

  const engine = resolveEngine(language);
  const toggleExplain = () => setExplainOn((v) => { localStorage.setItem("cv.explain", v ? "0" : "1"); return !v; });

  const langs = LANGUAGES.filter((l) => isLangEnabled(db, l.slug));
  const lang = langs.find((l) => l.slug === language) || langs[0];
  const mySnippets = user ? db.snippets.filter((s) => s.userId === user.id) : [];

  // Initial load
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const navState = (loc.state as { language?: string } | null)?.language;
    const rawDraft = sessionStorage.getItem("cv.pg.draft");
    const rawWork = localStorage.getItem("cv.pg.work");

    if (rawDraft) {
      try {
        const d = JSON.parse(rawDraft);
        if (d.language && d.files?.length) {
          const tpl = PLAYGROUND_TEMPLATES[d.language] || PLAYGROUND_TEMPLATES.javascript;
          setLanguage(d.language);
          setFiles(d.files[0].content ? d.files : tpl);
          setName(d.name || "example");
          sessionStorage.removeItem("cv.pg.draft");
          return;
        }
      } catch { /* fall through */ }
    }

    if (navState && PLAYGROUND_TEMPLATES[navState]) {
      setLanguage(navState);
      setFiles(PLAYGROUND_TEMPLATES[navState]);
      setName(`untitled.${navState}`);
      return;
    }

    if (rawWork) {
      try {
        const w = JSON.parse(rawWork);
        if (w.language && w.files?.length) {
          setLanguage(w.language);
          setFiles(w.files);
          setStdin(w.stdin || "");
          setName(w.name || "untitled");
          setSnippetId(w.snippetId);
          return;
        }
      } catch { /* fall through */ }
    }
  }, [loc.state]);

  // Persist working state
  useEffect(() => {
    if (!loaded.current) return;
    localStorage.setItem("cv.pg.work", JSON.stringify({ language, files, stdin, name, snippetId }));
  }, [language, files, stdin, name, snippetId]);

  const switchLang = (slug: string) => {
    setLanguage(slug);
    const tpl = PLAYGROUND_TEMPLATES[slug] || [{ name: `main.txt`, content: "" }];
    setFiles(tpl);
    setActive(0);
    setResult(null);
    setName(`untitled.${slug}`);
    setSnippetId(undefined);
    setCaret({ line: 1, text: tpl[0]?.content.split("\n")[0] || "" });
  };

  const updateFile = (content: string) => {
    setFiles((f) => f.map((x, i) => (i === active ? { ...x, content } : x)));
  };

  const addFile = () => {
    const ext = lang.extension;
    let n = 2;
    while (files.some((f) => f.name === `module${n}.${ext}`)) n++;
    setFiles((f) => [...f, { name: `module${n}.${ext}`, content: `# ${lang.name} module\n` }]);
    setActive(files.length);
  };

  const removeFile = (i: number) => {
    if (files.length <= 1) { toast.push({ tone: "error", title: "Cannot delete the last file" }); return; }
    setFiles((f) => f.filter((_, j) => j !== i));
    setActive((a) => Math.max(0, a > i ? a - 1 : Math.min(a, files.length - 2)));
  };

  const run = async () => {
    if (running) return;

    // Play tension-building run sound
    playRunSound();

    setRunning(true);
    setResult(null);

    // For HTML/CSS, generate preview instead of executing
    if (isPreviewMode) {
      let htmlContent = "";

      if (language === "html") {
        // Use the HTML file content directly
        htmlContent = files[active]?.content || "";
      } else if (language === "css") {
        // For CSS, create a preview HTML that includes the CSS
        const cssContent = files[active]?.content || "";
        htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>${cssContent}</style>
</head>
<body>
  <div class="container">
    <h1>CSS Preview</h1>
    <div class="box">
      <h2>Styled Box</h2>
      <p>This is a preview of your CSS styles.</p>
      <a href="#" class="btn">Sample Button</a>
    </div>
  </div>
</body>
</html>`;
      }

      setPreviewHtml(htmlContent);
      setRunning(false);
      return;
    }

    // For other languages, execute normally
    const res = await execute(
      { language, files, stdin, userId: user?.id, source: "playground" },
      (e) => setStage(e.stage),
    );
    setResult(res);
    setRunning(false);
    setStage(null);

    // Play success or error sound based on result
    if (res.status === "success") {
      playSuccessSound();
    } else {
      playErrorSound();
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); run(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const doSave = (asNew: boolean) => {
    if (!user) { setSaveModal(false); toast.push({ tone: "error", title: "Sign in to save" }); return; }
    const finalName = saveName.trim() || name || "untitled";
    saveSnippet(user.id, { id: asNew ? undefined : snippetId, name: finalName, language, files, stdin });
    setName(finalName);
    setSaveModal(false);
    toast.push({ tone: "success", title: "Snippet saved" });
  };

  const loadSnippet = (id: string) => {
    const s = mySnippets.find((x) => x.id === id);
    if (!s) return;
    setLanguage(s.language);
    setFiles(s.files);
    setStdin(s.stdin);
    setName(s.name);
    setSnippetId(s.id);
    setResult(null);
    setLoadOpen(false);
    setActive(0);
  };

  const stageLabel = stage === "queued" ? "Preparing" : stage === "compile" ? "Compiling" : stage === "running" ? "Running" : stage === "collecting" ? "Collecting" : null;

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-4 sm:px-4 sm:py-6">
      {/* Mobile Toolbar - Compact */}
      <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-2.5">
        {/* File name input */}
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-ink px-2.5 py-1.5 sm:flex-none sm:w-auto sm:px-3">
          <Folder size={14} className="hidden shrink-0 text-dim sm:block" />
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent font-mono text-[12px] font-semibold text-fog outline-none sm:w-32 sm:text-[13px]" />
        </div>

        {/* Language selector */}
        <select value={language} onChange={(e) => switchLang(e.target.value)}
          className="flex-1 cursor-pointer rounded-xl border border-line bg-ink px-2.5 py-1.5 font-mono text-[12px] font-semibold text-fog outline-none focus:border-jade/50 sm:flex-none sm:px-3 sm:py-2 sm:text-[13px]">
          {langs.map((l) => <option key={l.slug} value={l.slug}>{l.name} {l.version}</option>)}
        </select>

        {/* Engine badge - hidden on very small screens */}
        <div className="hidden sm:block">
          <Badge tone={isPreviewMode ? "sky" : "jade"} title={isPreviewMode ? "Live browser preview" : "Cloud execution"}>
            <span className={`pulse-dot h-1.5 w-1.5 rounded-full ${isPreviewMode ? "bg-sky" : "bg-jade"}`} />
            {isPreviewMode ? "PREVIEW" : "CLOUD"}
          </Badge>
        </div>
      </div>

      {/* Secondary toolbar - Controls */}
      <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4 sm:gap-2.5">
        {/* Toggle buttons - compact on mobile */}
        <button onClick={toggleExplain}
          className={`flex h-9 items-center gap-1.5 rounded-xl border px-2.5 font-mono text-[10px] font-bold transition-all sm:text-[11px] ${
            explainOn ? "border-jade/45 bg-jade/10 text-jade" : "border-line bg-ink text-dim hover:text-mist"}`}>
          <MessageCircle size={13} /> <span className="hidden sm:inline">explain</span>
        </button>

        <button onClick={() => {
          const newState = toggleSounds();
          toast.push({
            tone: newState ? "success" : "info",
            title: newState ? "Sounds enabled" : "Sounds muted",
            desc: newState ? "Typing and run sounds are now active" : "All sounds have been muted"
          });
        }}
          className={`flex h-9 items-center gap-1.5 rounded-xl border px-2.5 font-mono text-[10px] font-bold transition-all sm:text-[11px] ${
            areSoundsEnabled() ? "border-sky/45 bg-sky/10 text-sky" : "border-line bg-ink text-dim hover:text-mist"}`}
          title={areSoundsEnabled() ? "Sounds enabled - click to mute" : "Sounds disabled - click to enable"}>
          {areSoundsEnabled() ? <Volume2 size={13} /> : <VolumeX size={13} />}
          <span className="hidden sm:inline">{areSoundsEnabled() ? "sounds" : "muted"}</span>
        </button>

        {/* Action buttons - right aligned */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button size="sm" onClick={run} loading={running} icon={<Play size={13} />} className="px-3 sm:px-4">
            <span className="hidden sm:inline">Run <Kbd>⌘↵</Kbd></span>
            <span className="sm:hidden">Run</span>
          </Button>
          <Button size="sm" variant="subtle" onClick={() => { setSaveName(name); setSaveModal(true); }} icon={<Save size={13} />} className="hidden sm:flex">Save</Button>
          <div className="relative">
            <Button size="sm" variant="subtle" onClick={() => setLoadOpen((v) => !v)} icon={<FolderOpen size={13} />} className="hidden sm:flex">
              Load <ChevronDown size={11} />
            </Button>
            {loadOpen && (
              <div className="pop-in absolute right-0 top-10 z-30 w-64 rounded-xl border border-line2 bg-ink p-1.5 shadow-2xl">
                {mySnippets.length === 0 && <div className="px-3 py-6 text-center text-xs text-dim">{user ? "No saved snippets" : "Sign in to save"}</div>}
                {mySnippets.map((s) => (
                  <div key={s.id} className="group flex items-center gap-2 rounded-lg px-2.5 py-2 hover:bg-white/4">
                    <button onClick={() => loadSnippet(s.id)} className="min-w-0 flex-1 text-left">
                      <div className="truncate text-[13px] font-semibold text-fog">{s.name}</div>
                      <div className="font-mono text-[10px] text-dim">{s.language}</div>
                    </button>
                    <button onClick={() => { if (user) deleteSnippet(user.id, s.id); }}
                      className="rounded p-1 text-dim opacity-0 hover:text-rose group-hover:opacity-100"><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={() => { setFiles(PLAYGROUND_TEMPLATES[language]); setResult(null); setActive(0); }} icon={<RotateCcw size={13} />} className="hidden sm:flex">
            Reset
          </Button>
        </div>
      </div>

      {/* Pipeline status */}
      {(running || result) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px]">
          {["queued", "compile", "running", "collecting", "complete"].map((s, i) => {
            const order = ["queued", "compile", "running", "collecting", "complete"];
            const curIdx = running ? Math.max(0, stage ? order.indexOf(stage) : 0) : order.length - 1;
            const done = i <= curIdx;
            return (
              <React.Fragment key={s}>
                {i > 0 && <span className={`h-px w-5 ${done ? "bg-jade/60" : "bg-line2"}`} />}
                <span className={`flex items-center gap-1.5 rounded-md border px-2 py-0.5 ${done ? "border-jade/40 text-jade" : "border-line text-dim"}`}>
                  {done && s === "complete" && result?.status === "success" ? <Check size={10} /> : done ? <span className={`h-1.5 w-1.5 rounded-full ${i === curIdx && running ? "pulse-dot" : ""} bg-current`} /> : null}
                  {s}
                </span>
              </React.Fragment>
            );
          })}
          {running && stageLabel && <span className="ml-1 text-sky">{stageLabel}…</span>}
          {result && !running && (
            <span className={`ml-1 ${result.status === "success" ? "text-jade" : "text-rose"}`}>● {result.status} · {result.ms}ms</span>
          )}
        </div>
      )}

      {/* Workspace */}
      <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-[180px_1fr]">
        {/* File tree - hidden on mobile, shown on lg screens */}
        <div className="hidden rounded-2xl border border-line bg-ink p-2.5 lg:block lg:min-h-[460px]">
          <div className="flex items-center justify-between px-1.5 py-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-dim">files</span>
            <button onClick={addFile} className="rounded-md p-1 text-mist hover:bg-white/5 hover:text-jade"><FilePlus2 size={13} /></button>
          </div>
          <div className="mt-1 space-y-0.5">
            {files.map((f, i) => (
              <div key={i} className={`group flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-mono text-[12px] ${i === active ? "bg-jade/10 text-jade" : "text-mist hover:bg-white/4"}`}>
                <button onClick={() => setActive(i)} className="min-w-0 flex-1 truncate text-left">{f.name}</button>
                <button onClick={() => removeFile(i)} className="rounded p-0.5 text-dim opacity-0 hover:text-rose group-hover:opacity-100"><Trash2 size={11} /></button>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-line px-1.5 pt-3">
            <div className="flex items-center gap-2 px-1">
              <LangChip slug={lang.slug} name={lang.short} color={lang.color} size="sm" />
              <div className="min-w-0">
                <div className="truncate font-mono text-[11px] font-bold text-fog">{lang.name}</div>
                <div className="font-mono text-[9px] text-dim">{lang.version}</div>
              </div>
            </div>
            <p className="mt-2.5 px-1 font-mono text-[9.5px] leading-relaxed text-dim">{isPreviewMode ? "Live browser preview" : engineLabel(language)}</p>
          </div>
        </div>

        {/* Editor + Terminal */}
        <div className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-ink">
          {/* Mobile file selector */}
          <div className="border-b border-line bg-ink2/60 p-2 lg:hidden">
            <select
              value={active}
              onChange={(e) => setActive(Number(e.target.value))}
              className="w-full cursor-pointer rounded-lg border border-line bg-ink px-3 py-2 font-mono text-[12px] font-semibold text-fog outline-none focus:border-jade/50"
            >
              {files.map((f, i) => (
                <option key={i} value={i}>{f.name}</option>
              ))}
            </select>
          </div>

          {/* File tabs - desktop only */}
          <div className="hidden items-center gap-1 overflow-x-auto border-b border-line bg-ink2/60 px-2 pt-2 no-scrollbar lg:flex">
            {files.map((f, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`flex shrink-0 items-center gap-2 rounded-t-lg border border-b-0 px-3.5 py-2 font-mono text-[12px] font-semibold ${
                  i === active ? "border-line bg-[#0a0c10] text-fog" : "border-transparent text-dim hover:text-mist"}`}>
                {f.name}
              </button>
            ))}
          </div>

          {/* Code editor with inline explainer */}
          <div className="min-h-[250px] flex-1 sm:min-h-[300px]">
            <CodeEditor
              value={files[active]?.content || ""}
              onChange={updateFile}
              language={language}
              minHeight={250}
              onCaretLine={(line, text) => setCaret({ line, text })}
              inlineExplainer={explainOn}
            />
          </div>

          {/* Bottom explainer bar (optional, can be toggled off) */}
          {explainOn && <ExplainerBar lang={language} line={caret.line} text={caret.text} />}

          {/* Terminal/Preview */}
          <div className="border-t border-line">
            {isPreviewMode ? (
              // HTML/CSS Preview Mode
              <>
                <div className="flex items-center justify-between border-b border-line bg-ink2/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-jade" />
                    <span className="font-mono text-[11px] font-semibold text-fog">Preview</span>
                    {running && (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] text-sky">
                        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-sky" />
                        Rendering
                      </span>
                    )}
                  </div>
                  <Badge tone="jade">LIVE PREVIEW</Badge>
                </div>
                <div className="min-h-[250px] bg-white sm:min-h-[300px]">
                  {previewHtml ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="h-[300px] w-full border-0 sm:h-[400px]"
                      title="HTML/CSS Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="flex h-[300px] items-center justify-center text-dim sm:h-[400px]">
                      <div className="text-center">
                        <div className="mb-2 text-3xl sm:text-4xl">🎨</div>
                        <div className="text-sm sm:text-base">Start typing to see live preview</div>
                        <div className="mt-2 text-xs text-dim">Preview updates automatically as you type</div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Normal Terminal Mode
              <>
                <div className="flex items-center justify-between border-b border-line bg-ink2/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Terminal size={12} className="text-jade" />
                    <span className="font-mono text-[11px] font-semibold text-fog">Terminal</span>
                    {running && stageLabel && (
                      <span className="flex items-center gap-1.5 font-mono text-[10px] text-sky">
                        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-sky" />
                        {stageLabel}
                      </span>
                    )}
                    {result && !running && (
                      <span className={`font-mono text-[10px] ${result.status === "success" ? "text-jade" : "text-rose"}`}>
                        ● {result.status} · {result.ms}ms
                      </span>
                    )}
                  </div>
                  {result?.simulated && <Badge tone="ember">OFFLINE</Badge>}
                </div>

                {/* Output */}
                <div className="min-h-[120px] max-h-[250px] overflow-y-auto bg-[#080a0d] p-3 font-mono text-[11px] leading-relaxed sm:min-h-[150px] sm:max-h-[300px] sm:p-4 sm:text-[12.5px]">
                  {!running && !result && (
                    <div className="text-dim">
                      <div>$ Press Run or ⌘↵ to execute</div>
                    </div>
                  )}

                  {running && stageLabel && (
                    <div className="flex items-center gap-2.5 text-sky">
                      <span className="pulse-dot h-2 w-2 rounded-full bg-sky" />
                      {stageLabel}…
                    </div>
                  )}

                  {result && (
                    <>
                      {result.stdout && <pre className="term-line whitespace-pre-wrap text-fog">{result.stdout}</pre>}
                      {!result.stdout && <span className="text-dim">(no output)</span>}

                      {result.stderr && (
                        <pre className={`term-line mt-2 whitespace-pre-wrap ${result.simulated ? "text-ember/80" : "text-rose"}`}>
                          {result.stderr}
                        </pre>
                      )}

                      <div className="mt-3 border-t border-line/60 pt-2 text-[11px] text-dim">
                        <span className={result.status === "success" ? "text-jade" : "text-rose"}>● exit {result.exitCode}</span>
                        {" · "}{result.ms}ms
                        {result.memoryKB && ` · ${(result.memoryKB / 1024).toFixed(1)}MB`}
                      </div>
                    </>
                  )}
                </div>

            {/* Input */}
            <div className="border-t border-line bg-ink2/40 px-2.5 py-2 sm:px-3">
              <div className="flex items-center gap-2">
                <span className="text-jade font-mono text-xs sm:text-sm">$</span>
                <input
                  type="text"
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      run();
                    }
                  }}
                  placeholder="Type input and press Enter..."
                  className="flex-1 bg-transparent text-fog font-mono text-xs outline-none placeholder:text-dim sm:text-sm"
                />
              </div>
              <div className="mt-1 hidden text-[10px] text-dim sm:block">
                Press <Kbd>Enter</Kbd> to run · Use <code className="text-sky/70">input()</code>, <code className="text-sky/70">scanf()</code>, <code className="text-sky/70">cin</code> to read
              </div>
            </div>              </>
            )}
          </div>
        </div>
      </div>

      {/* Save modal */}
      <Modal open={saveModal} onClose={() => setSaveModal(false)} title={snippetId ? "Update snippet" : "Save snippet"}>
        {!user ? (
          <EmptyState icon={<Save size={26} />} title="Sign in to save" desc="Snippets persist per account." />
        ) : (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist">Name</span>
              <Input value={saveName} onChange={(e) => setSaveName(e.target.value)} autoFocus placeholder="my-solution" />
            </label>
            <div className="flex items-center gap-2 font-mono text-[11px] text-dim">
              <LangChip slug={lang.slug} name={lang.short} color={lang.color} size="sm" />
              {files.length} file{files.length > 1 ? "s" : ""} · {language}
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button variant="ghost" onClick={() => setSaveModal(false)}>Cancel</Button>
              {snippetId && <Button variant="subtle" onClick={() => doSave(true)}>Save as new</Button>}
              <Button onClick={() => doSave(false)} icon={<Save size={13} />}>{snippetId ? "Update" : "Save"}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
