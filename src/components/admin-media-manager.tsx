"use client";

import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Film,
  FolderOpen,
  LoaderCircle,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, useTransition, type SyntheticEvent } from "react";

import { useImageKitUpload } from "@/components/admin-media-upload";
import { Image, Video } from "@/components/imagekit";
import { ImageKitLibraryInline, useImageKitPicker } from "@/components/imagekit-library";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resetSlotMedia, saveSlotMedia } from "@/lib/actions/site-media";
import { ORIGINAL_VIDEO } from "@/lib/imagekit";
import { SITE_PAGES, type SiteMediaItem, type SiteMediaSlot, type SitePage } from "@/lib/site-media";
import { cn } from "@/lib/utils";

export interface MediaSlotState {
  slot: SiteMediaSlot;
  items: SiteMediaItem[];
  /** True when an admin override is live (else the built-in default shows). */
  custom: boolean;
  updatedAt?: string;
}

const PAGE_HREF: Record<SitePage, string> = {
  Home: "/",
  Events: "/events",
  Community: "/community",
  About: "/about",
  Journal: "/journal",
};

const UPLOAD_FOLDER = "/YRC/Site";

/** Media manager: every image/video box on the public pages, by page. */
export function AdminMediaManager({ slots }: { slots: MediaSlotState[] }) {
  const [page, setPage] = useState<SitePage | "All">("All");
  const pick = useImageKitPicker();
  const visible = slots.filter((s) => page === "All" || s.slot.page === page);
  const customCount = slots.filter((s) => s.custom).length;

  return (
    <Tabs defaultValue="pages" className="gap-6">
      <TabsList variant="line" className="h-auto w-full justify-start gap-6 border-b border-border p-0">
        <TabsTrigger value="pages" className="h-10 flex-none rounded-none px-0.5 font-semibold">
          Page media
        </TabsTrigger>
        <TabsTrigger value="library" className="h-10 flex-none rounded-none px-0.5 font-semibold">
          ImageKit library
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pages" className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          {(["All", ...SITE_PAGES] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-pressed={page === p}
              className={cn(
                "h-8 rounded-full border px-3.5 text-xs font-semibold transition-colors",
                page === p
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
              <span className="ml-1.5 opacity-60">
                {p === "All" ? slots.length : slots.filter((s) => s.slot.page === p).length}
              </span>
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {customCount} of {slots.length} boxes changed from the default
          </span>
        </div>

        {visible.map((state) => (
          <SlotEditor key={state.slot.key} state={state} pick={pick} />
        ))}
      </TabsContent>

      <TabsContent value="library" className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          The ImageKit media library: upload, organise, rename and delete files. Sign in with the
          YRC ImageKit account the first time. Files deleted here disappear from every page that
          uses them, so swap them out under <strong>Page media</strong> first.
        </p>
        <ImageKitLibraryInline folder="/YRC" />
      </TabsContent>
    </Tabs>
  );
}

type Picker = ReturnType<typeof useImageKitPicker>;

function SlotEditor({ state, pick }: { state: MediaSlotState; pick: Picker }) {
  const { slot } = state;
  const router = useRouter();
  const [items, setItems] = useState<SiteMediaItem[]>(state.items);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const initial = useMemo(() => JSON.stringify(state.items), [state.items]);
  const dirty = JSON.stringify(items) !== initial;
  const variable = slot.min !== slot.max;

  const update = (index: number, patch: Partial<SiteMediaItem>) =>
    setItems((list) => list.map((item, i) => (i === index ? clean({ ...item, ...patch }) : item)));
  const move = (index: number, by: -1 | 1) =>
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });

  const save = () =>
    startTransition(async () => {
      setMessage(null);
      const result = await saveSlotMedia(slot.key, items);
      if (result.ok) {
        setMessage({ tone: "ok", text: "Saved — the page shows it now." });
        router.refresh();
      } else setMessage({ tone: "error", text: result.error });
    });

  const reset = () =>
    startTransition(async () => {
      setMessage(null);
      const result = await resetSlotMedia(slot.key);
      if (result.ok) {
        setItems(slot.defaults);
        setMessage({ tone: "ok", text: "Back to the built-in default." });
        router.refresh();
      } else setMessage({ tone: "error", text: result.error });
    });

  const addFromLibrary = async () => {
    const picked = await pick({ multiple: true, folder: "/YRC" });
    if (!picked.length) return;
    setItems((list) =>
      [
        ...list,
        ...picked.map((p) => clean({ src: p.path, alt: "", type: p.type === "video" ? "video" : undefined })),
      ].slice(0, slot.max),
    );
  };

  return (
    <section
      aria-labelledby={`${slot.key}-title`}
      className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4 md:p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px] tracking-wider uppercase">
              {slot.page}
            </Badge>
            <h2 id={`${slot.key}-title`} className="text-base font-semibold">
              {slot.label}
            </h2>
            {state.custom ? (
              <Badge className="bg-yrc-accent text-[10px] text-yrc-accent-foreground">Changed</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                Default
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {slot.kind === "video" ? "Video" : "Image"} · {slot.shape}
            {variable ? ` · ${slot.min}–${slot.max} items` : ""}
          </p>
        </div>
        <a
          href={PAGE_HREF[slot.page]}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          View page
          <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </header>

      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <ItemEditor
            key={`${index}-${item.src}`}
            slot={slot}
            item={item}
            index={index}
            count={items.length}
            pick={pick}
            onChange={(patch) => update(index, patch)}
            onMove={(by) => move(index, by)}
            onRemove={variable && items.length > slot.min ? () => setItems((l) => l.filter((_, i) => i !== index)) : undefined}
          />
        ))}
      </ol>

      <footer className="flex flex-wrap items-center gap-2">
        {variable && items.length < slot.max && (
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addFromLibrary}>
            <Plus aria-hidden="true" />
            Add from ImageKit
          </Button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {message && (
            <span
              role="status"
              className={cn("text-xs", message.tone === "ok" ? "text-green-700 dark:text-green-500" : "text-destructive")}
            >
              {message.text}
            </span>
          )}
          {state.custom && (
            <Button type="button" variant="ghost" size="sm" className="gap-1.5" disabled={isPending} onClick={reset}>
              <RotateCcw aria-hidden="true" />
              Reset to default
            </Button>
          )}
          {dirty && (
            <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={() => setItems(state.items)}>
              Discard
            </Button>
          )}
          <Button type="button" size="sm" className="gap-1.5" disabled={!dirty || isPending} onClick={save}>
            {isPending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Check aria-hidden="true" />}
            Save
          </Button>
        </div>
      </footer>
    </section>
  );
}

