"use client";

import { QRCodeSVG } from "qrcode.react";

/**
 * Renders the QR code for a check-in URL. The URL points at the public site
 * origin so printed QRs keep working from any environment.
 */
export function CheckinQr({ token }: { token: string }) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasrise.run";
  const url = `${base.replace(/\/$/, "")}/checkin/${token}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl border border-border bg-white p-3">
        <QRCodeSVG value={url} size={160} />
      </div>
      <p className="max-w-[220px] text-center text-[10px] break-all text-muted-foreground">
        {url}
      </p>
    </div>
  );
}
