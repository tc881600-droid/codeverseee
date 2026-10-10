import type {
  User, Challenge, Course, Lesson, Notif, UserStats, AchievementDef, Snippet,
} from "./types";
import { getDB, mutate, uid, hashPass, todayKey, levelFromXp, type DBShape } from "./db";
import { ACHIEVEMENTS, CHALLENGES, COURSES, LANGUAGES, LESSONS, PROJECTS } from "./seed";
import { auth, supabase } from "./supabase";

/* ================= AUTH (Supabase Integration) =================
 * Using Supabase for authentication with email/password and Google OAuth.
 * Local database is used for demo data and offline functionality.
 */

export type AuthResult = { ok: true; user: User } | { ok: false; error: string };

export const currentUser = (db: DBShape): User | null =>
  db.users.find((u) => u.id === db.currentUserId) ?? null;

export async function register(email: string, username: string, password: string): Promise<AuthResult> {
  email = email.trim().toLowerCase();
  username = username.trim().toLowerCase();

  // Validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  if (!/^[a-z0-9_]{3,20}$/.test(username)) return { ok: false, error: "Username: 3–20 chars, letters, numbers, underscore." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  // Try Supabase signup FIRST - let Supabase be the source of truth
  const { data, error } = await auth.signUp(email, password, username);

  if (error) {
    // Supabase returned an error - handle it properly
    if (error.message?.includes("already registered") || error.message?.includes("already exists")) {
      return { ok: false, error: "An account with this email already exists." };
    }
    // For other errors, show the Supabase error message
    console.error("Supabase signup failed:", error.message);
    return { ok: false, error: error.message || "Signup failed. Please try again." };
  }

  // Supabase signup successful - now create local user record
  if (!data?.user) {
    return { ok: false, error: "Signup failed. Please try again." };
  }

  // Create local user record using Supabase user ID
  const user: User = {
    id: data.user.id, // Always use Supabase Auth UID
    email,
    username,
    passHash: hashPass(password),
    role: "user",
    suspended: false,
    provider: "supabase",
    createdAt: Date.now(),
  };

  // Create profile in Supabase if signup was successful
  if (data?.user?.id) {
    const { error: profileError } = await auth.createProfile(
      data.user.id,
      username,
      email
    );

    if (profileError) {
      console.error("Failed to create Supabase profile:", profileError);
      // Continue anyway - local profile will still be created
    }
  }

  mutate((d) => {
    d.users.push(user);
    d.profiles.push({
      userId: user.id,
      displayName: username,
      title: "New developer",
      bio: "Just landed in the Verse.",
      hue: Math.floor(Math.random() * 360),
    });
    d.currentUserId = user.id;
    d.notifs.unshift({
      id: uid(),
      userId: user.id,
      kind: "system",
      title: "Welcome to CodeVerse",
      body: "Pick a language, run real code in the Playground, and start your streak.",
      at: Date.now(),
      read: false,
    });
  });

  return { ok: true, user };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  email = email.trim().toLowerCase();

  // Try Supabase login first
  const { data, error } = await auth.signIn(email, password);

  if (error) {
    // Fall back to local auth if Supabase fails
    console.warn("Supabase login failed, trying local auth:", error.message);
    const db = getDB();
    const user = db.users.find((u) => u.email === email);
    if (!user || user.passHash !== hashPass(password)) {
      return { ok: false, error: error.message || "Invalid email or password." };
    }
    if (user.suspended) return { ok: false, error: "This account is suspended. Contact an administrator." };
    mutate((d) => { d.currentUserId = user.id; });
    return { ok: true, user };
  }

  // Supabase login successful
  const db = getDB();
  let user = db.users.find((u) => u.email === email);

  if (!user) {
    // Create local user record for Supabase user
    if (!data.user?.id) {
      return { ok: false, error: "Login failed. Please try again." };
    }
    user = {
      id: data.user.id, // Always use Supabase Auth UID
      email,
      username: data.user.user_metadata?.username || email.split('@')[0],
      passHash: "",
      role: "user",
      suspended: false,
      provider: "supabase",
      createdAt: Date.now(),
    };
    mutate((d) => {
      d.users.push(user!);
      d.profiles.push({
        userId: user!.id,
        displayName: user!.username,
        title: "New developer",
        bio: "Signed in with Supabase.",
        hue: Math.floor(Math.random() * 360),
      });
    });

    // Create profile in Supabase if it doesn't exist
    if (data.user?.id) {
      const { error: profileError } = await auth.createProfile(
        data.user.id,
        user.username,
        email
      );

      if (profileError) {
        console.error("Failed to create Supabase profile on login:", profileError);
      }
    }
  }

  if (user.suspended) return { ok: false, error: "This account is suspended. Contact an administrator." };
  mutate((d) => { d.currentUserId = user!.id; });
  return { ok: true, user };
}

