/**
 * Live line explainer — reads the line under the caret and explains every
 * meaningful token plus the line's overall intent, in plain words.
 */

export interface ExplainChip { t: string; g: string }
export interface LineExplanation { summary: string; chips: ExplainChip[]; kind: "empty" | "comment" | "code" }

const GLOSS: Record<string, string> = {
  // python
  def: "defines a reusable function", elif: "extra branch, checked only if the ones above failed",
  lambda: "tiny one-line throwaway function", self: "the instance this method works on",
  None: "Python's 'no value'", True: "boolean yes", False: "boolean no",
  and: "both sides must be true", or: "at least one side must be true", not: "flips true ↔ false",
  in: "walks a sequence / checks membership", range: "range(n) produces 0 … n−1",
  len: "counts items in a sequence", print: "writes to the Output panel", input: "reads a line from stdin",
  append: "adds an item to the end of a list", return: "hands a value back and exits the function",
  import: "loads a module so you can use its names", from: "pulls specific names out of a module",
  for: "starts a loop over a sequence", while: "loops as long as the condition stays true",
  if: "branch — the block runs only when the condition is true", else: "the fallback branch",
  f: "f-string prefix — {slots} get interpolated", pass: "does nothing — a placeholder body",
  // js / ts
  const: "binding that can't be reassigned", let: "reassignable binding", var: "legacy function-scoped binding (avoid)",
  function: "declares a reusable function", undefined: "declared but never assigned", null: "intentional absence of a value",
  typeof: "asks what type a value is", new: "constructs an object from a class", this: "the current object context",
  async: "marks a function returning a promise", await: "pauses here until the promise settles",
  export: "makes this available to other files", require: "loads a module (CommonJS)",
  map: "transforms every element into a new array", filter: "keeps elements passing the test",
  reduce: "folds the whole array into one value", forEach: "runs code for each element",
  push: "adds to the end of an array", length: "how many items / characters",
  interface: "describes the shape an object must have", type: "names a type for reuse",
  implements: "promises a class fulfills an interface", readonly: "field can't be reassigned after creation",
  extends: "inherits from / narrows a type", keyof: "union of an object's key names",
  // c / cpp
  "#include": "pastes a library header into this file", "using": "skips the namespace prefix",
  int: "whole-number type", double: "decimal type", float: "decimal type", char: "single character type",
  bool: "true/false type", boolean: "true/false type", void: "returns nothing",
  "std::cout": "stream connected to the Output panel", endl: "newline + flush the stream",
  nullptr: "a pointer that points to nothing", unsigned: "only non-negative numbers",
  static: "belongs to the type, not an instance", public: "visible to all code", private: "visible inside the class only",
  struct: "plain data container", class: "blueprint bundling data + behavior",
  template: "generic — works for any type you pass", auto: "let the compiler deduce the type",
  scanf: "reads formatted input from stdin", printf: "formatted print to output",
  // java / c# / kotlin
  "System.out.println": "prints a line to the Output panel", "Console.WriteLine": "prints a line to output",
  String: "text type", final: "can't be reassigned", package: "declares this file's namespace",
  Scanner: "reads stdin conveniently", super: "the parent class", fun: "defines a function (Kotlin)",
  val: "immutable binding (Kotlin)", companion: "Kotlin's static-like holder",
  // go
  func: "defines a function", chan: "channel — a pipe between goroutines",
  "fmt.Println": "prints a line to output", "fmt.Sprintf": "formats text without printing",
  defer: "runs when the surrounding function exits", nil: "Go's zero for pointers, maps, slices",
  goroutine: "a lightweight concurrent function",
  // rust
  mut: "makes a binding mutable", "println!": "prints a line (macro)", match: "pattern-match branches",
  impl: "attaches methods to a type", trait: "a contract types can fulfill", unwrap: "panics if None/Err — fine for demos",
  String_: "growable owned text", enum: "a type with named variants",
  // sql
  SELECT: "chooses which columns to return", FROM: "the table to read", WHERE: "filters rows",
  "GROUP": "GROUP BY collapses rows into groups", "ORDER": "ORDER BY sorts the result",
  JOIN: "stitches tables together on a key", COUNT: "counts rows", AS: "renames the result column",
  HAVING: "filters groups after aggregation", LIMIT: "caps how many rows return",
  DISTINCT: "removes duplicate rows", INSERT: "adds new rows", UPDATE: "changes rows (always add WHERE!)",
  DELETE: "removes rows (always add WHERE!)", AND: "both conditions must hold", OR: "either condition holds",
  LIKE: "pattern-matches text (% = wildcard)", NULL: "SQL's unknown value",
  // php / dart / misc
  echo: "writes to the output", foreach: "loops over each item", fn: "defines a function",
  main: "the program's entry point — runs first",
  // operators
  "=": "assignment — stores the right side under the left name",
  "+=": "adds to the existing value", "-=": "subtracts from the existing value",
  "===": "strict equality — value AND type must match", "!==": "strict inequality",
  "==": "equality check (coerces types in JS — prefer ===)", "!=": "not-equal check",
  "<=": "less than or equal", ">=": "greater than or equal",
  "&&": "logical AND — both must be true", "||": "logical OR — one is enough",
  "??": "uses the right side when the left is null/undefined",
  "?.": "optional chaining — safe access that yields undefined instead of crashing",
  "...": "spread — unpacks a collection in place",
  "++": "increments by one", "--": "decrements by one",
  "%": "modulo — the remainder after division",
  "=>": "arrow — compact function syntax", "->": "member access through a pointer / return type",
  "::": "reaches into a namespace or class", ".": "accesses a member of an object",
  "[": "index access — position in a sequence (0-based)", "{": "opens a block / object",
  ":": "type annotation / key-value separator", ";": "end of statement",
};

