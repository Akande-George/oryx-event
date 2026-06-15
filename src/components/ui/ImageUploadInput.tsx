"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export default function ImageUploadInput({ value, onChange, folder = "oryx-events" }: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      onChange(data.secure_url);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {value ? (
        <div className="relative w-full h-48 rounded-xl border border-border overflow-hidden group">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            sizes="(max-width: 768px) 100vw, 512px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onChange("")}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="p-3 bg-primary/10 rounded-full">
                <UploadCloud className="w-6 h-6 text-primary" />
              </div>
              <div className="text-sm font-medium text-foreground">Click to upload image</div>
              <div className="text-xs">SVG, PNG, JPG or GIF</div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <Input
            placeholder="Or paste an image URL..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isUploading}
          />
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
