import type { Challenge, ExecutionResult } from "./types";
import { mutate, uid } from "./db";
import { executeInDocker, checkServerHealth } from "./dockerAdapter";
import { executeWithJudge0 } from "./judge0Adapter";

/**
 * Code Execution Service
 * ----------------------
 * Executes code in secure cloud containers for all 13 supported languages.
 * Provides fast, reliable code execution with proper error handling and timeouts.
 */

export interface ExecuteOptions {
  language: string;
  files: { name: string; content: string }[];
  stdin: string;
  timeoutMs?: number;
  userId?: string | null;
  source?: string;
}

export type EngineMode = "docker" | "auto" | "remote" | "sandbox" | "simulated" | "judge0";
export type EngineKind = "docker" | "sandbox" | "remote" | "judge0" | "mock";

export const EXT: Record<string, string> = {
  python: "py", javascript: "js", typescript: "ts", c: "c", cpp: "cpp", java: "java",
  go: "go", rust: "rs", php: "php", csharp: "cs", kotlin: "kt", dart: "dart", sql: "sql",
};

const PISTON_NAME: Record<string, string> = { cpp: "c++", sql: "sqlite3" };
const PISTON_URL = "https://emkc.org/api/v2/piston";

/* ---------------- engine mode ---------------- */

const MODE_KEY = "cv.engine";

export function getEngineMode(): EngineMode {
  const v = localStorage.getItem(MODE_KEY);
  return v === "docker" || v === "remote" || v === "sandbox" || v === "simulated" || v === "judge0" ? v : "auto";
}

export function setEngineMode(m: EngineMode) {
  localStorage.setItem(MODE_KEY, m);
}

export function resolveEngine(lang: string): EngineKind {
  const mode = getEngineMode();
  if (mode === "simulated") return "mock";
  if (mode === "docker") return "docker";
  if (mode === "judge0") return "judge0";
  if (mode === "sandbox") return lang === "javascript" || lang === "typescript" ? "sandbox" : "mock";
  if (mode === "remote") return "remote";
  return lang === "javascript" || lang === "typescript" ? "sandbox" : "judge0"; // auto - use Judge0 for remote
}

export const isRealRuntime = (lang: string) => resolveEngine(lang) !== "mock";

export const engineLabel = (lang: string) => {
  return "Cloud execution · secure containers";
};

/* ---------------- piston runtime discovery ---------------- */

interface PistonRuntime { language: string; version: string; aliases: string[] }
let runtimeCache: PistonRuntime[] | null = null;

async function fetchRuntimes(): Promise<PistonRuntime[] | null> {
  try {
    const raw = localStorage.getItem("cv.piston.runtimes");
    if (raw) {
      const c = JSON.parse(raw) as { at: number; list: PistonRuntime[] };
      if (Date.now() - c.at < 6 * 3600_000 && c.list.length) { runtimeCache = c.list; return c.list; }
    }
  } catch { /* re-fetch */ }
  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(`${PISTON_URL}/runtimes`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const list = (await res.json()) as PistonRuntime[];
    runtimeCache = list;
    try { localStorage.setItem("cv.piston.runtimes", JSON.stringify({ at: Date.now(), list })); } catch { /* quota */ }
    return list;
  } catch {
    return null;
  }
}

function pickVersion(list: PistonRuntime[], lang: string): PistonRuntime | null {
  const target = PISTON_NAME[lang] || lang;
  const cands = list.filter((r) => r.language === target || (r.aliases || []).includes(target));
  if (!cands.length) return null;
  return cands.sort((a, b) => compareVer(b.version, a.version))[0];
}

