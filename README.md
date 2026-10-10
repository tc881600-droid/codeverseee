# CodeVerse

**Learn. Code. Run. Build. Master.** — a full programming learning platform: interactive
lessons, a browser IDE with real code execution, judged challenges, project-based learning,
an AI tutor, community, and an admin console.

## Quickstart

```bash
npm install
npm run dev        # local dev
npm run build      # production build (verified green)
```

### Demo accounts

| Account | Email | Password | Notes |
|---|---|---|---|
| Demo user | `demo@codeverse.dev` | `codeverse` | Populated: lessons, streak, achievements, solved challenges |
| Admin | `admin@codeverse.dev` | `admin123` | Unlocks `/admin` |

Or register a fresh account and run the full journey:
lesson → run code → earn XP → solve *Two Sum* → ship project tasks → ask the tutor.

## Docker Execution System (All 13 Languages)

CodeVerse includes a complete self-hosted Docker execution system that compiles and runs code in all 13 supported languages using real compilers in isolated containers.

### Setup

```bash
# 1. Build and start the Docker execution server
cd docker
docker compose up --build

# 2. In another terminal, start the frontend
cd ..
npm run dev
```

The execution server runs on `http://localhost:3001`. The frontend automatically detects it and uses it for code execution.

### What's Included

**Docker Sandbox Image** (`docker/Dockerfile.sandbox`):
- Python 3.12
- Node.js 20 + TypeScript
- Go 1.23
- Rust 1.82
- Java 21 (OpenJDK)
- GCC/G++ (C/C++)
- PHP 8.3
- Kotlin 2.0
- Dart 3.5
- SQLite3

**Execution Server** (`server/`):
- Node.js + Express API
- Dockerode for container management
- Isolated execution with resource limits (256MB RAM, 1 CPU, no network)
- Timeout handling and cleanup

**Frontend Integration**:
- `src/lib/dockerAdapter.ts` — calls the execution server
- `src/lib/exec.ts` — adapter chain: Docker → Piston → Mock
- Engine selector in Playground and Settings

### Execution Flow

1. User writes code in Playground
2. Frontend sends code to execution server (`POST /execute`)
3. Server creates temp directory, writes files
4. Server spawns Docker container with sandbox image
5. Container compiles (if needed) and runs the code
6. Server captures stdout/stderr/exit code/memory
7. Server cleans up container and temp files
8. Frontend displays results

### Security

- Containers run as non-root user
- No network access (`--network none`)
- Memory limit: 256MB
- CPU limit: 1 core
- PID limit: 64
- Auto-kill on timeout
- Read-only root filesystem (except /tmp)

### API Endpoints

```
GET  /health      — Check server and Docker status
GET  /languages   — List supported languages
POST /execute     — Execute code
```

**POST /execute** request:
```json
{
  "language": "python",
  "files": [{"name": "main.py", "content": "print('hello')"}],
  "stdin": "",
  "timeoutMs": 5000
}
```

**Response**:
```json
{
  "status": "success",
  "stdout": "hello\n",
  "stderr": "",
  "exitCode": 0,
  "ms": 142,
  "memoryKB": 12400,
  "engine": "DockerExecutionAdapter"
}
```

### Engine Modes

In Playground or Settings, choose:

- **Self-hosted Docker** — All 13 languages in your own containers (requires `docker compose up`)
- **Auto** — JS/TS in browser, others in Piston (public API)
- **Remote sandbox** — Everything in Piston
- **Browser only** — JS/TS in browser, others simulated
- **Simulated** — Everything simulated (offline mode)

### Troubleshooting

**Docker not reachable:**
```bash
# Check Docker is running
docker ps

# Rebuild the sandbox image
cd docker
docker compose down
docker compose up --build
```

**Execution server not starting:**
```bash
cd server
npm install
npm run build
npm start
```

**Frontend can't connect:**
- Check `VITE_CODE_EXECUTION_URL` in `.env` (default: `http://localhost:3001`)
- Ensure CORS is enabled in the server (it is by default)

## Architecture

```
src/
  lib/
    db.ts         localStorage store + useSyncExternalStore reactivity
    seed.ts       13 languages · 8 courses · 46 lessons · 22 challenges · 10 projects
    exec.ts       CodeExecutionService
                    ├─ BrowserSandboxAdapter  → REAL JS/TS (Web Worker, stdin, timeout)
                    └─ MockExecutionAdapter   → simulated, clearly labeled
    services.ts   auth / progress / XP / streaks / achievements / challenges /
                  community / notifications / admin / search
    ai.ts         AITutorService — HeuristicTutorAdapter (local) + LLM slot
  components/     UI kit, CodeEditor (highlighted editor), Layout, shell
  pages/          Landing, Account, Dashboard, Learn, Playground, Practice,
                  Projects, Community, AITutor, Docs, Admin
prisma/schema.prisma  production data model (1:1 with the local store)
.env.example          adapter configuration slots
```

## Adapter map (local → production)

| Concern | Active now | Production slot |
|---|---|---|
| Auth | LocalAuthAdapter (hashed, per-browser) | Supabase email/Google/GitHub |
| Database | localStorage store | PostgreSQL + Prisma (`prisma/schema.prisma`) |
| Execution JS/TS | BrowserSandboxAdapter — **real** | Keep as fast path |
| Execution other | MockExecutionAdapter — **simulated, UI-flagged** | Judge0 / Docker / Firecracker via `RealExecutionAdapter` |
| AI Tutor | HeuristicTutorAdapter — local | LLM behind `/api/ai` (key server-side only) |

## Known limits (honest)

- Python/C++/Java/Go/Rust/SQL run as **labeled simulations**; their challenge verdicts
  return `inconclusive` rather than faking passes.
- Monaco is swapped for a purpose-built highlighted editor (registry was unavailable);
  same component contract — drop-in replaceable.
- OAuth buttons are explicitly marked production-only, not fake.
