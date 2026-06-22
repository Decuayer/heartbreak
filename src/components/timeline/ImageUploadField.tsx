"use client";

import { useState, useRef, useEffect } from "react";
import { uploadMediaAction } from "@/lib/actions/upload";
import { createTimelineEvent } from "@/lib/actions/timeline";
import { Camera, Upload, X, Loader } from "lucide-react";

interface Props {
  initialImageUrl?: string | null;
}

export default function ImageUploadField({ initialImageUrl }: Props = {}) {
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialImageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Re-sync if initialImageUrl changes (e.g. when opening a different event to edit)
  useEffect(() => {
    setPreview(initialImageUrl || null);
    setUploadedUrl(initialImageUrl || "");
  }, [initialImageUrl]);

  async function compressToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context unavailable"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) resolve(blob);
            else reject(new Error("WebP conversion failed"));
          },
          "image/webp",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Görsel yüklenemedi. Lütfen desteklenen bir format (JPEG, PNG, WebP) seçin."));
      img.src = url;
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setIsUploading(true);

    try {
      let processableFile = file;

      // Check if HEIC/HEIF
      const isHeic = file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
      if (isHeic) {
        try {
          const heic2anyModule = await import("heic2any");
          const heic2anyFn = heic2anyModule.default || heic2anyModule;
          const convertedBlob = await heic2anyFn({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          });
          const blobArray = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob];
          processableFile = new File(blobArray, file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"), {
            type: "image/jpeg",
          });
        } catch (err) {
          console.error("HEIC Conversion Error:", err);
          // Dönüştürme başarısız olursa orijinal dosyayı kullanmayı dene 
          // (Safari gibi HEIC'i doğal olarak destekleyen tarayıcılar için)
          processableFile = file;
        }
      }

      // Preview
      const previewUrl = URL.createObjectURL(processableFile);
      setPreview(previewUrl);

      // Compress to WebP
      const webpBlob = await compressToWebP(processableFile);
      const webpFile = new File([webpBlob], `${Date.now()}.webp`, {
        type: "image/webp",
      });

      // Upload to Supabase Storage via Server Action
      const path = `timeline/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const formData = new FormData();
      formData.append("file", webpFile);
      formData.append("path", path);

      const result = await uploadMediaAction(formData);
      if (result.error) throw new Error(result.error);
      if (result.url) setUploadedUrl(result.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Yükleme hatası");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    setUploadedUrl("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="form-label">Görsel (isteğe bağlı)</label>
      <input type="hidden" name="image_url" value={uploadedUrl} />

      {preview ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 200,
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {isUploading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Loader size={20} style={{ animation: "rotate-slow 1s linear infinite", color: "var(--color-blush)" }} />
              <span style={{ color: "white", fontSize: "0.875rem" }}>WebP&apos;e dönüştürülüyor...</span>
            </div>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 32,
                height: 32,
                background: "rgba(0,0,0,0.7)",
                border: "none",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      ) : (
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "32px",
            border: "2px dashed rgba(255,255,255,0.1)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            transition: "all var(--transition-base)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <Camera size={24} style={{ color: "var(--color-text-muted)" }} />
          <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Görsel seç (otomatik WebP&apos;e dönüştürülür)
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg, image/png, image/webp, image/gif, .heic, .heif"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </label>
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
