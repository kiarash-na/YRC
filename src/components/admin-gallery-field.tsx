"use client";

import { ArrowLeft, ArrowRight, Film, ImagePlus, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";

import { useImageKitUpload } from "@/components/admin-media-upload";
import { Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeEventGallery, type EventMedia } from "@/lib/content-shared";

interface GalleryFieldProps {
  /** Form field that receives the list as JSON (default "gallery"). */
  name?: string;
  defaultValue?: unknown;
  /** ImageKit folder new uploads go into. */
  folder: string;
}

/** A tile preview: the image, or a video's poster; a film icon otherwise. */
function Thumb({ item }: { item: EventMedia }) {
  const [failed, setFailed] = useState(false);
  const src = item.type === "image" ? item.src : item.poster;
  if (!src || failed) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <Film className="size-6" aria-hidden="true" />
      </div>
    );
  }
  return <Image src={src} alt="" fill sizes="200px" className="object-cover" onError={() => setFailed(true)} />;
}

/**
 * Event gallery editor: upload photos/videos straight to ImageKit (videos
 * get a poster frame captured in the browser), or add existing ImageKit
 * paths; reorder, caption and remove. Posts the list as JSON in one hidden
 * field — the server normalizes it again (normalizeEventGallery).
 */
export function GalleryField({ name = "gallery", defaultValue, folder }: GalleryFieldProps) {
  const statusId = useId();
  const pathId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<EventMedia[]>(() => normalizeEventGallery(defaultValue));
  const [path, setPath] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const { uploadMedia, progress, error } = useImageKitUpload(folder);

  const update = (index: number, patch: Partial<EventMedia>) =>
    setItems((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  const move = (index: number, by: -1 | 1) =>
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setMessage(null);
    const picked = Array.from(files);
    let added = 0;
    for (const [i, file] of picked.entries()) {
      setBusy(`${i + 1}/${picked.length} · ${file.name}`);
      const result = await uploadMedia(file);
      if (!result) continue;
      added += 1;
      setItems((list) => [
        ...list,
        { src: result.path, type: result.type, ...(result.poster ? { poster: result.poster } : {}) },
      ]);
    }
    setBusy(null);
    if (fileRef.current) fileRef.current.value = "";
    if (added) setMessage(`Added ${added} item${added === 1 ? "" : "s"}. Save the event to publish.`);
  }

  function addPath() {
    const [item] = normalizeEventGallery([{ src: path }]);
    if (!item) {
      setMessage("Paste an ImageKit path that starts with /, e.g. /YRC/Events/…/IMG_1.jpg");
      return;
    }
    setItems((list) => [...list, item]);
    setPath("");
    setMessage(null);
  }

  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <legend className="px-1 text-caption font-medium">Gallery (photos and videos, optional)</legend>
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      {items.length > 0 && (
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Gallery items">
          {items.map((item, index) => (
            <li key={`${item.src}-${index}`} className="flex flex-col gap-2 rounded-lg border border-border p-2">
              <div className="relative aspect-3/4 overflow-hidden rounded-md bg-muted">
                <Thumb key={item.type === "image" ? item.src : (item.poster ?? "")} item={item} />
                <span className="absolute top-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white uppercase">
                  {index + 1} · {item.type}
                </span>
              </div>
              <Input
                aria-label={`Caption for item ${index + 1}`}
                placeholder="Caption / alt text"
                value={item.alt ?? ""}
                onChange={(e) => update(index, { alt: e.target.value })}
                className="h-8 text-xs"
              />
              {item.type === "video" && (
                <Input
                  aria-label={`Poster image path for item ${index + 1}`}
                  placeholder="Poster image path"
                  value={item.poster ?? ""}
                  onChange={(e) => update(index, { poster: e.target.value || undefined })}
                  className="h-8 text-xs"
                />
              )}
              <div className="flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`Move item ${index + 1} earlier`}
                  >
                    <ArrowLeft />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`Move item ${index + 1} later`}
                  >
                    <ArrowRight />
                  </Button>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setItems((list) => list.filter((_, i) => i !== index))}
                  aria-label={`Remove item ${index + 1}`}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,video/*,.heic,.heif,.mov"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          data-testid={`${name}-files`}
          onChange={(e) => onFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          disabled={busy !== null}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
          {busy ? `Uploading ${progress ?? 0}%` : "Upload photos or videos"}
        </Button>
        <div className="flex flex-1 gap-2">
          <label htmlFor={pathId} className="sr-only">
            ImageKit path to add
          </label>
          <Input
            id={pathId}
            value={path}
            onChange={(e) => setPath(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPath();
              }
            }}
            placeholder={`…or paste a path, e.g. ${folder}/IMG_1.jpg`}
            aria-describedby={statusId}
          />
          <Button type="button" variant="outline" onClick={addPath} disabled={!path.trim()} className="gap-1">
            <Plus aria-hidden="true" />
            Add
          </Button>
        </div>
      </div>

      <p id={statusId} aria-live="polite" className="text-caption">
        {busy ? (
          <span className="text-muted-foreground">Uploading {busy}…</span>
        ) : error ? (
          <span className="text-destructive">{error}</span>
        ) : message ? (
          <span className="text-muted-foreground">{message}</span>
        ) : (
          <span className="text-muted-foreground">
            Shown as a swipeable gallery on the event page, in this order. Videos play muted in
            the card and with sound when opened. MOV, MP4, HEIC, JPG and PNG all work.
          </span>
        )}
      </p>
    </fieldset>
  );
}