export function loginAsDemo(): AuthResult {
  const db = getDB();
  const user = db.users.find((u) => u.id === "u-demo");
  if (!user) return { ok: false, error: "Demo user missing — reset the local database from Settings." };
  mutate((d) => { d.currentUserId = user.id; });
  return { ok: true, user };
}

/**
 * Google OAuth — Supabase integration
 */
export async function loginWithGoogle(): Promise<AuthResult> {
  const { data, error } = await auth.signInWithGoogle();

  if (error) {
    return { ok: false, error: error.message || "Google sign-in failed." };
  }

  // The actual user creation will happen after OAuth redirect
  // For now, return a pending state
  return { ok: false, error: "Redirecting to Google..." };
}

/**
 * Logout — clears both Supabase and local session
 */
export async function logout(): Promise<void> {
  // Clear Supabase session
  await auth.signOut();

  // Clear local session
  mutate((d) => {
    d.currentUserId = null;
  });
}

/**
 * Initialize session — checks for existing Supabase session on app load
 */
export async function initializeSession(): Promise<void> {
  const { session } = await auth.getSession();

  if (session?.user) {
    const db = getDB();
    const email = session.user.email;

    if (email) {
      let user = db.users.find((u) => u.email === email);

      if (!user) {
        // Create local user record for existing Supabase user
        user = {
          id: session.user.id,
          email,
          username: session.user.user_metadata?.username || email.split('@')[0],
          passHash: "",
          role: "user",
          suspended: false,
          provider: "supabase",
          createdAt: Date.now(),
        };
        mutate((d) => {
          d.users.push(user!);
          d.profiles.push({
            userId: user!.id,
            displayName: user!.username,
            title: "Developer",
            bio: "Signed in with Supabase.",
            hue: Math.floor(Math.random() * 360),
          });
        });

        // Ensure profile exists in Supabase
        const { error: profileError } = await auth.createProfile(
          session.user.id,
          user.username,
          email
        );

        if (profileError) {
          console.error("Failed to create Supabase profile on session init:", profileError);
        }
      }

      mutate((d) => {
        d.currentUserId = user!.id;
      });
    }
  }
}

export function updateProfile(userId: string, patch: { displayName?: string; title?: string; bio?: string }) {
  mutate((d) => {
    const p = d.profiles.find((x) => x.userId === userId);
    if (p) Object.assign(p, patch);
  });
}

/* ================= STATS / GAMIFICATION ================= */

export function getUserStats(db: DBShape, userId: string): UserStats {
  const lp = db.lessonProgress[userId] || {};
  const lessons = Object.keys(lp).length;
  const accepted = db.submissions.filter((s) => s.userId === userId && s.verdict === "accepted");
  const challenges = new Set(accepted.map((s) => s.challengeId)).size;
  const runs = db.executions.filter((e) => e.userId === userId).length;
  const languages = new Set(db.executions.filter((e) => e.userId === userId).map((e) => e.language)).size;
  const snippets = db.snippets.filter((s) => s.userId === userId).length;
  const posts = db.posts.filter((p) => p.authorId === userId).length;
  const tasks = (db.tasks[userId] || []).length;
  const streak = db.streaks[userId]?.current ?? 0;
  const bestStreak = db.streaks[userId]?.best ?? 0;
  const xp = db.xp[userId] ?? 0;

  let courses = 0;
  for (const c of COURSES) {
    const cls = LESSONS.filter((l) => l.courseId === c.id);
    if (cls.length > 0 && cls.every((l) => lp[l.id])) courses++;
  }

  const minutes =
    LESSONS.filter((l) => lp[l.id]).reduce((a, l) => a + l.minutes, 0) +
    tasks * 18 + accepted.length * 9;

  return { xp, level: levelFromXp(xp).level, lessons, challenges, runs, languages, snippets, posts, tasks, streak, bestStreak, courses, minutes };
}

