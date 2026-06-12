"use client";

import Link from "next/link";

import { GlossaryPanel } from "@/components/app/glossary-panel";
import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-1 pb-2 pt-3 lg:p-8">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <KoboMascot mood="thinking" size="md" speech="new word? look it up here!" />
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold lowercase text-ink sm:text-3xl">
            glossary
          </h1>
          <p className="mt-1 text-sm lowercase text-ink-soft">
            plain-english definitions for ngx trading terms.
          </p>
        </div>
        <DuoButton href="/learn" variant="secondary" size="sm">
          back to path
        </DuoButton>
      </div>
      <GlossaryPanel />
      <p className="text-center text-xs lowercase text-ink-soft">
        spotted a term in a lesson?{" "}
        <Link href="/learn" className="font-bold text-primary underline">
          keep learning
        </Link>
      </p>
    </div>
  );
}
