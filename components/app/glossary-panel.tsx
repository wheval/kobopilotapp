"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

import { glossary } from "@/lib/glossary";
import { cn } from "@/lib/utils";

export function GlossaryPanel({ className }: { className?: string }) {
  const [query, setQuery] = useState("");

  const filtered = glossary.filter(
    (entry) =>
      entry.term.toLowerCase().includes(query.toLowerCase()) ||
      entry.definition.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        <BookOpen className="size-5 text-primary" />
        <h2 className="text-xl font-extrabold lowercase text-ink">trading glossary</h2>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search terms…"
        className="w-full rounded-xl border-2 border-b-4 border-hairline-strong bg-paper px-4 py-3 text-sm font-semibold outline-none focus:border-[#58cc02] focus:border-b-[#58cc02]"
      />
      <div className="space-y-3">
        {filtered.map((entry) => (
          <article
            key={entry.term}
            className="micro-card animate-fade-up rounded-xl border-2 border-b-4 border-hairline-strong bg-paper p-4"
          >
            <h3 className="font-extrabold lowercase text-ink">{entry.term}</h3>
            <p className="mt-2 text-sm lowercase leading-relaxed text-ink-soft">
              {entry.definition}
            </p>
            {entry.example && (
              <p className="mt-2 text-xs lowercase text-ink-soft/80">
                e.g. {entry.example}
              </p>
            )}
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm lowercase text-ink-soft">no terms found.</p>
        )}
      </div>
    </div>
  );
}

export function GlossaryTerms({ text }: { text: string }) {
  const terms = glossary.filter((entry) =>
    new RegExp(`\\b${entry.term}\\b`, "i").test(text)
  );

  if (terms.length === 0) return null;

  return (
    <div className="mt-4 rounded-md border-2 border-dashed border-hairline-strong bg-canvas/80 p-3">
      <p className="text-[10px] font-bold uppercase text-ink-soft">key terms</p>
      <ul className="mt-2 space-y-2">
        {terms.map((entry) => (
          <li key={entry.term} className="text-sm">
            <span className="font-extrabold lowercase text-primary">{entry.term}</span>
            <span className="lowercase text-ink-soft"> — {entry.definition}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
