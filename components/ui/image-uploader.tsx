"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string, imageData?: File) => void;
  className?: string;
  deleteAfterUpload?: boolean;
  isLogo?: boolean;
  multiple?: boolean;
  recommendedDimension?: string;
}

export function ImageUploader({
  value,
  onChange,
  className,
  deleteAfterUpload = false,
  isLogo = false,
  multiple = false,
  recommendedDimension,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (response.status !== 200) {
          setLocalImageUrl(null);
          setError("Upload failed");
          return;
        }

        const data = await response.json();
        onChange(data.url, file);
        if (!deleteAfterUpload) {
          setLocalImageUrl(data.url);
        }
      } catch (err) {
        setLocalImageUrl(null);
        setError(err instanceof Error ? err.message : "Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, deleteAfterUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
    },
    maxFiles: multiple ? undefined : 1,
    multiple: multiple,
  });

  const displayUrl = localImageUrl || value;
  const showPreview = !isUploading && !deleteAfterUpload && !!displayUrl;

  const removeImage = () => {
    // Purely clears the field. No blob is deleted here — the image only really
    // goes away when the form is submitted without it and the blob
    // garbage-collector later reclaims the now-unreferenced file. This is what
    // keeps the DB reference and storage from ever drifting apart, even if the
    // page is refreshed before submit.
    setLocalImageUrl(null);
    onChange("", undefined);
    // toast.success("Image removed");
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {showPreview ? (
        <div
          className={`relative w-full max-w-[300px] aspect-[4/3] overflow-hidden rounded-lg border border-black/20 ${isLogo ? "max-w-[100px] h-[100px] bg-black" : "max-w-[300px]"}`}
        >
          <Image
            src={displayUrl as string}
            alt="Uploaded image"
            className={isLogo ? "object-contain p-2 bg-black" : "object-cover"}
            fill
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 bg-red-500"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 transition-colors hover:border-gray-400",
            "flex flex-col items-center justify-center gap-2 cursor-pointer",
            isDragActive && "border-blue-500 bg-blue-50",
            isUploading && "pointer-events-none opacity-60",
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
              <p className=" text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="text-gray-600">
                {isDragActive
                  ? "Drop the image here"
                  : "Drag & drop an image here, or click to select"}
              </p>
              {recommendedDimension && (
                <p className="text-center text-xs text-gray-500">
                  {recommendedDimension}
                </p>
              )}
            </>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