const COMMENT_BY_LANG: Record<string, RegExp> = {
  python: /^\s*#/, javascript: /^\s*\/\//, typescript: /^\s*\/\//, c: /^\s*\/\//, cpp: /^\s*\/\//,
  java: /^\s*\/\//, go: /^\s*\/\//, rust: /^\s*\/\//, csharp: /^\s*\/\//, kotlin: /^\s*\/\//,
  dart: /^\s*\/\//, php: /^\s*(\/\/|#)/, sql: /^\s*--/,
};

const TOKEN_RE = /("[^"\n]*"|'[^'\n]*'|`[^`\n]*`)|(\d+(?:\.\d+)?)|(=>|===|!==|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\+\+|--|\+=|-=|::|->|\.\.\.|[+\-*/%=<>!&|^~?:;.,[\]{}()])|([A-Za-z_#$][\w$]*)/g;

function glossFor(ident: string, lang: string): string | null {
  if (GLOSS[ident]) return GLOSS[ident];
  const lower = ident.toLowerCase();
  if (lang === "sql" && GLOSS[ident.toUpperCase()]) return GLOSS[ident.toUpperCase()];
  if (GLOSS[lower]) return GLOSS[lower];
  if (/^(print|println|printf|puts)$/.test(ident)) return "writes to the Output panel";
  if (/log$/.test(ident) && ident.includes(".")) return "writes to the Output panel";
  return null;
}