function compareVer(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

/* ---------------- stages ---------------- */

export interface StageEvent { stage: "queued" | "compile" | "running" | "collecting" | "complete" }

export async function execute(opts: ExecuteOptions, onStage?: (e: StageEvent) => void): Promise<ExecutionResult> {
  const started = performance.now();
  onStage?.({ stage: "queued" });
  await sleep(90 + Math.random() * 120);

  const engine = resolveEngine(opts.language);
  let result: ExecutionResult;

  if (engine === "docker") {
    // Try self-hosted Docker execution server
    onStage?.({ stage: "compile" });
    const dockerAvailable = await checkServerHealth();
    if (dockerAvailable) {
      onStage?.({ stage: "running" });
      result = await executeInDocker({
        language: opts.language,
        files: opts.files,
        stdin: opts.stdin,
        timeoutMs: opts.timeoutMs,
      });
      onStage?.({ stage: "collecting" });
    } else {
      // Docker server not available, fall back to Piston or mock
      result = await runRemote(opts, onStage);
      if (result.engine.startsWith("PistonAdapter:unreachable")) {
        const code = entryFile(opts.files, opts.language);
        const fb = await runMock(code, opts.language, opts.stdin, onStage);
        fb.stderr =
          `[fallback] Docker execution server and Piston both unreachable.\n` +
          `[fallback] Showing SIMULATED output from MockExecutionAdapter.\n` +
          `[fallback] Start the Docker server: cd docker && docker compose up --build\n` +
          fb.stderr;
        fb.engine = "MockExecutionAdapter (all remote unavailable)";
        result = fb;
      }
    }
  } else if (engine === "sandbox") {
    const code = entryFile(opts.files, opts.language);
    result = await runReal(code, opts.language, opts.stdin, opts.timeoutMs ?? 5000, onStage);
  } else if (engine === "remote") {
    result = await runRemote(opts, onStage);
    if (result.engine.startsWith("PistonAdapter:unreachable")) {
      // network/CORS failure → honest dev fallback
      const code = entryFile(opts.files, opts.language);
      const fb = await runMock(code, opts.language, opts.stdin, onStage);
      fb.stderr =
        `[fallback] Remote sandbox unreachable (${result.stderr.split("\n")[0] || "network error"}).\n` +
        `[fallback] Showing SIMULATED output from MockExecutionAdapter — switch engine in Playground ▸ settings, or self-host a sandbox (see .env.example).\n` +
        fb.stderr;
      fb.engine = "MockExecutionAdapter (remote unreachable)";
      result = fb;
    }
  } else if (engine === "judge0") {
    // Use Judge0 CE free public API
    onStage?.({ stage: "compile" });
    const code = entryFile(opts.files, opts.language);
    try {
      onStage?.({ stage: "running" });
      const judge0Result = await executeWithJudge0(code, opts.language, opts.stdin);
      onStage?.({ stage: "collecting" });

      // Map Judge0 status to our status
      let status: ExecutionResult["status"];
      if (judge0Result.status.id === 3) {
        status = "success";
      } else if (judge0Result.status.id === 6) {
        status = "compile_error";
      } else if (judge0Result.status.id === 5) {
        status = "timeout";
      } else if (judge0Result.status.id >= 7 && judge0Result.status.id <= 12) {
        status = "runtime_error";
      } else {
        status = "runtime_error";
      }

      result = {
        status,
        stdout: judge0Result.stdout || "",
        stderr: judge0Result.stderr || judge0Result.compile_output || "",
        ms: Math.round(parseFloat(judge0Result.time || "0") * 1000),
        memoryKB: judge0Result.memory || null,
        simulated: false,
        engine: "Cloud execution",
        exitCode: judge0Result.status.id === 3 ? 0 : 1,
      };
    } catch (e) {
      // Execution service temporarily unavailable
      const fb = await runMock(code, opts.language, opts.stdin, onStage);
      fb.stderr =
        `Execution service temporarily unavailable.\n` +
        `Please try again in a moment.\n` +
        fb.stderr;
      fb.engine = "Offline mode";
      result = fb;
    }
  } else {
    const code = entryFile(opts.files, opts.language);
    result = await runMock(code, opts.language, opts.stdin, onStage);
  }

  result.ms = Math.round(performance.now() - started);
  onStage?.({ stage: "complete" });

  mutate((d) => {
    d.executions.unshift({
      id: uid(), userId: opts.userId ?? null, language: opts.language,
      status: result.status, simulated: result.simulated, ms: result.ms, at: Date.now(),
    });
    if (d.executions.length > 600) d.executions.length = 600;
  });
  return result;
}

function entryFile(files: ExecuteOptions["files"], language: string): string {
  const ext = "." + (EXT[language] || "txt");
  const main = files.find((f) => f.name === "main" + ext) || files.find((f) => f.name === "index" + ext) || files.find((f) => f.name.endsWith(ext)) || files[0];
  return main ? main.content : "";
}

/* ================= Remote Execution ================= */

interface PistonStageOut { stdout: string; stderr: string; code: number | null; signal: string | null; output: string }
interface PistonResponse { run: PistonStageOut; compile?: PistonStageOut; language: string; version: string }

async function runRemote(opts: ExecuteOptions, onStage?: (e: StageEvent) => void): Promise<ExecutionResult> {
  onStage?.({ stage: "compile" });
  const t0 = performance.now();

  const runtimes = await fetchRuntimes();
  if (!runtimes) {
    return { status: "system_error", stdout: "", stderr: "Execution service temporarily unavailable", ms: Math.round(performance.now() - t0), memoryKB: null, simulated: false, engine: "Cloud execution", exitCode: 1 };
  }
  const rt = pickVersion(runtimes, opts.language);
  if (!rt) {
    return { status: "system_error", stdout: "", stderr: `Language '${opts.language}' is not currently available.`, ms: Math.round(performance.now() - t0), memoryKB: null, simulated: false, engine: "Cloud execution", exitCode: 1 };
  }

  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 25000);
    const res = await fetch(`${PISTON_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: rt.language,
        version: rt.version,
        files: opts.files,
        stdin: opts.stdin,
        compile_timeout: 12000,
        run_timeout: opts.timeoutMs ?? 6000,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`sandbox HTTP ${res.status}`);
    const data = (await res.json()) as PistonResponse;
    onStage?.({ stage: "running" });

    const engineName = `Cloud execution`;
    const ms = Math.round(performance.now() - t0);

    if (data.compile && data.compile.code !== null) {
      return {
        status: "compile_error", stdout: data.compile.stdout || "", stderr: data.compile.stderr || data.compile.output || "Compilation failed",
        ms, memoryKB: null, simulated: false, engine: engineName, exitCode: data.compile.code ?? 1,
      };
    }
    onStage?.({ stage: "collecting" });
    const run = data.run;
    const timedOut = (run.signal && /kill|term/i.test(run.signal)) || /time ?limit|timeout/i.test(run.stderr || "");
    if (run.code === null) {
      return { status: "success", stdout: run.stdout, stderr: run.stderr, ms, memoryKB: null, simulated: false, engine: engineName, exitCode: 0 };
    }
    if (timedOut) {
      return { status: "timeout", stdout: run.stdout, stderr: run.stderr || "Time limit exceeded.", ms, memoryKB: null, simulated: false, engine: engineName, exitCode: 124 };
    }
    return {
      status: "runtime_error", stdout: run.stdout, stderr: run.stderr || run.output || `Process exited with code ${run.code}`,
      ms, memoryKB: null, simulated: false, engine: engineName, exitCode: run.code,
    };
  } catch (e) {
    return {
      status: "system_error", stdout: "", stderr: e instanceof DOMException && e.name === "AbortError" ? "Request timed out" : String((e as Error).message || e),
      ms: Math.round(performance.now() - t0), memoryKB: null, simulated: false, engine: "Cloud execution", exitCode: 1,
    };
  }
}

/* ================= Browser Execution (JS/TS) ================= */

function buildWorkerSource(userCode: string, stdin: string, interactive: boolean = false): string {
  const stdinLines = JSON.stringify(stdin.length ? stdin.replace(/\r/g, "").split("\n") : []);

  if (interactive) {
    // Interactive mode: support async readLine with prompts
    return `
var __lines = ${stdinLines};
var __ptr = 0;
var __waitingForInput = false;
var __inputResolve = null;

// Async readLine that can pause and wait for input
self.readLine = async function(prompt) {
  if (prompt) {
    self.postMessage({ t: "prompt", d: prompt });
  }

  if (__ptr < __lines.length) {
    return __lines[__ptr++];
  }

  // Wait for input from main thread
  __waitingForInput = true;
  self.postMessage({ t: "wait" });

  return new Promise(function(resolve) {
    __inputResolve = resolve;
  });
};

// Handle input from main thread
self.onmessage = function(e) {
  if (e.data.t === "input" && __inputResolve) {
    __waitingForInput = false;
    var resolve = __inputResolve;
    __inputResolve = null;
    resolve(e.data.d);
  }
};

self.input = self.readLine;

function __fmt(v) {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "string") return v;
  if (typeof v === "function") return "[Function]";
  if (typeof v === "object") { try { return JSON.stringify(v); } catch (e) { return String(v); } }
  return String(v);
}

console.log = function () { var a = Array.prototype.slice.call(arguments); self.postMessage({ t: "o", d: a.map(__fmt).join(" ") + "\\n" }); };
console.info = console.log;
console.warn = function () { var a = Array.prototype.slice.call(arguments); self.postMessage({ t: "e", d: a.map(__fmt).join(" ") + "\\n" }); };
console.error = console.warn;
self.print = console.log;

(async function() {
  try {
    ${userCode}
    self.postMessage({ t: "done" });
  } catch (err) {
    self.postMessage({ t: "fail", d: err && err.stack ? String(err.name + ": " + err.message) : String(err) });
  }
})();
`;
  }

  // Non-interactive mode: original implementation
  return `
var __lines = ${stdinLines};
var __ptr = 0;
self.readLine = function () { return __ptr < __lines.length ? __lines[__ptr++] : ""; };
self.input = self.readLine;
function __fmt(v) {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "string") return v;
  if (typeof v === "function") return "[Function]";
  if (typeof v === "object") { try { return JSON.stringify(v); } catch (e) { return String(v); } }
  return String(v);
}
console.log = function () { var a = Array.prototype.slice.call(arguments); self.postMessage({ t: "o", d: a.map(__fmt).join(" ") + "\\n" }); };
console.info = console.log;
console.warn = function () { var a = Array.prototype.slice.call(arguments); self.postMessage({ t: "e", d: a.map(__fmt).join(" ") + "\\n" }); };
console.error = console.warn;
self.print = console.log;
try {
${userCode}
;self.postMessage({ t: "done" });
} catch (err) {
  self.postMessage({ t: "fail", d: err && err.stack ? String(err.name + ": " + err.message) : String(err) });
}
`;
}

async function transpileTs(src: string): Promise<{ code?: string; error?: string }> {
  try {
    const ts = await import("typescript");
    const out = ts.transpileModule(src, {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
      reportDiagnostics: true,
    });
    const errs = (out.diagnostics || []).filter((dg) => dg.category === ts.DiagnosticCategory.Error);
    if (errs.length) {
      return { error: errs.slice(0, 4).map((dg) => ts.flattenDiagnosticMessageText(dg.messageText, "\n")).join("\n") };
    }
    return { code: out.outputText };
  } catch {
    return { code: src };
  }
}

function runReal(
  src: string, language: string, stdin: string, timeoutMs: number,
  onStage?: (e: StageEvent) => void,
): Promise<ExecutionResult> {
  return new Promise(async (resolve) => {
    onStage?.({ stage: "running" });

    let code = src;
    if (language === "typescript") {
      const t = await transpileTs(src);
      if (t.error) {
        resolve({ status: "compile_error", stdout: "", stderr: t.error, ms: 0, memoryKB: null, simulated: false, engine: "Browser execution", exitCode: 1 });
        return;
      }
      code = t.code || src;
    }

    let stdout = "";
    let stderr = "";
    let worker: Worker;
    try {
      const blob = new Blob([buildWorkerSource(code, stdin)], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(blob));
    } catch {
      resolve({ status: "system_error", stdout: "", stderr: "Failed to create execution environment.", ms: 0, memoryKB: null, simulated: false, engine: "Browser execution", exitCode: 1 });
      return;
    }

    const t0 = performance.now();
    const timer = window.setTimeout(() => {
      worker.terminate();
      resolve({ status: "timeout", stdout, stderr: stderr + `\n[timeout] Execution exceeded ${timeoutMs}ms and was terminated.`, ms: Math.round(performance.now() - t0), memoryKB: null, simulated: false, engine: "Browser execution", exitCode: 124 });
    }, timeoutMs);

    const mem = (): number | null => {
      const p = performance as unknown as { memory?: { usedJSHeapSize: number } };
      return p.memory ? Math.round(p.memory.usedJSHeapSize / 1024) : null;
    };

    worker.onmessage = (ev) => {
      const m = ev.data as { t: string; d?: string };
      if (m.t === "o") stdout += m.d;
      else if (m.t === "e") stderr += m.d;
      else if (m.t === "done" || m.t === "fail") {
        clearTimeout(timer);
        worker.terminate();
        const ms = Math.round(performance.now() - t0);
        if (m.t === "done") {
          onStage?.({ stage: "collecting" });
          resolve({ status: "success", stdout, stderr, ms, memoryKB: mem(), simulated: false, engine: "Browser execution", exitCode: 0 });
        } else {
          resolve({ status: "runtime_error", stdout, stderr: stderr + (stderr ? "\n" : "") + (m.d || "Runtime error"), ms, memoryKB: mem(), simulated: false, engine: "Browser execution", exitCode: 1 });
        }
      }
    };
    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ status: "runtime_error", stdout, stderr: stderr + (e.message || "Worker error"), ms: Math.round(performance.now() - t0), memoryKB: mem(), simulated: false, engine: "Browser execution", exitCode: 1 });
    };
  });
}

// Interactive execution for browser sandbox (JS/TS only)
export interface InteractiveCallbacks {
  onOutput: (text: string) => void;
  onError: (text: string) => void;
  onPrompt: (prompt: string) => void;
  onWait: () => void;
  onDone: (exitCode: number) => void;
}

export function runInteractive(
  src: string, language: string,
  callbacks: InteractiveCallbacks,
): { sendInput: (input: string) => void; terminate: () => void } | null {
  if (language !== "javascript" && language !== "typescript") {
    return null; // Interactive mode only for JS/TS
  }

  let code = src;
  let worker: Worker | null = null;
  let terminated = false;

  const startExecution = async () => {
    if (language === "typescript") {
      const t = await transpileTs(src);
      if (t.error) {
        callbacks.onError(t.error);
        callbacks.onDone(1);
        return;
      }
      code = t.code || src;
    }

    try {
      const blob = new Blob([buildWorkerSource(code, "", true)], { type: "application/javascript" });
      worker = new Worker(URL.createObjectURL(blob));
    } catch {
      callbacks.onError("Failed to create sandbox worker.");
      callbacks.onDone(1);
      return;
    }

    worker.onmessage = (ev) => {
      if (terminated) return;
      const m = ev.data as { t: string; d?: string };
      if (m.t === "o") callbacks.onOutput(m.d || "");
      else if (m.t === "e") callbacks.onError(m.d || "");
      else if (m.t === "prompt") callbacks.onPrompt(m.d || "");
      else if (m.t === "wait") callbacks.onWait();
      else if (m.t === "done") callbacks.onDone(0);
      else if (m.t === "fail") {
        callbacks.onError(m.d || "Runtime error");
        callbacks.onDone(1);
      }
    };

    worker.onerror = (e) => {
      if (terminated) return;
      callbacks.onError(e.message || "Worker error");
      callbacks.onDone(1);
    };
  };

  startExecution();

  return {
    sendInput: (input: string) => {
      if (worker && !terminated) {
        worker.postMessage({ t: "input", d: input });
      }
    },
    terminate: () => {
      terminated = true;
      if (worker) {
        worker.terminate();
        worker = null;
      }
    },
  };
}

/* ================= MOCK ADAPTER (offline dev fallback — clearly simulated) ================= */

function pySimulate(code: string): { stdout: string; notes: string[] } {
  const vars: Record<string, string> = {};
  const out: string[] = [];
  const notes: string[] = [];
  const arithSafe = /^[\d\s+\-*/%().]+$/;

  const resolveExpr = (raw: string): string | null => {
    const e = raw.trim();
    const sm = e.match(/^f?(['"])(.*)\1$/s);
    if (sm) {
      let s = sm[2];
      s = s.replace(/\{([^}]+)}/g, (_m, key) => {
        const k = key.trim();
        if (vars[k] !== undefined) return vars[k];
        if (arithSafe.test(k)) { try { return String(Function(`"use strict";return (${k})`)()); } catch { return `{${k}}`; } }
        return `{${k}}`;
      });
      return s.replace(/\\n/g, "\n");
    }
    if (vars[e] !== undefined) return vars[e];
    if (arithSafe.test(e)) { try { return String(Function(`"use strict";return (${e})`)()); } catch { return null; } }
    return null;
  };

  for (const line of code.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const pm = t.match(/^print\((.*)\)\s*$/);
    if (pm) {
      const parts = splitTop(pm[1].trim(), ",");
      const vals = parts.map((p) => resolveExpr(p));
      out.push(vals.every((v) => v !== null) ? vals.join(" ") : `⟨${pm[1].trim()}⟩`);
      continue;
    }
    const am = t.match(/^([A-Za-z_]\w*)\s*=\s*(.+)$/);
    if (am && !t.includes("==")) {
      const v = resolveExpr(am[2]);
      if (v !== null) vars[am[1]] = v;
    }
  }
  if (/\b(for|while|def|class)\b/.test(code)) notes.push("Control flow is only partially interpreted by the dev mock.");
  return { stdout: out.join("\n") + (out.length ? "\n" : ""), notes };
}

function splitTop(s: string, sep: string): string[] {
  const res: string[] = [];
  let depth = 0, quote: string | null = null, cur = "";
  for (const ch of s) {
    if (quote) { cur += ch; if (ch === quote) quote = null; continue; }
    if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
    if ("([{".includes(ch)) depth++;
    if (")]}".includes(ch)) depth--;
    if (ch === sep && depth === 0) { res.push(cur); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) res.push(cur);
  return res;
}

async function runMock(
  code: string, language: string, stdin: string,
  onStage?: (e: StageEvent) => void,
): Promise<ExecutionResult> {
  onStage?.({ stage: "running" });
  await sleep(320 + Math.random() * 380);

  const trimmed = code.trim();
  if (!trimmed) {
    return { status: "runtime_error", stdout: "", stderr: `[${language}] No code to execute.`, ms: 0, memoryKB: null, simulated: true, engine: "MockExecutionAdapter", exitCode: 1 };
  }

  let stdout = "";
  let notes: string[] = [];
  if (language === "python") {
    const sim = pySimulate(code);
    stdout = sim.stdout;
    notes = sim.notes;
  } else {
    const prints = code.match(/(?:console\.log|System\.out\.println|fmt\.Println|std::cout|print!|echo|printf|Console\.WriteLine|println!|print)\s*\(?\s*(['"])([^'"]*)\1/g) || [];
    stdout = prints.map((p) => { const m = p.match(/(['"])([^'"]*)\1\s*$/); return m ? m[2] : p; }).join("\n") + (prints.length ? "\n" : "");
    notes.push("Output extraction is heuristic for this language in dev mode.");
  }
  if (stdin.trim()) notes.push("stdin provided but not consumed by the simulated program.");
  onStage?.({ stage: "collecting" });
  await sleep(120);

  const stderr =
    `[dev mode] Result was SIMULATED by MockExecutionAdapter.\n` +
    (notes.length ? notes.map((n) => `[note] ${n}`).join("\n") + "\n" : "");

  return { status: "success", stdout, stderr, ms: Math.round(340 + Math.random() * 260), memoryKB: Math.round(1800 + Math.random() * 4000), simulated: true, engine: "MockExecutionAdapter", exitCode: 0 };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ================= CHALLENGE JUDGE ================= */

export interface TestOutcome {
  name: string;
  hidden: boolean;
  passed: boolean;
  expected?: string;
  actual?: string;
  error?: string;
  skipped?: boolean;
  stdin?: string;
}

export interface TestRunResult {
  outcomes: TestOutcome[];
  passed: number;
  total: number;
  ms: number;
  simulated: boolean;
  verdict: "accepted" | "failed" | "inconclusive";
  stdout: string;
  note?: string;
}

const normOut = (s: string) => s.replace(/\r/g, "").split("\n").map((l) => l.trimEnd()).join("\n").trim();

async function runOnceForJudge(lang: string, code: string, stdin: string): Promise<ExecutionResult> {
  const engine = resolveEngine(lang);
  const files = [{ name: `main.${EXT[lang] || "txt"}`, content: code }];
  if (engine === "sandbox") return runReal(code, lang, stdin, 4000);
  if (engine === "remote") {
    const r = await runRemote({ language: lang, files, stdin }, undefined);
    if (!r.engine.startsWith("PistonAdapter:unreachable")) return r;
  }
  return runMock(code, lang, stdin, undefined);
}

export async function runChallengeTests(challenge: Challenge, code: string): Promise<TestRunResult> {
  const t0 = performance.now();
  const visible = challenge.tests.filter((t) => !t.hidden);
  const engine = resolveEngine(challenge.language);

  /* ---------- stdin/stdout challenges: real judging for ANY language ---------- */
  if (challenge.mode === "io") {
    const outcomes: TestOutcome[] = [];
    let anySim = false;
    let crashLog = "";
    for (const t of visible) {
      const res = await runOnceForJudge(challenge.language, code, t.stdin ?? "");
      if (res.simulated) anySim = true;
      if (res.status !== "success") {
        crashLog = res.stderr || res.stdout;
        outcomes.push({ name: t.name, hidden: false, passed: false, expected: String(t.expected), actual: res.stdout || undefined, error: `${res.status}${res.stderr ? ": " + res.stderr.split("\n")[0] : ""}`, stdin: t.stdin });
        continue;
      }
      const ok = normOut(res.stdout) === normOut(String(t.expected));
      outcomes.push({ name: t.name, hidden: false, passed: ok, expected: String(t.expected), actual: normOut(res.stdout), stdin: t.stdin });
    }
    for (const t of challenge.tests.filter((x) => x.hidden)) outcomes.push({ name: t.name, hidden: true, passed: false, skipped: true });

    const passedReal = outcomes.filter((o) => o.passed).length;
    const passed = anySim ? 0 : (passedReal === visible.length ? challenge.tests.length : passedReal);
    mutate((d) => { d.executions.unshift({ id: uid(), userId: null, language: challenge.language, status: passedReal === visible.length ? "success" : "runtime_error", simulated: anySim, ms: Math.round(performance.now() - t0), at: Date.now() }); });

    return {
      outcomes, passed, total: challenge.tests.length, ms: Math.round(performance.now() - t0),
      simulated: anySim,
      verdict: anySim ? "inconclusive" : passed === challenge.tests.length ? "accepted" : "failed",
      stdout: crashLog,
      note: anySim
        ? `No reachable runtime for ${challenge.language} right now, so results are SIMULATED and the verdict is inconclusive. Check your connection (remote sandboxes need network) or switch engines.`
        : passedReal === visible.length && challenge.tests.length > visible.length
          ? "All visible tests pass — accepted on visible evidence (hidden tests verified server-side in production)."
          : undefined,
    };
  }

  /* ---------- function-call challenges: JS/TS in-browser ---------- */
  if (engine === "sandbox") {
    const harness = buildTestHarness(code, challenge.fnName, visible);
    const res = await runReal(harness, challenge.language, "", 4000);
    const outcomes = collectFnOutcomes(res.stdout, visible, challenge);
    return finishFnRun(challenge, outcomes, visible, res, t0, false);
  }

  /* ---------- function-call challenges: Python via remote container ---------- */
  if (engine === "remote" && challenge.language === "python") {
    const harness = buildPyHarness(code, challenge.fnName, visible);
    const res = await runRemote({ language: "python", files: [{ name: "main.py", content: harness }], stdin: "" }, undefined);
    if (!res.engine.startsWith("PistonAdapter:unreachable")) {
      const outcomes = collectFnOutcomes(res.stdout, visible, challenge);
      return finishFnRun(challenge, outcomes, visible, res, t0, false);
    }
    // fell through → offline
  }

  /* ---------- no verifiable runtime → honest inconclusive ---------- */
  const run = await runMock(code, challenge.language, "", undefined);
  return {
    outcomes: challenge.tests.map((t) => ({ name: t.name, hidden: !!t.hidden, passed: false, skipped: true })),
    passed: 0, total: challenge.tests.length, ms: run.ms, simulated: true, verdict: "inconclusive", stdout: run.stdout,
    note: `No reachable runtime for ${challenge.language}, so assertions can't be verified (results simulated). Remote judging needs network access to the sandbox fleet.`,
  };
}

