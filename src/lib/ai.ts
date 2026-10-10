/**
 * AI Tutor Service
 * ----------------
 * Provides intelligent coding assistance using Groq AI.
 * Handles code explanations, error diagnosis, code review, optimization,
 * language conversion, hints, and practice problem generation.
 */

export interface TutorRequest {
  mode:
    | "explain"
    | "error"
    | "review"
    | "hint"
    | "optimize"
    | "convert"
    | "practice";
  prompt: string;
  code?: string;
  error?: string;
  language?: string;
  targetLanguage?: string;
}

const GROQ_API_KEY = "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Groq API call function
async function callGroqAPI(messages: any[]): Promise<string | null> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      console.error("Groq API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error("Groq API call failed:", error);
    return null;
  }
}

const CONCEPTS: Record<
  string,
  { keywords: string[]; text: (lang: string) => string }
> = {
  loop: {
    keywords: ["loop", "for ", "while", "iterate", "iteration"],
    text: (lang) =>
      `**Loops** repeat a block of work without repeating code. The two universal forms:\n\n- **for** — iterate a known sequence or range\n- **while** — repeat until a condition flips\n\n\`\`\`${lang}\n// sum 1..5\nlet total = 0;\nfor (let i = 1; i <= 5; i++) total += i;\n// total === 15\n\`\`\`\n\nMental model: a loop is a cursor plus a stopping rule. Most "infinite loop" bugs are a stopping rule that never becomes false — check what *changes* inside the body.`,
  },
  recursion: {
    keywords: ["recursion", "recursive", "base case"],
    text: (lang) =>
      `**Recursion** solves a problem by calling a smaller copy of itself.\n\nEvery recursive function needs exactly two things:\n1. A **base case** that returns without recursing\n2. A **recursive step** that moves toward the base case\n\n\`\`\`${lang}\nfunction factorial(n) {\n  if (n <= 1) return 1;        // base case\n  return n * factorial(n - 1); // smaller problem\n}\n\`\`\`\n\nIf you can't name both parts, the function will stack-overflow. When in doubt, ask: "what input makes this stop?"`,
  },
  closure: {
    keywords: ["closure", "closures", "capture"],
    text: () =>
      `A **closure** is a function plus the variables it can see from its birthplace.\n\nWhen \`counter()\` returns the inner arrow, the outer \`n\` doesn't die — the returned function carries a reference to it (engines store these in a heap-allocated *context object*).\n\n\`\`\`js\nfunction counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst tick = counter();\ntick(); tick(); // 1, 2 — n survived\n\`\`\`\n\nWhy it matters: closures are how JavaScript does private state, memoization, debouncing, and callbacks that remember.`,
  },
  async: {
    keywords: ["async", "await", "promise", "promises", "event loop"],
    text: () =>
      `**async/await** is syntax over promises. JavaScript runs one thing at a time; long work (network, timers) happens off-thread and *reports back* through the event queue.\n\n\`\`\`js\nconst user = await fetch("/api/me").then(r => r.json());\n// execution PAUSES here — the thread is NOT blocked\n\`\`\`\n\nRules that prevent 90% of async bugs:\n- \`await\` only works inside \`async\` functions (or module top level)\n- a rejected promise without \`try/catch\` is an unhandled rejection\n- \`await\` in a loop is sequential; \`Promise.all\` is parallel`,
  },
  pointer: {
    keywords: ["pointer", "pointers", "address", "dereference"],
    text: () =>
      `A **pointer** stores a memory *address*. Two operators run the whole show:\n\n- \`&x\` — "the address of x"\n- \`*p\` — "the value at the address p holds"\n\n\`\`\`cpp\nint x = 42;\nint* p = &x;  // p -> [42]\n*p = 7;       // follow the arrow, write there\n// x is now 7\n\`\`\`\n\nDraw it: a box for \`x\` with its value, an arrow from \`p\` to the box. Every pointer confusion I've seen dissolves once you sketch the arrow. A pointer to nothing must be \`nullptr\` — checking it is not optional.`,
  },
  oop: {
    keywords: [
      "class",
      "classes",
      "object",
      "oop",
      "inheritance",
      "constructor",
    ],
    text: (lang) =>
      `**Classes** bundle state (fields) with the behavior (methods) that operates on it. The constructor initializes a fresh instance; \`this\`/\`self\` refers to "the one being worked on right now".\n\n\`\`\`${lang === "python" ? "python" : "js"}\n${
        lang === "python"
          ? "class Account:\n    def __init__(self, owner):\n        self.owner = owner\n        self.balance = 0\n\n    def deposit(self, amount):\n        self.balance += amount"
          : "class Account {\n  constructor(owner) {\n    this.owner = owner;\n    this.balance = 0;\n  }\n  deposit(amount) { this.balance += amount; }\n}"
      }\n\`\`\`\n\nDesign tip: favor small classes that own one concept. When a class grows a second reason to change, split it.`,
  },
  array: {
    keywords: ["array", "arrays", "list", "lists", "slice"],
    text: (lang) =>
      `**${lang === "python" ? "Lists" : "Arrays"}** are ordered, indexed, zero-based collections. Index \`0\` is the first element; index \`-1\` (in Python/JS) is the last.\n\nThe operations that matter daily:\n- access by index — O(1)\n- append/push at the end — O(1) amortized\n- insert/delete in the middle — O(n), everything shifts\n- search by value — O(n) unless you keep it sorted or use a set/map\n\nWhen you're doing "search by value" in a hot loop, that's the cue to reach for a hash map/set instead.`,
  },
  map: {
    keywords: ["dict", "dictionary", "object", "hashmap", "hash map", "map "],
    text: () =>
      `A **map** (dict / object / HashMap) stores *key → value* pairs with ~O(1) lookup by key.\n\n\`\`\`js\nconst xp = { ada: 120, grace: 95 };\nxp["ada"];        // 120\nxp["new"] ?? 0;   // safe default for missing keys\n\`\`\`\n\nUse one whenever you catch yourself scanning an array to find something. Classic upgrade: counting occurrences — loop once, bump \`counts[key]\`.`,
  },
  join: {
    keywords: ["join", "joins", "sql", "foreign key"],
    text: () =>
      `**JOINs** stitch tables together on a key. Two-step mental model:\n\n1. **Merge** — start from the cartesian product, keep rows matching \`ON\`\n2. **Mercy** — \`INNER\` shows only matches; \`LEFT\` keeps all left rows and pads misses with \`NULL\`\n\n\`\`\`sql\nSELECT u.name, COUNT(s.id) AS solves\nFROM users u\nLEFT JOIN submissions s ON s.user_id = u.id\nGROUP BY u.id, u.name;\n\`\`\`\n\nCount \`s.id\`, never \`*\`, when a LEFT JOIN may produce NULLs — \`COUNT(*)\` would count the phantom rows.`,
  },
  type: {
    keywords: ["type", "types", "typescript", "interface", "generic", "typing"],
    text: () =>
      `**Types** are machine-checked documentation. TypeScript is *structural*: anything with the right shape satisfies an interface — no \`implements\` ceremony.\n\n\`\`\`ts\ninterface User { id: number; name: string }\nconst u: User = { id: 1, name: "Ada" }; // shape matches → OK\n\`\`\`\n\nWorkflow that pays off: model your domain first (interfaces for the nouns), let \`strict: true\` catch shape drift, and treat every \`any\` as a small loan against future debugging time.`,
  },
  scope: {
    keywords: ["scope", "hoisting", "var ", "block scope"],
    text: () =>
      `**Scope** answers "where is this name visible?". Modern JS: \`let\`/\`const\` are *block-scoped* — visible from declaration to the closing \`}\`.\n\n\`\`\`js\nif (true) {\n  const inner = 1;\n}\n// inner is gone here\n\`\`\`\n\n\`var\` is function-scoped and hoisted (declared early, initialized as \`undefined\`) — which is why \`var\` inside loops leaks and \`let\` doesn't. Default to \`const\`, use \`let\` when you must reassign, retire \`var\`.`,
  },
  bigo: {
    keywords: ["big o", "complexity", "o(n", "performance", "efficient"],
    text: () =>
      `**Big-O** describes how work grows with input size, ignoring constants:\n\n- O(1) — hash lookup, array index\n- O(log n) — binary search\n- O(n) — one pass over the data\n- O(n log n) — good sorts\n- O(n²) — nested loops over the same data\n\nPractical instinct: a nested loop where the inner loop *searches* the outer loop's data is the most common accidental O(n²). The fix is almost always a set or map built in a first pass.`,
  },
};