/** Paths are stored URL-encoded (spaces → %20); show them readable. */
const readable = (path: string) => {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
};
const encoded = (path: string) => path.trim().replace(/ /g, "%20");

/** Drops empty optional fields so "unchanged" compares equal. */
function clean(item: SiteMediaItem): SiteMediaItem {
  const out = { ...item };
  for (const key of Object.keys(out) as (keyof SiteMediaItem)[]) {
    if (out[key] === undefined || out[key] === "") delete out[key];
  }
  if (out.alt === undefined) out.alt = "";
  return out;
}

function ItemEditor({
  slot,
  item,
  index,
  count,
  pick,
  onChange,
  onMove,
  onRemove,
}: {
  slot: SiteMediaSlot;
  item: SiteMediaItem;
  index: number;
  count: number;
  pick: Picker;
  onChange: (patch: Partial<SiteMediaItem>) => void;
  onMove: (by: -1 | 1) => void;
  onRemove?: () => void;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const { uploadMedia, progress, uploading, error } = useImageKitUpload(UPLOAD_FOLDER);
  const isVideo = item.type === "video" || slot.kind === "video";
  const label = slot.itemLabels?.[index] ?? `${isVideo ? "Clip" : "Photo"} ${index + 1}`;

  // A new file is a new cache key: drop the old one (and the old crop hints).
  const replace = (src: string, type?: "image" | "video") =>
    onChange({ src, type: type === "video" ? "video" : undefined, updatedAt: undefined, position: undefined, width: undefined });

  const choose = async () => {
    const [picked] = await pick({ folder: "/YRC" });
    if (picked) replace(picked.path, picked.type);
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    const result = await uploadMedia(file);
    if (result) {
      replace(result.path, result.type);
      if (result.poster) onChange({ poster: result.poster });
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <li className="flex flex-col gap-2.5 rounded-lg border border-border p-2.5">
      <div className="relative aspect-4/3 overflow-hidden rounded-md bg-muted">
        <Preview item={item} isVideo={isVideo} />
        <span className="absolute top-1.5 left-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {label}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 px-2 text-xs" onClick={choose}>
          <FolderOpen aria-hidden="true" />
          Choose
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
          {uploading ? `${progress ?? 0}%` : "Upload"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept={isVideo ? "video/*,.mov" : "image/*,.heic,.heif"}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => upload(e.target.files?.[0])}
        />
        <div className="ml-auto flex gap-0.5">
          <Button type="button" variant="ghost" size="icon-sm" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move ${label} earlier`}>
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Move ${label} later`}>
            <ArrowDown />
          </Button>
          {onRemove && (
            <Button type="button" variant="ghost" size="icon-sm" onClick={onRemove} aria-label={`Remove ${label}`}>
              <Trash2 className="text-destructive" />
            </Button>
          )}
        </div>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <label htmlFor={`${id}-src`} className="sr-only">
        {label}: ImageKit path
      </label>
      <Input
        id={`${id}-src`}
        value={readable(item.src)}
        onChange={(e) => onChange({ src: encoded(e.target.value), updatedAt: undefined })}
        placeholder="/YRC/…/photo.jpg"
        className="h-8 font-mono text-[11px]"
      />
      <label htmlFor={`${id}-alt`} className="sr-only">
        {label}: description (alt text)
      </label>
      <Input
        id={`${id}-alt`}
        value={item.alt}
        onChange={(e) => onChange({ alt: e.target.value })}
        placeholder="Describe the photo (alt text)"
        className="h-8 text-xs"
      />
      {isVideo && (
        <div className="grid grid-cols-[1fr_auto_auto] gap-1.5">
          <Input
            aria-label={`${label}: still image path`}
            value={item.poster ? readable(item.poster) : ""}
            onChange={(e) => onChange({ poster: encoded(e.target.value) })}
            placeholder="Still image path (optional)"
            className="h-8 font-mono text-[11px]"
          />
          <Input
            aria-label={`${label}: start second`}
            type="number"
            min={0}
            step={0.1}
            value={item.start ?? ""}
            onChange={(e) => onChange({ start: e.target.value === "" ? undefined : Number(e.target.value) })}
            placeholder="from s"
            className="h-8 w-16 text-xs"
          />
          <Input
            aria-label={`${label}: end second`}
            type="number"
            min={0}
            step={0.1}
            value={item.end ?? ""}
            onChange={(e) => onChange({ end: e.target.value === "" ? undefined : Number(e.target.value) })}
            placeholder="to s"
            className="h-8 w-16 text-xs"
          />
        </div>
      )}
    </li>
  );
}

function Preview({ item, isVideo }: { item: SiteMediaItem; isVideo: boolean }) {
  const [failed, setFailed] = useState(false);
  const still = isVideo ? item.poster : item.src;
  if (still && !failed && item.src.startsWith("/")) {
    return (
      <Image
        key={still}
        src={still}
        alt=""
        fill
        sizes="320px"
        className="object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  if (isVideo && item.src.startsWith("/") && !failed) {
    // No still: show the clip's first frame (metadata only, no autoplay).
    return (
      <Video
        key={item.src}
        src={item.src}
        queryParameters={ORIGINAL_VIDEO}
        muted
        playsInline
        preload="metadata"
        tabIndex={-1}
        aria-hidden="true"
        onLoadedMetadata={(event: SyntheticEvent<HTMLVideoElement>) => {
          event.currentTarget.currentTime = Math.max(0.1, item.start ?? 0);
        }}
        onError={() => setFailed(true)}
        className="absolute inset-0 size-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
      <Film className="size-6" aria-hidden="true" />
      <span className="text-[10px]">Can&apos;t load this path</span>
    </div>
  );
}
