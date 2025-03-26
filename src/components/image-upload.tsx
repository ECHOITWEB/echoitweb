"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setIsUploading(true);
      const file = acceptedFiles[0];
      
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류 발생:", error);
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"]
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-4 w-full">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-4 hover:bg-gray-50 transition
          ${isDragActive ? "border-primary bg-gray-50" : "border-gray-300"}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-gray-600">
            {isUploading ? (
              <Icons.spinner className="h-10 w-10 animate-spin" />
            ) : (
              <Icons.upload className="h-10 w-10" />
            )}
          </div>
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "여기에 이미지를 놓으세요"
              : "클릭하여 이미지를 선택하거나 드래그 앤 드롭하세요"}
          </p>
        </div>
      </div>

      {value && (
        <div className="relative aspect-video">
          <Image
            src={value}
            alt="업로드된 이미지"
            fill
            className="object-cover rounded-lg"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => onChange("")}
          >
            <Icons.trash className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 