import Script from "next/script";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

/** The public website chrome — header, footer, Tally embed. */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://tally.so/widgets/embed.js"
        strategy="afterInteractive"
      />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