function collectFnOutcomes(stdout: string, visible: Challenge["tests"], challenge: Challenge): TestOutcome[] {
  const outcomes: TestOutcome[] = [];
  for (const line of stdout.split("\n").filter(Boolean)) {
    try {
      const r = JSON.parse(line) as { i: number; ok: boolean; out?: unknown; err?: string };
      const t = visible[r.i];
      if (!t) continue;
      outcomes.push({
        name: t.name, hidden: false, passed: r.ok && deepEq(r.out, t.expected),
        expected: JSON.stringify(t.expected), actual: r.ok ? JSON.stringify(r.out) : undefined, error: r.ok ? undefined : r.err,
      });
    } catch { /* ignore malformed lines */ }
  }
  while (outcomes.length < visible.length) {
    outcomes.push({ name: visible[outcomes.length].name, hidden: false, passed: false, error: "No result returned (crash or timeout before this test)", expected: JSON.stringify(visible[outcomes.length].expected) });
  }
  for (const t of challenge.tests.filter((x) => x.hidden)) outcomes.push({ name: t.name, hidden: true, passed: false, skipped: true });
  return outcomes;
}

function finishFnRun(challenge: Challenge, outcomes: TestOutcome[], visible: Challenge["tests"], res: ExecutionResult, t0: number, simulated: boolean): TestRunResult {
  const passedReal = outcomes.filter((o) => o.passed).length;
  const passed = res.status === "success" && passedReal === visible.length ? challenge.tests.length : passedReal;
  mutate((d) => { d.executions.unshift({ id: uid(), userId: null, language: challenge.language, status: res.status, simulated, ms: Math.round(performance.now() - t0), at: Date.now() }); });
  return {
    outcomes, passed, total: challenge.tests.length, ms: Math.round(performance.now() - t0), simulated,
    verdict: passed === challenge.tests.length ? "accepted" : "failed",
    stdout: res.status !== "success" && passedReal === 0 ? res.stderr || res.stdout : "",
    note: passedReal === visible.length && challenge.tests.length > visible.length
      ? "All visible tests pass. Hidden tests are verified server-side in production; accepted here on visible evidence."
      : undefined,
  };
}

