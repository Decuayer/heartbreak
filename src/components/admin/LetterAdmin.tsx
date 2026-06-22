"use client";

import { useState, useTransition } from "react";
import { updateLetter } from "@/lib/actions/letter";
import { Save, FileText } from "lucide-react";

interface Props {
  initialContent: string;
  unlockDate: string;
  isUnlocked: boolean;
}

export default function LetterAdmin({ initialContent, unlockDate, isUnlocked }: Props) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const result = await updateLetter(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  }

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", marginBottom: 6 }}>
          Dijital Mektup
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          Kilit tarihi: <strong style={{ color: "var(--color-blush)" }}>{unlockDate}</strong>
          {" · "}
          {isUnlocked ? (
            <span style={{ color: "#86efac" }}>✅ Kilit açık</span>
          ) : (
            <span style={{ color: "#fca5a5" }}>🔒 Kilitli</span>
          )}
        </p>
      </div>

      <div
        className="glass-card"
        style={{
          padding: "12px 16px",
          marginBottom: "16px",
          background: "rgba(234,179,8,0.06)",
          border: "1px solid rgba(234,179,8,0.15)",
        }}
      >
        <p style={{ fontSize: "0.875rem", color: "rgba(234,179,8,0.9)" }}>
          💡 Mektup içeriği {unlockDate} tarihine kadar kullanıcıya gösterilmez. İçeriği şimdiden yazabilirsiniz.
        </p>
      </div>

      <form action={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label className="form-label" htmlFor="letter_content">
            <FileText size={14} style={{ display: "inline", marginRight: 6 }} />
            Mektup İçeriği
          </label>
          <textarea
            id="letter_content"
            name="letter_content"
            className="form-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            placeholder="Sevgili..."
            style={{ minHeight: 400, fontFamily: "'Outfit', sans-serif", fontSize: "1rem", lineHeight: 1.8 }}
          />
        </div>

        {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

        {saved && (
          <div
            className="animate-fade-in"
            style={{
              padding: "12px 16px",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "var(--radius-md)",
              marginBottom: 16,
              fontSize: "0.875rem",
              color: "#86efac",
            }}
          >
            ✅ Mektup başarıyla kaydedildi!
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn-primary" disabled={isPending}>
            <Save size={16} />
            {isPending ? "Kaydediliyor..." : "Mektubu Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
