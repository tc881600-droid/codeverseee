import type {
  Language, Course, Lesson, LessonSection, Challenge, Project, AchievementDef, DocTopic,
  User, Profile, Snippet, Submission, Notif, Post, CommentT, ExecLog,
} from "./types";
import type { DBShape } from "./db";
import { hashPass, todayKey } from "./db";
import { COMPREHENSIVE_COURSES, COMPREHENSIVE_LESSONS } from "./comprehensive-courses";

/* ================= LANGUAGES ================= */

export const LANGUAGES: Language[] = [
  { slug: "python", name: "Python", short: "Py", color: "#3b82f6", tagline: "Readable, versatile, the language of AI and automation.", paradigms: ["Multi-paradigm", "Interpreted"], firstYear: 1991, version: "3.12", extension: "py", monaco: "python", enabled: true, usage: 100 },
  { slug: "javascript", name: "JavaScript", short: "JS", color: "#f0b429", tagline: "The language of the web — browsers, servers, everywhere.", paradigms: ["Multi-paradigm", "JIT compiled"], firstYear: 1995, version: "ES2024", extension: "js", monaco: "javascript", enabled: true, usage: 97 },
  { slug: "typescript", name: "TypeScript", short: "TS", color: "#38bdf8", tagline: "JavaScript with types that scale to millions of lines.", paradigms: ["Typed", "Transpiled"], firstYear: 2012, version: "5.6", extension: "ts", monaco: "typescript", enabled: true, usage: 88 },
  { slug: "c", name: "C", short: "C", color: "#94a3b8", tagline: "Close to the metal. Operating systems, embedded, everything fast.", paradigms: ["Procedural", "Compiled"], firstYear: 1972, version: "C17", extension: "c", monaco: "c", enabled: true, usage: 74 },
  { slug: "cpp", name: "C++", short: "C+", color: "#818cf8", tagline: "Zero-cost abstractions for systems and game engines.", paradigms: ["Multi-paradigm", "Compiled"], firstYear: 1985, version: "C++23", extension: "cpp", monaco: "cpp", enabled: true, usage: 76 },
  { slug: "java", name: "Java", short: "Jv", color: "#fb923c", tagline: "Write once, run anywhere — the enterprise workhorse.", paradigms: ["OOP", "JVM"], firstYear: 1995, version: "21 LTS", extension: "java", monaco: "java", enabled: true, usage: 82 },
  { slug: "go", name: "Go", short: "Go", color: "#2dd4bf", tagline: "Simple, concurrent, built for cloud infrastructure.", paradigms: ["Concurrent", "Compiled"], firstYear: 2009, version: "1.23", extension: "go", monaco: "go", enabled: true, usage: 68 },
  { slug: "rust", name: "Rust", short: "Rs", color: "#fb7185", tagline: "Memory safety without garbage collection.", paradigms: ["Systems", "Ownership"], firstYear: 2010, version: "1.82", extension: "rs", monaco: "rust", enabled: true, usage: 64 },
  { slug: "php", name: "PHP", short: "PH", color: "#a78bfa", tagline: "Still powering most of the web, one request at a time.", paradigms: ["Server-side", "Interpreted"], firstYear: 1995, version: "8.3", extension: "php", monaco: "php", enabled: true, usage: 58 },
  { slug: "csharp", name: "C#", short: "C#", color: "#34d399", tagline: "Modern, expressive, from games to cloud APIs.", paradigms: ["OOP", ".NET"], firstYear: 2000, version: "12", extension: "cs", monaco: "csharp", enabled: true, usage: 66 },
  { slug: "kotlin", name: "Kotlin", short: "Kt", color: "#f472b6", tagline: "The pragmatic language for Android and beyond.", paradigms: ["OOP", "Functional"], firstYear: 2011, version: "2.0", extension: "kt", monaco: "kotlin", enabled: true, usage: 52 },
  { slug: "dart", name: "Dart", short: "Dt", color: "#22d3ee", tagline: "One codebase, every screen — Flutter's engine.", paradigms: ["OOP", "AOT/JIT"], firstYear: 2011, version: "3.5", extension: "dart", monaco: "dart", enabled: true, usage: 44 },
  { slug: "sql", name: "SQL", short: "SQ", color: "#e2e8f0", tagline: "Talk to data. The most durable language in computing.", paradigms: ["Declarative", "Relational"], firstYear: 1974, version: "SQL:2023", extension: "sql", monaco: "sql", enabled: true, usage: 90 },
  { slug: "html", name: "HTML", short: "HT", color: "#f97316", tagline: "The structure of the web — markup language for every webpage.", paradigms: ["Markup", "Declarative"], firstYear: 1993, version: "HTML5", extension: "html", monaco: "html", enabled: true, usage: 95 },
  { slug: "css", name: "CSS", short: "CS", color: "#0ea5e9", tagline: "Style the web — make everything beautiful and responsive.", paradigms: ["Stylesheet", "Declarative"], firstYear: 1996, version: "CSS3", extension: "css", monaco: "css", enabled: true, usage: 93 },
];

/* ================= COURSES ================= */

export const COURSES: Course[] = [
  // Original fundamental courses
  { id: "python-fundamentals", slug: "python-fundamentals", language: "python", title: "Python Fundamentals", level: "Beginner", description: "From your first print() to functions, lists and dictionaries — the complete base camp for Python.", hue: 215, published: true, skills: ["Variables", "Control flow", "Lists & dicts", "Functions", "Modules"] },
  { id: "javascript-fundamentals", slug: "javascript-fundamentals", language: "javascript", title: "JavaScript Fundamentals", level: "Beginner", description: "Master the language of the web: values, functions, arrays, objects, async and modules.", hue: 45, published: true, skills: ["let & const", "Functions", "Arrays & objects", "Promises", "ES modules"] },
  { id: "cpp-fundamentals", slug: "cpp-fundamentals", language: "cpp", title: "C++ Fundamentals", level: "Beginner", description: "Compiled performance from zero: types, control flow, functions, and your first pointers.", hue: 235, published: true, skills: ["Compilation", "Types", "Functions", "Pointers", "References"] },
  { id: "java-fundamentals", slug: "java-fundamentals", language: "java", title: "Java Fundamentals", level: "Beginner", description: "Objects, classes and the JVM — build the mental model behind enterprise Java.", hue: 25, published: true, skills: ["Classes & objects", "Collections", "Interfaces", "Control flow"] },
  { id: "web-dev-fundamentals", slug: "web-dev-fundamentals", language: "javascript", title: "Web Development Fundamentals", level: "Beginner", description: "HTML, CSS and the browser: how the web actually works, from markup to fetch().", hue: 190, published: true, skills: ["HTML", "CSS layout", "DOM", "Fetch & APIs", "Responsive design"] },
  { id: "sql-fundamentals", slug: "sql-fundamentals", language: "sql", title: "SQL Fundamentals", level: "Beginner", description: "Query real relational data: SELECT, filters, aggregates, joins and mutations.", hue: 210, published: true, skills: ["SELECT", "WHERE", "GROUP BY", "JOIN", "INSERT/UPDATE"] },
  { id: "typescript-fundamentals", slug: "typescript-fundamentals", language: "typescript", title: "TypeScript Fundamentals", level: "Intermediate", description: "Types that pay rent: interfaces, generics and narrowing for safer JavaScript.", hue: 200, published: true, skills: ["Interfaces", "Generics", "Narrowing", "Utility types"] },
  { id: "go-fundamentals", slug: "go-fundamentals", language: "go", title: "Go Fundamentals", level: "Beginner", description: "Simplicity as a feature: Go's types, errors, structs and interfaces.", hue: 170, published: true, skills: ["go run", "Types", "Errors", "Structs", "Interfaces"] },

  // Comprehensive A-to-Z courses
  ...COMPREHENSIVE_COURSES,
];

/* ================= LESSONS ================= */

const L = (
  id: string, courseId: string, module: string, order: number, title: string,
  minutes: number, xp: number, summary: string, sections: LessonSection[],
  takeaways: string[], exercise?: Lesson["exercise"],
): Lesson => ({ id, courseId, module, order, title, minutes, xp, summary, sections, takeaways, exercise });

