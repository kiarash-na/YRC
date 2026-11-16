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
      {/* First tab stop: lets keyboard users jump past the navigation. */}
      <a
        href="#main"
        className="sr-only z-100 rounded-md bg-yrc-accent px-4 py-2 text-body-small font-semibold text-yrc-accent-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
