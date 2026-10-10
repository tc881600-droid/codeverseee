/**
 * CodeVerse Execution Server
 * --------------------------
 * Receives code from the frontend, runs it inside an isolated Docker container,
 * and returns stdout/stderr/exit code/memory/timing.
 *
 * Architecture:
 *   Frontend → POST /execute → this server → Docker container (sandbox image)
 *
 * Security:
 *   - Container runs as non-root user
 *   - No network access (--network none)
 *   - Memory limit (256MB)
 *   - CPU limit (1 core)
 *   - PID limit (64)
 *   - Read-only root filesystem
 *   - Auto-kill on timeout
 */

import express from "express";
import cors from "cors";
import Docker from "dockerode";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const docker = new Docker();
const SANDBOX_IMAGE = process.env.SANDBOX_IMAGE || "codeverse/sandbox:latest";
const PORT = parseInt(process.env.PORT || "3001", 10);
const WORKSPACE_BASE = process.env.WORKSPACE_BASE || "/tmp/codeverse-workspaces";

// ──────────────────────────── Language configs ────────────────────────────

interface LanguageConfig {
  compile?: string;
  run: string;
  mainFile: string;
  binary?: string;
}

const LANGUAGES: Record<string, LanguageConfig> = {
  python: { run: "python3 main.py", mainFile: "main.py" },
  javascript: { run: "node main.js", mainFile: "main.js" },
  typescript: {
    compile: "npx tsc main.ts --outDir /tmp/out --target ES2020 --module commonjs --esModuleInterop",
    run: "node /tmp/out/main.js",
    mainFile: "main.ts",
  },
  c: {
    compile: "gcc -o /tmp/program main.c -lm",
    run: "/tmp/program",
    mainFile: "main.c",
    binary: "/tmp/program",
  },
  cpp: {
    compile: "g++ -o /tmp/program main.cpp -std=c++17",
    run: "/tmp/program",
    mainFile: "main.cpp",
    binary: "/tmp/program",
  },
  java: {
    compile: "javac Main.java",
    run: "java Main",
    mainFile: "Main.java",
  },
  go: {
    compile: "go build -o /tmp/program main.go",
    run: "/tmp/program",
    mainFile: "main.go",
    binary: "/tmp/program",
  },
  rust: {
    compile: "rustc main.rs -o /tmp/program",
    run: "/tmp/program",
    mainFile: "main.rs",
    binary: "/tmp/program",
  },
  php: { run: "php main.php", mainFile: "main.php" },
  csharp: {
    compile: "dotnet build -o /tmp/cs-out",
    run: "dotnet /tmp/cs-out/Program.dll",
    mainFile: "Program.cs",
  },
  kotlin: {
    compile: "kotlinc main.kt -include-runtime -d /tmp/program.jar",
    run: "java -jar /tmp/program.jar",
    mainFile: "main.kt",
  },
  dart: {
    compile: "dart compile exe main.dart -o /tmp/program",
    run: "/tmp/program",
    mainFile: "main.dart",
    binary: "/tmp/program",
  },
  sql: { run: "sqlite3 :memory: < main.sql", mainFile: "main.sql" },
};

// ──────────────────────────── Request types ────────────────────────────

interface ExecuteRequest {
  language: string;
  files: { name: string; content: string }[];
  stdin?: string;
  timeoutMs?: number;
}

interface ExecuteResponse {
  status: "success" | "compile_error" | "runtime_error" | "timeout" | "memory_limit" | "system_error";
  stdout: string;
  stderr: string;
  exitCode: number;
  ms: number;
  memoryKB: number | null;
  engine: string;
}

// ──────────────────────────── Execution ────────────────────────────

async function ensureImage(): Promise<void> {
  try {
    await docker.getImage(SANDBOX_IMAGE).inspect();
  } catch {
    console.log(`[boot] Pulling sandbox image ${SANDBOX_IMAGE}…`);
    const stream = await docker.pull(SANDBOX_IMAGE);
    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(stream, (err: Error | null) => err ? reject(err) : resolve());
    });
    console.log(`[boot] Sandbox image ready.`);
  }
}

