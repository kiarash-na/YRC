"use client";

import { upload } from "@imagekit/next";
import { ImageUp, LoaderCircle } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Image } from "@/components/imagekit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getImageKitUploadAuth } from "@/lib/actions/media";

const MAX_BYTES = 20 * 1024 * 1024;

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
 * Returns the new file's ImageKit path, or null (with `error` set).
 */
export function useImageKitUpload(folder: string) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadImage(file: File): Promise<{ path: string; name: string } | null> {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG, WebP…).");
      return null;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is over 20 MB. Export a smaller version and try again.");
      return null;
    }
    setProgress(0);
    try {
      const auth = await getImageKitUploadAuth();
      if (!auth.ok) {
        setError(auth.error);
        return null;
      }
      const result = await upload({
        file,
        fileName: file.name,
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
      return { path: result.filePath, name: result.name ?? file.name };
    } catch (err) {
      console.error("ImageKit upload failed:", err);
      setError("Upload failed. Check your connection and try again.");
      return null;
    } finally {
      setProgress(null);
    }
  }

  return { uploadImage, progress, uploading: progress !== null, error };
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
