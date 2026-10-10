import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Send, RotateCcw, Play } from 'lucide-react';
import { Button } from './ui';
import { runInteractive } from '../lib/exec';

interface TerminalLine {
  type: 'output' | 'input' | 'prompt' | 'error';
  content: string;
  timestamp: number;
}

interface InteractiveSession {
  sendInput: (input: string) => void;
  terminate: () => void;
}

interface InteractiveTerminalProps {
  code: string;
  language: string;
  onSessionChange: (session: InteractiveSession | null) => void;
  session: InteractiveSession | null;
}

export function InteractiveTerminal({ code, language, onSessionChange, session }: InteractiveTerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input when waiting for input
  useEffect(() => {
    if (isWaitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isWaitingForInput]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (session) {
        session.terminate();
      }
    };
  }, [session]);

  const addLine = (type: TerminalLine['type'], content: string) => {
    setLines(prev => [...prev, { type, content, timestamp: Date.now() }]);
  };

  const handleRun = () => {
    setLines([]);
    setCurrentInput('');
    setIsWaitingForInput(false);
    setIsRunning(true);

    addLine('prompt', '$ Running program...');

    const newSession = runInteractive(
      code,
      language,
      {
        onOutput: (text) => addLine('output', text),
        onError: (text) => addLine('error', text),
        onPrompt: (prompt) => {
          addLine('output', prompt);
        },
        onWait: () => {
          setIsWaitingForInput(true);
          addLine('prompt', '⌨  Waiting for input...');
        },
        onDone: (exitCode) => {
          setIsRunning(false);
          setIsWaitingForInput(false);
          addLine('prompt', `$ Program exited with code ${exitCode}`);
          onSessionChange(null);
        },
      }
    );

    if (newSession) {
      onSessionChange(newSession);
    } else {
      addLine('error', 'Interactive mode is not available for this language.');
      addLine('output', 'Please use the Input tab to provide stdin before running.');
      setIsRunning(false);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() && !isWaitingForInput) return;

    const input = currentInput;
    addLine('input', input);
    setCurrentInput('');

    if (isWaitingForInput && session) {
      setIsWaitingForInput(false);
      session.sendInput(input);
    }
  };

  const handleReset = () => {
    if (session) {
      session.terminate();
      onSessionChange(null);
    }
    setLines([]);
    setCurrentInput('');
    setIsWaitingForInput(false);
    setIsRunning(false);
  };

  const supportsInteractive = language === 'javascript' || language === 'typescript';

  return (
    <div className="flex flex-col h-full bg-[#0a0c10] rounded-lg border border-line overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 bg-ink2/60 border-b border-line">
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-jade" />
          <span className="font-mono text-xs font-semibold text-fog">Interactive Terminal</span>
          {isRunning && (
            <span className="flex items-center gap-1.5 text-xs text-sky">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-sky" />
              Running
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            icon={<RotateCcw size={12} />}
            disabled={isRunning}
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleRun}
            loading={isRunning}
            disabled={isRunning || !supportsInteractive}
            icon={<Play size={12} />}
          >
            Run
          </Button>
        </div>
      </div>

      {/* Terminal output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed min-h-[200px] max-h-[400px]"
      >
        {lines.length === 0 && !isRunning && (
          <div className="text-dim">
            Click "Run" to execute your program with interactive input.
            {!supportsInteractive && (
              <div className="mt-2 text-xs text-ember/80">
                Note: Interactive mode is only available for JavaScript and TypeScript.
                <br />
                For other languages, use the Input tab to provide stdin before running.
              </div>
            )}
          </div>
        )}

        {lines.map((line, i) => (
          <div key={i} className="mb-1">
            {line.type === 'output' && (
              <pre className="whitespace-pre-wrap text-fog">{line.content}</pre>
            )}
            {line.type === 'input' && (
              <div className="text-sky">
                <span className="text-dim">{'>'} </span>
                {line.content}
              </div>
            )}
            {line.type === 'prompt' && (
              <div className="text-jade">{line.content}</div>
            )}
            {line.type === 'error' && (
              <pre className="whitespace-pre-wrap text-rose">{line.content}</pre>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <form
        onSubmit={handleInputSubmit}
        className="flex items-center gap-2 px-4 py-3 bg-ink2/40 border-t border-line"
      >
        <span className="text-jade font-mono text-sm">$</span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder={isWaitingForInput ? 'Type input and press Enter...' : 'Click Run to start'}
          disabled={!isWaitingForInput || isRunning || !supportsInteractive}
          className="flex-1 bg-transparent text-fog font-mono text-sm outline-none placeholder:text-dim disabled:opacity-50"
          autoFocus={isWaitingForInput}
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          disabled={!isWaitingForInput || isRunning || !supportsInteractive}
          icon={<Send size={12} />}
        />
      </form>
    </div>
  );
}