export const LESSONS: Lesson[] = [
  /* ----- Python Fundamentals ----- */
  L("py-hello", "python-fundamentals", "Getting Started", 1, "Hello, Python", 10, 20,
    "Run your first Python program and learn how the interpreter reads your code top to bottom.",
    [
      { p: "Python is an interpreted language: the interpreter reads your file from top to bottom and executes each statement. No compilation step, no boilerplate — a program can be a single line." },
      { h: "Your first program", p: "The print() function writes text to standard output. Strings live inside quotes — single or double, Python accepts both.", code: 'print("Hello, CodeVerse!")\nprint(\'Run it again — interpreters are fast.\')', lang: "python" },
      { h: "Comments", p: "Anything after # on a line is ignored by the interpreter. Use comments to explain why, not what.", code: "# This calculates nothing, but explains everything\nprint(\"# inside quotes is not a comment\")", lang: "python" },
    ],
    ["Python executes top to bottom", "print() writes to stdout", "# starts a comment"],
    { prompt: "Print two lines: your name, then the text 'learning Python'.", starter: '# print two lines below\n', hint: "Two print() calls, one per line." }),

  L("py-variables", "python-fundamentals", "Getting Started", 2, "Variables & Types", 14, 25,
    "Names, values, and the core types: int, float, str, bool.",
    [
      { p: "A variable is a name bound to a value. Python infers the type from the value — you never declare types in plain Python." },
      { h: "Core types", code: 'name = "Ada"          # str\nage = 36              # int\npi = 3.14159          # float\nis_admin = True       # bool\n\nprint(type(name), type(age))\nprint(f"{name} is {age}")  # f-string interpolation', lang: "python" },
      { h: "Dynamic but not reckless", p: "Types are checked at runtime. Adding a str to an int raises TypeError the moment that line runs — not before.", code: 'count = "3"\n# print(count + 1)  # TypeError: can only concatenate str to str\nprint(int(count) + 1)  # 4 — convert first', lang: "python" },
    ],
    ["Assignment binds names to values", "int, float, str, bool are the core types", "f-strings interpolate with {expr}"]),

  L("py-conditionals", "python-fundamentals", "Control Flow", 3, "Conditionals", 12, 25,
    "if, elif, else — making decisions with boolean logic.",
    [
      { p: "Blocks in Python are defined by indentation, not braces. The colon opens a block; every statement inside sits one indent level deeper." },
      { h: "Branching", code: 'temp = 27\n\nif temp > 30:\n    print("heatwave")\nelif temp > 20:\n    print("pleasant")\nelse:\n    print("cold")', lang: "python" },
      { h: "Boolean operators", p: "and, or, not combine conditions. Comparisons return real bool values you can store and pass around.", code: 'has_key = True\ndoor_locked = False\n\nif has_key and not door_locked:\n    print("enter")', lang: "python" },
    ],
    ["Indentation defines blocks", "elif chains multiple branches", "and / or / not compose conditions"],
    { prompt: "Set score = 74 and print 'pass' if score >= 50, else 'fail'.", starter: 'score = 74\n# your branch below\n', hint: "if score >= 50: … else: …" }),

  L("py-loops", "python-fundamentals", "Control Flow", 4, "Loops", 15, 30,
    "for and while: repeating work without repeating code.",
    [
      { p: "A for loop iterates over any sequence — a list, a string, or a range of numbers." },
      { h: "for + range", code: 'for i in range(3):\n    print("lap", i)   # 0, 1, 2\n\ntotal = 0\nfor n in [4, 8, 15]:\n    total += n\nprint(total)  # 27', lang: "python" },
      { h: "while + break", p: "while repeats while a condition holds. break exits immediately; continue skips to the next iteration.", code: 'n = 0\nwhile True:\n    n += 1\n    if n % 2 == 0:\n        continue\n    if n > 5:\n        break\n    print(n)  # 1 3 5', lang: "python" },
    ],
    ["range(n) yields 0..n-1", "for iterates any sequence", "break exits, continue skips"],
    { prompt: "Print the multiplication table of 5 from 5×1 to 5×5.", starter: '# loop from 1 to 5\n', hint: "for i in range(1, 6): print(5 * i)" }),

  L("py-lists", "python-fundamentals", "Data Structures", 5, "Lists & Dicts", 18, 35,
    "The two workhorse containers: ordered lists and key→value dicts.",
    [
      { h: "Lists", p: "Ordered, mutable, zero-indexed. append, index access, slicing, len — 80% of real Python data handling.", code: 'langs = ["python", "go"]\nlangs.append("rust")\nprint(langs[0], langs[-1])\nprint(langs[1:])   # slicing\nprint(len(langs))', lang: "python" },
      { h: "Dicts", p: "Hash maps from keys to values. Constant-time lookup by key; order preserved since 3.7.", code: 'user = {"name": "Ada", "xp": 120}\nuser["xp"] += 30\nprint(user["name"], user.get("level", 1))\n\nfor k, v in user.items():\n    print(k, "->", v)', lang: "python" },
      { list: ["Lists: ordered, allow duplicates", "Dicts: unique keys, fast lookup", ".get(key, default) avoids KeyError"] },
    ],
    ["Lists are ordered & mutable", "Dicts map keys to values", "Slicing: seq[start:stop]"]),

  L("py-functions", "python-fundamentals", "Functions", 6, "Functions", 16, 35,
    "def, parameters, return values, and default arguments.",
    [
      { p: "Functions package logic behind a name. def defines one; return hands a value back to the caller." },
      { h: "Defining and calling", code: 'def greet(name, greeting="Hello"):\n    return f"{greeting}, {name}!"\n\nprint(greet("Ada"))\nprint(greet("Grace", greeting="Hi"))', lang: "python" },
      { h: "Pure functions", p: "A function that depends only on its inputs and returns a value — no hidden state — is trivially testable and reusable. Prefer them.", code: 'def celsius_to_f(c):\n    return c * 9 / 5 + 32\n\nfor c in [0, 20, 37]:\n    print(c, "C =", celsius_to_f(c), "F")', lang: "python" },
    ],
    ["def defines, return exits with a value", "Defaults make args optional", "Pure functions are easier to test"],
    { prompt: "Write a function area(w, h) returning w*h, then print area(3, 4).", starter: '# define area, then call it\n', hint: "def area(w, h): return w * h" }),

  L("py-strings", "python-fundamentals", "Functions", 7, "Strings & Methods", 12, 30,
    "Slicing, methods, and the small toolkit you'll use daily.",
    [
      { h: "Methods", p: "Strings are immutable — methods return new strings instead of changing the original.", code: 'raw = "  Hello, Verse  "\nprint(raw.strip().lower())\nprint("a-b-c".split("-"))\nprint(", ".join(["x", "y", "z"]))', lang: "python" },
      { h: "Slicing again", code: 'word = "function"\nprint(word[:4])    # func\nprint(word[::-1])  # noitcnuf — reversed', lang: "python" },
    ],
    ["Strings are immutable", "strip/split/join cover most parsing", "[::-1] reverses a sequence"]),

  L("py-modules", "python-fundamentals", "Functions", 8, "Modules & Imports", 10, 30,
    "Organize code into files and reuse the standard library.",
    [
      { p: "Every .py file is a module. import pulls names in; the standard library ships with batteries included." },
      { h: "Imports", code: 'import math\nfrom random import randint\n\nprint(math.sqrt(144))\nprint(randint(1, 6))  # dice roll', lang: "python" },
      { list: ["import math — whole module", "from x import y — single name", "import x as y — alias"] },
    ],
    ["Each file is a module", "from … import … pulls specific names", "The stdlib is huge — check it before pip"]),

  /* ----- JavaScript Fundamentals ----- */
  L("js-hello", "javascript-fundamentals", "Getting Started", 1, "Hello, JavaScript", 10, 20,
    "console.log, statements, and how JS runs everywhere.",
    [
      { p: "JavaScript runs in browsers, servers, and this very playground. console.log() is your window into what a program does." },
      { h: "First program", code: 'console.log("Hello, CodeVerse!");\nconsole.log("One language, every platform.");', lang: "javascript" },
      { h: "Semicolons & errors", p: "Semicolons end statements (ASI often saves you, but be explicit). A runtime error stops execution at that line.", code: 'console.log("before");\n// console.log(missing); // ReferenceError — execution would stop\nconsole.log("after");', lang: "javascript" },
    ],
    ["console.log prints to stdout", "Errors halt execution at that line", "JS runs in browser & server"]),

  L("js-variables", "javascript-fundamentals", "Getting Started", 2, "let, const & Types", 14, 25,
    "Modern declarations and the seven primitive types.",
    [
      { h: "const by default", p: "const binds a name that cannot be reassigned; let allows reassignment. var is legacy — avoid it.", code: 'const name = "Ada";\nlet xp = 0;\nxp += 25;\n// name = "Other"; // TypeError\nconsole.log(name, xp);', lang: "javascript" },
      { h: "Primitives", code: 'const str = "text";      // string\nconst num = 42;          // number (int & float are one type)\nconst big = 1.5;\nconst ok = true;         // boolean\nconst nothing = null;\nlet notYet;              // undefined\nconsole.log(typeof str, typeof num, typeof notYet);', lang: "javascript" },
    ],
    ["Prefer const, use let when reassigning", "number covers integers and floats", "null is intentional absence, undefined is uninitialized"],
    { prompt: "Declare const city with your city, let temp = 21.5, and log both.", starter: '// declarations below\n', hint: "const city = '…'; let temp = 21.5;" }),

  L("js-functions", "javascript-fundamentals", "Functions", 3, "Functions & Arrows", 16, 30,
    "Function declarations, expressions, and arrow syntax.",
    [
      { h: "Three ways", code: 'function add(a, b) { return a + b; }\n\nconst sub = function (a, b) { return a - b; };\n\nconst mul = (a, b) => a * b;\n\nconsole.log(add(2, 3), sub(5, 2), mul(3, 4));', lang: "javascript" },
      { h: "Functions are values", p: "You can pass functions to other functions — the foundation of callbacks and array methods.", code: 'const twice = (f, x) => f(f(x));\nconst inc = (n) => n + 1;\nconsole.log(twice(inc, 5)); // 7', lang: "javascript" },
    ],
    ["Arrow functions are compact expressions", "Functions are first-class values", "return exits with a value"]),

  L("js-arrays", "javascript-fundamentals", "Data", 4, "Arrays & Objects", 18, 35,
    "The two structures behind nearly all JavaScript data.",
    [
      { h: "Arrays + methods", p: "map, filter, reduce transform arrays without mutating them — the idiomatic JS pipeline.", code: 'const nums = [3, 1, 4, 1, 5];\n\nconst doubled = nums.map((n) => n * 2);\nconst big = nums.filter((n) => n > 2);\nconst sum = nums.reduce((a, n) => a + n, 0);\n\nconsole.log(doubled, big, sum);', lang: "javascript" },
      { h: "Objects", code: 'const user = { name: "Ada", xp: 90 };\nuser.xp += 10;                 // mutate\nconsole.log(user.name);        // dot access\nconsole.log(user["xp"]);       // bracket access\nconsole.log({ ...user, level: 3 }); // spread copy', lang: "javascript" },
    ],
    ["map/filter/reduce don't mutate", "Objects map keys to values", "Spread copies shallowly"],
    { prompt: "Given const nums = [2,4,6,8], log an array of their squares using map.", starter: 'const nums = [2, 4, 6, 8];\n// map below\n', hint: "nums.map(n => n * n)" }),

  L("js-control", "javascript-fundamentals", "Control Flow", 5, "Control Flow", 12, 25,
    "if/else, ternary, switch, and loops in JS.",
    [
      { h: "Branches", code: 'const status = "running";\n\nif (status === "done") {\n  console.log("finished");\n} else if (status === "running") {\n  console.log("in progress");\n} else {\n  console.log("idle");\n}', lang: "javascript" },
      { h: "Loops", p: "=== compares value and type (always prefer it). for...of walks values; classic for walks indices.", code: 'for (const ch of "abc") console.log(ch);\n\nfor (let i = 0; i < 3; i++) {\n  console.log("tick", i);\n}\n\nconst label = status === "done" ? "finished" : "not yet";\nconsole.log(label);', lang: "javascript" },
    ],
    ["=== avoids type coercion surprises", "for...of iterates values", "Ternary for inline branches"]),

  L("js-strings", "javascript-fundamentals", "Data", 6, "Strings & Templates", 10, 25,
    "Template literals and the string method toolkit.",
    [
      { h: "Template literals", p: "Backticks allow interpolation and multi-line strings — the modern way to build text.", code: 'const user = "Ada";\nconst xp = 120;\nconsole.log(`${user} has ${xp} XP`);\nconsole.log(`2 + 2 = ${2 + 2}`);', lang: "javascript" },
      { h: "Methods", code: 'const s = "  Learn Code  ";\nconsole.log(s.trim().toLowerCase());\nconsole.log("a,b,c".split(","));\nconsole.log("verse".toUpperCase().includes("ERS"));', lang: "javascript" },
    ],
    ["Backticks interpolate with ${}", "Strings are immutable", "split/join convert between strings and arrays"]),

  L("js-async", "javascript-fundamentals", "Async", 7, "Promises & Async/Await", 20, 40,
    "Non-blocking JavaScript: promises, async functions, and error handling.",
    [
      { p: "JavaScript is single-threaded. Long work happens off-thread and reports back through promises." },
      { h: "Promises", code: 'const wait = (ms) => new Promise((res) => setTimeout(res, ms));\n\nasync function main() {\n  console.log("start");\n  await wait(30);\n  console.log("30ms later");\n}\nmain();', lang: "javascript" },
      { h: "Handling failure", code: 'const risky = async () => {\n  throw new Error("network down");\n};\n\nasync function run() {\n  try {\n    await risky();\n  } catch (err) {\n    console.log("caught:", err.message);\n  }\n}\nrun();', lang: "javascript" },
    ],
    ["await pauses an async function, not the thread", "try/catch handles rejected promises", "Promises represent future values"]),

  L("js-modules", "javascript-fundamentals", "Async", 8, "ES Modules", 10, 25,
    "import/export — how modern JS organizes code.",
    [
      { h: "Named exports", code: '// math.js\nexport const add = (a, b) => a + b;\nexport const TAU = Math.PI * 2;\n\n// app.js\nimport { add, TAU } from "./math.js";\nconsole.log(add(1, 2), TAU.toFixed(2));', lang: "javascript" },
      { list: ["export … / import { … } — named", "export default — one per module", "Modules are strict mode by default"] },
    ],
    ["Named exports for multiple values", "One default export per module", "Modules enforce strict mode"]),

  /* ----- C++ Fundamentals ----- */
  L("cpp-hello", "cpp-fundamentals", "Getting Started", 1, "Hello, C++", 12, 20,
    "Compilation, main(), and iostream.",
    [
      { p: "C++ is compiled: source → object code → binary. The entry point is always a function named main." },
      { h: "Anatomy of a program", code: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, CodeVerse!" << std::endl;\n    return 0;\n}', lang: "cpp" },
      { list: ["#include pulls in library headers", "std::cout streams to stdout", "return 0 signals success to the OS"] },
    ],
    ["C++ compiles ahead of time", "main() is the entry point", "<< chains stream output"]),

  L("cpp-types", "cpp-fundamentals", "Getting Started", 2, "Variables & Types", 14, 25,
    "int, double, char, bool, std::string — static typing in practice.",
    [
      { h: "Static types", p: "Every variable's type is fixed at compile time. The compiler catches type mistakes before the program ever runs.", code: '#include <iostream>\n#include <string>\n\nint main() {\n    int age = 30;\n    double pi = 3.14159;\n    char grade = \'A\';\n    bool ready = true;\n    std::string name = "Ada";\n    std::cout << name << " " << age << " " << pi << std::endl;\n}', lang: "cpp" },
      { h: "auto", p: "auto lets the compiler deduce the type from the initializer — handy, but don't hide intent.", code: 'auto count = 10;      // int\nauto ratio = 0.5;     // double', lang: "cpp" },
    ],
    ["Types are checked at compile time", "std::string over char* in modern code", "auto deduces from the initializer"]),

  L("cpp-control", "cpp-fundamentals", "Control Flow", 3, "Control Flow", 12, 25,
    "if, switch, for, while in C++.",
    [
      { h: "Branches and loops", code: '#include <iostream>\n\nint main() {\n    for (int i = 1; i <= 3; i++) {\n        if (i % 2 == 0) {\n            std::cout << i << " is even" << std::endl;\n        } else {\n            std::cout << i << " is odd" << std::endl;\n        }\n    }\n}', lang: "cpp" },
      { h: "Range-based for", p: "Modern C++ iterates containers directly — no index bookkeeping.", code: '#include <vector>\n#include <iostream>\n\nint main() {\n    std::vector<int> nums = {2, 4, 6};\n    for (int n : nums) std::cout << n << " "; \n}', lang: "cpp" },
    ],
    ["Blocks use { }", "Range-for walks containers", "Conditions need real booleans — no implicit int truth"]),

  L("cpp-functions", "cpp-fundamentals", "Functions", 4, "Functions & Scope", 14, 30,
    "Signatures, pass-by-value, and block scope.",
    [
      { h: "Signatures", code: '#include <iostream>\n\ndouble area(double w, double h) {\n    return w * h;\n}\n\nint main() {\n    std::cout << area(3.0, 4.5) << std::endl;\n}', lang: "cpp" },
      { h: "Pass by value vs reference", p: "By default, arguments are copied. Add & to pass by reference and let the function mutate the caller's value.", code: 'void bump(int& n) { n += 1; }   // reference — mutates caller\nvoid bumpCopy(int n) { n += 1; } // copy — caller unaffected', lang: "cpp" },
    ],
    ["Return types appear before the name", "Arguments copy by default", "& passes by reference"]),

  L("cpp-pointers", "cpp-fundamentals", "Memory", 5, "Pointers & References", 20, 40,
    "Addresses, dereferencing, and the mental model behind C++ memory.",
    [
      { p: "A pointer stores a memory address. * dereferences it; & takes the address of a variable." },
      { h: "Pointer basics", code: '#include <iostream>\n\nint main() {\n    int x = 42;\n    int* p = &x;        // p holds x\'s address\n    std::cout << *p << std::endl;  // 42 — read through p\n    *p = 7;             // write through p\n    std::cout << x << std::endl;   // 7\n}', lang: "cpp" },
      { h: "nullptr", p: "A pointer that points nowhere must be nullptr — never assume. Modern code prefers references and smart pointers over raw owning pointers.", code: 'int* p = nullptr;\nif (p == nullptr) std::cout << "points nowhere" << std::endl;', lang: "cpp" },
    ],
    ["Pointers store addresses", "* dereferences, & takes an address", "nullptr means 'points nowhere'"],
    { prompt: "Declare int n = 5 and a pointer to it; print the value through the pointer.", starter: '// int n = 5; int* p = …\n', hint: "int* p = &n; then std::cout << *p;" }),

  /* ----- Java Fundamentals ----- */
  L("java-hello", "java-fundamentals", "Getting Started", 1, "Hello, Java", 12, 20,
    "The JVM, public static void main, and javac.",
    [
      { p: "Java compiles to bytecode that runs on the JVM — the same .class file runs on any machine with a JVM." },
      { h: "Anatomy", code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeVerse!");\n    }\n}', lang: "java" },
      { list: ["One public class per file, matching the filename", "main is the entry point", "System.out.println prints a line"] },
    ],
    ["Java compiles to JVM bytecode", "Everything lives in a class", "main(String[] args) is the entry"]),

  L("java-classes", "java-fundamentals", "OOP", 2, "Classes & Objects", 18, 35,
    "Fields, constructors, and methods — Java's object model.",
    [
      { h: "A class", code: 'class Account {\n    String owner;\n    double balance;\n\n    Account(String owner, double balance) {\n        this.owner = owner;\n        this.balance = balance;\n    }\n\n    void deposit(double amount) {\n        balance += amount;\n    }\n}\n\npublic class Main {\n    public static void main(String[] a) {\n        Account acc = new Account("Ada", 100);\n        acc.deposit(50);\n        System.out.println(acc.owner + ": " + acc.balance);\n    }\n}', lang: "java" },
    ],
    ["new constructs an object via its constructor", "this refers to the current instance", "State (fields) + behavior (methods) live together"]),

  L("java-collections", "java-fundamentals", "Collections", 3, "Collections", 16, 30,
    "ArrayList, HashMap, and the generics syntax.",
    [
      { h: "List and Map", code: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] a) {\n        List<String> langs = new ArrayList<>();\n        langs.add("java");\n        langs.add("kotlin");\n\n        Map<String, Integer> xp = new HashMap<>();\n        xp.put("ada", 120);\n\n        System.out.println(langs.size() + " " + xp.get("ada"));\n    }\n}', lang: "java" },
      { list: ["List<T> — ordered, indexed", "Map<K,V> — key to value", "Generics (<T>) make collections type-safe"] },
    ],
    ["ArrayList grows dynamically", "HashMap gives O(1) lookup", "Generics catch type errors at compile time"]),

  L("java-control", "java-fundamentals", "Control Flow", 4, "Control Flow", 10, 25,
    "Loops and branches, Java style.",
    [
      { h: "Enhanced for", code: 'public class Main {\n    public static void main(String[] a) {\n        int[] nums = {1, 2, 3, 4};\n        int sum = 0;\n        for (int n : nums) {\n            if (n % 2 == 0) sum += n;\n        }\n        System.out.println("even sum: " + sum);\n    }\n}', lang: "java" },
    ],
    ["for (T x : arr) walks values", "Arrays have fixed length", "switch supports strings and enums"]),

  L("java-interfaces", "java-fundamentals", "OOP", 5, "Interfaces", 14, 35,
    "Contracts over implementations — how Java code stays decoupled.",
    [
      { h: "Defining and implementing", code: 'interface Shape {\n    double area();\n}\n\nclass Square implements Shape {\n    double side;\n    Square(double s) { side = s; }\n    public double area() { return side * side; }\n}\n\npublic class Main {\n    public static void main(String[] a) {\n        Shape s = new Square(4);\n        System.out.println(s.area());\n    }\n}', lang: "java" },
      { p: "Code against the interface, not the class: any future Shape plugs in without touching callers." },
    ],
    ["Interfaces declare contracts", "implements fulfills them", "Polymorphism: one interface, many shapes"]),

  /* ----- Web Development Fundamentals ----- */
  L("web-html", "web-dev-fundamentals", "The Browser", 1, "HTML Foundations", 14, 25,
    "Elements, attributes, and semantic structure.",
    [
      { p: "HTML is a tree of elements. Browsers parse it into the DOM — a live object model your code can manipulate." },
      { h: "Semantic markup", code: '<header>\n  <h1>CodeVerse</h1>\n  <nav><a href="/learn">Learn</a></nav>\n</header>\n<main>\n  <article>\n    <h2>Why semantic HTML?</h2>\n    <p>Screen readers, SEO, and future-you all benefit.</p>\n  </article>\n</main>', lang: "html" },
      { list: ["Elements nest into a tree", "Attributes configure elements", "Semantic tags describe meaning, not looks"] },
    ],
    ["HTML = structure tree", "Semantics aid accessibility & SEO", "The DOM is the live object model"]),

  L("web-css", "web-dev-fundamentals", "The Browser", 2, "CSS Layout: Flexbox & Grid", 18, 30,
    "The two layout systems that ended the float era.",
    [
      { h: "Flexbox — one dimension", code: '.toolbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n}', lang: "css" },
      { h: "Grid — two dimensions", code: '.gallery {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  gap: 16px;\n}', lang: "css" },
      { list: ["Flexbox: rows OR columns", "Grid: rows AND columns", "gap replaces margin hacks"] },
    ],
    ["Flexbox aligns one axis", "Grid places in two axes", "auto-fill + minmax = responsive for free"]),

  L("web-dom", "web-dev-fundamentals", "The Browser", 3, "JavaScript & the DOM", 16, 30,
    "querySelector, events, and updating the page live.",
    [
      { h: "Reacting to users", code: 'const btn = document.querySelector("#run");\nconst out = document.querySelector("#output");\n\nbtn.addEventListener("click", () => {\n  out.textContent = "Executed at " + new Date().toLocaleTimeString();\n});', lang: "javascript" },
      { list: ["querySelector finds elements via CSS selectors", "addEventListener subscribes to events", "Mutate textContent/style to update the page"] },
    ],
    ["The DOM is a JS API over your HTML", "Events drive interactivity", "Prefer textContent over innerHTML for text"]),

  L("web-fetch", "web-dev-fundamentals", "Data", 4, "Fetch & JSON APIs", 18, 35,
    "Talking to servers with fetch(), promises, and JSON.",
    [
      { h: "GET request", code: 'async function loadUser() {\n  const res = await fetch("https://api.example.com/users/1");\n  if (!res.ok) throw new Error("HTTP " + res.status);\n  const user = await res.json();\n  console.log(user.name);\n}\nloadUser();', lang: "javascript" },
      { h: "POST request", code: 'await fetch("/api/posts", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ title: "Hello" }),\n});', lang: "javascript" },
    ],
    ["fetch returns a promise", "Always check res.ok", "JSON.stringify/parse cross the wire"]),

  L("web-responsive", "web-dev-fundamentals", "Craft", 5, "Responsive Design", 14, 30,
    "Media queries, fluid units, and mobile-first thinking.",
    [
      { h: "Mobile-first", p: "Style the small screen first, then add complexity at wider breakpoints.", code: '.grid { display: grid; gap: 16px; }\n\n@media (min-width: 768px) {\n  .grid { grid-template-columns: 1fr 1fr; }\n}\n\n@media (min-width: 1200px) {\n  .grid { grid-template-columns: repeat(3, 1fr); }\n}', lang: "css" },
      { list: ["min-width media queries layer up", "rem/clamp() beat fixed px", "Test with real devices, not just devtools"] },
    ],
    ["Design mobile-first", "Breakpoints add layout, not fixes", "Fluid units scale between breakpoints"]),

  L("web-a11y", "web-dev-fundamentals", "Craft", 6, "Accessibility Essentials", 12, 30,
    "Labels, focus, and contrast — building for every user.",
    [
      { h: "The non-negotiables", code: '<label for="email">Email</label>\n<input id="email" type="email" required />\n\n<button type="button" aria-label="Close dialog">×</button>\n\n<img src="chart.png" alt="Bar chart: 40% prefer dark mode" />', lang: "html" },
      { list: ["Every input gets a <label>", "Interactive elements must be keyboard-focusable", "Alt text describes, decorative images get alt=\"\"", "4.5:1 contrast minimum for body text"] },
    ],
    ["Labels bind text to inputs", "Keyboard access is mandatory", "Contrast is measurable, not a vibe"]),

  /* ----- SQL Fundamentals ----- */
  L("sql-select", "sql-fundamentals", "Querying", 1, "SELECT & FROM", 12, 20,
    "Your first queries: columns, rows, aliases.",
    [
      { p: "SQL is declarative: you describe the result you want, the engine figures out how to build it." },
      { h: "Basics", code: "SELECT name, xp FROM users;\n\nSELECT name AS player, xp * 2 AS double_xp\nFROM users;\n\nSELECT DISTINCT language FROM submissions;", lang: "sql" },
      { list: ["SELECT lists columns, FROM names the table", "AS aliases results", "DISTINCT removes duplicates"] },
    ],
    ["Declarative: what, not how", "Alias with AS", "DISTINCT dedupes rows"],
    { prompt: "Select name and xp from users.", starter: "-- write your query\n", hint: "SELECT name, xp FROM users;" }),

  L("sql-where", "sql-fundamentals", "Querying", 2, "WHERE & Operators", 14, 25,
    "Filtering rows with comparisons, AND/OR, LIKE, IN.",
    [
      { h: "Filters", code: "SELECT * FROM users WHERE xp >= 100;\n\nSELECT * FROM users\nWHERE language = 'python' AND streak > 3;\n\nSELECT * FROM users WHERE name LIKE 'A%';\n\nSELECT * FROM users WHERE language IN ('go', 'rust');", lang: "sql" },
      { list: ["=, <>, <, >, <=, >= compare", "AND binds tighter than OR — use parentheses", "LIKE '%x%' pattern-matches"] },
    ],
    ["WHERE filters rows before output", "IN replaces long OR chains", "LIKE supports % wildcards"]),

  L("sql-order", "sql-fundamentals", "Querying", 3, "ORDER BY & LIMIT", 10, 20,
    "Sorting and paging results.",
    [
      { h: "Sort + page", code: "SELECT name, xp FROM users\nORDER BY xp DESC\nLIMIT 10;\n\nSELECT name FROM users\nORDER BY language ASC, xp DESC\nLIMIT 5 OFFSET 10;", lang: "sql" },
      { list: ["DESC = descending (default is ASC)", "LIMIT caps rows; OFFSET skips", "Order columns apply left to right"] },
    ],
    ["ORDER BY sorts the result set", "LIMIT/OFFSET paginate", "Multi-key sorts are left-to-right"]),

  L("sql-aggregates", "sql-fundamentals", "Aggregation", 4, "Aggregates & GROUP BY", 18, 35,
    "COUNT, SUM, AVG, and collapsing rows into groups.",
    [
      { h: "Aggregate functions", code: "SELECT COUNT(*) AS total,\n       AVG(xp)  AS avg_xp,\n       MAX(xp)  AS top_xp\nFROM users;", lang: "sql" },
      { h: "GROUP BY", p: "GROUP BY collapses rows sharing a key; HAVING filters groups the way WHERE filters rows.", code: "SELECT language, COUNT(*) AS devs\nFROM users\nGROUP BY language\nHAVING COUNT(*) > 100\nORDER BY devs DESC;", lang: "sql" },
    ],
    ["Aggregates summarize many rows", "GROUP BY defines the grain", "HAVING filters after grouping"],
    { prompt: "Count users per language, sorted by count descending.", starter: "-- SELECT language, COUNT(*) …\n", hint: "GROUP BY language ORDER BY COUNT(*) DESC" }),

  L("sql-joins", "sql-fundamentals", "Relational", 5, "JOINs", 20, 40,
    "Combining tables: INNER, LEFT, and the mental model of keys.",
    [
      { p: "Relational data is split across tables; JOINs stitch it back together using keys." },
      { h: "INNER vs LEFT", code: "-- only users WITH submissions\nSELECT u.name, s.challenge_id\nFROM users u\nINNER JOIN submissions s ON s.user_id = u.id;\n\n-- all users, submissions optional (NULL when absent)\nSELECT u.name, COUNT(s.id) AS solves\nFROM users u\nLEFT JOIN submissions s ON s.user_id = u.id\nGROUP BY u.id, u.name;", lang: "sql" },
      { list: ["INNER JOIN: only matching pairs", "LEFT JOIN: keep all left rows, NULL when no match", "Join ON key equality — foreign key to primary key"] },
    ],
    ["JOINs connect tables via keys", "LEFT JOIN preserves unmatched left rows", "NULL signals 'no related row'"]),

  L("sql-mutations", "sql-fundamentals", "Relational", 6, "INSERT, UPDATE, DELETE", 14, 30,
    "Changing data — and doing it safely.",
    [
      { h: "Mutations", code: "INSERT INTO users (name, language, xp)\nVALUES ('Grace', 'sql', 0);\n\nUPDATE users SET xp = xp + 25\nWHERE name = 'Grace';\n\nDELETE FROM users WHERE xp = 0 AND name = 'Grace';", lang: "sql" },
      { p: "Golden rule: UPDATE and DELETE without WHERE affect every row. Always preview with a SELECT using the same WHERE first." },
    ],
    ["INSERT adds rows", "UPDATE/DELETE need WHERE", "Preview destructive WHEREs with SELECT first"]),

  /* ----- TypeScript Fundamentals ----- */
  L("ts-why", "typescript-fundamentals", "Types", 1, "Why Types?", 10, 25,
    "The case for a type system on top of JavaScript.",
    [
      { p: "TypeScript checks your code before it runs. Whole categories of bugs — typos, wrong shapes, null surprises — become compile-time errors." },
      { h: "Caught before runtime", code: 'function greet(name: string): string {\n  return "Hello, " + name;\n}\n\n// greet(42);        // compile error: number ≠ string\nconsole.log(greet("Ada"));', lang: "typescript" },
      { p: "Types also power tooling: autocomplete, rename, and safe refactors across thousands of files." },
    ],
    ["Errors surface at compile time", "Types document intent", "Tooling quality scales with types"]),

  L("ts-basics", "typescript-fundamentals", "Types", 2, "Basic Types & Interfaces", 16, 30,
    "Primitives, arrays, and describing object shapes.",
    [
      { h: "Interfaces", code: 'interface User {\n  id: number;\n  name: string;\n  email?: string;   // optional\n  readonly createdAt: number;\n}\n\nconst ada: User = {\n  id: 1,\n  name: "Ada",\n  createdAt: Date.now(),\n};\n\nconst names: string[] = ["ada", "grace"];', lang: "typescript" },
      { list: ["? marks optional properties", "readonly forbids reassignment", "T[] or Array<T> for arrays"] },
    ],
    ["Interfaces name object shapes", "? = optional, readonly = immutable field", "Structural typing: shape matters, not name"]),

  L("ts-functions", "typescript-fundamentals", "Types", 3, "Functions & Generics", 18, 35,
    "Typing parameters, returns, and writing reusable generic code.",
    [
      { h: "Typed functions", code: 'const add = (a: number, b: number): number => a + b;\n\nfunction first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\n\nconsole.log(add(2, 3));\nconsole.log(first([10, 20]));      // number | undefined\nconsole.log(first(["a", "b"]));    // string, inferred', lang: "typescript" },
      { p: "Generics keep code reusable while staying precise: first() returns T, not any." },
    ],
    ["Annotate params and returns", "Generics preserve type info", "Avoid any — it deletes the type system"]),

  L("ts-narrowing", "typescript-fundamentals", "Types", 4, "Narrowing & Unions", 14, 30,
    "Union types and how control flow proves which type you hold.",
    [
      { h: "Narrowing", code: 'type Shape =\n  | { kind: "circle"; radius: number }\n  | { kind: "square"; side: number };\n\nfunction area(s: Shape): number {\n  if (s.kind === "circle") {\n    return Math.PI * s.radius ** 2;  // TS knows: circle\n  }\n  return s.side ** 2;                // TS knows: square\n}', lang: "typescript" },
      { list: ["Discriminated unions: shared literal field", "if/switch narrow the type inside branches", "The compiler exhaustiveness-checks for you"] },
    ],
    ["Unions model 'one of these shapes'", "Control flow narrows types", "Discriminants make invalid states unrepresentable"]),

  /* ----- Go Fundamentals ----- */
  L("go-hello", "go-fundamentals", "Getting Started", 1, "Hello, Go", 10, 20,
    "go run, package main, and Go's radical simplicity.",
    [
      { p: "Go compiles to a single static binary in milliseconds. No build config, no dependency hell — go run main.go and it executes." },
      { h: "First program", code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, CodeVerse!")\n}', lang: "go" },
    ],
    ["go run compiles + executes", "Executables start at package main", "fmt is the standard I/O package"]),

  L("go-types", "go-fundamentals", "Getting Started", 2, "Variables & Types", 14, 25,
    ":= inference, zero values, and static typing.",
    [
      { h: "Declarations", code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    name := "Ada"      // inferred string\n    var xp int = 120   // explicit\n    var ratio float64  // zero value: 0\n    ok := true\n    fmt.Println(name, xp, ratio, ok)\n}', lang: "go" },
      { p: "Every type has a zero value (0, \"\", false, nil). Go has no undefined — uninitialized means zero." },
    ],
    [":= declares and infers", "Zero values replace null-ness for primitives", "Unused variables are compile errors"]),

  L("go-errors", "go-fundamentals", "Functions", 3, "Functions & Errors", 16, 30,
    "Multiple returns and errors as values.",
    [
      { h: "Errors are values", code: 'package main\n\nimport (\n    "errors"\n    "fmt"\n)\n\nfunc divide(a, b float64) (float64, error) {\n    if b == 0 {\n        return 0, errors.New("division by zero")\n    }\n    return a / b, nil\n}\n\nfunc main() {\n    r, err := divide(10, 0)\n    if err != nil {\n        fmt.Println("error:", err)\n        return\n    }\n    fmt.Println(r)\n}', lang: "go" },
      { list: ["Return (result, error) pairs", "Always check err before using the result", "nil error means success"] },
    ],
    ["Errors are ordinary values", "Check err at every call site", "No exceptions — explicit flow"]),

  L("go-structs", "go-fundamentals", "Types", 4, "Structs & Interfaces", 14, 35,
    "Go's object model: composition over inheritance.",
    [
      { h: "Structs + methods", code: 'package main\n\nimport "fmt"\n\ntype Account struct {\n    Owner   string\n    Balance float64\n}\n\nfunc (a *Account) Deposit(amount float64) {\n    a.Balance += amount\n}\n\nfunc main() {\n    acc := Account{Owner: "Ada"}\n    acc.Deposit(50)\n    fmt.Println(acc.Owner, acc.Balance)\n}', lang: "go" },
      { p: "Interfaces are satisfied implicitly — no 'implements' keyword. If it has the methods, it is the interface." },
    ],
    ["Structs hold data, methods attach behavior", "Pointer receivers allow mutation", "Interfaces are implicit contracts"]),

  // Comprehensive A-to-Z lessons
  ...COMPREHENSIVE_LESSONS,
];

/* ================= CHALLENGES ================= */

const C = (
  id: string, title: string, language: string, difficulty: Challenge["difficulty"],
  category: string, tags: string[], points: number, description: string[],
  fnName: string, starter: string, tests: Challenge["tests"],
  constraints: string[] = ["1 ≤ input size ≤ 10⁴", "Return values must match exactly"],
  sample?: Challenge["sample"],
): Challenge => ({ id, slug: id, title, language, difficulty, category, tags, points, description, constraints, sample, starter, fnName, tests, published: true });

export const CHALLENGES: Challenge[] = [
  C("js-two-sum", "Two Sum", "javascript", "Easy", "Arrays", ["arrays", "hashmap"], 50,
    ["Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.", "You may assume exactly one solution exists, and you may not use the same element twice. Return the indices as [i, j] with i < j."],
    "twoSum",
    "/**\n * @param {number[]} nums\n * @param {number} target\n * @returns {number[]} [i, j]\n */\nfunction twoSum(nums, target) {\n  // your code here\n  return [];\n}",
    [
      { name: "basic pair", args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { name: "later pair", args: [[3, 2, 4], 6], expected: [1, 2] },
      { name: "negatives", args: [[-3, 4, 3, 90], 0], expected: [0, 2] },
      { name: "duplicates", args: [[3, 3], 6], expected: [0, 1] },
      { name: "hidden case", args: [[1, 5, 8, 3, 9], 12], expected: [2, 3], hidden: true },
    ],
    ["2 ≤ nums.length ≤ 10⁴", "Exactly one valid answer exists"],
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" }),

  C("js-reverse-string", "Reverse a String", "javascript", "Easy", "Strings", ["strings"], 30,
    ["Given a string s, return the string reversed."],
    "reverseString",
    "function reverseString(s) {\n  // your code here\n  return s;\n}",
    [
      { name: "word", args: ["hello"], expected: "olleh" },
      { name: "single char", args: ["a"], expected: "a" },
      { name: "empty", args: [""], expected: "" },
      { name: "spaces", args: ["code verse"], expected: "esrev edoc" },
      { name: "hidden palindrome", args: ["racecar"], expected: "racecar", hidden: true },
    ]),

  C("js-fizzbuzz", "FizzBuzz Array", "javascript", "Easy", "Algorithms", ["loops", "classic"], 30,
    ["Given n, return an array of strings for 1..n where multiples of 3 are \"Fizz\", multiples of 5 are \"Buzz\", multiples of both are \"FizzBuzz\", and everything else is the number as a string."],
    "fizzbuzz",
    "function fizzbuzz(n) {\n  // return string[]\n  return [];\n}",
    [
      { name: "n = 5", args: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
      { name: "n = 15 tail", args: [15], expected: ["1", "2", "Fizz", "4", "Buzz", "Fizz", "7", "8", "Fizz", "Buzz", "11", "Fizz", "13", "14", "FizzBuzz"] },
      { name: "n = 1", args: [1], expected: ["1"] },
      { name: "hidden n = 3", args: [3], expected: ["1", "2", "Fizz"], hidden: true },
    ]),

  C("js-palindrome", "Palindrome Check", "javascript", "Easy", "Strings", ["strings", "two-pointers"], 30,
    ["Return true if the given string reads the same forwards and backwards, ignoring case and non-alphanumeric characters."],
    "isPalindrome",
    "function isPalindrome(s) {\n  // your code here\n  return false;\n}",
    [
      { name: "simple", args: ["racecar"], expected: true },
      { name: "sentence", args: ["A man, a plan, a canal: Panama"], expected: true },
      { name: "not one", args: ["code"], expected: false },
      { name: "mixed case", args: ["AbBa"], expected: true },
      { name: "hidden empty", args: [""], expected: true, hidden: true },
    ]),

  C("js-largest-three", "Largest of Three", "javascript", "Easy", "Algorithms", ["conditionals"], 20,
    ["Return the largest of three numbers without using Math.max."],
    "largestOfThree",
    "function largestOfThree(a, b, c) {\n  // no Math.max!\n  return a;\n}",
    [
      { name: "a wins", args: [9, 2, 3], expected: 9 },
      { name: "c wins", args: [1, 2, 30], expected: 30 },
      { name: "negatives", args: [-5, -1, -9], expected: -1 },
      { name: "ties", args: [4, 4, 2], expected: 4 },
    ]),

  C("js-vowels", "Count Vowels", "javascript", "Easy", "Strings", ["strings", "loops"], 25,
    ["Return the number of vowels (a, e, i, o, u — any case) in the given string."],
    "countVowels",
    "function countVowels(s) {\n  // your code here\n  return 0;\n}",
    [
      { name: "hello", args: ["hello"], expected: 2 },
      { name: "mixed case", args: ["CodeVerse"], expected: 4 },
      { name: "none", args: ["rhythm"], expected: 0 },
      { name: "all vowels", args: ["aeiouAEIOU"], expected: 10 },
    ]),

  C("js-factorial", "Factorial (Recursive)", "javascript", "Easy", "Recursion", ["recursion", "math"], 30,
    ["Return n! using recursion. factorial(0) = 1."],
    "factorial",
    "function factorial(n) {\n  // recursion required\n  return 1;\n}",
    [
      { name: "0!", args: [0], expected: 1 },
      { name: "5!", args: [5], expected: 120 },
      { name: "10!", args: [10], expected: 3628800 },
      { name: "1!", args: [1], expected: 1 },
    ]),

  C("js-sum-array", "Sum of Array", "javascript", "Easy", "Arrays", ["arrays", "reduce"], 20,
    ["Return the sum of all numbers in the array. Empty arrays sum to 0."],
    "sumArray",
    "function sumArray(nums) {\n  // your code here\n  return 0;\n}",
    [
      { name: "basic", args: [[1, 2, 3, 4]], expected: 10 },
      { name: "negatives", args: [[-1, 1, -2, 2]], expected: 0 },
      { name: "empty", args: [[]], expected: 0 },
      { name: "floats", args: [[0.5, 0.25]], expected: 0.75 },
    ]),

  C("js-is-prime", "Prime Check", "javascript", "Medium", "Math", ["math", "loops"], 60,
    ["Return true if n is a prime number, false otherwise. A prime is greater than 1 with no divisors other than 1 and itself."],
    "isPrime",
    "function isPrime(n) {\n  // your code here\n  return false;\n}",
    [
      { name: "2", args: [2], expected: true },
      { name: "1 is not prime", args: [1], expected: false },
      { name: "97", args: [97], expected: true },
      { name: "100", args: [100], expected: false },
      { name: "hidden large prime", args: [7919], expected: true, hidden: true },
      { name: "hidden 0", args: [0], expected: false, hidden: true },
    ]),

  C("js-capitalize", "Capitalize Words", "javascript", "Medium", "Strings", ["strings", "map"], 50,
    ["Capitalize the first letter of every word in the sentence; leave the rest of each word unchanged."],
    "capitalizeWords",
    "function capitalizeWords(sentence) {\n  // your code here\n  return sentence;\n}",
    [
      { name: "basic", args: ["hello world"], expected: "Hello World" },
      { name: "mixed", args: ["javaScript is fun"], expected: "JavaScript Is Fun" },
      { name: "single", args: ["go"], expected: "Go" },
      { name: "hidden punctuation", args: ["one, two. three!"], expected: "One, Two. Three!", hidden: true },
    ]),

  C("js-longest-word", "Longest Word", "javascript", "Medium", "Strings", ["strings", "split"], 45,
    ["Return the longest word in the sentence (split on spaces). On ties, return the first one."],
    "longestWord",
    "function longestWord(sentence) {\n  // your code here\n  return \"\";\n}",
    [
      { name: "basic", args: ["the quick brown fox"], expected: "quick" },
      { name: "tie keeps first", args: ["aa bb cc"], expected: "aa" },
      { name: "single word", args: ["supercalifragilistic"], expected: "supercalifragilistic" },
    ]),

  C("js-flatten", "Flatten Nested Arrays", "javascript", "Medium", "Recursion", ["recursion", "arrays"], 70,
    ["Flatten an arbitrarily nested array into a single-level array, preserving order. Do not use Array.prototype.flat."],
    "flatten",
    "function flatten(arr) {\n  // recursion, no .flat()\n  return arr;\n}",
    [
      { name: "one level", args: [[[1, 2], [3]]], expected: [1, 2, 3] },
      { name: "deep", args: [[1, [2, [3, [4]], 5]]], expected: [1, 2, 3, 4, 5] },
      { name: "empty", args: [[]], expected: [] },
      { name: "hidden mixed", args: [[[0], 1, [2, [3]]]], expected: [0, 1, 2, 3], hidden: true },
    ]),

  C("js-occurrences", "Count Occurrences", "javascript", "Medium", "Arrays", ["arrays", "objects"], 45,
    ["Return an object mapping each value in the array to how many times it appears."],
    "countOccurrences",
    "function countOccurrences(arr) {\n  // return { value: count }\n  return {};\n}",
    [
      { name: "basic", args: [["a", "b", "a"]], expected: { a: 2, b: 1 } },
      { name: "numbers", args: [[1, 1, 2, 3, 3, 3]], expected: { 1: 2, 2: 1, 3: 3 } },
      { name: "single", args: [["x"]], expected: { x: 1 } },
    ]),

  /* ----- Python (simulated engine — honestly labeled) ----- */
  C("py-hello-name", "Greeting Function", "python", "Easy", "Python Basics", ["functions", "strings"], 25,
    ["Write a function greet(name) that returns the string \"Hello, {name}!\"."],
    "greet",
    "def greet(name):\n    # return the greeting string\n    return \"\"",
    [
      { name: "Ada", args: ["Ada"], expected: "Hello, Ada!" },
      { name: "Grace", args: ["Grace"], expected: "Hello, Grace!" },
      { name: "hidden empty", args: [""], expected: "Hello, !", hidden: true },
    ]),

  C("py-even-odd", "Even or Odd", "python", "Easy", "Python Basics", ["conditionals", "modulo"], 25,
    ["Return \"even\" if n is even, otherwise \"odd\"."],
    "even_or_odd",
    "def even_or_odd(n):\n    # your code here\n    return \"\"",
    [
      { name: "even", args: [4], expected: "even" },
      { name: "odd", args: [7], expected: "odd" },
      { name: "zero", args: [0], expected: "even" },
      { name: "negative", args: [-3], expected: "odd" },
    ]),

  C("py-list-sum", "List Sum", "python", "Easy", "Python Basics", ["lists", "loops"], 25,
    ["Return the sum of all numbers in the list without using sum()."],
    "list_sum",
    "def list_sum(nums):\n    # no sum() — loop it\n    return 0",
    [
      { name: "basic", args: [[1, 2, 3]], expected: 6 },
      { name: "negatives", args: [[-1, 1]], expected: 0 },
      { name: "empty", args: [[]], expected: 0 },
    ]),

  C("py-max-element", "Max Element", "python", "Easy", "Python Basics", ["lists", "loops"], 30,
    ["Return the largest element of a non-empty list without using max()."],
    "max_element",
    "def max_element(nums):\n    # no max()\n    return nums[0]",
    [
      { name: "basic", args: [[3, 9, 2]], expected: 9 },
      { name: "negatives", args: [[-5, -1, -8]], expected: -1 },
      { name: "single", args: [[42]], expected: 42 },
    ]),

  C("py-repeat-string", "Repeat String", "python", "Easy", "Python Basics", ["strings", "operators"], 20,
    ["Return s repeated n times, joined with \"-\". Example: (\"ab\", 3) → \"ab-ab-ab\"."],
    "repeat_string",
    "def repeat_string(s, n):\n    # your code here\n    return \"\"",
    [
      { name: "basic", args: ["ab", 3], expected: "ab-ab-ab" },
      { name: "once", args: ["x", 1], expected: "x" },
      { name: "zero", args: ["x", 0], expected: "" },
    ]),

  C("py-word-count", "Word Count", "python", "Medium", "Python Basics", ["dicts", "strings"], 55,
    ["Return a dict mapping each word (split on spaces, lowercased) to its count."],
    "word_count",
    "def word_count(text):\n    # return a dict\n    return {}",
    [
      { name: "basic", args: ["a b a"], expected: { a: 2, b: 1 } },
      { name: "case", args: ["Hi hi"], expected: { hi: 2 } },
      { name: "hidden longer", args: ["the cat and the dog"], expected: { the: 2, cat: 1, and: 1, dog: 1 }, hidden: true },
    ]),

  /* ----- SQL (simulated engine) ----- */
  C("sql-where-easy", "Filter High XP", "sql", "Easy", "SQL", ["select", "where"], 30,
    ["Write a query returning name and xp from users where xp is at least 100, ordered by xp descending."],
    "query",
    "-- write your query\n",
    [
      { name: "filters correctly", stdin: "users: 5 rows", expected: "rows where xp >= 100, DESC" },
      { name: "selects right columns", stdin: "users", expected: "name, xp" },
    ]),

  C("sql-group-count", "Devs per Language", "sql", "Medium", "SQL", ["group-by", "count"], 55,
    ["Return each language and the number of users who use it, only for languages with more than one user, sorted by count descending."],
    "query",
    "-- GROUP BY challenge\n",
    [
      { name: "groups & counts", stdin: "users: 200 rows", expected: "language, COUNT(*)" },
      { name: "having clause", stdin: "users", expected: "HAVING COUNT(*) > 1" },
    ]),

  C("sql-left-join", "Users With Optional Solves", "sql", "Medium", "SQL", ["join", "left-join"], 65,
    ["List every user's name plus their number of submissions (0 when they have none), using a LEFT JOIN."],
    "query",
    "-- LEFT JOIN users to submissions\n",
    [
      { name: "keeps all users", stdin: "users + submissions", expected: "LEFT JOIN" },
      { name: "counts zeros", stdin: "users", expected: "COUNT(s.id) = 0 for non-submitters" },
    ]),

  /* ----- stdin/stdout challenges — judged for REAL in any language via sandbox containers ----- */
  { ...C("py-io-sum", "A + B (Python I/O)", "python", "Easy", "I/O", ["python", "stdin"], 35,
    ["Read one line containing two space-separated integers and print their sum."],
    "main",
    "# read a line like: 2 3\nline = input().split()\na = int(line[0])\nb = int(line[1])\n\n# print the sum\n",
    [
      { name: "2 3", stdin: "2 3", expected: "5" },
      { name: "10 -4", stdin: "10 -4", expected: "6" },
      { name: "0 0", stdin: "0 0", expected: "0" },
      { name: "hidden big", stdin: "1000000 234567", expected: "1234567", hidden: true },
    ], ["Input is one line, two integers separated by a space"]), mode: "io" as const },

  { ...C("py-io-fizz", "FizzBuzz Printer (Python)", "python", "Medium", "I/O", ["python", "loops"], 50,
    ["Read an integer n from stdin. Print 1..n, one value per line: \"Fizz\" for multiples of 3, \"Buzz\" for multiples of 5, \"FizzBuzz\" for both."],
    "main",
    "n = int(input())\n\n# print 1..n with the FizzBuzz rules\n",
    [
      { name: "n = 5", stdin: "5", expected: "1\n2\nFizz\n4\nBuzz" },
      { name: "n = 15", stdin: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
      { name: "hidden n = 3", stdin: "3", expected: "1\n2\nFizz", hidden: true },
    ]), mode: "io" as const },

  { ...C("c-io-double", "Double It (C)", "c", "Easy", "I/O", ["c", "scanf"], 35,
    ["Read one integer from stdin and print its double. Classic first C program with real I/O."],
    "main",
    "#include <stdio.h>\n\nint main(void) {\n    int n;\n    scanf(\"%d\", &n);\n    /* print n * 2 */\n    return 0;\n}\n",
    [
      { name: "21", stdin: "21", expected: "42" },
      { name: "0", stdin: "0", expected: "0" },
      { name: "negative", stdin: "-5", expected: "-10" },
      { name: "hidden", stdin: "123", expected: "246", hidden: true },
    ]), mode: "io" as const },

  { ...C("cpp-io-max3", "Max of Three (C++)", "cpp", "Easy", "I/O", ["cpp", "iostream"], 35,
    ["Read three space-separated integers from stdin and print the largest."],
    "main",
    "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b, c;\n    cin >> a >> b >> c;\n    // print the maximum\n    return 0;\n}\n",
    [
      { name: "basic", stdin: "3 9 2", expected: "9" },
      { name: "negatives", stdin: "-5 -1 -8", expected: "-1" },
      { name: "ties", stdin: "4 4 2", expected: "4" },
      { name: "hidden", stdin: "1 2 3", expected: "3", hidden: true },
    ]), mode: "io" as const },

  { ...C("java-io-greet", "Greeter (Java)", "java", "Easy", "I/O", ["java", "scanner"], 35,
    ["Read a name from stdin and print exactly: Hello, {name}!"],
    "main",
    "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String name = sc.nextLine();\n        // print: Hello, <name>!\n    }\n}\n",
    [
      { name: "Ada", stdin: "Ada", expected: "Hello, Ada!" },
      { name: "Grace", stdin: "Grace", expected: "Hello, Grace!" },
      { name: "hidden empty", stdin: "", expected: "Hello, !" },
    ]), mode: "io" as const },

  { ...C("go-io-sum", "Sum Two (Go)", "go", "Easy", "I/O", ["go", "fmt"], 35,
    ["Read two space-separated integers from stdin and print their sum."],
    "main",
    "package main\n\nimport \"fmt\"\n\nfunc main() {\n    var a, b int\n    fmt.Scanf(\"%d %d\", &a, &b)\n    // print a + b\n}\n",
    [
      { name: "2 3", stdin: "2 3", expected: "5" },
      { name: "7 8", stdin: "7 8", expected: "15" },
      { name: "hidden", stdin: "-2 2", expected: "0", hidden: true },
    ]), mode: "io" as const },

  { ...C("rust-io-len", "Line Length (Rust)", "rust", "Medium", "I/O", ["rust", "ownership"], 55,
    ["Read one line from stdin and print its length in characters (excluding the newline)."],
    "main",
    "use std::io;\n\nfn main() {\n    let mut line = String::new();\n    io::stdin().read_line(&mut line).unwrap();\n    // print line.trim().len()\n}\n",
    [
      { name: "hello", stdin: "hello", expected: "5" },
      { name: "with spaces", stdin: "code verse", expected: "10" },
      { name: "hidden empty", stdin: "", expected: "0", hidden: true },
    ]), mode: "io" as const },
];

/* ================= PROJECTS ================= */

const P = (
  id: string, title: string, language: string, level: Project["level"], hours: number,
  description: string, outcomes: string[], tasks: [string, string, number][], hue: number,
): Project => ({
  id, slug: id, title, language, level, hours, description, outcomes, hue,
  tasks: tasks.map(([t, d, xp], i) => ({ id: `${id}-t${i + 1}`, title: t, desc: d, xp })),
});

export const PROJECTS: Project[] = [
  P("fullstack-task-manager", "Full-Stack Task Manager", "typescript", "Intermediate", 14,
    "The classic, done properly: a production-grade task app with auth, a real database schema, REST API, and a responsive frontend.",
    ["Design a relational schema", "Build a REST API with validation", "Implement session auth", "Ship optimistic UI updates"],
    [
      ["Setup & architecture", "Scaffold the repo, choose the stack, define the folder structure and data model on paper.", 40],
      ["Database schema", "Model users, tasks, and tags with foreign keys, indexes, and constraints.", 60],
      ["Authentication", "Registration, login, hashed passwords, and protected routes.", 80],
      ["Backend API", "CRUD endpoints with input validation and proper status codes.", 80],
      ["Frontend", "List, create, edit, complete — with loading and empty states.", 80],
      ["Testing", "API integration tests and a critical-path e2e test.", 60],
      ["Deployment", "Environment config, migrations in CI, and a live URL.", 60],
    ], 200),
  P("personal-portfolio", "Developer Portfolio", "javascript", "Beginner", 8,
    "A fast, accessible portfolio that shows your projects — and proves you understand the platform it runs on.",
    ["Semantic HTML & a11y", "Modern CSS layout", "Performance budget", "Deploy with a custom domain"],
    [
      ["Content inventory", "List projects, write 3-sentence case studies for each.", 30],
      ["HTML skeleton", "Semantic structure: header, main, project articles, footer.", 40],
      ["Design system", "Type scale, colors, spacing tokens in CSS custom properties.", 40],
      ["Layout & responsive", "Grid/flexbox layouts that hold up from 320px to 4K.", 60],
      ["Interactions", "Scroll reveals, hover states, theme toggle.", 40],
      ["Performance pass", "Image optimization, font subsetting, Lighthouse 95+.", 50],
      ["Ship it", "Deploy, custom domain, HTTPS, and share the link.", 40],
    ], 45),
  P("weather-cli", "Weather CLI", "python", "Beginner", 5,
    "A command-line tool that fetches real weather data, caches it, and renders it beautifully in a terminal.",
    ["argparse / flags", "HTTP & JSON", "File-based caching", "Terminal UX"],
    [
      ["CLI skeleton", "Parse a city argument and --units flag with argparse.", 40],
      ["API integration", "Fetch from a weather API; handle HTTP errors gracefully.", 50],
      ["Caching", "Cache responses per city for 15 minutes in a local file.", 40],
      ["Rendering", "ASCII icons, aligned columns, color output.", 40],
      ["Edge cases", "Unknown cities, network failures, empty results.", 30],
      ["Packaging", "Make it installable: entry point and README.", 30],
    ], 210),
  P("expense-tracker", "Expense Tracker", "javascript", "Intermediate", 12,
    "Track spending with categories, monthly summaries, and charts — localStorage-first, exportable to CSV.",
    ["Data modeling in JS", "Date math", "Chart rendering", "CSV import/export"],
    [
      ["Data model", "Expense objects, categories, and storage schema.", 40],
      ["Entry form", "Validated form with amount, date, category.", 50],
      ["List & filters", "Sortable list with month and category filters.", 60],
      ["Summaries", "Monthly totals, category breakdown, top expenses.", 60],
      ["Charts", "Bar/donut charts from your aggregates (canvas or SVG).", 70],
      ["CSV export/import", "Round-trip data without loss.", 40],
    ], 35),
  P("rest-api-go", "REST API in Go", "go", "Intermediate", 10,
    "A JSON API for a notes service in Go: routing, middleware, in-memory store, and graceful shutdown.",
    ["net/http routing", "Middleware chains", "JSON encoding", "Concurrency-safe stores"],
    [
      ["Server skeleton", "net/http server with health endpoint and graceful shutdown.", 50],
      ["Routes & handlers", "CRUD for notes with proper status codes.", 70],
      ["Store", "Concurrency-safe in-memory store with RWMutex.", 60],
      ["Middleware", "Logging, request IDs, and panic recovery.", 50],
      ["Validation", "Reject bad payloads with useful 400s.", 40],
      ["Docs & tests", "OpenAPI sketch + table-driven tests.", 50],
    ], 170),
  P("markdown-blog", "Markdown Blog Engine", "typescript", "Intermediate", 12,
    "A static blog engine: parse markdown files into HTML pages with syntax-highlighted code blocks and RSS.",
    ["Filesystem tooling", "Markdown parsing", "Templating", "Static site generation"],
    [
      ["Project setup", "TS config, watch script, folder conventions.", 40],
      ["Markdown pipeline", "Parse frontmatter + markdown into structured posts.", 70],
      ["Templating", "Layouts, post pages, and index with reading time.", 60],
      ["Code highlighting", "Syntax-highlighted code blocks in output HTML.", 50],
      ["RSS & sitemap", "Generate feed.xml and sitemap.xml.", 40],
      ["Deploy", "Build step + static hosting.", 40],
    ], 205),
  P("quiz-game", "Realtime Quiz Game", "javascript", "Beginner", 7,
    "A multiplayer-feeling quiz game: timed questions, streaks, local high scores, and juicy feedback.",
    ["State machines", "Timers & animation", "Sound/feedback design", "LocalStorage leaderboards"],
    [
      ["Game model", "Questions, rounds, scoring, state machine.", 40],
      ["Core loop", "Question → timer → answer → feedback cycle.", 60],
      ["Juice", "Streak counters, transitions, micro-animations.", 50],
      ["Leaderboard", "Local high scores with names and dates.", 30],
      ["Question editor", "JSON question pack format + loader.", 40],
    ], 160),
  P("url-shortener", "URL Shortener", "sql", "Intermediate", 9,
    "Design the schema and queries behind a URL shortener: base62 codes, click analytics, and expiry.",
    ["Schema design", "Index strategy", "Analytics queries", "Base62 encoding"],
    [
      ["Schema", "urls, clicks, users tables with the right constraints.", 60],
      ["Short code", "Base62 generation + collision handling query.", 50],
      ["Redirect lookup", "Indexed lookup with expiry filtering.", 40],
      ["Analytics", "Clicks per day, top referrers, per-link stats.", 60],
      ["Abuse controls", "Rate limiting table + cleanup query for expired links.", 40],
    ], 215),
  P("habit-tracker", "Habit Tracker", "dart", "Beginner", 10,
    "A Flutter habit tracker: daily check-ins, streak grids, and gentle notifications.",
    ["Flutter widgets", "State management", "Local persistence", "Date grids"],
    [
      ["App skeleton", "Navigation shell with habits/home/stats tabs.", 40],
      ["Habit model", "Habit + completion records, local persistence.", 50],
      ["Check-in UI", "Today view with one-tap completions.", 50],
      ["Streak grid", "GitHub-style contribution grid per habit.", 60],
      ["Notifications", "Scheduled daily reminders.", 40],
    ], 150),
  P("chat-app", "Chat Application", "java", "Advanced", 16,
    "A socket-based chat server in Java with rooms, broadcast, and a simple swing/TUI client.",
    ["Sockets & threads", "Protocol design", "Concurrent collections", "Graceful disconnects"],
    [
      ["Protocol design", "Message framing: JOIN, MSG, LEAVE as JSON lines.", 60],
      ["Server core", "Thread-per-client socket server with rooms.", 90],
      ["Broadcast", "Efficient fan-out with concurrent collections.", 60],
      ["Client", "TUI or Swing client with input history.", 70],
      ["Robustness", "Timeouts, disconnects, and reconnection.", 50],
    ], 25),
];

/* ================= ACHIEVEMENTS ================= */

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-lesson", name: "Hello, World", desc: "Complete your first lesson", icon: "sparkles", metric: "lessons", threshold: 1 },
  { id: "five-lessons", name: "Momentum", desc: "Complete 5 lessons", icon: "zap", metric: "lessons", threshold: 5 },
  { id: "fifteen-lessons", name: "Scholar", desc: "Complete 15 lessons", icon: "book", metric: "lessons", threshold: 15 },
  { id: "first-solve", name: "Bug Hunter", desc: "Solve your first challenge", icon: "bug", metric: "challenges", threshold: 1 },
  { id: "five-solves", name: "Algorithmist", desc: "Solve 5 challenges", icon: "binary", metric: "challenges", threshold: 5 },
  { id: "ten-solves", name: "Grandmaster", desc: "Solve 10 challenges", icon: "trophy", metric: "challenges", threshold: 10 },
  { id: "xp-500", name: "Rising Star", desc: "Earn 500 XP", icon: "star", metric: "xp", threshold: 500 },
  { id: "xp-1500", name: "Committed", desc: "Earn 1,500 XP", icon: "flame", metric: "xp", threshold: 1500 },
  { id: "streak-3", name: "Warming Up", desc: "Reach a 3-day streak", icon: "calendar", metric: "streak", threshold: 3 },
  { id: "streak-7", name: "On Fire", desc: "Reach a 7-day streak", icon: "flame", metric: "streak", threshold: 7 },
  { id: "runs-25", name: "Compiler Whisperer", desc: "Run code 25 times", icon: "terminal", metric: "runs", threshold: 25 },
  { id: "polyglot-3", name: "Polyglot", desc: "Run code in 3 languages", icon: "globe", metric: "languages", threshold: 3 },
  { id: "polyglot-6", name: "Tower of Babel", desc: "Run code in 6 languages", icon: "layers", metric: "languages", threshold: 6 },
  { id: "first-snippet", name: "Saved for Later", desc: "Save a snippet in the Playground", icon: "save", metric: "snippets", threshold: 1 },
  { id: "first-post", name: "Voice in the Verse", desc: "Publish a community post", icon: "message", metric: "posts", threshold: 1 },
  { id: "ten-tasks", name: "Builder", desc: "Complete 10 project tasks", icon: "hammer", metric: "tasks", threshold: 10 },
  { id: "course-complete", name: "Graduate", desc: "Finish every lesson in a course", icon: "graduation", metric: "courses", threshold: 1 },
];

/* ================= DOCS ================= */

const T = (slug: string, title: string, minutes: number, intro: string, sections: LessonSection[], example: { name: string; code: string }): DocTopic =>
  ({ slug, title, minutes, intro, sections, example });

export const DOCS: Record<string, DocTopic[]> = {
  python: [
    T("syntax", "Syntax & Style", 8, "Python's grammar in one page: indentation, statements, and the style the community expects.",
      [
        { h: "Indentation is syntax", p: "Blocks are defined by consistent indentation (4 spaces by convention). A mixed-tabs file is a SyntaxError, not a style issue." },
        { h: "PEP 8 in 30 seconds", list: ["snake_case for functions/variables, PascalCase for classes", "max ~88 chars per line", "two blank lines between top-level defs", "import order: stdlib → third-party → local"] },
      ],
      { name: "style.py", code: 'import math\n\n\ndef circle_area(radius):\n    """Return the area of a circle."""\n    return math.pi * radius ** 2\n\n\nprint(circle_area(2))' }),
    T("data-types", "Data Types", 10, "int, float, str, bool, list, dict, tuple, set — and when to reach for each.",
      [
        { h: "Immutables vs mutables", p: "Numbers, strings, and tuples are immutable; lists, dicts, and sets can change in place. This distinction drives a lot of Python's behavior around aliases and function arguments." },
        { h: "Quick reference", list: ["list — ordered, mutable, duplicates ok", "tuple — ordered, immutable", "dict — key → value, O(1) lookup", "set — unique members, fast membership tests"] },
      ],
      { name: "types.py", code: 'point = (3, 4)          # tuple\nstack = [1, 2, 3]       # list\nconfig = {"debug": True}  # dict\nseen = {1, 2, 2}        # set -> {1, 2}\nprint(type(point), len(seen))' }),
    T("comprehensions", "Comprehensions", 9, "Build lists, dicts, and sets in one expressive line.",
      [
        { h: "List comprehensions", p: "[expr for item in seq if cond] replaces the classic accumulator loop.", code: 'squares = [n * n for n in range(6)]\nevens = [n for n in range(10) if n % 2 == 0]\nprint(squares, evens)', lang: "python" },
        { h: "Dict & set comprehensions", code: 'word = "hello"\ncounts = {ch: word.count(ch) for ch in set(word)}\nprint(counts)', lang: "python" },
      ],
      { name: "comprehensions.py", code: 'matrix = [[1, 2], [3, 4], [5, 6]]\nflat = [x for row in matrix for x in row]\nprint(flat)' }),
    T("functions", "Functions & Lambdas", 10, "def, defaults, *args/**kwargs, and the small anonymous lambda.",
      [
        { h: "Flexible signatures", code: 'def log(level, *messages, sep=" | "):\n    print(f"[{level}]", sep.join(messages))\n\nlog("INFO", "started", "ready")', lang: "python" },
        { h: "Lambdas", p: "One-expression functions, ideal as throwaway keys and callbacks.", code: 'pairs = [(1, "b"), (2, "a")]\nprint(sorted(pairs, key=lambda p: p[1]))', lang: "python" },
      ],
      { name: "functions.py", code: 'def apply(fn, value):\n    return fn(value)\n\nprint(apply(lambda x: x * 3, 7))' }),
    T("errors", "Exceptions", 8, "try/except/finally and the errors you'll actually meet.",
      [
        { h: "The pattern", code: 'try:\n    n = int("abc")\nexcept ValueError as e:\n    print("bad number:", e)\nfinally:\n    print("always runs")', lang: "python" },
        { h: "Common ones", list: ["ValueError — right type, wrong value", "KeyError — missing dict key", "IndexError — list index out of range", "TypeError — wrong type for the operation"] },
      ],
      { name: "errors.py", code: 'def safe_div(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return None\n\nprint(safe_div(10, 0))' }),
  ],
  javascript: [
    T("syntax", "Syntax Essentials", 8, "Statements, expressions, and the quirks worth knowing on day one.",
      [
        { h: "Expressions vs statements", p: "An expression produces a value (a + b, fn()); a statement does something (if, for, const x = 1). Arrow bodies with one expression return it implicitly." },
        { h: "Coercion corners", list: ["'5' + 1 → '51' but '5' - 1 → 4", "== coerces, === doesn't — use ===", "NaN !== NaN — use Number.isNaN()"] },
      ],
      { name: "syntax.js", code: 'const shout = (s) => s.toUpperCase() + "!";\nconsole.log(shout("learn"));\nconsole.log("5" - 1, "5" + 1);' }),
    T("arrays", "Array Methods", 12, "map, filter, reduce, find, some — the functional toolkit.",
      [
        { h: "The big three", code: 'const prices = [10, 20, 30];\nconst withTax = prices.map((p) => p * 1.1);\nconst cheap = prices.filter((p) => p < 25);\nconst total = prices.reduce((a, p) => a + p, 0);\nconsole.log(withTax, cheap, total);', lang: "javascript" },
        { h: "Searching", code: 'const users = [{ id: 1, name: "Ada" }, { id: 2, name: "Grace" }];\nconsole.log(users.find((u) => u.id === 2));\nconsole.log(users.some((u) => u.name.startsWith("A")));', lang: "javascript" },
      ],
      { name: "arrays.js", code: 'const words = ["code", "verse", "learn"];\nconst lens = words.map((w) => w.length);\nconsole.log(lens, Math.max(...lens));' }),
    T("closures", "Closures & Scope", 10, "Why inner functions remember the variables they were born with.",
      [
        { h: "A closure is born", p: "When a function is created, it captures the variables around it. Returning that function carries the captured state with it.", code: 'function counter() {\n  let n = 0;\n  return () => ++n;\n}\nconst tick = counter();\nconsole.log(tick(), tick(), tick());', lang: "javascript" },
        { h: "Block scope", p: "let/const are block-scoped; each loop iteration gets a fresh binding — the classic fix for setTimeout-in-for bugs." },
      ],
      { name: "closures.js", code: 'function memoize(fn) {\n  const cache = new Map();\n  return (x) => {\n    if (!cache.has(x)) cache.set(x, fn(x));\n    return cache.get(x);\n  };\n}\nconst sq = memoize((n) => n * n);\nconsole.log(sq(5), sq(5));' }),
    T("async", "Async & Promises", 12, "The event loop, promises, and async/await without hand-waving.",
      [
        { h: "Event loop mental model", p: "JS runs one thing at a time. Async work (timers, network) happens elsewhere; when it finishes, its callback joins the queue and runs when the stack is clear." },
        { h: "await in practice", code: 'const fetchUser = async () => {\n  await new Promise((r) => setTimeout(r, 10));\n  return { name: "Ada" };\n};\n\n(async () => {\n  const u = await fetchUser();\n  console.log("loaded", u.name);\n})();', lang: "javascript" },
      ],
      { name: "async.js", code: 'const all = await Promise.all([\n  Promise.resolve(1),\n  Promise.resolve(2),\n]);\nconsole.log(all);' }),
  ],
  typescript: [
    T("everyday-types", "Everyday Types", 9, "The types you'll write daily: primitives, arrays, objects, unions.",
      [
        { h: "Basics", code: 'let name: string = "Ada";\nlet xp: number = 120;\nlet tags: string[] = ["ts", "web"];\nlet pair: [string, number] = ["level", 4];\nlet id: string | number = "u_1";', lang: "typescript" },
        { h: "Objects & optional", code: 'interface Config {\n  retries: number;\n  timeout?: number;\n}\nconst c: Config = { retries: 3 };\nconsole.log(c.timeout ?? 1000);', lang: "typescript" },
      ],
      { name: "types.ts", code: 'type Status = "idle" | "running" | "done";\nconst s: Status = "running";\nconsole.log(s.toUpperCase());' }),
    T("generics", "Generics", 11, "Write once, stay typed: generic functions, constraints, and defaults.",
      [
        { h: "Generic functions", code: 'function firstOf<T>(items: T[]): T | undefined {\n  return items[0];\n}\nconsole.log(firstOf([1, 2, 3]));', lang: "typescript" },
        { h: "Constraints", code: 'function longest<T extends { length: number }>(a: T, b: T): T {\n  return a.length >= b.length ? a : b;\n}\nconsole.log(longest("abc", "de"));', lang: "typescript" },
      ],
      { name: "generics.ts", code: 'interface Box<T> { value: T }\nconst numBox: Box<number> = { value: 42 };\nconsole.log(numBox.value + 1);' }),
    T("narrowing", "Narrowing", 9, "How TypeScript uses your control flow to prove types.",
      [
        { h: "typeof & in", code: 'function area(shape: { r?: number; s?: number }) {\n  if (shape.r !== undefined) return Math.PI * shape.r ** 2;\n  if ("s" in shape && shape.s) return shape.s ** 2;\n  return 0;\n}\nconsole.log(area({ r: 2 }));', lang: "typescript" },
      ],
      { name: "narrowing.ts", code: 'type Result<T> = { ok: true; value: T } | { ok: false; error: string };\nconst r: Result<number> = { ok: true, value: 7 };\nif (r.ok) console.log(r.value + 1);' }),
  ],
  sql: [
    T("select", "SELECT Basics", 7, "Columns, expressions, aliases — the anatomy of a query.",
      [
        { h: "Anatomy", code: "SELECT name, xp, xp / 100 AS level\nFROM users\nWHERE xp > 0;", lang: "sql" },
        { h: "Order of execution", list: ["FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT", "Aliases defined in SELECT can't be used in WHERE"] },
      ],
      { name: "select.sql", code: "SELECT name, xp\nFROM users\nORDER BY xp DESC\nLIMIT 3;" }),
    T("joins", "JOINs Visualized", 12, "INNER, LEFT, RIGHT, FULL — with the row math that makes them click.",
      [
        { h: "The row math", p: "A JOIN starts as the cartesian product of two tables, then keeps rows matching the ON condition. INNER keeps matches only; LEFT keeps all left rows and pads with NULL." },
        { h: "LEFT JOIN + COUNT", code: "SELECT u.name, COUNT(s.id) AS solves\nFROM users u\nLEFT JOIN submissions s ON s.user_id = u.id\nGROUP BY u.id, u.name;", lang: "sql" },
      ],
      { name: "joins.sql", code: "SELECT u.name, c.title\nFROM users u\nINNER JOIN course_progress c ON c.user_id = u.id;" }),
    T("aggregation", "Aggregation Patterns", 10, "GROUP BY grain, HAVING filters, and window-free analytics.",
      [
        { h: "Set the grain", p: "Whatever you GROUP BY is the grain of the result — every other selected column must be aggregated or grouped.", code: "SELECT language, COUNT(*), AVG(xp)\nFROM users\nGROUP BY language\nHAVING AVG(xp) > 50;", lang: "sql" },
      ],
      { name: "aggregation.sql", code: "SELECT language, MAX(xp) AS top\nFROM users\nGROUP BY language\nORDER BY top DESC;" }),
  ],
  cpp: [
    T("memory", "Stack, Heap & Pointers", 14, "Where your data lives and who frees it.",
      [
        { h: "Stack vs heap", p: "Local variables live on the stack and die with their scope. new allocates on the heap and lives until delete — or until a smart pointer takes over.", code: '#include <memory>\n\nauto p = std::make_unique<int>(42); // freed automatically\nstd::cout << *p << std::endl;', lang: "cpp" },
      ],
      { name: "memory.cpp", code: '#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> v{1, 2, 3}; // owns its heap buffer\n    v.push_back(4);\n    std::cout << v.size() << std::endl;\n}' }),
    T("raii", "RAII & Smart Pointers", 12, "Resource acquisition is initialization — C++'s answer to finally.",
      [
        { h: "Destructors do the cleanup", p: "When an object leaves scope, its destructor runs. Smart pointers and containers exploit this to free memory automatically — no manual cleanup paths." },
      ],
      { name: "raii.cpp", code: '#include <fstream>\n#include <iostream>\n\nint main() {\n    std::ofstream out("log.txt"); // closes itself on scope exit\n    out << "hello file";\n}' }),
  ],
  java: [
    T("jvm", "Classes & the JVM", 10, "Bytecode, classpath, and why main looks the way it does.",
      [
        { h: "From source to process", list: ["javac Main.java → Main.class (bytecode)", "java Main → JVM interprets/JITs the bytecode", "public static void main(String[]) is the entry contract"] },
      ],
      { name: "Main.java", code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("JVM speaking.");\n    }\n}' }),
    T("streams", "Streams & Lambdas", 12, "Functional pipelines over collections.",
      [
        { h: "Pipeline", code: 'import java.util.*;\nimport java.util.stream.*;\n\nclass S {\n  public static void main(String[] a) {\n    int sum = List.of(1, 2, 3, 4).stream()\n        .filter(n -> n % 2 == 0)\n        .mapToInt(n -> n * 10)\n        .sum();\n    System.out.println(sum);\n  }\n}', lang: "java" },
      ],
      { name: "Streams.java", code: 'import java.util.*;\n\nclass Streams {\n  public static void main(String[] a) {\n    List.of("go", "rust", "java").stream()\n        .map(String::toUpperCase)\n        .forEach(System.out::println);\n  }\n}' }),
  ],
  go: [
    T("errors", "Error Handling", 9, "Errors as values, and the if err != nil discipline.",
      [
        { h: "The idiom", code: 'file, err := os.Open("data.json")\nif err != nil {\n    log.Fatal(err)\n}\ndefer file.Close()', lang: "go" },
        { list: ["Check err immediately after every fallible call", "Wrap with fmt.Errorf(\"context: %w\", err)", "errors.Is / errors.As inspect chains"] },
      ],
      { name: "errors.go", code: 'package main\n\nimport (\n\t"errors"\n\t"fmt"\n)\n\nfunc main() {\n\terr := errors.New("boom")\n\tfmt.Println("handled:", err)\n}' }),
    T("concurrency", "Goroutines & Channels", 13, "Don't communicate by sharing memory; share memory by communicating.",
      [
        { h: "A goroutine + channel", code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    ch := make(chan int)\n    go func() { ch <- 21 * 2 }()\n    fmt.Println(<-ch)\n}', lang: "go" },
      ],
      { name: "concurrency.go", code: 'package main\n\nimport (\n\t"fmt"\n\t"sync"\n)\n\nfunc main() {\n\tvar wg sync.WaitGroup\n\tfor i := 0; i < 3; i++ {\n\t\twg.Add(1)\n\t\tgo func(n int) {\n\t\t\tdefer wg.Done()\n\t\t\tfmt.Println("worker", n)\n\t\t}(i)\n\t}\n\twg.Wait()\n}' }),
  ],
  rust: [
    T("ownership", "Ownership & Borrowing", 14, "The rules that make Rust memory-safe without a GC.",
      [
        { h: "Three rules", list: ["Each value has exactly one owner", "When the owner leaves scope, the value is dropped", "You may have many & borrows OR one &mut borrow, never both"] },
        { h: "In code", code: 'fn main() {\n    let s1 = String::from("verse");\n    let len = measure(&s1);      // borrow, s1 still valid\n    println!("{} -> {}", s1, len);\n}\n\nfn measure(s: &String) -> usize {\n    s.len()\n}', lang: "rust" },
      ],
      { name: "ownership.rs", code: 'fn main() {\n    let v = vec![1, 2, 3];\n    let total: i32 = v.iter().sum();\n    println!("{total}");\n}' }),
  ],
  csharp: [
    T("linq", "LINQ Essentials", 10, "Query collections with method syntax.",
      [
        { h: "Pipeline", code: 'var nums = new[] { 1, 2, 3, 4 };\nvar evens = nums.Where(n => n % 2 == 0)\n                .Select(n => n * 10)\n                .ToList();\nConsole.WriteLine(string.Join(", ", evens));', lang: "csharp" },
      ],
      { name: "Linq.cs", code: 'using System.Linq;\n\nvar words = new[] { "code", "verse" };\nConsole.WriteLine(words.Select(w => w.Length).Sum());' }),
  ],
  kotlin: [
    T("null-safety", "Null Safety", 8, "The billion-dollar mistake, fixed by the type system.",
      [
        { h: "Nullable types", code: 'val name: String? = null\nval len = name?.length ?: 0   // safe call + elvis\nprintln(len)', lang: "kotlin" },
      ],
      { name: "Null.kt", code: 'fun main() {\n    val xs = listOf(1, 2, 3)\n    println(xs.firstOrNull { it > 5 } ?: "none")\n}' }),
  ],
  dart: [
    T("null-safety", "Null Safety & Collections", 8, "Sound null safety and Dart's collection literals.",
      [
        { h: "Basics", code: 'void main() {\n  String? title;\n  final len = title?.length ?? 0;\n  final scores = {\'ada\': 90, \'grace\': 95};\n  print(\'$len ${scores[\'ada\']}\');\n}', lang: "dart" },
      ],
      { name: "main.dart", code: 'void main() {\n  final nums = [1, 2, 3];\n  final doubled = nums.map((n) => n * 2).toList();\n  print(doubled);\n}' }),
  ],
  php: [
    T("basics", "Modern PHP Basics", 8, "Typed, modern PHP: arrow functions, match, strict types.",
      [
        { h: "Modern idioms", code: "<?php\ndeclare(strict_types=1);\n\n$double = fn(int $n): int => $n * 2;\n$status = match ($double(2)) {\n    4 => 'four',\n    default => 'other',\n};\necho $status;", lang: "php" },
      ],
      { name: "index.php", code: "<?php\n$users = ['ada' => 90, 'grace' => 95];\narsort($users);\nforeach ($users as $name => $score) {\n    echo \"$name: $score\\n\";\n}" }),
  ],
  c: [
    T("pointers", "Pointers & Arrays", 13, "Addresses, pointer arithmetic, and the array-pointer relationship.",
      [
        { h: "Arrays decay", p: "In most expressions an array name becomes a pointer to its first element — which is why functions can't see an array's length.", code: '#include <stdio.h>\n\nint main(void) {\n    int arr[3] = {10, 20, 30};\n    int *p = arr;           /* &arr[0] */\n    printf("%d %d\\n", *p, *(p + 2));\n    return 0;\n}', lang: "c" },
      ],
      { name: "pointers.c", code: '#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    int t = *a; *a = *b; *b = t;\n}\n\nint main(void) {\n    int x = 1, y = 2;\n    swap(&x, &y);\n    printf("%d %d\\n", x, y);\n    return 0;\n}' }),
  ],
};

/* ================= DEMO DATA ================= */

export function buildSeed(): DBShape {
  const now = Date.now();
  const D = 24 * 60 * 60 * 1000;
  const users: User[] = [
    { id: "u-demo", email: "demo@codeverse.dev", username: "demo", passHash: hashPass("codeverse"), role: "user", suspended: false, provider: "demo", createdAt: now - 40 * D },
    { id: "u-admin", email: "admin@codeverse.dev", username: "admin", passHash: hashPass("admin123"), role: "admin", suspended: false, provider: "demo", createdAt: now - 60 * D },
    { id: "u-mira", email: "mira@codeverse.dev", username: "mira", passHash: hashPass("codeverse"), role: "user", suspended: false, provider: "demo", createdAt: now - 30 * D },
    { id: "u-kenji", email: "kenji@codeverse.dev", username: "kenji", passHash: hashPass("codeverse"), role: "user", suspended: false, provider: "demo", createdAt: now - 25 * D },
    { id: "u-sofia", email: "sofia@codeverse.dev", username: "sofia", passHash: hashPass("codeverse"), role: "user", suspended: false, provider: "demo", createdAt: now - 18 * D },
  ];

  const profiles: Profile[] = [
    { userId: "u-demo", displayName: "Demo Coder", title: "Full-stack in training", bio: "This demo account ships with real progress: lessons, solved challenges, streaks and achievements. Poke around — everything is editable.", hue: 160 },
    { userId: "u-admin", displayName: "Verse Admin", title: "Platform ops", bio: "Keeps the compilers warm.", hue: 260 },
    { userId: "u-mira", displayName: "Mira K.", title: "Backend · Go & SQL", bio: "Writing Go by day, learning Rust by night.", hue: 20 },
    { userId: "u-kenji", displayName: "Kenji T.", title: "Frontend engineer", bio: "TypeScript maximalist. Ask me about generics.", hue: 200 },
    { userId: "u-sofia", displayName: "Sofia R.", title: "CS student", bio: "Currently fighting pointers in C++. Send help.", hue: 320 },
  ];

  const pyLessons = LESSONS.filter((l) => l.courseId === "python-fundamentals");
  const jsLessons = LESSONS.filter((l) => l.courseId === "javascript-fundamentals");
  const tsLessons = LESSONS.filter((l) => l.courseId === "typescript-fundamentals").slice(0, 2);

  const demoDone: Record<string, { at: number; xp: number; runs: number }> = {};
  let demoXp = 0;
  [...pyLessons, ...jsLessons, ...tsLessons].forEach((l, i) => {
    demoDone[l.id] = { at: now - (30 - i) * D, xp: l.xp, runs: 3 + (i % 4) };
    demoXp += l.xp;
  });

  const lessonProgress: DBShape["lessonProgress"] = { "u-demo": demoDone, "u-mira": { "sql-select": { at: now - 3 * D, xp: 20, runs: 5 } } };

  const solvedIds = ["js-reverse-string", "js-fizzbuzz", "js-palindrome", "js-vowels", "js-factorial", "js-two-sum"];
  const submissions: Submission[] = solvedIds.map((cid, i) => {
    const ch = CHALLENGES.find((c) => c.id === cid)!;
    return {
      id: `sub-seed-${i}`, userId: "u-demo", challengeId: cid, language: ch.language,
      code: ch.starter, passed: ch.tests.length, total: ch.tests.length,
      verdict: "accepted", simulated: false, ms: 4 + i * 3, at: now - (i + 2) * D,
    };
  });

  const taskIds = [
    ...PROJECTS.find((p) => p.id === "weather-cli")!.tasks.map((t) => t.id),
    ...PROJECTS.find((p) => p.id === "personal-portfolio")!.tasks.slice(0, 4).map((t) => t.id),
  ];

  const ach: Record<string, number> = {};
  const achAt = (id: string, days: number) => { ach[id] = now - days * D; };
  achAt("first-lesson", 29); achAt("five-lessons", 24); achAt("fifteen-lessons", 9);
  achAt("first-solve", 20); achAt("five-solves", 6); achAt("xp-500", 12);
  achAt("streak-3", 21); achAt("runs-25", 8); achAt("polyglot-3", 15);
  achAt("first-snippet", 11); achAt("first-post", 7); achAt("ten-tasks", 5);
  achAt("course-complete", 9);

  const notifs: Notif[] = [
    { id: "n-seed-1", userId: "u-demo", kind: "achievement", title: "Achievement unlocked — Graduate", body: "You finished every lesson in Python Fundamentals.", at: now - 9 * D, read: true },
    { id: "n-seed-2", userId: "u-demo", kind: "challenge", title: "Challenge accepted: Two Sum", body: "All 5 test cases passed in 19ms. +50 XP.", at: now - 2 * D, read: true },
    { id: "n-seed-3", userId: "u-demo", kind: "community", title: "Mira replied to your post", body: "\"The event loop explanation finally made it click — thanks!\"", at: now - 1 * D, read: false },
    { id: "n-seed-4", userId: "u-demo", kind: "milestone", title: "Streak: 6 days", body: "One more for a personal best week. Keep the flame alive.", at: now - 0.2 * D, read: false },
    { id: "n-seed-5", userId: "u-demo", kind: "system", title: "Welcome to CodeVerse", body: "Start with a language, run real code in the Playground, and build your streak.", at: now - 40 * D, read: true },
  ];

  const posts: Post[] = [
    { id: "p-closures", authorId: "u-kenji", kind: "question", title: "How do closures actually capture variables?", body: "I get that an inner function \"remembers\" outer variables, but what's the mechanism? When the outer function returns, its stack frame is gone — so where does the captured variable live?\n\n```js\nfunction counter() {\n  let n = 0;\n  return () => ++n;\n}\n```\n\nCalling counter() twice gives two independent counters. What does the engine actually allocate?", tags: ["javascript", "closures", "v8"], at: now - 2 * D },
    { id: "p-goapi", authorId: "u-mira", kind: "share", title: "Show CV: I built a REST API in Go with zero frameworks", body: "Finished the REST API in Go project using only net/http. Three things surprised me:\n\n1. The standard library router (1.22+) made me delete a dependency\n2. Middleware is just func(http.Handler) http.Handler — that's it\n3. Table-driven tests are genuinely pleasant\n\nHappy to share the repo structure if anyone's starting the project.", tags: ["go", "project-share", "api"], at: now - 3 * D },
    { id: "p-pointers", authorId: "u-sofia", kind: "question", title: "Best way to build intuition for pointers in C++?", body: "I can pass the syntax quizzes but pointers still feel like memorized rituals rather than understanding. When someone says `int* p = &x`, I translate it word-by-word instead of *seeing* it.\n\nWhat finally made it click for you?", tags: ["cpp", "pointers", "learning"], at: now - 1 * D },
    { id: "p-streak30", authorId: "u-demo", kind: "discussion", title: "My 30-day streak taught me more than any tutorial", body: "I kept a daily streak for a month: at least one lesson, one playground run, or one challenge per day. Observations:\n\n- Consistency beats intensity. 20 focused minutes daily > 4h weekend binges\n- The streak visualization is a surprisingly honest accountability partner\n- My retention of syntax tripled once spacing was forced on me\n\nAnyone else riding a long streak? What's your rule for a \"valid\" day?", tags: ["habits", "discussion", "streaks"], at: now - 5 * D },
    { id: "p-sqljoins", authorId: "u-mira", kind: "share", title: "SQL JOINs finally clicked — here's my mental model", body: "I stopped trying to memorize JOIN types and started thinking in two steps:\n\n**Step 1 — the merge.** Every JOIN starts as the cartesian product, then keeps rows matching the ON clause.\n\n**Step 2 — the mercy.** INNER shows only survivors. LEFT drags the casualties back with NULL bandages.\n\n```sql\nSELECT u.name, COUNT(s.id) AS solves\nFROM users u\nLEFT JOIN submissions s ON s.user_id = u.id\nGROUP BY u.id, u.name;\n```\n\nCounting s.id (not *) is the trick that makes LEFT JOIN useful.", tags: ["sql", "joins", "mental-models"], at: now - 4 * D },
    { id: "p-recursion", authorId: "u-kenji", kind: "discussion", title: "Recursion vs iteration: when do you actually choose recursion?", body: "Interview answers say \"recursion for trees, iteration for arrays\" but I want the engineering answer. When is recursion the *better* tool in production code, and when is it just cleverness with a stack-overflow risk?", tags: ["algorithms", "recursion", "discussion"], at: now - 6 * D },
    { id: "p-typeerror", authorId: "u-sofia", kind: "question", title: "TypeError: Cannot read properties of undefined (mapping an array)", body: "This keeps crashing my app on refresh:\n\n```js\nconst names = data.users.map(u => u.name);\n```\n\n`data` comes from a fetch. It works sometimes, crashes other times. Why is it inconsistent and how do I make it bulletproof?", tags: ["javascript", "debugging", "async"], at: now - 0.5 * D },
    { id: "p-tsblog", authorId: "u-kenji", kind: "share", title: "Share: a Markdown blog engine in TypeScript, ~400 lines", body: "Built the Markdown Blog Engine project over a weekend. The whole pipeline: read .md files → parse frontmatter → render HTML → write static output.\n\nThe fun part was typing the frontmatter parser so invalid posts fail at build time with precise errors instead of runtime surprises. TypeScript's template literal types did real work here.", tags: ["typescript", "project-share", "static-sites"], at: now - 7 * D },
  ];

  const comments: CommentT[] = [
    { id: "c-1", postId: "p-closures", authorId: "u-mira", body: "The engine allocates a heap object holding the captured bindings — V8 calls it a context object. The returned function carries a hidden pointer to it. That's why two counter() calls don't share n: two separate context objects.", at: now - 1.8 * D },
    { id: "c-2", postId: "p-closures", authorId: "u-demo", body: "Think of it as the function being born with a backpack containing the variables it can see. The stack frame dies; the backpack survives on the heap.", at: now - 1.5 * D },
    { id: "c-3", postId: "p-pointers", authorId: "u-mira", body: "Draw memory. Literally boxes with addresses on paper. Once you can sketch `p → x` and `*p` as 'follow the arrow', the rituals stop being rituals.", at: now - 0.8 * D },
    { id: "c-4", postId: "p-typeerror", authorId: "u-kenji", body: "It crashes when the fetch hasn't resolved yet or failed. Guard it: `const users = data?.users ?? [];` and check `res.ok` before parsing. The inconsistency is a race, not luck.", at: now - 0.4 * D },
    { id: "c-5", postId: "p-streak30", authorId: "u-sofia", body: "Day 14 here. My rule: reading docs doesn't count, running code does. The run counter keeps me honest.", at: now - 4 * D },
    { id: "c-6", postId: "p-sqljoins", authorId: "u-kenji", body: "The NULL bandages framing is going straight into my notes.", at: now - 3.5 * D },
  ];

  const likes = [
    "u-demo:p-closures", "u-mira:p-streak30", "u-kenji:p-sqljoins", "u-sofia:p-goapi",
    "u-demo:p-sqljoins", "u-kenji:p-streak30", "u-mira:p-tsblog", "u-sofia:p-closures",
    "u-demo:p-recursion",
  ];
  const bookmarks = ["u-demo:p-sqljoins", "u-demo:p-closures", "u-demo:p-goapi"];

  const snippets: Snippet[] = [
    {
      id: "sn-1", userId: "u-demo", name: "hello.py", language: "python",
      files: [{ name: "main.py", content: '# My first CodeVerse program\nname = "Demo"\nxp = 25\n\nprint(f"Hello, {name}!")\nprint(f"You just earned {xp} XP")\n\nfor i in range(3):\n    print("keep going...", i + 1)\n' }],
      stdin: "", updatedAt: now - 11 * D,
    },
    {
      id: "sn-2", userId: "u-demo", name: "debounce.js", language: "javascript",
      files: [{ name: "main.js", content: "// debounce: wait until the calls stop\nfunction debounce(fn, ms) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), ms);\n  };\n}\n\nconst log = debounce((msg) => console.log('fired:', msg), 40);\nlog('a'); log('b'); log('c'); // only 'c' fires\n" }],
      stdin: "", updatedAt: now - 6 * D,
    },
  ];

  const executions: ExecLog[] = [];
  const langs = ["python", "javascript", "typescript", "python", "javascript", "python", "sql", "javascript"];
  for (let i = 0; i < 46; i++) {
    const r = (i * 7) % 10;
    executions.push({
      id: `ex-${i}`,
      userId: i % 3 === 0 ? "u-mira" : i % 3 === 1 ? "u-demo" : "u-kenji",
      language: langs[i % langs.length],
      status: r < 7 ? "success" : r < 9 ? "runtime_error" : "timeout",
      simulated: langs[i % langs.length] !== "javascript",
      ms: 3 + ((i * 13) % 40),
      at: now - ((i * 7) % 14) * D - (i % 9) * 3600_000,
    });
  }

  // keep seeded XP internally consistent with the demo's actual activity
  demoXp += submissions.reduce((a, s) => a + (CHALLENGES.find((c) => c.id === s.challengeId)?.points ?? 0), 0);
  demoXp += taskIds.reduce((a, id) => {
    for (const p of PROJECTS) {
      const t = p.tasks.find((x) => x.id === id);
      if (t) return a + t.xp;
    }
    return a;
  }, 0);

  return {
    v: 3,
    seededAt: now,
    currentUserId: null,
    users,
    profiles,
    lessonProgress,
    xp: { "u-demo": demoXp, "u-mira": 20 },
    streaks: {
      "u-demo": { current: 6, best: 11, lastDay: todayKey(-1) },
      "u-mira": { current: 1, best: 2, lastDay: todayKey(-1) },
    },
    achievements: { "u-demo": ach },
    tasks: { "u-demo": taskIds },
    snippets,
    submissions,
    notifs,
    posts,
    comments,
    likes,
    bookmarks,
    reports: [
      { id: "r-1", postId: "p-recursion", byId: "u-sofia", reason: "Duplicate of an older thread?", at: now - 5 * D, resolved: false },
    ],
    executions,
    admin: { languages: {}, courses: {}, challenges: {} },
  };
}
