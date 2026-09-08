"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { File, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";
// import { uploadToDropbox } from "@/lib/connectDropbox";
// import { toast } from "sonner";

interface FileUploaderProps {
  value?: string;
  onChange: (url: string, fileName: string, size: string) => void;
  className?: string;
  accept?: Record<string, string[]>;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i)) + ' ' + sizes[i];
}

export function FileUploader({
  value,
  onChange,
  className,
  accept = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    "application/vnd.ms-excel": [".xls"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  },
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(false);
  const [fileName, setFileName] = useState<string>(() => {
    if (value) {
      const parts = value.split("/");
      return parts[parts.length - 1];
    }
    return "";
  });

  useEffect(() => {
    const checkFile = async () => {
      if (!value) {
        setFileExists(false);
        return;
      }

      try {
        const res = await fetch(`${value}?t=${Date.now()}`, {
          method: "HEAD",
        });

        if (res.ok) {
          setFileExists(true);
        } else {
          setFileExists(false);
        }
      } catch {
        setFileExists(false);
      }
    };

    checkFile();
  }, [value]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        setIsUploading(true);
        setError(null);

        // const filePath = `/uploads/file/${Date.now()}${file.name}`;
        // const uploadResult = await uploadToDropbox(file, filePath);
        // setFileName(file.name);
        // console.log(file.size)
        // onChange(uploadResult, file.name, formatBytes(file.size));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to upload file");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  });

  const removeFile = async () => {
    if (!value) return;

    // const response = await fetch("/api/admin/delete-file", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({ url: value }),
    // });

    // if (response.ok) {
    //   setFileName("");
    //   onChange("", "", "0");
    //   toast.success("File deleted successfully")
    // }

  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {value && fileName && fileExists ? (
        <div className="flex items-center justify-between p-4 border rounded-lg border-black/20">
          <div className="flex items-center space-x-2 break-word">
            <File className="h-5 w-5 text-blue-500" />
            <span className="text-sm">{fileName.split(".")[0]}</span>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={removeFile}>
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
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </>
          ) : (
            <>
              <File className="h-10 w-10 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragActive ? "Drop the file here" : "Drag & drop a file here, or click to select"}
              </p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
