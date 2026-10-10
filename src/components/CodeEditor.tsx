import React, { useMemo, useRef, useState } from "react";
import { playTypeSound, playEnterSound } from "../lib/sounds";
import { InlineExplainer } from "./InlineExplainer";

/**
 * CodeEditor — dependency-free editor with regex-based syntax highlighting,
 * line numbers, current-line tracking (for the live explainer) and smart
 * indent. Props contract matches a Monaco drop-in.
 */

const KEYWORDS: Record<string, string[]> = {
  javascript: "const let var function return if else for while do switch case break continue new class extends import export from default try catch finally throw async await typeof instanceof in of yield static get set null undefined true false this super delete void".split(" "),
  typescript: "const let var function return if else for while do switch case break continue new class extends implements interface type enum import export from default try catch finally throw async await typeof instanceof in of yield static get set null undefined true false this super delete void readonly keyof declare namespace abstract as satisfies".split(" "),
  python: "def return if elif else for while in not and or is None True False class import from as pass break continue lambda with try except finally raise yield global nonlocal assert del self cls match case".split(" "),
  cpp: "int char float double void bool auto const static struct class public private protected return if else for while do switch case break continue new delete template typename namespace using include define nullptr true false sizeof unsigned long short virtual override friend operator this".split(" "),
  c: "int char float double void const static struct return if else for while do switch case break continue sizeof unsigned long short include define typedef enum union NULL".split(" "),
  java: "public private protected class interface extends implements return if else for while do switch case break continue new static final void int long double boolean char byte short this super import package try catch finally throw throws null true false var record".split(" "),
  go: "func package import return if else for range switch case break continue var const type struct interface map chan go defer select nil true false make new fallthrough default".split(" "),
  rust: "fn let mut pub use mod struct enum impl trait match if else for while loop return self Self crate super where async await move ref true false None Some Ok Err dyn static const type as in".split(" "),
  sql: "select from where group by order having limit offset insert into values update set delete create table join left right inner outer full cross on as and or not null distinct count sum avg min max between like in is union all primary key foreign references desc asc case when then end exists alter drop index".split(" "),
  php: "echo function return if else elseif for foreach while as class public private protected new true false null use namespace fn match require include print array".split(" "),
  csharp: "using namespace class public private protected static void int string var bool double float return if else for foreach while new null true false async await interface override virtual readonly out ref this base try catch finally throw".split(" "),
  kotlin: "fun val var return if else when for while class object interface data null true false import package override private public companion in is try catch finally throw".split(" "),
  dart: "void main var final class extends return if else for while import print new const null true false int double String bool this super async await Future".split(" "),
  html: "html head body div span section header footer nav main article p a img ul ol li h1 h2 h3 button form input label script style link meta title".split(" "),
  css: "display flex grid margin padding border color background position absolute relative width height gap align-items justify-content font-size transition transform".split(" "),
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function master(lang: string): RegExp {
  const kw = (KEYWORDS[lang] || KEYWORDS.javascript).join("|");
  return new RegExp(
    `(\\/\\/[^\\n]*|--[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)` +
    `|("(?:[^"\\\\\\n]|\\\\.)*"|'(?:[^'\\\\\\n]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)` +
    `|(\\b\\d+(?:\\.\\d+)?\\b)` +
    `|(\\b(?:${kw})\\b)` +
    `|([A-Za-z_$][\\w$]*(?=\\s*\\())` +
    `|(\\b[A-Z][A-Za-z0-9_]*\\b)`,
    "g",
  );
}

export function highlight(code: string, lang: string): string {
  const re = master(lang);
  let out = "";
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const [full, com, str, num, kw, fnn, ty] = m;
    const cls = com ? "tk-c" : str ? "tk-s" : num ? "tk-n" : kw ? "tk-k" : fnn ? "tk-f" : ty ? "tk-t" : "";
    out += cls ? `<span class="${cls}">${esc(full)}</span>` : esc(full);
    last = m.index + full.length;
  }
  out += esc(code.slice(last));
  return out;
}