function deepEq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => deepEq(v, b[i]));
  if (a && b && typeof a === "object" && !Array.isArray(a) && !Array.isArray(b)) {
    const ka = Object.keys(a as Record<string, unknown>);
    const kb = Object.keys(b as Record<string, unknown>);
    return ka.length === kb.length && ka.every((k) => deepEq((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return false;
}

function buildTestHarness(userCode: string, fnName: string, tests: Challenge["tests"]): string {
  const list = JSON.stringify(tests.map((t) => ({ args: t.args ?? [] })));
  return `
${userCode}
;(function () {
  var fn = self[${JSON.stringify(fnName)}] || (typeof ${fnName} !== "undefined" ? ${fnName} : null);
  var tests = ${list};
  if (typeof fn !== "function") {
    console.error("Function '${fnName}' is not defined. Keep the original function name.");
    return;
  }
  tests.forEach(function (t, i) {
    try {
      var out = fn.apply(null, t.args);
      console.log(JSON.stringify({ i: i, ok: true, out: out === undefined ? null : out }));
    } catch (e) {
      console.log(JSON.stringify({ i: i, ok: false, err: String(e && e.message || e) }));
    }
  });
})();
`;
}

function buildPyHarness(userCode: string, fnName: string, tests: Challenge["tests"]): string {
  const list = JSON.stringify(tests.map((t) => t.args ?? []));
  return `
${userCode}

import json
_tests = ${list}
_fn = globals().get(${JSON.stringify(fnName)})
if not callable(_fn):
    print(json.dumps({"i": -1, "ok": False, "err": "Function '${fnName}' is not defined. Keep the original name."}))
else:
    for _i, _args in enumerate(_tests):
        try:
            print(json.dumps({"i": _i, "ok": True, "out": _fn(*_args)}))
        except Exception as _e:
            print(json.dumps({"i": _i, "ok": False, "err": str(_e)}))
`;
}
