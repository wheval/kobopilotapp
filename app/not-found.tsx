import Link from "next/link";

import { KoboMascot } from "@/components/mascot/kobo-mascot";
import {
  MarketingFooter,
  MarketingNav,
} from "@/components/marketing/site-chrome";
import { DuoButton } from "@/components/ui/duo-button";

export default function NotFound() {
  return (
    <>
      <MarketingNav />
      <main className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center bg-canvas px-4 py-16">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <p className="text-[10rem] font-black leading-none text-primary/15 sm:text-[12rem]">
            404
          </p>

          <div className="-mt-16 sm:-mt-20">
            <KoboMascot mood="sad" size="lg" speech="this page doesn't exist!" />
          </div>

          <h1 className="mt-6 text-display-sm lowercase text-ink">
            lost on the trading path?
          </h1>
          <p className="mt-3 max-w-sm text-sm lowercase leading-relaxed text-ink-soft">
            the link might be broken or the page moved. head back home or jump
            into your ngx lessons.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <DuoButton href="/dashboard" variant="success" size="lg" fullWidth>
              go to dashboard
            </DuoButton>
            <DuoButton href="/learn" variant="secondary" size="lg" fullWidth>
              lesson path
            </DuoButton>
          </div>

          <Link
            href="/"
            className="mt-6 text-sm font-bold lowercase text-ink-soft underline underline-offset-4 hover:text-primary"
          >
            back to landing
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
