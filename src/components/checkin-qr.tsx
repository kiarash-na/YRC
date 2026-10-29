"use client";

import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Renders the QR code for a check-in URL. The URL points at the public site
 * origin so printed QRs keep working from any environment. Download buttons
 * export the code as print-ready PNG (1024px) or vector SVG.
 */
export function CheckinQr({ token, slug }: { token: string; slug?: string }) {
  const svgRef = useRef<HTMLDivElement>(null);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yasrise.run";
  const url = `${base.replace(/\/$/, "")}/checkin/${token}`;
  const fileBase = `yrc-checkin-${slug ?? token.slice(0, 8)}`;

  function serializeSvg(): string | null {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    return new XMLSerializer().serializeToString(clone);
  }

  function downloadSvg() {
    const data = serializeSvg();
    if (!data) return;
    const blob = new Blob([data], { type: "image/svg+xml" });
    triggerDownload(URL.createObjectURL(blob), `${fileBase}.svg`);
  }

  function downloadPng() {
    const data = serializeSvg();
    if (!data) return;
    const img = new Image();
    img.onload = () => {
      const size = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff"; // white background for print
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      triggerDownload(canvas.toDataURL("image/png"), `${fileBase}.png`);
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
  }

  function triggerDownload(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    if (href.startsWith("blob:")) URL.revokeObjectURL(href);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={svgRef} className="rounded-xl border border-border bg-white p-3">
        <QRCodeSVG value={url} size={160} />
      </div>
      <p className="max-w-[220px] text-center text-[10px] break-all text-muted-foreground">
        {url}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={downloadPng} className="gap-1.5">
          <Download className="size-3.5" />
          PNG
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={downloadSvg} className="gap-1.5">
          <Download className="size-3.5" />
          SVG
        </Button>
      </div>
    </div>
  );
}
