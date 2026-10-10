export type Role = "user" | "admin";

export interface User {
  id: string;
  email: string;
  username: string;
  passHash: string;
  role: Role;
  suspended: boolean;
  provider: "local" | "demo" | "supabase" | "google" | "github";
  createdAt: number;
}

export interface Profile {
  userId: string;
  displayName: string;
  title: string;
  bio: string;
  hue: number;
}

export interface Language {
  slug: string;
  name: string;
  short: string; // 2-3 letter mark
  color: string;
  tagline: string;
  paradigms: string[];
  firstYear: number;
  version: string;
  extension: string;
  monaco: string;
  enabled: boolean;
  usage: number; // popularity weight 0-100
}

export interface LessonSection {
  h?: string;
  p?: string;
  code?: string;
  lang?: string;
  list?: string[];
}

export interface Lesson {
  id: string;
  courseId: string;
  module: string;
  order: number;
  title: string;
  minutes: number;
  xp: number;
  summary: string;
  sections: LessonSection[];
  exercise?: { prompt: string; starter: string; hint: string };
  takeaways: string[];
}

export interface Course {
  id: string;
  slug: string;
  language: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  hue: number;
  published: boolean;
  skills: string[];
}

export interface ChallengeTest {
  name: string;
  args?: unknown[];
  stdin?: string;
  expected: unknown;
  hidden?: boolean;
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  language: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  tags: string[];
  points: number;
  description: string[];
  constraints: string[];
  sample?: { input: string; output: string };
  starter: string;
  fnName: string;
  /** "fn" = function-call judging (JS/TS/Py) · "io" = stdin/stdout judging (any language) */
  mode?: "fn" | "io";
  tests: ChallengeTest[];
  published: boolean;
}

export interface ProjectTask {
  id: string;
  title: string;
  desc: string;
  xp: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  language: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  hours: number;
  description: string;
  outcomes: string[];
  tasks: ProjectTask[];
  hue: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string; // lucide icon name key
  metric: "lessons" | "challenges" | "xp" | "streak" | "runs" | "languages" | "snippets" | "posts" | "tasks" | "courses";
  threshold: number;
}

export interface SnippetFile {
  name: string;
  content: string;
}

export interface Snippet {
  id: string;
  userId: string;
  name: string;
  language: string;
  files: SnippetFile[];
  stdin: string;
  updatedAt: number;
}

export interface Submission {
  id: string;
  userId: string;
  challengeId: string;
  language: string;
  code: string;
  passed: number;
  total: number;
  verdict: "accepted" | "failed" | "inconclusive";
  simulated: boolean;
  ms: number;
  at: number;
}

export interface Notif {
  id: string;
  userId: string;
  kind: "achievement" | "challenge" | "community" | "system" | "course" | "milestone";
  title: string;
  body: string;
  at: number;
  read: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  kind: "question" | "share" | "discussion";
  title: string;
  body: string;
  tags: string[];
  at: number;
}

export interface CommentT {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  at: number;
}

export interface Report {
  id: string;
  postId: string;
  byId: string;
  reason: string;
  at: number;
  resolved: boolean;
}

export interface ExecLog {
  id: string;
  userId: string | null;
  language: string;
  status: string;
  simulated: boolean;
  ms: number;
  at: number;
}

export interface Streak {
  current: number;
  best: number;
  lastDay: string; // YYYY-MM-DD
}

export interface DocTopic {
  slug: string;
  title: string;
  minutes: number;
  intro: string;
  sections: LessonSection[];
  example: { name: string; code: string };
}

export interface ChatMsg {
  id: string;
  role: "user" | "tutor";
  text: string;
  at: number;
  mode?: string;
}

export type ExecStatus =
  | "queued"
  | "running"
  | "success"
  | "compile_error"
  | "runtime_error"
  | "timeout"
  | "memory_limit"
  | "system_error";

export interface ExecutionResult {
  status: ExecStatus;
  stdout: string;
  stderr: string;
  ms: number;
  memoryKB: number | null;
  simulated: boolean;
  engine: string;
  exitCode: number;
  interactive?: boolean;
}

export interface UserStats {
  xp: number;
  level: number;
  lessons: number;
  challenges: number;
  runs: number;
  languages: number;
  snippets: number;
  posts: number;
  tasks: number;
  streak: number;
  bestStreak: number;
  courses: number;
  minutes: number;
}