export interface ProgressEvent {
  xpGained: number;
  newAchievements: AchievementDef[];
  levelBefore: number;
  levelAfter: number;
  streak: number;
}

function bumpStreak(d: DBShape, userId: string): number {
  const today = todayKey();
  const s = d.streaks[userId] || { current: 0, best: 0, lastDay: "" };
  if (s.lastDay !== today) {
    const yesterday = todayKey(-1);
    s.current = s.lastDay === yesterday ? s.current + 1 : 1;
    s.lastDay = today;
    s.best = Math.max(s.best, s.current);
    d.streaks[userId] = s;
  }
  return s.current;
}

function checkAchievements(d: DBShape, userId: string): AchievementDef[] {
  const stats = getUserStats(d as DBShape, userId);
  const owned = d.achievements[userId] || (d.achievements[userId] = {});
  const fresh: AchievementDef[] = [];
  for (const a of ACHIEVEMENTS) {
    if (owned[a.id]) continue;
    const val = stats[a.metric];
    if (val >= a.threshold) {
      owned[a.id] = Date.now();
      fresh.push(a);
      d.notifs.unshift({
        id: uid(), userId, kind: "achievement", title: `Achievement unlocked — ${a.name}`,
        body: a.desc, at: Date.now(), read: false,
      });
    }
  }
  return fresh;
}

function award(d: DBShape, userId: string, amount: number) {
  d.xp[userId] = (d.xp[userId] ?? 0) + amount;
}

export function completeLesson(userId: string, lesson: Lesson): ProgressEvent {
  const db0 = getDB();
  const before = levelFromXp(db0.xp[userId] ?? 0).level;
  let ev: ProgressEvent = { xpGained: 0, newAchievements: [], levelBefore: before, levelAfter: before, streak: 0 };

  mutate((d) => {
    const lp = d.lessonProgress[userId] || (d.lessonProgress[userId] = {});
    if (lp[lesson.id]) { ev.streak = d.streaks[userId]?.current ?? 0; return; }
    lp[lesson.id] = { at: Date.now(), xp: lesson.xp, runs: 0 };
    award(d, userId, lesson.xp);
    const streak = bumpStreak(d, userId);
    const fresh = checkAchievements(d, userId);

    const course = COURSES.find((c) => c.id === lesson.courseId);
    const all = LESSONS.filter((l) => l.courseId === lesson.courseId);
    const done = all.every((l) => (d.lessonProgress[userId] || {})[l.id]);
    if (course && done) {
      award(d, userId, 50);
      d.notifs.unshift({
        id: uid(), userId, kind: "course", title: `Course complete — ${course.title}`,
        body: "Every lesson finished. Bonus +50 XP awarded.", at: Date.now(), read: false,
      });
    }
    const after = levelFromXp(d.xp[userId] ?? 0).level;
    if (after > before) {
      d.notifs.unshift({
        id: uid(), userId, kind: "milestone", title: `Level ${after} reached`,
        body: "Your consistency is compounding. Keep shipping.", at: Date.now(), read: false,
      });
    }
    ev = { xpGained: lesson.xp + (done ? 50 : 0), newAchievements: fresh, levelBefore: before, levelAfter: after, streak };
  });
  return ev;
}

export function recordLessonRun(userId: string | null, lessonId: string) {
  if (!userId) return;
  mutate((d) => {
    const lp = d.lessonProgress[userId] || (d.lessonProgress[userId] = {});
    if (lp[lessonId]) lp[lessonId].runs += 1;
  });
}