export function explainLine(lang: string, raw: string): LineExplanation {
  const text = raw.trim();
  if (!text) return { summary: "Blank line — whitespace that separates blocks. The runtime ignores it.", chips: [], kind: "empty" };

  if (COMMENT_BY_LANG[lang]?.test(raw) || /^\/\*/.test(text)) {
    return { summary: "Comment — the runtime skips this entirely. It's a note for humans (and future you).", chips: [], kind: "comment" };
  }

  const chips: ExplainChip[] = [];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(text)) && chips.length < 6) {
    const [full, str, num, op, ident] = m;
    if (str) { chips.push({ t: full.length > 22 ? full.slice(0, 20) + "…" : full, g: "text data — characters in quotes" }); continue; }
    if (num) { chips.push({ t: full, g: "numeric literal" }); continue; }
    if (op && GLOSS[full]) { chips.push({ t: full, g: GLOSS[full] }); continue; }
    if (ident) {
      const g = glossFor(ident, lang);
      if (g) chips.push({ t: ident, g });
    }
  }
  const uniq: ExplainChip[] = [];
  for (const c of chips) if (!uniq.some((u) => u.t === c.t)) uniq.push(c);

  /* line-level intent */
  let summary: string | null = null;

  const importM = text.match(/^(?:import|from|#include|using|require|use|package)\b(.*)/);
  if (importM) summary = lang === "c" || lang === "cpp"
    ? `#include pastes the <${(importM[1].match(/<(.+)>/) || [, "header"])[1]}> library into this file so you can use what it provides.`
    : `Pulls in a library${importM[1].trim() ? ` (${importM[1].trim().slice(0, 40)})` : ""} so its names are usable here.`;

  if (!summary) {
    const fnM = text.match(/^(?:export\s+)?(?:async\s+)?(?:def|function|fn|func)\s+([A-Za-z_]\w*)/);
    if (fnM) summary = `Defines the function "${fnM[1]}". Its body runs only when something calls ${fnM[1]}(…).`;
  }
  if (!summary && /^(?:export\s+)?(class|struct|interface|enum|trait|type)\s+([A-Za-z_]\w*)/.test(text)) {
    const mm = text.match(/^(?:export\s+)?(class|struct|interface|enum|trait|type)\s+([A-Za-z_]\w*)/)!;
    summary = `Declares a new ${mm[1]} called "${mm[2]}" — a blueprint for data${mm[1] === "class" ? " and behavior" : ""}.`;
  }
  if (!summary && /\b(for|while)\b/.test(text)) {
    const rM = text.match(/range\(\s*(\d+)\s*\)/);
    const cM = text.match(/for\s*\(\s*(?:let|var|int|auto)?\s*(\w+)\s*=\s*0\s*;\s*\w+\s*<\s*(\d+)/);
    summary = rM
      ? `Loop — repeats the indented block ${rM[1]} times, with the counter taking values 0 … ${Number(rM[1]) - 1}.`
      : cM
        ? `Loop — repeats while the counter stays under ${cM[2]}, bumping it once per round.`
        : "Loop — repeats the block: the condition is checked before every round; the body must move toward making it false.";
  }
  if (!summary && /^(else\s+if|elif|if|switch|match|case)\b/.test(text)) {
    summary = text.startsWith("else") || text.startsWith("elif")
      ? "Fallback branch — checked only because the condition above was false."
      : "Branch — the block runs only when this condition evaluates to true; otherwise it's skipped.";
  }
  if (!summary && /^}\s*else/.test(text)) summary = "Fallback branch — runs when the if-condition above was false.";
  if (!summary && /^return\b/.test(text)) {
    const v = text.replace(/^return\s*/, "").replace(/[;]$/, "").trim();
    summary = v
      ? `Exits the function right here and hands ${v.length > 30 ? "the computed value" : `"${v}"`} back to whoever called it.`
      : "Exits the function right here without a value.";
  }
  if (!summary) {
    const printM = text.match(/(?:console\.log|print!|println!|System\.out\.println|fmt\.Println|std::cout|echo|printf|print|Console\.WriteLine)\s*[<(]/);
    if (printM) {
      const s = text.match(/(['"`])([^'"`]*)\1/);
      summary = s ? `Writes "${s[2]}" (plus anything else on the line) to the Output panel below.` : "Writes a computed value to the Output panel below — your window into what the program does.";
    }
  }
  if (!summary) {
    const asM = text.match(/^([A-Za-z_]\w*)\s*(=|\+=|-=)\s*(.+?);?$/);
    if (asM && !/==/.test(asM[2])) {
      const rhs = asM[3].trim();
      summary = asM[2] === "="
        ? `Stores ${rhs.length > 34 ? "the result of the right-hand expression" : `the value ${rhs}`} under the name "${asM[1]}" — creating or overwriting it.`
        : `Updates "${asM[1]}" by ${asM[2] === "+=" ? "adding" : "subtracting"} the right-hand value to what it already holds.`;
    }
  }
  if (!summary) {
    const callM = text.match(/^([A-Za-z_][\w$.]*)\s*\(/);
    if (callM && !GLOSS[callM[1]]) summary = `Calls ${callM[1]}(…) — runs that function's body with the arguments in the parentheses.`;
  }
  if (!summary) {
    summary = uniq.length
      ? uniq.slice(0, 3).map((c) => `${c.t} → ${c.g}`).join("  ·  ")
      : "A line of code — hover the tokens below for what each piece means.";
  }

  return { summary, chips: uniq, kind: "code" };
}
