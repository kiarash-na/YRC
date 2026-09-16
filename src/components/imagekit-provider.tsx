"use client";

import { ImageKitProvider } from "@imagekit/next";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "";

if (process.env.NODE_ENV !== "production" && !urlEndpoint) {
  console.error(
    "[ImageKit] NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT is not set. " +
      "ImageKit Image/Video components will generate broken URLs."
  );
}

export default function ImageKitProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImageKitProvider urlEndpoint={urlEndpoint}>{children}</ImageKitProvider>
  );
}