const ERROR_PATTERNS: { re: RegExp; cause: string; fix: string }[] = [
  {
    re: /Cannot read propert(?:y|ies) of (?:undefined|null)/i,
    cause:
      "You read a property off a value that was `undefined` or `null` — the object you expected hadn't arrived yet (often an un-awaited fetch) or a lookup missed.",
    fix: "Guard the chain: `data?.users ?? []`. For fetch, check `res.ok` before `res.json()`, and make sure every `await` is actually there.",
  },
  {
    re: /is not a function/i,
    cause:
      "A value you called with `()` isn't a function — often a typo'd name, an import mismatch (default vs named), or a method called on the wrong object.",
    fix: "Log the value right before the call to see what it actually is. Check the import style matches the export (`import x` vs `import { x }`).",
  },
  {
    re: /SyntaxError/i,
    cause:
      "The parser gave up before running anything: a missing bracket, quote, or comma — the reported line is often *after* the real mistake.",
    fix: "Scan upward from the reported line for an unclosed `(`, `[`, `{` or quote. Pasting the block into a formatter finds it instantly.",
  },
  {
    re: /ReferenceError/i,
    cause:
      "A name was used before it exists in this scope — a typo, or `let`/`const` used above its declaration.",
    fix: "Check spelling and declaration order. `const`/`let` have a temporal dead zone: no access before the declaration line.",
  },
  {
    re: /IndexError|out of range/i,
    cause:
      "A list index beyond its bounds — very often an off-by-one (`<=` instead of `<`) or an empty list.",
    fix: "Print `len(your_list)` and the index you're using. Valid indices are `0 .. len-1`. Guard empty inputs first.",
  },
  {
    re: /KeyError/i,
    cause: "A dict lookup with a key that doesn't exist.",
    fix: "Use `d.get(key, default)` when absence is possible, or `if key in d:` when it's a branch, not an accident.",
  },
  {
    re: /NameError/i,
    cause:
      "Python doesn't know that name — typo, or the variable is defined after the line that uses it.",
    fix: "Python executes top to bottom: define before use. Check the exact spelling — `count` vs `counts` is a classic.",
  },
  {
    re: /ZeroDivision/i,
    cause: "Division by zero — the divisor was 0 at runtime.",
    fix: "Guard the divisor: `if b != 0:` or return a sentinel. If zero is impossible 'by design', your data disagrees with your design.",
  },
  {
    re: /TypeError/i,
    cause:
      "An operation received the wrong type — e.g. adding a string to a number, or calling a method that doesn't exist on this type.",
    fix: "Print `type(x)` (or `typeof x`) for each operand. Convert explicitly (`int(s)`, `Number(s)`) rather than hoping.",
  },
  {
    re: /timeout|exceeded/i,
    cause:
      "The program ran past its time limit — usually an infinite loop or accidental O(n²)/O(2ⁿ) algorithm.",
    fix: "Find the loop whose exit condition never changes, or add a counter print to watch it spin. For algorithms, look for a nested loop you can replace with a map.",
  },
];

