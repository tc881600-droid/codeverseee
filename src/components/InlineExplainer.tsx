import React, { useEffect, useRef, useState } from "react";
import { explainLine } from "../lib/explain";
import { Sparkles } from "lucide-react";

/**
 * InlineExplainer — A floating tooltip that appears next to the active line,
 * streaming the explanation character-by-character like an AI tutor whispering
 * in your ear as you code.
 *
 * - Follows the cursor line automatically
 * - Streams text with typewriter animation
 * - Non-intrusive (pointer-events: none)
 * - Fades out on empty/comment lines
 */

interface Props {
  line: number;
  text: string;
  language: string;
  /** Pixel offset from the top of the visible editor area */
  topOffset: number;
  /** Whether the explainer is enabled */
  enabled: boolean;
}

const LINE_HEIGHT = 13.5 * 1.65; // matches .ce-pre line-height
const CHARS_PER_FRAME = 3; // characters revealed per animation frame
const FRAME_INTERVAL = 16; // ~60fps

export function InlineExplainer({ line, text, language, topOffset, enabled }: Props) {
  const explanation = explainLine(language, text);
  const [revealedChars, setRevealedChars] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [prevLine, setPrevLine] = useState(line);
  const animRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Reset animation when line or text changes
  useEffect(() => {
    if (line !== prevLine || text !== displayedText) {
      setPrevLine(line);
      setRevealedChars(0);
      setDisplayedText("");

      // Clear previous animation
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);

      // Start streaming animation
      const fullText = explanation.summary;
      if (!fullText || explanation.kind === "empty") {
        setDisplayedText("");
        return;
      }

      let currentChar = 0;
      intervalRef.current = window.setInterval(() => {
        currentChar += CHARS_PER_FRAME;
        if (currentChar >= fullText.length) {
          currentChar = fullText.length;
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        setRevealedChars(currentChar);
        setDisplayedText(fullText.slice(0, currentChar));
      }, FRAME_INTERVAL);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [line, text, explanation.summary, explanation.kind]);

  // Don't render if disabled or on empty/comment lines
  if (!enabled || explanation.kind === "empty") {
    return null;
  }

  // Don't show for very short lines or comments (keep it subtle)
  if (text.trim().length < 2 && explanation.kind !== "comment") {
    return null;
  }

  const isComment = explanation.kind === "comment";
  const chipCount = explanation.chips.length;

  return (
    <div
      className="inline-explainer"
      style={{
        position: "absolute",
        top: topOffset,
        right: 16,
        zIndex: 10,
        pointerEvents: "none",
        maxWidth: 340,
        minWidth: 200,
      }}
    >
      <div
        className={`inline-explainer-card ${isComment ? "inline-explainer-comment" : ""}`}
      >
        {/* Header with icon */}
        <div className="inline-explainer-header">
          <Sparkles size={11} className="inline-explainer-icon" />
          <span className="inline-explainer-label">
            {isComment ? "comment" : `L${String(line).padStart(2, "0")}`}
          </span>
        </div>

        {/* Streaming text */}
        <div className="inline-explainer-text">
          {displayedText}
          {revealedChars < explanation.summary.length && (
            <span className="inline-explainer-cursor">▍</span>
          )}
        </div>

        {/* Token chips (only show after text is fully revealed) */}
        {chipCount > 0 && revealedChars >= explanation.summary.length && (
          <div className="inline-explainer-chips">
            {explanation.chips.slice(0, 3).map((chip, i) => (
              <span key={i} className="inline-explainer-chip" title={chip.g}>
                <span className="inline-explainer-chip-token">{chip.t}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
