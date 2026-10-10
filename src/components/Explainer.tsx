import React, { useMemo } from "react";
import { MessageCircle } from "lucide-react";
import { explainLine } from "../lib/explain";

/** The "love bubble" — explains the line under the caret as you type. */
export function ExplainerBar({ lang, line, text }: { lang: string; line: number; text: string }) {
  const ex = useMemo(() => explainLine(lang, text), [lang, text]);
  const key = `${line}:${text}`;

  return (
    <div className="border-t border-line bg-[#0b0e13] px-4 py-2.5">
      <div key={key} className="rise-in flex flex-wrap items-start gap-x-3 gap-y-1.5">
        <span className={`mt-0.5 flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold ${
          ex.kind === "code" ? "border-jade/35 bg-jade/10 text-jade" : "border-line2 bg-ink3 text-dim"}`}>
          <MessageCircle size={11} /> L{String(line).padStart(2, "0")}
        </span>
        <span className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-fog">{ex.summary}</span>
      </div>
      {ex.chips.length > 0 && (
        <div key={key + ":c"} className="rise-in mt-1.5 flex flex-wrap gap-1.5 pl-[52px]">
          {ex.chips.map((c, i) => (
            <span key={i} title={c.g}
              className="group inline-flex cursor-help items-baseline gap-1.5 rounded-md border border-line bg-ink2 px-2 py-0.5 font-mono text-[11px] transition-colors hover:border-jade/40">
              <span className="font-bold text-sky">{c.t}</span>
              <span className="hidden text-[10px] text-dim transition-colors group-hover:text-mist sm:inline">→ {c.g}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
