"use client";

import { useState, type FormEvent } from "react";

import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";
import { hapticSuccess, hapticTap } from "@/lib/haptics";
import {
  normalizeDisplayName,
  useUserStore,
} from "@/lib/store/user-store";

export function CreateProfileModal({
  open,
  onClose,
  onComplete,
  reason = "share",
}: {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  reason?: "share" | "save";
}) {
  const setProfile = useUserStore((s) => s.setProfile);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const normalized = normalizeDisplayName(name);
    if (normalized.length < 2) {
      setError("pick a name with at least 2 characters");
      return;
    }
    hapticSuccess();
    setProfile(normalized);
    onComplete();
  };

  const headline =
    reason === "share"
      ? "create a profile to share your card"
      : "create a profile to save progress";

  return (
    <div
      className="fixed inset-0 z-90 flex items-end justify-center bg-ink/60 p-4 sm:items-center"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
      role="dialog"
      aria-modal
      aria-labelledby="create-profile-title"
    >
      <div className="animate-pop-in w-full max-w-md overflow-hidden rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper shadow-card">
        <div className="border-b border-hairline bg-canvas px-5 py-4 text-center">
          <KoboMascot mood="happy" size="sm" speech="what should i call you?" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <h2
              id="create-profile-title"
              className="text-lg font-extrabold lowercase text-ink"
            >
              {headline}
            </h2>
            <p className="mt-2 text-sm lowercase leading-relaxed text-ink-soft">
              play free as a guest anytime. add a display name so your progress
              card shows who you are — and so we can sync your path when accounts
              launch.
            </p>
          </div>

          <div>
            <label
              htmlFor="display-name"
              className="text-xs font-bold uppercase text-ink-soft"
            >
              display name
            </label>
            <input
              id="display-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. ada, trading_queen…"
              autoFocus
              className="mt-2 w-full rounded-xl border-2 border-b-4 border-hairline-strong bg-canvas px-4 py-3 text-sm font-semibold outline-none focus:border-[#58cc02] focus:border-b-[#58cc02]"
            />
            {error && (
              <p className="mt-2 text-xs font-semibold lowercase text-destructive">
                {error}
              </p>
            )}
          </div>

          <DuoButton type="submit" fullWidth size="lg" variant="success">
            create profile & continue
          </DuoButton>
          <button
            type="button"
            onClick={() => {
              hapticTap();
              onClose();
            }}
            className="min-h-11 w-full text-sm font-bold lowercase text-ink-soft underline"
          >
            not now
          </button>
        </form>
      </div>
    </div>
  );
}