export function submitChallenge(userId: string, challenge: Challenge, result: { passed: number; total: number; verdict: "accepted" | "failed" | "inconclusive"; simulated: boolean; ms: number; code: string }) {
  const accepted = result.verdict === "accepted";
  const db0 = getDB();
  const firstSolve = accepted && !db0.submissions.some((s) => s.userId === userId && s.challengeId === challenge.id && s.verdict === "accepted");
  const before = levelFromXp(db0.xp[userId] ?? 0).level;
  let fresh: AchievementDef[] = [];

  mutate((d) => {
    d.submissions.unshift({
      id: uid(), userId, challengeId: challenge.id, language: challenge.language,
      code: result.code, passed: result.passed, total: result.total,
      verdict: result.verdict, simulated: result.simulated, ms: result.ms, at: Date.now(),
    });
    if (accepted && firstSolve) {
      award(d, userId, challenge.points);
      bumpStreak(d, userId);
      d.notifs.unshift({
        id: uid(), userId, kind: "challenge", title: `Challenge accepted: ${challenge.title}`,
        body: `${result.passed}/${result.total} tests passed in ${result.ms}ms. +${challenge.points} XP.`,
        at: Date.now(), read: false,
      });
    }
    fresh = checkAchievements(d, userId);
  });
  const after = levelFromXp(getDB().xp[userId] ?? 0).level;
  return { firstSolve, xpGained: accepted && firstSolve ? challenge.points : 0, newAchievements: fresh, levelAfter: after, levelBefore: before };
}

export function toggleProjectTask(userId: string, taskId: string, xp: number): { done: boolean; newAchievements: AchievementDef[] } {
  let done = false;
  let fresh: AchievementDef[] = [];
  mutate((d) => {
    const list = d.tasks[userId] || (d.tasks[userId] = []);
    const idx = list.indexOf(taskId);
    if (idx >= 0) {
      list.splice(idx, 1);
      award(d, userId, -xp);
      d.xp[userId] = Math.max(0, d.xp[userId]);
    } else {
      list.push(taskId);
      award(d, userId, xp);
      bumpStreak(d, userId);
      done = true;
    }
    fresh = checkAchievements(d, userId);
  });
  return { done, newAchievements: fresh };
}

/* ================= NOTIFICATIONS ================= */

export function markAllRead(userId: string) {
  mutate((d) => { d.notifs.forEach((n) => { if (n.userId === userId) n.read = true; }); });
}

export function notify(userId: string, kind: Notif["kind"], title: string, body: string) {
  mutate((d) => { d.notifs.unshift({ id: uid(), userId, kind, title, body, at: Date.now(), read: false }); });
}

/* ================= PLAYGROUND ================= */

export function saveSnippet(userId: string, data: { id?: string; name: string; language: string; files: { name: string; content: string }[]; stdin: string }): Snippet {
  const id = data.id || uid();
  let saved: Snippet = { id, userId, name: data.name, language: data.language, files: data.files, stdin: data.stdin, updatedAt: Date.now() };
  mutate((d) => {
    const idx = d.snippets.findIndex((s) => s.id === id && s.userId === userId);
    if (idx >= 0) d.snippets[idx] = saved;
    else d.snippets.unshift(saved);
    checkAchievements(d, userId);
  });
  return saved;
}

export function deleteSnippet(userId: string, id: string) {
  mutate((d) => { d.snippets = d.snippets.filter((s) => !(s.id === id && s.userId === userId)); });
}

