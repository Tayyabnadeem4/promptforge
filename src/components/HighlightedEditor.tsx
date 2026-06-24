"use client";

import { useRef } from "react";
import { segment } from "@/lib/templates";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
  label: string;
  accent?: string;
}

/**
 * A textarea with a synced highlight overlay so {{variables}} glow as you type.
 * The transparent textarea captures input; the overlay underneath renders the
 * same text with highlighted variable tokens. Both share identical typography
 * and scroll, so they line up pixel-for-pixel.
 */
export default function HighlightedEditor({
  value,
  onChange,
  placeholder,
  minHeight = 120,
  label,
  accent = "#7c5cff",
}: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.currentTarget.scrollTop;
      overlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const segments = segment(value);

  return (
    <div className="group relative">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </span>
      </div>
      <div
        className="relative overflow-hidden rounded-xl glass focus-within:border-brand/50 focus-within:shadow-glow-sm transition"
        style={{ minHeight }}
      >
        {/* Highlight overlay */}
        <div
          ref={overlayRef}
          aria-hidden
          className="editor-layer pointer-events-none absolute inset-0 overflow-auto p-4 text-transparent"
        >
          {segments.map((s, i) =>
            s.isVar ? (
              <mark
                key={i}
                className="rounded-md px-0.5 text-transparent"
                style={{ backgroundColor: `${accent}33` }}
              >
                {s.text}
              </mark>
            ) : (
              <span key={i}>{s.text}</span>
            ),
          )}
          {/* keep trailing newline height */}
          {value.endsWith("\n") ? "​" : ""}
        </div>

        {/* Actual input */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={syncScroll}
          placeholder={placeholder}
          spellCheck={false}
          className="editor-layer relative block w-full resize-y bg-transparent p-4 text-slate-100 placeholder:text-slate-600 focus:outline-none"
          style={{ minHeight, caretColor: accent }}
        />
      </div>
    </div>
  );
}
