"use client";

import { useState, useRef, useTransition } from "react";
import { updateHeroPhoto } from "@/lib/actions/settings";
import { uploadMediaAction } from "@/lib/actions/upload";
import { Camera, Upload, X, Loader, CheckCircle, Heart } from "lucide-react";
import Image from "next/image";

interface Props {
  initialPhotoUrl: string;
}

export default function HeroPhotoAdmin({ initialPhotoUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl || null);
  const [uploadedUrl, setUploadedUrl] = useState<string>(initialPhotoUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSaving, startSaveTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function compressToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 1400;
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
          0.88
        );
      };
      img.onerror = () => reject(new Error("Görsel yüklenemedi."));
      img.src = url;
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setIsUploading(true);
    setSaveStatus("idle");

    try {
      let processableFile = file;

      // HEIC/HEIF support
      const isHeic =
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        file.name.toLowerCase().endsWith(".heic") ||
        file.name.toLowerCase().endsWith(".heif");

      if (isHeic) {
        try {
          const heic2anyModule = await import("heic2any");
          const heic2anyFn = heic2anyModule.default || heic2anyModule;
          const convertedBlob = await heic2anyFn({
            blob: file,
            toType: "image/jpeg",
            quality: 0.85,
          });
          const blobArray = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob];
          processableFile = new File(
            blobArray,
            file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg"),
            { type: "image/jpeg" }
          );
        } catch {
          processableFile = file;
        }
      }

      // Local preview
      const previewUrl = URL.createObjectURL(processableFile);
      setPreview(previewUrl);

      // Compress to WebP
      const webpBlob = await compressToWebP(processableFile);
      const webpFile = new File([webpBlob], `${Date.now()}.webp`, { type: "image/webp" });

      // Upload to Supabase Storage
      const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
      const formData = new FormData();
      formData.append("file", webpFile);
      formData.append("path", path);

      const result = await uploadMediaAction(formData);
      if (result.error) throw new Error(result.error);
      if (result.url) setUploadedUrl(result.url);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Yükleme hatası oluştu.");
      setPreview(initialPhotoUrl || null);
      setUploadedUrl(initialPhotoUrl || "");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemove() {
    setPreview(null);
    setUploadedUrl("");
    setSaveStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSave() {
    setSaveStatus("idle");
    setSaveMessage("");
    startSaveTransition(async () => {
      const formData = new FormData();
      formData.append("heroPhotoUrl", uploadedUrl);
      const result = await updateHeroPhoto(formData);
      if (result?.error) {
        setSaveStatus("error");
        setSaveMessage(result.error);
      } else {
        setSaveStatus("success");
        setSaveMessage("Fotoğraf başarıyla kaydedildi! Ana sayfa güncellendi.");
      }
    });
  }

  const hasChanges = uploadedUrl !== (initialPhotoUrl || "");

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      {/* Info card */}
      <div
        className="glass-card animate-fade-in"
        style={{
          padding: "20px 24px",
          marginBottom: "28px",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          borderColor: "rgba(196,28,82,0.25)",
          background: "rgba(196,28,82,0.06)",
        }}
      >
        <Heart size={20} style={{ color: "var(--color-blush)", flexShrink: 0, marginTop: 2 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9375rem", marginBottom: 4 }}>
            Ana Sayfa Çift Fotoğrafı
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            Bu fotoğraf ana sayfada gün sayacı ile &ldquo;Seninle Her An Özel&rdquo; yazısı
            arasında gösterilir. Kendi fotoğrafınızı yükleyerek sayfayı kişiselleştirin.
          </p>
        </div>
      </div>

      {/* Upload area */}
      <div className="glass-card animate-fade-in-up" style={{ padding: "32px", animationDelay: "0.1s" }}>
        <label className="form-label" style={{ marginBottom: "16px", display: "block" }}>
          Fotoğraf
        </label>

        {preview ? (
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <Image
                src={preview}
                alt="Hero fotoğraf önizleme"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 600px) 100vw, 600px"
                unoptimized={preview.startsWith("blob:")}
              />

              {/* Upload overlay */}
              {isUploading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.65)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  <Loader
                    size={28}
                    style={{ animation: "rotate-slow 1s linear infinite", color: "var(--color-blush)" }}
                  />
                  <span style={{ color: "white", fontSize: "0.875rem" }}>
                    WebP&apos;e dönüştürülüyor...
                  </span>
                </div>
              )}

              {/* Remove button */}
              {!isUploading && (
                <button
                  type="button"
                  onClick={handleRemove}
                  title="Fotoğrafı kaldır"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 36,
                    height: 36,
                    background: "rgba(0,0,0,0.75)",
                    border: "none",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "white",
                    transition: "background var(--transition-base)",
                  }}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Replace button */}
            {!isUploading && (
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 12,
                  cursor: "pointer",
                  fontSize: "0.8125rem",
                  color: "var(--color-blush)",
                }}
              >
                <Upload size={14} />
                Farklı fotoğraf seç
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg, image/png, image/webp, image/gif, .heic, .heif"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
        ) : (
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              padding: "56px 32px",
              border: "2px dashed rgba(255,255,255,0.1)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "all var(--transition-base)",
              background: "rgba(255,255,255,0.02)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,28,82,0.4)";
              (e.currentTarget as HTMLElement).style.background = "rgba(196,28,82,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                background: "rgba(196,28,82,0.1)",
                border: "1px solid rgba(196,28,82,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Camera size={28} style={{ color: "var(--color-blush)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: 4 }}>
                Fotoğraf Yükle
              </p>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                JPEG, PNG, WebP, HEIC desteklenir · Otomatik WebP&apos;e dönüştürülür
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg, image/png, image/webp, image/gif, .heic, .heif"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </label>
        )}

        {uploadError && <p className="form-error" style={{ marginTop: 10 }}>{uploadError}</p>}

        {/* Save button */}
        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={handleSave}
            className="btn-primary"
            disabled={isSaving || isUploading || (!uploadedUrl && !initialPhotoUrl)}
            style={{ minWidth: 160 }}
          >
            {isSaving ? (
              <>
                <Loader size={15} style={{ animation: "rotate-slow 1s linear infinite" }} />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Heart size={15} />
                {hasChanges ? "Kaydet" : "Kaydet"}
              </>
            )}
          </button>

          {!uploadedUrl && initialPhotoUrl && (
            <button
              onClick={() => {
                const formData = new FormData();
                formData.append("heroPhotoUrl", "");
                setSaveStatus("idle");
                startSaveTransition(async () => {
                  const result = await updateHeroPhoto(formData);
                  if (result?.error) {
                    setSaveStatus("error");
                    setSaveMessage(result.error);
                  } else {
                    setSaveStatus("success");
                    setSaveMessage("Fotoğraf kaldırıldı.");
                  }
                });
              }}
              className="btn-danger"
              disabled={isSaving}
              style={{ fontSize: "0.875rem" }}
            >
              Fotoğrafı Kaldır
            </button>
          )}
        </div>

        {/* Status messages */}
        {saveStatus === "success" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
              padding: "12px 16px",
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
              borderRadius: "var(--radius-sm)",
              color: "#86efac",
              fontSize: "0.875rem",
            }}
          >
            <CheckCircle size={16} />
            {saveMessage}
          </div>
        )}
        {saveStatus === "error" && (
          <p className="form-error" style={{ marginTop: 12 }}>{saveMessage}</p>
        )}
      </div>
    </div>
  );
}