export const PLAYGROUND_TEMPLATES: Record<string, { name: string; content: string }[]> = {
  python: [{ name: "main.py", content: '# CodeVerse Playground — Python, running in a Docker sandbox container\nname = "Verse"\nversion = 3.12\n\nprint(f"Hello from {name}!")\nprint("Python", version)\nprint("Sum:", 40 + 2)\n\n# stdin is live too:\n# line = input()\n' }],
  javascript: [{ name: "main.js", content: '// CodeVerse Playground — JavaScript (REAL execution in your browser)\nconst greet = (name) => `Hello, ${name}!`;\n\nconsole.log(greet("Verse"));\n\nconst nums = [3, 1, 4, 1, 5];\nconst sum = nums.reduce((a, n) => a + n, 0);\nconsole.log("sum:", sum);\n\n// stdin is available via readLine():\n// const line = readLine();\n' }],
  typescript: [{ name: "main.ts", content: '// CodeVerse Playground — TypeScript (REAL execution: transpiled, then run)\ninterface Runner {\n  name: string;\n  pace: number;\n}\n\nconst describe = (r: Runner): string => `${r.name} runs ${r.pace} min/km`;\n\nconst ada: Runner = { name: "Ada", pace: 5.2 };\nconsole.log(describe(ada));\n' }],
  c: [{ name: "main.c", content: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, CodeVerse!\\n");\n    return 0;\n}\n' }],
  cpp: [{ name: "main.cpp", content: '#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> nums{3, 1, 4};\n    int sum = 0;\n    for (int n : nums) sum += n;\n    std::cout << "sum: " << sum << std::endl;\n    return 0;\n}\n' }],
  java: [{ name: "Main.java", content: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeVerse!");\n        System.out.println("sum: " + (40 + 2));\n    }\n}\n' }],
  go: [{ name: "main.go", content: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, CodeVerse!")\n    fmt.Println("sum:", 40+2)\n}\n' }],
  rust: [{ name: "main.rs", content: 'fn main() {\n    let nums = vec![3, 1, 4];\n    let sum: i32 = nums.iter().sum();\n    println!("Hello, CodeVerse!");\n    println!("sum: {}", sum);\n}\n' }],
  php: [{ name: "index.php", content: "<?php\necho \"Hello, CodeVerse!\\n\";\n$sum = 40 + 2;\necho \"sum: $sum\\n\";\n" }],
  csharp: [{ name: "Program.cs", content: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, CodeVerse!");\n        Console.WriteLine($"sum: {40 + 2}");\n    }\n}\n' }],
  kotlin: [{ name: "main.kt", content: 'fun main() {\n    println("Hello, CodeVerse!")\n    val sum = listOf(3, 1, 4).sum()\n    println("sum: $sum")\n}\n' }],
  dart: [{ name: "main.dart", content: 'void main() {\n  print("Hello, CodeVerse!");\n  final sum = [3, 1, 4].reduce((a, b) => a + b);\n  print("sum: $sum");\n}\n' }],
  sql: [{ name: "query.sql", content: "-- CodeVerse Playground — SQL, executed on a live sqlite3 container\nCREATE TABLE users (name TEXT, xp INT);\nINSERT INTO users VALUES ('ada', 220), ('grace', 95), ('edsger', 310), ('barbara', 180);\n\nSELECT name, xp\nFROM users\nWHERE xp >= 100\nORDER BY xp DESC\nLIMIT 5;\n" }],
  html: [{ name: "index.html", content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>CodeVerse HTML Playground</title>\n  <style>\n    body {\n      font-family: system-ui, -apple-system, sans-serif;\n      max-width: 800px;\n      margin: 50px auto;\n      padding: 20px;\n      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n      color: white;\n    }\n    .card {\n      background: rgba(255, 255, 255, 0.95);\n      border-radius: 12px;\n      padding: 30px;\n      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);\n      color: #333;\n    }\n    h1 {\n      margin-top: 0;\n      color: #667eea;\n    }\n    button {\n      background: #667eea;\n      color: white;\n      border: none;\n      padding: 12px 24px;\n      border-radius: 6px;\n      font-size: 16px;\n      cursor: pointer;\n      transition: transform 0.2s;\n    }\n    button:hover {\n      transform: translateY(-2px);\n    }\n  </style>\n</head>\n<body>\n  <div class="card">\n    <h1>🚀 Welcome to CodeVerse!</h1>\n    <p>This is your HTML playground. Edit the code and see it render live!</p>\n    <button onclick="alert(\'Hello from HTML!\')">Click Me</button>\n  </div>\n</body>\n</html>' }],
  css: [{ name: "styles.css", content: '/* CodeVerse CSS Playground */\n/* Write your CSS here and see it applied in the preview */\n\nbody {\n  font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif;\n  margin: 0;\n  padding: 40px;\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  min-height: 100vh;\n}\n\n.container {\n  max-width: 600px;\n  margin: 0 auto;\n  background: white;\n  padding: 40px;\n  border-radius: 16px;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);\n}\n\nh1 {\n  color: #667eea;\n  margin-bottom: 20px;\n}\n\n.box {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  color: white;\n  padding: 30px;\n  border-radius: 12px;\n  text-align: center;\n  margin: 20px 0;\n  transition: transform 0.3s ease;\n}\n\n.box:hover {\n  transform: scale(1.05);\n}\n\n.btn {\n  display: inline-block;\n  background: #667eea;\n  color: white;\n  padding: 12px 30px;\n  border-radius: 25px;\n  text-decoration: none;\n  font-weight: bold;\n  transition: all 0.3s ease;\n}\n\n.btn:hover {\n  background: #764ba2;\n  transform: translateY(-3px);\n  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);\n}' }],
};

/* ================= COMMUNITY ================= */

export function createPost(userId: string, data: { kind: "question" | "share" | "discussion"; title: string; body: string; tags: string[] }): { ok: boolean; error?: string; id?: string } {
  if (data.title.trim().length < 8) return { ok: false, error: "Title needs at least 8 characters." };
  if (data.body.trim().length < 20) return { ok: false, error: "Body needs at least 20 characters." };
  const id = uid();
  mutate((d) => {
    d.posts.unshift({ id, authorId: userId, kind: data.kind, title: data.title.trim(), body: data.body.trim(), tags: data.tags.slice(0, 4), at: Date.now() });
    checkAchievements(d, userId);
  });
  return { ok: true, id };
}

export function addComment(userId: string, postId: string, body: string): { ok: boolean; error?: string } {
  if (body.trim().length < 3) return { ok: false, error: "Comment is too short." };
  const db = getDB();
  const post = db.posts.find((p) => p.id === postId);
  mutate((d) => {
    d.comments.push({ id: uid(), postId, authorId: userId, body: body.trim(), at: Date.now() });
  });
  if (post && post.authorId !== userId) {
    const author = db.users.find((u) => u.id === post.authorId);
    const me = db.users.find((u) => u.id === userId);
    notify(post.authorId, "community", `${me?.username ?? "Someone"} commented on your post`, `"${body.trim().slice(0, 80)}${body.length > 80 ? "…" : ""}" on "${post.title}"`, );
    void author;
  }
  return { ok: true };
}

export function toggleLike(userId: string, postId: string): boolean {
  const key = `${userId}:${postId}`;
  let liked = false;
  mutate((d) => {
    const i = d.likes.indexOf(key);
    if (i >= 0) d.likes.splice(i, 1);
    else { d.likes.push(key); liked = true; }
  });
  return liked;
}

export function toggleBookmark(userId: string, postId: string): boolean {
  const key = `${userId}:${postId}`;
  let marked = false;
  mutate((d) => {
    const i = d.bookmarks.indexOf(key);
    if (i >= 0) d.bookmarks.splice(i, 1);
    else { d.bookmarks.push(key); marked = true; }
  });
  return marked;
}

export function reportPost(userId: string, postId: string, reason: string): { ok: boolean; error?: string } {
  if (reason.trim().length < 5) return { ok: false, error: "Give moderators a little more detail." };
  mutate((d) => { d.reports.unshift({ id: uid(), postId, byId: userId, reason: reason.trim(), at: Date.now(), resolved: false }); });
  return { ok: true };
}

/* ================= ADMIN ================= */

export function adminSetSuspended(userId: string, suspended: boolean) {
  mutate((d) => { const u = d.users.find((x) => x.id === userId); if (u) u.suspended = suspended; });
}
export function adminSetRole(userId: string, role: "user" | "admin") {
  mutate((d) => { const u = d.users.find((x) => x.id === userId); if (u) u.role = role; });
}
export function adminToggleLanguage(slug: string, enabled: boolean) {
  mutate((d) => { d.admin.languages[slug] = enabled; });
}
export function adminToggleCourse(courseId: string, published: boolean) {
  mutate((d) => { d.admin.courses[courseId] = published; });
}
export function adminToggleChallenge(challengeId: string, published: boolean) {
  mutate((d) => { d.admin.challenges[challengeId] = published; });
}
export function adminResolveReport(id: string) {
  mutate((d) => { const r = d.reports.find((x) => x.id === id); if (r) r.resolved = true; });
}

export const isLangEnabled = (db: DBShape, slug: string): boolean => {
  const base = LANGUAGES.find((l) => l.slug === slug)?.enabled ?? true;
  return db.admin.languages[slug] ?? base;
};
export const isCoursePublished = (db: DBShape, id: string): boolean => {
  const base = COURSES.find((c) => c.id === id)?.published ?? true;
  return db.admin.courses[id] ?? base;
};
export const isChallengePublished = (db: DBShape, id: string): boolean => {
  const base = CHALLENGES.find((c) => c.id === id)?.published ?? true;
  return db.admin.challenges[id] ?? base;
};

/* ================= SEARCH ================= */

export interface SearchHit {
  type: "language" | "course" | "lesson" | "challenge" | "project" | "post" | "doc";
  title: string;
  sub: string;
  to: string;
}

export function searchAll(db: DBShape, q: string): SearchHit[] {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  const hits: SearchHit[] = [];
  const has = (...parts: (string | string[])[]) =>
    parts.some((p) => (Array.isArray(p) ? p.join(" ") : p).toLowerCase().includes(s));

  LANGUAGES.filter((l) => isLangEnabled(db, l.slug)).forEach((l) => {
    if (has(l.name, l.tagline, l.paradigms)) hits.push({ type: "language", title: l.name, sub: l.tagline, to: `/languages/${l.slug}` });
  });
  COURSES.filter((c) => isCoursePublished(db, c.id)).forEach((c) => {
    if (has(c.title, c.description, c.skills)) hits.push({ type: "course", title: c.title, sub: `${c.level} · course`, to: `/learn/${c.slug}` });
  });
  LESSONS.forEach((l) => {
    if (has(l.title, l.summary)) {
      const course = COURSES.find((c) => c.id === l.courseId);
      if (course && isCoursePublished(db, course.id)) hits.push({ type: "lesson", title: l.title, sub: course.title, to: `/lesson/${l.id}` });
    }
  });
  CHALLENGES.filter((c) => isChallengePublished(db, c.id)).forEach((c) => {
    if (has(c.title, c.category, c.tags)) hits.push({ type: "challenge", title: c.title, sub: `${c.difficulty} · ${c.points} pts`, to: `/challenge/${c.slug}` });
  });
  PROJECTS.forEach((p) => {
    if (has(p.title, p.description, p.outcomes)) hits.push({ type: "project", title: p.title, sub: `${p.level} · ~${p.hours}h project`, to: `/projects/${p.slug}` });
  });
  db.posts.forEach((p) => {
    if (has(p.title, p.body, p.tags)) hits.push({ type: "post", title: p.title, sub: "Community", to: `/community/${p.id}` });
  });
  return hits.slice(0, 18);
}

/* ================= RECOMMENDATIONS ================= */

export function recommendCourses(db: DBShape, userId: string): Course[] {
  const lp = db.lessonProgress[userId] || {};
  const scored = COURSES.filter((c) => isCoursePublished(db, c.id)).map((c) => {
    const lessons = LESSONS.filter((l) => l.courseId === c.id);
    const done = lessons.filter((l) => lp[l.id]).length;
    const pct = lessons.length ? done / lessons.length : 0;
    const lang = LANGUAGES.find((l) => l.slug === c.language);
    return { c, score: (pct > 0 && pct < 1 ? 2 : pct === 0 ? 1 : 0) * 10 + (lang?.usage ?? 50) / 10 };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.c);
}
