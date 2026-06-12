import { ArrowRight, Sparkles } from "lucide-react";

import { KoboMascot } from "@/components/mascot/kobo-mascot";
import { DuoButton } from "@/components/ui/duo-button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-canvas section-padding">
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <KoboMascot
            mood="happy"
            size="xl"
            speech="trading is fun when you learn step by step!"
          />
        </div>
        <div className="order-1 space-y-6 lg:order-2">
          <div className="inline-flex animate-bounce-soft items-center gap-2 rounded-full border-2 border-b-4 border-hairline-strong bg-paper px-4 py-1.5 text-sm font-bold lowercase text-ink shadow-soft-lift">
            <Sparkles className="size-4 fill-accent-lime text-accent-lime" />
            free, gamified, no real money
          </div>
          <h1 className="text-display-xl lowercase text-ink">
            learn. practice. trade.
          </h1>
          <p className="max-w-xl text-body-lg lowercase text-ink-soft">
            bite-sized lessons, instant quizzes, and a paper-trading playground —
            just like your favorite language app, but for the markets.
          </p>
          <div className="flex flex-wrap gap-3">
            <DuoButton href="/dashboard" size="lg" variant="success">
              start learning
              <ArrowRight className="size-5" />
            </DuoButton>
            <DuoButton href="/learn" size="lg" variant="secondary">
              see the path
            </DuoButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SocialProof() {
  const stats = [
    { value: "12k+", label: "lessons done" },
    { value: "4.8k", label: "learners" },
    { value: "89k+", label: "paper trades" },
  ];

  return (
    <section className="border-y-2 border-hairline bg-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-display-sm lowercase text-ink">{stat.value}</p>
            <p className="mt-1 text-sm font-bold lowercase text-ink-soft">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Features() {
  const features = [
    {
      title: "guided lessons",
      description:
        "short, friendly modules from stock basics to your first paper trade.",
    },
    {
      title: "instant quizzes",
      description:
        "tap an answer, get feedback right away — just like duolingo.",
    },
    {
      title: "paper trading",
      description:
        "buy and sell with play money. zero stress, all skill-building.",
    },
    {
      title: "xp & streaks",
      description:
        "earn points, keep your streak, and watch your path light up green.",
    },
  ];

  return (
    <section id="features" className="section-padding bg-canvas">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-display-md lowercase text-ink">
            everything you need to learn trading
          </h2>
          <p className="mt-4 text-body-lg lowercase text-ink-soft">
            kobopilot turns intimidating finance into a game you actually want
            to play.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border-2 border-b-4 border-hairline-strong bg-paper p-6 shadow-soft-lift transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl border-b-4 border-b-primary-deep bg-primary">
                <Sparkles className="size-5 fill-accent-lime text-accent-lime" />
              </div>
              <h3 className="text-display-sm lowercase text-ink">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed lowercase text-ink-soft">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      step: "1",
      title: "pick a lesson bubble",
      description: "follow the path — each node unlocks the next one.",
    },
    {
      step: "2",
      title: "read & tap continue",
      description: "tiny lessons with a mascot cheering you on.",
    },
    {
      step: "3",
      title: "pass the quiz",
      description: "duolingo-style buttons with instant right/wrong feedback.",
    },
    {
      step: "4",
      title: "practice with fake cash",
      description: "paper trade stocks and track your play portfolio.",
    },
  ];

  return (
    <section id="how-it-works" className="section-padding bg-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <KoboMascot mood="thinking" size="md" speech="four steps. that's it!" />
          <h2 className="mt-6 text-display-md lowercase text-ink">
            how kobopilot works
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border-2 border-b-4 border-hairline-strong bg-canvas p-6"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-full border-b-4 border-b-[#46a302] bg-[#58cc02] text-lg font-extrabold text-white">
                {item.step}
              </span>
              <h3 className="mt-4 font-extrabold lowercase text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm lowercase leading-relaxed text-ink-soft">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="section-padding bg-primary text-on-primary">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6">
        <KoboMascot mood="celebrate" size="lg" speech="you've got this!" />
        <h2 className="mt-6 text-display-md lowercase text-on-primary">
          ready to start?
        </h2>
        <p className="mt-4 text-body-lg lowercase text-on-primary/80">
          join the path — lessons, quizzes, and paper trades await.
        </p>
        <DuoButton
          href="/dashboard"
          size="lg"
          variant="success"
          className="mt-8"
        >
          start for free
          <ArrowRight className="size-5" />
        </DuoButton>
      </div>
    </section>
  );
}
