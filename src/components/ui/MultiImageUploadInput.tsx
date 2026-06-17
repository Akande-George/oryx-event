"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface MultiImageUploadInputProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  max?: number;
}

export default function MultiImageUploadInput({
  value,
  onChange,
  folder = "oryx-hotels",
  max = 8,
}: MultiImageUploadInputProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const room = max - value.length;
    if (room <= 0) {
      toast.error(`You can add at most ${max} images.`);
      return;
    }
    const toUpload = files.slice(0, room);
    setUploading(true);

    try {
      const uploaded: string[] = [];
      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) continue;
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.secure_url) {
          throw new Error(data.error || "Upload failed.");
        }
        uploaded.push(data.secure_url);
      }
      if (uploaded.length) {
        onChange([...value, ...uploaded]);
        toast.success(
          `${uploaded.length} image${uploaded.length > 1 ? "s" : ""} added.`,
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative aspect-square rounded-lg overflow-hidden border border-border group"
          >
            <Image
              src={url}
              alt={`Gallery image ${i + 1}`}
              fill
              sizes="120px"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Add</span>
              </>
            )}
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length}/{max} images. The main image above is shown first.
      </p>

      <input
        type="file"
        ref={inputRef}
        onChange={handleFiles}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
}