export function CodeEditor({
  value, onChange, language, minHeight = 260, readOnly = false, onCaretLine,
  inlineExplainer = false,
}: {
  value: string;
  onChange: (v: string) => void;
  language: string;
  minHeight?: number;
  readOnly?: boolean;
  onCaretLine?: (line: number, text: string) => void;
  inlineExplainer?: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutRef = useRef<HTMLDivElement>(null);
  const [caretLine, setCaretLine] = useState(1);
  const [caretText, setCaretText] = useState("");
  const [scrollTop, setScrollTop] = useState(0);

  const html = useMemo(() => highlight(value + (value.endsWith("\n") ? " " : ""), language), [value, language]);
  const lineCount = useMemo(() => value.split("\n").length, [value]);

  // Calculate explainer Y position
  const LINE_HEIGHT = 13.5 * 1.65; // 22.275px
  const PADDING_TOP = 14;
  const explainerY = PADDING_TOP + (caretLine - 1) * LINE_HEIGHT - scrollTop;

  const sync = () => {
    const ta = taRef.current, pre = preRef.current, gut = gutRef.current;
    if (!ta) return;
    if (pre) pre.style.transform = `translate(${-ta.scrollLeft}px, ${-ta.scrollTop}px)`;
    if (gut) gut.scrollTop = ta.scrollTop;
    setScrollTop(ta.scrollTop);
  };

  const reportCaret = (el: HTMLTextAreaElement) => {
    const upto = el.value.slice(0, el.selectionStart);
    const lines = upto.split("\n");
    const n = lines.length;
    const lineText = lines[n - 1] ?? "";
    setCaretLine(n);
    setCaretText(lineText);
    onCaretLine?.(n, lineText);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    const ta = e.currentTarget;

    // Play enter sound for Enter key
    if (e.key === "Enter") {
      playEnterSound();
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart: s, selectionEnd: en } = ta;
      onChange(value.slice(0, s) + "  " + value.slice(en));
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2; reportCaret(ta); });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const { selectionStart: s } = ta;
      const before = value.slice(0, s);
      const lineStart = before.lastIndexOf("\n") + 1;
      const indent = (before.slice(lineStart).match(/^[ \t]*/) || [""])[0];
      const lastChar = before.trimEnd().slice(-1);
      const extra = ["{", ":", "("].includes(lastChar) ? "  " : "";
      const insert = "\n" + indent + extra;
      onChange(before + insert + value.slice(s));
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + insert.length; reportCaret(ta); });
    }
  };

  return (
    <div className="ce-wrap flex h-full w-full overflow-hidden rounded-b-xl bg-[#0a0c10]" style={{ minHeight }}>
      <div ref={gutRef} className="w-11 shrink-0 select-none overflow-hidden border-r border-line/60 bg-[#0a0c10]">
        <div className="px-0 py-[14px] text-right font-mono text-[12px] leading-[1.65]">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className={`pr-2.5 transition-colors ${i + 1 === caretLine ? "font-bold text-jade" : "text-[#3d4654]"}`}>{i + 1}</div>
          ))}
          <div className="pr-2.5 text-[#3d4654]">&nbsp;</div>
        </div>
      </div>
      <div className="relative min-w-0 flex-1">
        <pre ref={preRef} className="ce-pre absolute left-0 top-0 w-max min-w-full" dangerouslySetInnerHTML={{ __html: html }} />
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => {
            // Play typing sound for actual text changes
            if (e.target.value !== value && !readOnly) {
              playTypeSound();
            }
            onChange(e.target.value);
            reportCaret(e.target);
          }}
          onScroll={sync}
          onKeyDown={onKeyDown}
          onKeyUp={(e) => reportCaret(e.currentTarget)}
          onClick={(e) => reportCaret(e.currentTarget)}
          onSelect={(e) => reportCaret(e.currentTarget as HTMLTextAreaElement)}
          className="ce-ta"
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          readOnly={readOnly}
          aria-label="Code editor"
        />

        {/* Inline Explainer - floating tooltip next to active line */}
        {inlineExplainer && !readOnly && (
          <InlineExplainer
            line={caretLine}
            text={caretText}
            language={language}
            topOffset={explainerY}
            enabled={inlineExplainer}
          />
        )}
      </div>
    </div>
  );
}
