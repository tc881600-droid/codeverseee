import React, { useState } from 'react';

export function TerminalAnimation() {
  const codeLines = [
    { type: 'command', text: '$ codeverse init' },
    { type: 'success', text: '✓ Project initialized' },
    { type: 'empty', text: '' },
    { type: 'command', text: '$ python main.py' },
    { type: 'code', text: 'def fibonacci(n):' },
    { type: 'code', text: '    if n <= 1:' },
    { type: 'code', text: '        return n' },
    { type: 'code', text: '    return fibonacci(n-1) + fibonacci(n-2)' },
    { type: 'empty', text: '' },
    { type: 'code', text: 'for i in range(10):' },
    { type: 'code', text: '    print(fibonacci(i))' },
    { type: 'empty', text: '' },
    { type: 'output', text: 'Output:' },
    { type: 'result', text: '0, 1, 1, 2, 3, 5, 8, 13, 21, 34' },
    { type: 'empty', text: '' },
    { type: 'command', text: '$ codeverse challenge start' },
    { type: 'success', text: '✓ Loading challenge: Two Sum' },
    { type: 'success', text: '✓ All tests passed!' },
    { type: 'xp', text: '+50 XP earned' },
  ];

  return (
    <div className="h-full w-full bg-[#0a0c10] rounded-lg overflow-hidden border border-line">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-ink2/60 border-b border-line">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose/70"></div>
          <div className="w-3 h-3 rounded-full bg-ember/70"></div>
          <div className="w-3 h-3 rounded-full bg-jade/70"></div>
        </div>
        <span className="ml-2 font-mono text-[11px] text-mist">codeverse ~ terminal</span>
      </div>

      {/* Terminal content */}
      <div className="p-4 font-mono text-[13px] leading-relaxed h-[calc(100%-44px)] overflow-hidden">
        {codeLines.map((line, i) => (
          <div key={i} className="mb-1">
            {line.type === 'empty' ? (
              <span>&nbsp;</span>
            ) : line.type === 'command' ? (
              <span>
                <span className="text-jade">$</span>
                <span className="text-fog ml-2">{line.text.slice(2)}</span>
              </span>
            ) : line.type === 'success' ? (
              <span className="text-jade">{line.text}</span>
            ) : line.type === 'xp' ? (
              <span className="text-ember font-bold">{line.text}</span>
            ) : line.type === 'output' || line.type === 'result' ? (
              <span className="text-sky">{line.text}</span>
            ) : (
              <span className="text-mist">{line.text}</span>
            )}
          </div>
        ))}
        {/* Blinking cursor */}
        <div className="inline-block w-2 h-4 bg-jade animate-pulse mt-1"></div>
      </div>
    </div>
  );
}
