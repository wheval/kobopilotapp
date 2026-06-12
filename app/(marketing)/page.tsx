import {
  Features,
  FinalCta,
  Hero,
  HowItWorks,
  SocialProof,
} from "@/components/marketing/landing-sections";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <FinalCta />
    </main>
  );
}
