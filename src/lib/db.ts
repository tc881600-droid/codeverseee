import { useSyncExternalStore } from "react";
import type {
  User, Profile, Snippet, Submission, Notif, Post, CommentT, Report,
  ExecLog, Streak,
} from "./types";
import { buildSeed } from "./seed";

export interface DBShape {
  v: number;
  seededAt: number;
  currentUserId: string | null;
  users: User[];
  profiles: Profile[];
  /** userId -> lessonId -> { at, xp, runs } */
  lessonProgress: Record<string, Record<string, { at: number; xp: number; runs: number }>>;
  /** userId -> total xp */
  xp: Record<string, number>;
  streaks: Record<string, Streak>;
  /** userId -> achievementId -> unlockedAt */
  achievements: Record<string, Record<string, number>>;
  /** userId -> completed project task ids */
  tasks: Record<string, string[]>;
  snippets: Snippet[];
  submissions: Submission[];
  notifs: Notif[];
  posts: Post[];
  comments: CommentT[];
  /** "userId:postId" */
  likes: string[];
  /** "userId:postId" */
  bookmarks: string[];
  reports: Report[];
  executions: ExecLog[];
  /** admin overrides */
  admin: {
    languages: Record<string, boolean>; // slug -> enabled
    courses: Record<string, boolean>; // courseId -> published
    challenges: Record<string, boolean>; // challengeId -> published
  };
}

const KEY = "codeverse.db.v3";
let cache: DBShape | null = null;
const listeners = new Set<() => void>();

function persist(d: DBShape) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* quota */ }
}

function load(): DBShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as DBShape;
      if (d && d.v === 3 && Array.isArray(d.users)) return d;
    }
  } catch { /* corrupted -> reseed */ }
  const fresh = buildSeed();
  persist(fresh);
  return fresh;
}

export function getDB(): DBShape {
  if (!cache) cache = load();
  return cache;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

/** Apply a mutation, persist, and notify all subscribers. */
export function mutate<T>(fn: (d: DBShape) => T): T {
  const d = getDB();
  const result = fn(d);
  cache = { ...d };
  persist(cache);
  listeners.forEach((l) => l());
  return result;
}

export function useDB(): DBShape {
  return useSyncExternalStore(subscribe, getDB);
}

export function resetAll() {
  localStorage.removeItem(KEY);
  const fresh = buildSeed();
  cache = fresh;
  persist(fresh);
  listeners.forEach((l) => l());
}

/* ---------- small utils ---------- */

export const uid = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);

export const todayKey = (offset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

/** Demo-grade hash — NOT cryptographic. Local adapter only; Supabase Auth handles real credentials. */
export function hashPass(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16) + "." + s.length;
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

export function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/* ---------- leveling ---------- */

export function levelFromXp(xp: number): { level: number; into: number; span: number } {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
  const base = 50 * (level - 1) * (level - 1);
  const next = 50 * level * level;
  return { level, into: xp - base, span: next - base };
}

export const LEVEL_TITLES = [
  "Blank Terminal", "Syntax Scout", "Loop Wrangler", "Function Smith", "Debug Hunter",
  "Stack Juggler", "Refactor Rogue", "Async Acrobat", "Memory Tamer", "Type Alchemist",
  "Pattern Sage", "System Architect", "Kernel Whisperer", "Grandmaster",
];

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}
