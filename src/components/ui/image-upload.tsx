"use client";

import React, { useState, useRef, useCallback } from "react";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, maxFiles = 20, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        toast.error(`最多上传${maxFiles}张图片`);
        return;
      }

      const toUpload = fileArray.slice(0, remaining);
      if (toUpload.length < fileArray.length) {
        toast.warning(`最多上传${maxFiles}张，已自动截取前${toUpload.length}张`);
      }

      // 验证文件
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      const maxSize = 5 * 1024 * 1024;
      const validFiles: File[] = [];

      for (const file of toUpload) {
        if (!validTypes.includes(file.type)) {
          toast.error(`${file.name} 格式不支持，请选择 JPG/PNG/WebP/GIF`);
          continue;
        }
        if (file.size > maxSize) {
          toast.error(`${file.name} 超过5MB限制`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      setUploading(true);
      try {
        const formData = new FormData();
        validFiles.forEach((file) => formData.append("files", file));

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.urls) {
          onChange([...value, ...data.urls]);
          if (data.errors?.length > 0) {
            toast.warning(data.errors.join("; "));
          }
        } else {
          toast.error(data.error || "上传失败");
        }
      } catch {
        toast.error("上传失败，请重试");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [value, onChange, maxFiles],
  );

  const handleRemove = (index: number) => {
    const newUrls = [...value];
    newUrls.splice(index, 1);
    onChange(newUrls);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled || uploading) return;
      uploadFiles(e.dataTransfer.files);
    },
    [disabled, uploading, uploadFiles],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className="space-y-2">
      {/* 已上传图片预览 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group h-20 w-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`图片${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} className="text-white" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">
                  主图
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 上传区域 */}
      {value.length < maxFiles && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          } ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="text-blue-500 animate-spin" />
              <p className="mt-1 text-[11px] text-gray-400">上传中...</p>
            </>
          ) : (
            <>
              <Upload size={18} className="text-gray-400" />
              <p className="mt-1 text-[11px] text-gray-400">
                点击上传或拖拽图片 ({value.length}/{maxFiles})
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files);
            }}
            className="hidden"
            disabled={disabled || uploading}
          />
        </div>
      )}
    </div>
  );
}
