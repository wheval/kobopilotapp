import {
  AskKobo,
  FinalCta,
  Hero,
  LessonPath,
  Practice,
  TryQuiz,
} from "@/components/marketing/landing-sections";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TryQuiz />
      <LessonPath />
      <Practice />
      <AskKobo />
      <FinalCta />
    </main>
  );
}
