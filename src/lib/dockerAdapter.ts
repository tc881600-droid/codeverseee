/**
 * DockerExecutionAdapter
 * ----------------------
 * Calls the self-hosted execution server to run code in Docker containers.
 * Falls back to Piston or Mock if the server is unreachable.
 */

import type { ExecutionResult } from "./types";

const EXEC_SERVER_URL = import.meta.env.VITE_CODE_EXECUTION_URL || "http://localhost:3001";

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

let serverAvailable: boolean | null = null;

export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${EXEC_SERVER_URL}/health`, { method: "GET" });
    if (!res.ok) return false;
    const data = await res.json();
    serverAvailable = data.status === "ok" && data.docker === true;
    return serverAvailable;
  } catch {
    serverAvailable = false;
    return false;
  }
}

export async function executeInDocker(req: ExecuteRequest): Promise<ExecutionResult> {
  const started = performance.now();

  try {
    const res = await fetch(`${EXEC_SERVER_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = (await res.json()) as ExecuteResponse;

    return {
      status: data.status,
      stdout: data.stdout,
      stderr: data.stderr,
      ms: data.ms,
      memoryKB: data.memoryKB,
      simulated: false,
      engine: data.engine,
      exitCode: data.exitCode,
    };
  } catch (err: any) {
    return {
      status: "system_error",
      stdout: "",
      stderr: `Docker execution server unreachable: ${err.message || String(err)}\n\nMake sure the execution server is running:\n  cd docker && docker compose up --build`,
      ms: Math.round(performance.now() - started),
      memoryKB: null,
      simulated: false,
      engine: "DockerExecutionAdapter",
      exitCode: 1,
    };
  }
}

export function isDockerAvailable(): boolean {
  return serverAvailable === true;
}
