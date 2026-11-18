"use client";

import { upload } from "@imagekit/next";
import { ImageUp, LoaderCircle } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageKitUploadAuth } from "@/lib/actions/media";

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

interface MediaUploadFieldProps {
  /** Form field name that receives the ImageKit path (e.g. "cover"). */
  name: string;
  label: string;
  defaultValue?: string;
  /** ImageKit folder new uploads go into. */
  folder: string;
  required?: boolean;
}

/**
 * An ImageKit path input with a direct-upload button. Picking an image asks
 * the server for a one-time signed token, uploads the file straight from the
 * browser to ImageKit (with progress), then fills in the new file's path.
 * The path stays editable, so existing media can still be referenced by hand.
 */
/**
 * Direct browser → ImageKit upload with a server-signed one-time token.
 * `uploadImage` takes images only; `uploadMedia` also takes videos. Both
 * return the new file's ImageKit path, or null (with `error` set).
 */
export function useImageKitUpload(folder: string) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send(file: File, fileName = file.name): Promise<{ path: string; name: string } | null> {
    setProgress(0);
    try {
      const auth = await getImageKitUploadAuth();
      if (!auth.ok) {
        setError(auth.error);
        return null;
      }
      const result = await upload({
        file,
        fileName,
        folder,
        useUniqueFileName: true,
        token: auth.token,
        expire: auth.expire,
        signature: auth.signature,
        publicKey: auth.publicKey,
        onProgress: (event) => {
          if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
        },
      });
      if (!result.filePath) throw new Error("ImageKit didn't return a file path.");
      return { path: result.filePath, name: result.name ?? fileName };
    } catch (err) {
      console.error("ImageKit upload failed:", err);
      setError("Upload failed. Check your connection and try again.");
      return null;
    } finally {
      setProgress(null);
    }
  }

  async function uploadImage(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG, WebP…).");
      return null;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is over 20 MB. Export a smaller version and try again.");
      return null;
    }
    return send(file);
  }

  /** Images or videos. Videos also get a poster frame (see capturePoster). */
  async function uploadMedia(
    file: File,
  ): Promise<{ path: string; name: string; type: "image" | "video"; poster?: string } | null> {
    setError(null);
    if (file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name)) {
      if (file.size > MAX_IMAGE_BYTES) {
        setError(`${file.name} is over 20 MB. Export a smaller version and try again.`);
        return null;
      }
      const result = await send(file);
      return result && { ...result, type: "image" };
    }
    if (file.type.startsWith("video/")) {
      if (file.size > MAX_VIDEO_BYTES) {
        setError(`${file.name} is over 200 MB. Trim or compress it and try again.`);
        return null;
      }
      const result = await send(file);
      if (!result) return null;
      const still = await capturePoster(file);
      const poster = still ? await send(still) : null;
      return { ...result, type: "video", poster: poster?.path };
    }
    setError("Choose a photo or a video.");
    return null;
  }

  return { uploadImage, uploadMedia, progress, uploading: progress !== null, error };
}

/**
 * A JPEG still from a video file, taken in the browser (≈0.5 s in, long side
 * ≤ 1280 px). ImageKit can't make video thumbnails on this account, so the
 * gallery needs a real image. Null when the browser can't decode the clip
 * (e.g. HEVC in Chrome) — the admin can then paste a poster path.
 */
function capturePoster(file: File): Promise<File | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    const done = (result: File | null) => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
      resolve(result);
    };
    const timer = window.setTimeout(() => done(null), 15_000);
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onerror = () => {
      window.clearTimeout(timer);
      done(null);
    };
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, (video.duration || 1) / 3);
    };
    video.onseeked = () => {
      window.clearTimeout(timer);
      const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const context = canvas.getContext("2d");
      if (!context || !canvas.width) return done(null);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) =>
          done(
            blob
              ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-poster.jpg`, { type: "image/jpeg" })
              : null,
          ),
        "image/jpeg",
        0.85,
      );
    };
    video.src = url;
  });
}

export function MediaUploadField({ name, label, defaultValue = "", folder, required }: MediaUploadFieldProps) {
  const inputId = useId();
  const statusId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState(defaultValue);
  const [message, setMessage] = useState<string | null>(null);
  const { uploadImage, progress, uploading, error } = useImageKitUpload(folder);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setMessage(null);
    const result = await uploadImage(file);
    if (fileRef.current) fileRef.current.value = "";
    if (result) {
      setPath(result.path);
      setMessage(`Uploaded ${result.name}.`);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-caption font-medium">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={inputId}
          name={name}
          value={path}
          onChange={(e) => setPath(e.target.value)}
          required={required}
          placeholder={`${folder}/…`}
          aria-describedby={statusId}
          className="sm:flex-1"
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          data-testid={`${name}-file`}
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <ImageUp aria-hidden="true" />}
          {uploading ? `Uploading ${progress}%` : "Upload image"}
        </Button>
      </div>

      {uploading && (
        <div
          role="progressbar"
          aria-label="Upload progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress ?? 0}
          className="h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full bg-yrc-accent transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      )}

      <p id={statusId} aria-live="polite" className="text-caption">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : message ? (
          <span className="text-green-700 dark:text-green-500">{message}</span>
        ) : (
          <span className="text-muted-foreground">Upload a new image or paste an existing ImageKit path.</span>
        )}
      </p>

      {path.startsWith("/") && (
        <div className="relative aspect-4/3 w-full max-w-60 overflow-hidden rounded-lg border border-border bg-muted">
          <Image key={path} src={path} alt="Cover preview" fill sizes="240px" className="object-cover" />
        </div>
      )}
    </div>
  );
}
