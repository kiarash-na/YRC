import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import ImageKitProviderWrapper from "@/components/imagekit-provider";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YRC — Yas Rise Community",
  description:
    "Yas Rise Community Munich — weekly runs, training, outdoor adventures and good people. Run together. Grow together.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src="https://tally.so/widgets/embed.js"
          strategy="afterInteractive"
        />
        <ImageKitProviderWrapper>
          <Navbar />
          {children}
          <Footer />
        </ImageKitProviderWrapper>
      </body>
    </html>
  );
}
