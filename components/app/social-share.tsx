"use client";

import { useState } from "react";
import { Share2, UserPlus, UserRound } from "lucide-react";

import { CreateProfileModal } from "@/components/app/create-profile-modal";
import { ProgressShareModal } from "@/components/app/progress-share-modal";
import { DuoButton } from "@/components/ui/duo-button";
import { lessons } from "@/lib/lessons";
import { hapticSuccess, hapticTap } from "@/lib/haptics";
import {
  buildInviteShareText,
  getInviteUrl,
  shareOrCopy,
} from "@/lib/share-social";
import { useProgressStore } from "@/lib/store/progress-store";
import { useUserHydrated, useUserStore } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";

export function SocialShareSection() {
  const streak = useProgressStore((s) => s.streak);
  const xp = useProgressStore((s) => s.xp);
  const completedCount = useProgressStore((s) => s.completedLessonIds.length);
  const progressPercent = useProgressStore((s) => s.getOverallProgress());
  const quizAverage = useProgressStore((s) => s.getAverageQuizScore());

  const userHydrated = useUserHydrated();
  const displayName = useUserStore((s) => s.displayName);
  const hasProfile = useUserStore((s) => s.hasProfile());

  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [pendingShare, setPendingShare] = useState(false);

  const snapshot = {
    streak,
    xp,
    completedCount,
    progressPercent,
    quizAverage,
  };

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(null), 2500);
  };

  const openShareCard = () => {
    setShowShareCard(true);
  };

  const handleShareProgress = () => {
    hapticTap();
    if (!userHydrated) return;

    if (!hasProfile) {
      setPendingShare(true);
      setShowCreateProfile(true);
      return;
    }

    openShareCard();
  };

  const handleProfileComplete = () => {
    setShowCreateProfile(false);
    if (pendingShare) {
      setPendingShare(false);
      openShareCard();
    }
  };

  const handleInviteFriends = async () => {
    hapticTap();

    if (!userHydrated) return;

    if (!hasProfile) {
      setPendingShare(false);
      setShowCreateProfile(true);
      return;
    }

    const inviteUrl = getInviteUrl();
    const text = buildInviteShareText(snapshot, inviteUrl, displayName ?? undefined);

    try {
      const result = await shareOrCopy(text, inviteUrl);
      hapticSuccess();
      showFeedback(
        result === "shared" ? "invite sent!" : "invite link copied!"
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      showFeedback("couldn't copy link — try again");
    }
  };

  return (
    <>
      <section className="micro-card animate-fade-up space-y-3 rounded-xl border-2 border-b-4 border-hairline-strong bg-paper p-5 shadow-soft-lift">
        <div>
          <p className="text-xs font-bold uppercase text-ink-soft">spread the word</p>
          <p className="mt-1 text-sm lowercase text-ink-soft">
            {hasProfile
              ? "download your progress card or invite friends to learn ngx."
              : "create a quick profile to download a shareable progress card."}
          </p>
        </div>

        {userHydrated && !hasProfile && (
          <div className="flex items-start gap-3 rounded-xl border-2 border-dashed border-[#58cc02] bg-[#d7ffb8]/30 p-3">
            <UserRound className="mt-0.5 size-5 shrink-0 text-[#58cc02]" />
            <div>
              <p className="text-sm font-extrabold lowercase text-ink">
                you are playing as a guest
              </p>
              <p className="mt-1 text-xs lowercase text-ink-soft">
                lessons & trades save on this device. add a name to share your
                card — full accounts for cloud sync are coming soon.
              </p>
              <button
                type="button"
                onClick={() => {
                  hapticTap();
                  setPendingShare(false);
                  setShowCreateProfile(true);
                }}
                className="mt-2 text-xs font-bold lowercase text-[#58cc02] underline"
              >
                create profile
              </button>
            </div>
          </div>
        )}

        {userHydrated && hasProfile && displayName && (
          <p className="text-center text-xs font-bold lowercase text-primary">
            sharing as @{displayName.toLowerCase()}
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          <DuoButton
            variant="secondary"
            size="lg"
            onClick={handleShareProgress}
            className="normal-case"
          >
            <Share2 className="size-4" />
            share progress
          </DuoButton>
          <DuoButton
            variant="primary"
            size="lg"
            onClick={handleInviteFriends}
            className="normal-case"
          >
            <UserPlus className="size-4" />
            invite friends
          </DuoButton>
        </div>

        <p className="text-center text-xs lowercase text-ink-soft">
          {completedCount}/{lessons.length} lessons · {progressPercent}% · {xp} xp
        </p>

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
      </section>

      <CreateProfileModal
        open={showCreateProfile}
        onClose={() => {
          setShowCreateProfile(false);
          setPendingShare(false);
        }}
        onComplete={handleProfileComplete}
        reason={pendingShare ? "share" : "save"}
      />

      {displayName && (
        <ProgressShareModal
          open={showShareCard}
          onClose={() => setShowShareCard(false)}
          displayName={displayName}
          snapshot={snapshot}
        />
      )}
    </>
  );
}