const REVIEW_CHECKS: {
  re: RegExp;
  severity: "warn" | "info" | "good";
  title: string;
  body: string;
}[] = [
  {
    re: /\bvar\s+\w/,
    severity: "warn",
    title: "var → const/let",
    body: "`var` is function-scoped and hoisted. Use `const` by default and `let` when reassigning — block scoping removes a whole bug class.",
  },
  {
    re: /[^=!<>]==[^=]/,
    severity: "warn",
    title: "Loose equality ==",
    body: "`==` coerces types (`'5' == 5` is true). Use `===` unless you can name the coercion you want.",
  },
  {
    re: /\bawait\b(?![\s\S]*\btry\b)/,
    severity: "info",
    title: "await without try/catch",
    body: "A rejected promise here becomes an unhandled rejection. Wrap fallible awaits in try/catch and decide the failure behavior explicitly.",
  },
  {
    re: /for\s*\(.*\)\s*\{[\s\S]*?(indexOf|includes|find)\(/,
    severity: "warn",
    title: "O(n²) search inside a loop",
    body: "Searching the collection inside a loop over the same collection is quadratic. Build a `Set`/`Map` in a first pass, then look up in O(1).",
  },
  {
    re: /console\.log|print\(/,
    severity: "info",
    title: "Debug output left in",
    body: "Fine while iterating — strip or gate it before shipping. Debug prints are how secrets leak into logs.",
  },
  {
    re: /TODO|FIXME/,
    severity: "info",
    title: "Unfinished marker",
    body: "TODOs are promises. Either do it now or file it where it won't rot.",
  },
  {
    re: /function\s+\w+\s*\([^)]*\)\s*\{[\s\S]{600,}/,
    severity: "info",
    title: "Long function",
    body: "This function is doing several jobs. Extract one named helper per job — the names become your documentation.",
  },
  {
    re: /^\s*$/,
    severity: "good",
    title: "Readable structure",
    body: "Indentation and spacing are consistent — future readers thank you.",
  },
];

const PRACTICE_BANK: string[] = [
  "**Practice — warm-up:** Write `countChars(s)` returning an object of character → count for a string. *Hint: one loop, one map, `counts[ch] = (counts[ch] ?? 0) + 1`.*",
  "**Practice — arrays:** Return the second-largest number in an array in a single pass. *Hint: track `first` and `second`; update both on each element.*",
  "**Practice — strings:** Check if two strings are anagrams (same letters, different order). *Hint: normalized sorted letters are equal — or count letters in a map.*",
  "**Practice — recursion:** Compute `power(base, exp)` without `**` or `Math.pow`. *Hint: base case exp = 0 → 1; step: base × power(base, exp−1).*",
  "**Practice — real world:** Implement `retry(fn, times)` that calls an async fn up to `times` attempts, waiting between tries. *Hint: a for-loop around try/catch with `await wait(ms)`.*",
  "**Practice — data:** Group an array of objects by a key: `groupBy(users, 'role')` → `{ admin: [...], user: [...] }`. *Hint: reduce into an object, push into `(acc[k] ??= [])`.*",
];

function detectConcept(prompt: string): string | null {
  const p = prompt.toLowerCase();
  let best: string | null = null;
  let bestScore = 0;
  for (const [id, c] of Object.entries(CONCEPTS)) {
    const score = c.keywords.reduce((a, k) => a + (p.includes(k) ? 1 : 0), 0);
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

function reviewCode(code: string, language: string): string {
  const findings = REVIEW_CHECKS.filter((c) =>
    c.severity === "good" ? c.re.test(code) : c.re.test(code),
  );
  const real = findings.filter((f) => f.severity !== "good");
  if (real.length === 0) {
    return `I scanned the ${language} code and found **no structural red flags** — clean equality, modern declarations, no obvious quadratic traps.\n\nTwo things a human reviewer would still check:\n- **Naming**: do functions describe outcomes, not mechanics?\n- **Edge cases**: what happens with empty input, zero, negatives, duplicates?`;
  }
  const lines = real
    .map((f, i) => `${i + 1}. **${f.title}** — ${f.body}`)
    .join("\n");
  return `I ran ${real.length} heuristic check${real.length > 1 ? "s" : ""} over your code:\n\n${lines}\n\n*Heuristic review catches patterns, not logic — walk the happy path and one sad path yourself.*`;
}

function convertCode(code: string, from: string, to: string): string {
  if (
    (from === "python" && to === "javascript") ||
    (from === "javascript" && to === "python")
  ) {
    const pyToJs = from === "python";
    let out = code;
    if (pyToJs) {
      out = out
        .replace(/^(\s*)def (\w+)\(([^)]*)\):/gm, "$1function $2($3) {")
        .replace(/print\((.*)\)$/gm, "console.log($1);")
        .replace(/\belif\b/g, "else if")
        .replace(/\bTrue\b/g, "true")
        .replace(/\bFalse\b/g, "false")
        .replace(/\bNone\b/g, "null")
        .replace(/\band\b/g, "&&")
        .replace(/\bor\b/g, "||")
        .replace(/\bnot\b/g, "!")
        .replace(/#(.*)$/gm, "//$1");
      out = out
        .split("\n")
        .map((l) => (/:\s*\/\//.test(l) ? l : l))
        .join("\n");
      out +=
        "\n// NOTE: indentation-based blocks need { } braces added by hand —\n// this is a token-level sketch, not a compiler.";
    } else {
      out = out
        .replace(/console\.log\((.*)\);?$/gm, "print($1)")
        .replace(/^(\s*)function (\w+)\(([^)]*)\)\s*\{/gm, "$1def $2($3):")
        .replace(/\belse if\b/g, "elif")
        .replace(/\btrue\b/g, "True")
        .replace(/\bfalse\b/g, "False")
        .replace(/\bnull\b/g, "None")
        .replace(/&&/g, " and ")
        .replace(/\|\|/g, " or ")
        .replace(/\/\/(.*)$/gm, "#$1");
      out +=
        "\n# NOTE: { } braces don't become indentation automatically —\n# re-indent blocks by hand; this is a sketch, not a compiler.";
    }
    return `Rough **${from} → ${to}** conversion of your snippet:\n\n\`\`\`${to}\n${out}\n\`\`\`\n\nToken-level conversion gets you 80% there. The remaining 20% — block structure, idioms, standard library calls — needs a human eye.`;
  }
  return `Direct conversion between **${from}** and **${to}** isn't in my local engine's mapping tables yet. What I can do well:\n\n- explain the concept so you can port it yourself\n- review the code you write in the target language\n- convert Python ↔ JavaScript token-by-token\n\nPaste the snippet with one of those modes and I'll dig in.`;
}

export async function askTutor(req: TutorRequest): Promise<string> {
  const lang = req.language || "javascript";

  // Build system prompt based on mode
  const systemPrompts: Record<string, string> = {
    explain: `You are a friendly, expert programming tutor. Explain programming concepts clearly with examples. Use markdown formatting. Keep explanations concise but thorough. The user is learning ${lang}.`,
    error: `You are a debugging expert. Analyze error messages and help programmers understand and fix their code errors. Provide clear diagnosis and step-by-step solutions. Use markdown formatting.`,
    review: `You are a senior code reviewer. Review the provided code for best practices, potential bugs, performance issues, and readability. Provide constructive feedback with specific suggestions. Use markdown formatting.`,
    optimize: `You are a performance optimization expert. Analyze code for performance bottlenecks and suggest optimizations. Explain time/space complexity. Use markdown formatting.`,
    convert: `You are a polyglot programmer. Convert code between programming languages while preserving logic and adapting to idiomatic patterns. Explain key differences. Use markdown formatting.`,
    hint: `You are a helpful tutor giving hints without giving away answers. Provide progressive hints that guide the student to discover the solution themselves. Use markdown formatting.`,
    practice: `You are a programming coach. Create practice exercises that are challenging but achievable. Include hints and expected solutions. Use markdown formatting.`,
  };

  // Build user message
  let userMessage = req.prompt;
  if (req.code) {
    userMessage += `\n\nCode:\n\`\`\`${lang}\n${req.code}\n\`\`\``;
  }
  if (req.error) {
    userMessage += `\n\nError:\n\`\`\`\n${req.error}\n\`\`\``;
  }
  if (req.targetLanguage) {
    userMessage += `\n\nConvert to: ${req.targetLanguage}`;
  }

  // Try Groq API first
  try {
    const groqResponse = await callGroqAPI([
      { role: "system", content: systemPrompts[req.mode] },
      { role: "user", content: userMessage },
    ]);

    if (groqResponse) {
      return groqResponse;
    }
  } catch (error) {
    console.warn("AI service temporarily unavailable:", error);
  }

  // Fallback to built-in knowledge base
  await sleep(450 + Math.random() * 500);

  switch (req.mode) {
    case "explain": {
      const id = detectConcept(req.prompt + " " + (req.code || ""));
      if (id) return CONCEPTS[id].text(lang);
      const keys = Object.values(CONCEPTS)
        .map((c) => c.keywords[0])
        .slice(0, 10)
        .join(", ");
      return `I can help with these concepts: **${keys}** — and many more.\n\nTry asking about one directly, e.g. *"explain closures"* or *"how do SQL joins work?"*, or switch to **Review code** and paste your snippet — I'm much sharper with code in front of me.`;
    }
    case "error": {
      const text = req.error || req.prompt;
      const hit = ERROR_PATTERNS.find((p) => p.re.test(text));
      if (hit)
        return `**Diagnosis**\n\n${hit.cause}\n\n**How to fix it**\n\n${hit.fix}\n\nIf the message persists after this, paste the exact line it points to and I'll narrow further.`;
      return `Let me help you debug that. Here's a systematic approach:\n\n1. **Read it backwards** — the useful part is usually the last phrase\n2. **Find the line** — then look one line *above* it for unclosed syntax\n3. **Print the suspect value** right before the failing line\n4. **Reproduce minimally** — strip code until the error disappears, then add back\n\nPaste the full stack trace and I'll help you fix it.`;
    }
    case "review": {
      if (!req.code || req.code.trim().length < 10)
        return "Paste at least a few lines of code and I'll review structure, equality hygiene, complexity traps, and readability.";
      return reviewCode(req.code, lang);
    }
    case "optimize": {
      const code = req.code || "";
      const tips: string[] = [];
      if (/for\s*\(.*\)\s*\{[\s\S]*?(indexOf|includes|find)\(/.test(code))
        tips.push(
          "- **Quadratic search detected** — hoist the collection into a `Set`/`Map` before the loop; O(n²) → O(n).",
        );
      if (
        /\.map\([\s\S]*\.filter\(/.test(code) ||
        /\.filter\([\s\S]*\.map\(/.test(code)
      )
        tips.push(
          "- **Chained map+filter** — fine for clarity; if this is a hot path, one `reduce` avoids the intermediate array.",
        );
      if (/function (fib|factorial)\b[\s\S]*\1\(.*-/.test(code))
        tips.push(
          "- **Naive recursion** — overlapping subproblems? Memoize with a map, or go iterative.",
        );
      if (tips.length === 0)
        tips.push(
          "- No obvious hotspots in this snippet. Measure before optimizing: profile the real workload, then attack the top frame.",
        );
      return `**Optimization pass**\n\n${tips.join("\n")}\n\nOrder of operations: correct → clear → measured → fast. Never trade clarity for speed you didn't measure.`;
    }
    case "convert": {
      if (!req.code || req.code.trim().length < 5)
        return "Paste the snippet to convert, and tell me source → target (e.g. Python → JavaScript).";
      return convertCode(
        req.code,
        req.language || "python",
        req.targetLanguage || "javascript",
      );
    }
    case "hint": {
      return `${PRACTICE_BANK[Math.floor(Math.random() * PRACTICE_BANK.length)]}\n\nWant it applied to a specific challenge? Open it from **Practice** and ask from there — context makes the hint surgical.`;
    }
    case "practice": {
      const a = PRACTICE_BANK[Math.floor(Math.random() * PRACTICE_BANK.length)];
      let b = PRACTICE_BANK[Math.floor(Math.random() * PRACTICE_BANK.length)];
      if (b === a)
        b =
          PRACTICE_BANK[(PRACTICE_BANK.indexOf(a) + 1) % PRACTICE_BANK.length];
      return `Two drills for today, ${lang} flavor:\n\n${a}\n\n${b}\n\nSolve them in the **Playground** — real execution keeps you honest.`;
    }
  }
}

export const TUTOR_MODES: {
  id: TutorRequest["mode"];
  label: string;
  desc: string;
}[] = [
  {
    id: "explain",
    label: "Explain concept",
    desc: "Deep-dive a CS or language concept",
  },
  {
    id: "error",
    label: "Explain error",
    desc: "Diagnose a compiler/runtime message",
  },
  {
    id: "review",
    label: "Review code",
    desc: "Structural review of a pasted snippet",
  },
  { id: "optimize", label: "Optimize", desc: "Find complexity traps" },
  { id: "convert", label: "Convert", desc: "Sketch code in another language" },
  { id: "hint", label: "Hint me", desc: "A nudge, not the answer" },
  {
    id: "practice",
    label: "Practice drill",
    desc: "Generate a fresh exercise",
  },
];
