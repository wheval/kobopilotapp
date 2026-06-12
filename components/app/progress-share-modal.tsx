"use client";

import { useRef, useState } from "react";
import { Download, Share2, X } from "lucide-react";
import { toPng } from "html-to-image";

import { ProgressShareCard } from "@/components/app/progress-share-card";
import { DuoButton } from "@/components/ui/duo-button";
import { hapticSuccess, hapticTap } from "@/lib/haptics";
import {
  buildProgressShareText,
  type ProgressSnapshot,
  shareOrCopy,
} from "@/lib/share-social";
import { cn } from "@/lib/utils";

export function ProgressShareModal({
  open,
  onClose,
  displayName,
  snapshot,
}: {
  open: boolean;
  onClose: () => void;
  displayName: string;
  snapshot: ProgressSnapshot;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!open) return null;

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2500);
  };

  const exportCard = async () => {
    if (!cardRef.current) return null;
    return toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
    });
  };

  const handleDownload = async () => {
    hapticTap();
    try {
      const dataUrl = await exportCard();
      if (!dataUrl) return;

      const link = document.createElement("a");
      link.download = `kobopilot-${displayName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
      hapticSuccess();
      showFeedback("card saved!");
    } catch {
      showFeedback("couldn't save card — try again");
    }
  };

  const handleShare = async () => {
    hapticTap();
    const text = buildProgressShareText(snapshot, displayName);
    const url =
      typeof window !== "undefined" ? window.location.origin : undefined;

    try {
      const dataUrl = await exportCard();
      if (dataUrl && typeof navigator !== "undefined" && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File(
          [blob],
          `kobopilot-${displayName}.png`,
          { type: "image/png" }
        );

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            title: `${displayName} on Kobopilot`,
            text,
            files: [file],
          });
          hapticSuccess();
          showFeedback("shared!");
          return;
        }
      }

      const result = await shareOrCopy(text, url);
      hapticSuccess();
      showFeedback(result === "shared" ? "shared!" : "copied to clipboard!");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      showFeedback("couldn't share — try download");
    }
  };

  return (
    <div
      className="fixed inset-0 z-90 flex items-end justify-center bg-ink/60 p-4 sm:items-center"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
      role="dialog"
      aria-modal
      aria-labelledby="share-card-title"
    >
      <div className="animate-pop-in flex max-h-[min(92dvh,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border-2 border-b-4 border-hairline-strong bg-canvas shadow-card">
        <div className="flex shrink-0 items-center justify-between border-b border-hairline bg-paper px-4 py-3">
          <div>
            <p
              id="share-card-title"
              className="font-extrabold lowercase text-ink"
            >
              your progress card
            </p>
            <p className="text-xs lowercase text-ink-soft">
              download or share your ngx journey
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              onClose();
            }}
            className="flex size-10 items-center justify-center rounded-xl border-2 border-hairline bg-canvas"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          <ProgressShareCard
            ref={cardRef}
            displayName={displayName}
            snapshot={snapshot}
          />
        </div>

        <div className="shrink-0 space-y-2 border-t border-hairline bg-paper p-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <DuoButton
              fullWidth
              size="lg"
              variant="success"
              onClick={handleDownload}
              className="normal-case"
            >
              <Download className="size-4" />
              download card
            </DuoButton>
            <DuoButton
              fullWidth
              size="lg"
              variant="secondary"
              onClick={handleShare}
              className="normal-case"
            >
              <Share2 className="size-4" />
              share
            </DuoButton>
          </div>
          {feedback && (
            <p
              className={cn(
                "animate-pop-in text-center text-sm font-extrabold lowercase text-[#58cc02]"
              )}
              role="status"
            >
              {feedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
