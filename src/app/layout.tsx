import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import ImageKitProviderWrapper from "@/components/imagekit-provider";
import { IMAGEKIT_URL_ENDPOINT } from "@/lib/imagekit";
import { IS_PRODUCTION_SITE, SITE_URL } from "@/lib/site";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

const DESCRIPTION =
  "Yas Rise Community — weekly runs, training, outdoor adventures and good people. Run together. Grow together.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "YRC — Yas Rise Community",
  description: DESCRIPTION,
  // Default share card (pages with their own image override it).
  openGraph: {
    siteName: "Yas Rise Community",
    type: "website",
    title: "YRC — Yas Rise Community",
    description: DESCRIPTION,
    images: IMAGEKIT_URL_ENDPOINT
      ? [
          {
            url: `${IMAGEKIT_URL_ENDPOINT}/YRC/Home/pexels-runffwpu-18409430.jpg?tr=w-1200,h-630,c-maintain_ratio,fo-auto`,
            width: 1200,
            height: 630,
            alt: "YRC runners on a group run",
          },
        ]
      : undefined,
  },
  twitter: { card: "summary_large_image" },
  robots: IS_PRODUCTION_SITE ? undefined : { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ImageKitProviderWrapper>{children}</ImageKitProviderWrapper>
      </body>
    </html>
  );
}
