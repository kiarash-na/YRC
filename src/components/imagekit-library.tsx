"use client";

import { useCallback, useEffect, useRef } from "react";

/*
 * ImageKit's official Media Library widget (imagekit-media-library-widget):
 * the real ImageKit media library in an iframe from eml.imagekit.io. The
 * admin signs in with their own ImageKit account inside it (the ImageKit
 * dashboard itself refuses to be framed). Upload, delete, folders, search —
 * all happen in ImageKit; "Insert" sends the chosen files back here.
 *
 * Needs third-party cookies for eml.imagekit.io (Chrome Incognito blocks
 * them by default).
 */

export interface PickedMedia {
  /** ImageKit path, e.g. /YRC/Home/photo.jpg */
  path: string;
  type: "image" | "video";
}

interface PickOptions {
  multiple?: boolean;
  /** Folder the library opens in. */
  folder?: string;
}

type Widget = { open: (settings?: object, callback?: (payload: unknown) => void) => void; destroy: () => void };

// Imported on demand: the package touches `window` as soon as it loads.
const loadWidget = () => import("imagekit-media-library-widget").then((m) => m.ImagekitMediaLibraryWidget);

const VIDEO_RE = /\.(mp4|mov|m4v|webm)$/i;

/** INSERT payload → our paths (keeps the stored URL-encoded form). */
export function pickedFrom(payload: unknown): PickedMedia[] {
  const data = (payload as { eventType?: string; data?: unknown[] } | null) ?? {};
  if (data.eventType !== "INSERT" || !Array.isArray(data.data)) return [];
  const out: PickedMedia[] = [];
  for (const raw of data.data) {
    const file = raw as { filePath?: string; url?: string; fileType?: string; mime?: string };
    let path = typeof file.filePath === "string" ? file.filePath : "";
    if (!path && typeof file.url === "string") {
      try {
        path = new URL(file.url).pathname.replace(/^\/[^/]+/, ""); // drop the account id
      } catch {
        path = "";
      }
    }
    if (!path.startsWith("/")) continue;
    path = /\s/.test(path) ? encodeURI(path) : path;
    const isVideo = file.mime?.startsWith("video/") || VIDEO_RE.test(path);
    out.push({ path, type: isVideo ? "video" : "image" });
  }
  return out;
}

const mlSettings = ({ multiple = false, folder }: PickOptions) => ({
  multiple,
  maxFiles: multiple ? 16 : 1,
  ...(folder ? { initialView: { folderPath: folder } } : {}),
});

/**
 * Opens the library as a modal; resolves with the files the admin inserted
 * (empty when they close it).
 */
export function useImageKitPicker() {
  const widget = useRef<Widget | null>(null);
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(
    () => () => {
      widget.current?.destroy();
      host.current?.remove();
    },
    [],
  );

  return useCallback(async (options: PickOptions = {}): Promise<PickedMedia[]> => {
    const Ctor = await loadWidget();
    return new Promise((resolve) => {
      const callback = (payload: unknown) => resolve(pickedFrom(payload));
      if (!widget.current) {
        host.current = document.createElement("div");
        host.current.className = "yrc-ik-picker";
        document.body.appendChild(host.current);
        widget.current = new Ctor(
          {
            container: host.current,
            className: "yrc-ik-widget",
            view: "modal",
            renderOpenButton: false,
            dimensions: { height: "100%", width: "100%" },
            mlSettings: mlSettings(options),
          },
          callback,
        ) as unknown as Widget;
        widget.current.open(undefined, callback);
      } else {
        widget.current.open({ mlSettings: mlSettings(options) }, callback);
      }
    });
  }, []);
}

/** The whole library, inline — the "ImageKit library" tab. */
export function ImageKitLibraryInline({ folder = "/YRC" }: { folder?: string }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let widget: Widget | null = null;
    let cancelled = false;
    loadWidget().then((Ctor) => {
      if (cancelled || !container.current) return;
      widget = new Ctor(
        {
          container: container.current,
          className: "yrc-ik-inline",
          view: "inline",
          renderOpenButton: false,
          dimensions: { height: "100%", width: "100%" },
          mlSettings: { multiple: true, initialView: { folderPath: folder }, toolbar: { showInsertButton: false, showCloseButton: false } },
        },
        () => {},
      ) as unknown as Widget;
    });
    return () => {
      cancelled = true;
      widget?.destroy();
    };
  }, [folder]);

  return <div ref={container} className="h-[78svh] min-h-[520px] w-full overflow-hidden rounded-xl border border-border bg-background" />;
}