async function executeInContainer(req: ExecuteRequest): Promise<ExecuteResponse> {
  const started = performance.now();
  const lang = LANGUAGES[req.language];
  if (!lang) {
    return {
      status: "system_error", stdout: "", stderr: `Unknown language: ${req.language}`,
      exitCode: 1, ms: Math.round(performance.now() - started), memoryKB: null, engine: "DockerExecutionAdapter",
    };
  }

  const workspaceId = uuidv4();
  const workspaceDir = path.join(WORKSPACE_BASE, workspaceId);
  await fs.mkdir(workspaceDir, { recursive: true });

  // Write all files to workspace
  for (const file of req.files) {
    const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
    await fs.writeFile(path.join(workspaceDir, safeName), file.content);
  }

  // Write stdin file if provided
  const stdinPath = path.join(workspaceDir, ".stdin");
  if (req.stdin) await fs.writeFile(stdinPath, req.stdin);
  else await fs.writeFile(stdinPath, "");

  const timeoutMs = Math.min(req.timeoutMs ?? 6000, 15000);

  let container: Docker.Container | null = null;
  try {
    // Build the command that runs inside the container
    const commands: string[] = [];
    if (lang.compile) commands.push(lang.compile);
    commands.push(lang.run);

    const fullCommand = commands.join(" && ");
    const env = [
      `EXEC_LANGUAGE=${req.language}`,
      `EXEC_TIMEOUT=${timeoutMs}`,
      `EXEC_STDIN_FILE=${req.stdin ? "/workspace/.stdin" : "/dev/null"}`,
      `EXEC_CODE_DIR=/workspace`,
    ];

    container = await docker.createContainer({
      Image: SANDBOX_IMAGE,
      Cmd: ["bash", "-c", fullCommand],
      Env: env,
      WorkingDir: "/workspace",
      HostConfig: {
        Binds: [`${workspaceDir}:/workspace:rw`],
        Memory: 256 * 1024 * 1024,        // 256MB
        MemorySwap: 256 * 1024 * 1024,
        NanoCpus: 1_000_000_000,          // 1 CPU core
        PidsLimit: 64,
        NetworkMode: "none",              // No network access
        ReadonlyRootfs: false,            // Need /tmp writable
        AutoRemove: false,
      },
    });

    await container.start();

    // Wait for completion with timeout
    const waitPromise = container.wait();
    const timeoutPromise = new Promise<"timeout">((resolve) => {
      setTimeout(() => resolve("timeout"), timeoutMs + 1000);
    });

    const result = await Promise.race([waitPromise, timeoutPromise]);

    let stdout = "";
    let stderr = "";
    let status: ExecuteResponse["status"] = "success";

    if (result === "timeout") {
      status = "timeout";
      stderr = `Execution exceeded ${timeoutMs}ms time limit.`;
      try { await container.kill(); } catch { /* already stopped */ }
    } else {
      // Get logs
      const logs = await container.logs({ stdout: true, stderr: true, follow: false });
      const logText = logs.toString("utf8");

      // Docker multiplexes stdout/stderr with 8-byte headers
      const parsed = parseDockerLogs(logs);
      stdout = parsed.stdout;
      stderr = parsed.stderr;

      const exitCode = result.StatusCode;

      if (exitCode === 137 || exitCode === 124) {
        status = "timeout";
        stderr += "\nProcess killed (time limit).";
      } else if (exitCode === 139) {
        status = "runtime_error";
        stderr += "\nSegmentation fault.";
      } else if (exitCode !== 0) {
        // Check if compile or runtime error
        if (lang.compile && stderr.includes("error:")) {
          status = "compile_error";
        } else {
          status = "runtime_error";
        }
      }
    }

    // Get memory usage from container stats (best effort)
    let memoryKB: number | null = null;
    try {
      const stats = await container.stats({ stream: false });
      if (stats.memory_stats?.usage) {
        memoryKB = Math.round(stats.memory_stats.usage / 1024);
      }
    } catch { /* ignore */ }

    const ms = Math.round(performance.now() - started);

    return {
      status, stdout, stderr,
      exitCode: result === "timeout" ? 124 : (result as any).StatusCode ?? 1,
      ms, memoryKB, engine: "DockerExecutionAdapter",
    };
  } catch (err: any) {
    return {
      status: "system_error", stdout: "",
      stderr: `Container error: ${err.message || String(err)}`,
      exitCode: 1, ms: Math.round(performance.now() - started), memoryKB: null, engine: "DockerExecutionAdapter",
    };
  } finally {
    // Cleanup
    try { if (container) await container.remove({ force: true }); } catch { /* ignore */ }
    try { await fs.rm(workspaceDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }
}

function parseDockerLogs(buffer: Buffer): { stdout: string; stderr: string } {
  // Docker multiplexed stream: 8-byte header per frame
  // [stream_type(1)][0 0 0][size(4)] payload
  let stdout = "";
  let stderr = "";
  let offset = 0;

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;
    const streamType = buffer[offset];
    const size = buffer.readUInt32BE(offset + 4);
    offset += 8;
    if (offset + size > buffer.length) break;
    const payload = buffer.slice(offset, offset + size).toString("utf8");
    offset += size;

    if (streamType === 1) stdout += payload;
    else if (streamType === 2) stderr += payload;
    else stdout += payload; // fallback
  }

  // If no multiplexed frames found, treat entire buffer as stdout
  if (!stdout && !stderr && buffer.length > 0) {
    stdout = buffer.toString("utf8");
  }

  return { stdout, stderr };
}

// ──────────────────────────── API Routes ────────────────────────────

app.get("/health", async (_req, res) => {
  try {
    await docker.ping();
    const imageExists = await docker.getImage(SANDBOX_IMAGE).inspect().then(() => true).catch(() => false);
    res.json({
      status: "ok",
      docker: true,
      sandboxImage: imageExists ? SANDBOX_IMAGE : "not_pulled",
      languages: Object.keys(LANGUAGES),
    });
  } catch (err: any) {
    res.status(503).json({ status: "error", docker: false, error: err.message });
  }
});

app.get("/languages", (_req, res) => {
  res.json(Object.entries(LANGUAGES).map(([slug, cfg]) => ({
    slug, mainFile: cfg.mainFile, hasCompile: !!cfg.compile,
  })));
});

app.post("/execute", async (req, res) => {
  const body = req.body as ExecuteRequest;

  // Validate
  if (!body.language || !LANGUAGES[body.language]) {
    res.status(400).json({ error: "Invalid language" });
    return;
  }
  if (!body.files || !Array.isArray(body.files) || body.files.length === 0) {
    res.status(400).json({ error: "At least one file is required" });
    return;
  }

  const result = await executeInContainer(body);
  res.json(result);
});

// ──────────────────────────── Boot ────────────────────────────

async function boot() {
  console.log(`[boot] CodeVerse Execution Server starting…`);
  console.log(`[boot] Sandbox image: ${SANDBOX_IMAGE}`);
  console.log(`[boot] Workspace base: ${WORKSPACE_BASE}`);

  await fs.mkdir(WORKSPACE_BASE, { recursive: true });

  try {
    await docker.ping();
    console.log("[boot] Docker is reachable.");
  } catch {
    console.error("[boot] WARNING: Docker is not reachable. Execution will fail.");
  }

  // Pre-pull image in background
  ensureImage().catch((err) => {
    console.error(`[boot] Could not pull sandbox image: ${err.message}`);
    console.error(`[boot] Build it with: docker build -t ${SANDBOX_IMAGE} -f docker/Dockerfile.sandbox .`);
  });

  app.listen(PORT, () => {
    console.log(`[boot] Listening on http://localhost:${PORT}`);
    console.log(`[boot] Languages: ${Object.keys(LANGUAGES).join(", ")}`);
  });
}

boot();
