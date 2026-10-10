import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Trash2, Cpu, MessageSquare, Bot } from "lucide-react";
import { LANGUAGES } from "../lib/seed";
import type { ChatMsg } from "../lib/types";
import { askTutor, TUTOR_MODES, type TutorRequest } from "../lib/ai";
import { uid } from "../lib/db";
import { Badge, Button, Markdown, Panel, Select, Textarea } from "../components/ui";

const SUGGESTIONS: { mode: TutorRequest["mode"]; label: string; prompt: string }[] = [
  { mode: "explain", label: "Explain closures", prompt: "Explain closures with a real example" },
  { mode: "explain", label: "How do JOINs work?", prompt: "Explain SQL joins" },
  { mode: "error", label: "Diagnose an error", prompt: "TypeError: Cannot read properties of undefined (reading 'map')" },
  { mode: "review", label: "Review my code", prompt: "Review this snippet" },
  { mode: "practice", label: "Give me a drill", prompt: "Generate a practice problem" },
];

export default function AITutor() {
  const [mode, setMode] = useState<TutorRequest["mode"]>("explain");
  const [language, setLanguage] = useState("javascript");
  const [codeCtx, setCodeCtx] = useState("");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    {
      id: "intro", role: "tutor", at: Date.now(),
      text: "Hey — I'm your AI coding tutor powered by Groq! I can explain concepts, diagnose errors, review code, convert languages, and generate practice drills.\n\nPaste code in the context box for the best results, or just ask me anything about programming!",
    },
  ]);
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, thinking]);

  const ask = async (prompt: string, m: TutorRequest["mode"] = mode) => {
    if (!prompt.trim() || thinking) return;
    setInput("");
    setMsgs((cur) => [...cur, { id: uid(), role: "user", text: prompt, at: Date.now(), mode: m }]);
    setThinking(true);
    const reply = await askTutor({ mode: m, prompt, code: codeCtx || undefined, language });
    setThinking(false);
    setMsgs((cur) => [...cur, { id: uid(), role: "tutor", text: reply, at: Date.now(), mode: m }]);
  };

  const activeMode = TUTOR_MODES.find((m) => m.id === mode)!;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-jade">~/ai-tutor</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Ask the tutor</h1>
        </div>
        <Badge tone="sky"><Cpu size={11} />Powered by Groq AI</Badge>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* controls */}
        <div className="space-y-4">
          <Panel className="p-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-dim">mode</div>
            <div className="mt-2.5 space-y-1">
              {TUTOR_MODES.map((m) => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  className={`flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-all ${mode === m.id ? "border-jade/40 bg-jade/8" : "border-transparent hover:bg-white/4"}`}>
                  <Sparkles size={13} className={`mt-0.5 shrink-0 ${mode === m.id ? "text-jade" : "text-dim"}`} />
                  <span>
                    <span className={`block text-[13px] font-bold ${mode === m.id ? "text-jade" : "text-fog"}`}>{m.label}</span>
                    <span className="block text-[11px] text-dim">{m.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-dim">context</div>
            <div className="mt-2.5 space-y-3">
              <Select value={language} onChange={(e) => setLanguage(e.target.value)} className="!py-2 !text-xs">
                {LANGUAGES.map((l) => <option key={l.slug} value={l.slug}>{l.name}</option>)}
              </Select>
              <div>
                <div className="mb-1.5 text-[11px] font-semibold text-mist">Code context (optional)</div>
                <Textarea rows={6} value={codeCtx} onChange={(e) => setCodeCtx(e.target.value)} placeholder={"// paste the snippet the question is about"} className="!text-[12px]" />
              </div>
              {codeCtx && <button onClick={() => setCodeCtx("")} className="text-[11px] font-bold text-rose hover:underline">Clear code context</button>}
            </div>
          </Panel>

          <div className="rounded-xl border border-line bg-ink/60 p-4">
            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-dim">quick asks</div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s.label} onClick={() => { setMode(s.mode); ask(s.prompt, s.mode); }}
                  className="rounded-md border border-line bg-ink2 px-2.5 py-1.5 text-[11.5px] font-semibold text-mist transition-colors hover:border-jade/40 hover:text-jade">
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* chat */}
        <Panel className="flex h-[calc(100vh-220px)] min-h-[480px] flex-col overflow-hidden">
          <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5">
            {msgs.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "tutor" && (
                  <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-jade/30 bg-jade/10 text-jade"><Bot size={15} /></span>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === "user" ? "rounded-br-md border border-line2 bg-ink3" : "rounded-bl-md border border-line bg-ink2/70"}`}>
                  {m.mode && m.role === "user" && (
                    <div className="mb-1 font-mono text-[9.5px] font-bold uppercase tracking-wider text-jade">{TUTOR_MODES.find((x) => x.id === m.mode)?.label}</div>
                  )}
                  {m.role === "tutor" ? <Markdown text={m.text} /> : <p className="whitespace-pre-wrap text-sm leading-relaxed text-fog">{m.text}</p>}
                </div>
                {m.role === "user" && (
                  <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line2 bg-ink3 text-mist"><MessageSquare size={14} /></span>
                )}
              </div>
            ))}
            {thinking && (
              <div className="flex gap-3">
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-jade/30 bg-jade/10 text-jade"><Bot size={15} /></span>
                <div className="rounded-2xl rounded-bl-md border border-line bg-ink2/70 px-4 py-3.5">
                  <span className="flex gap-1.5">
                    {[0, 1, 2].map((i) => <span key={i} className="pulse-dot h-1.5 w-1.5 rounded-full bg-jade" style={{ animationDelay: `${i * 0.2}s` }} />)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line bg-ink/60 p-3.5">
            <div className="flex items-end gap-2.5">
              <Textarea
                rows={2} value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
                placeholder={`${activeMode.label}: type your question… (Enter to send)`}
                className="!resize-none"
              />
              <div className="flex shrink-0 gap-2">
                <Button variant="ghost" size="sm" onClick={() => setMsgs(msgs.slice(0, 1))} aria-label="Clear conversation" icon={<Trash2 size={14} />} />
                <Button onClick={() => ask(input)} loading={thinking} icon={<Send size={14} />}>Ask</Button>
              </div>
            </div>
            <div className="mt-2 text-center font-mono text-[9.5px] text-dim">AI-powered coding assistance</div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
