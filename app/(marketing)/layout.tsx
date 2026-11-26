import {
  MarketingFooter,
  MarketingNav,
} from "@/components/marketing/site-chrome";
import { SmoothScroll } from "@/components/marketing/smooth-scroll";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SmoothScroll />
      <MarketingNav />
      {children}
      <MarketingFooter />
    </>
  );
}
