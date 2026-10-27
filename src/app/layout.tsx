import type { Metadata } from "next";
import { Poppins } from "next/font/google";
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
    "Yas Rise Community — weekly runs, training, outdoor adventures and good people. Run together. Grow together.",
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
