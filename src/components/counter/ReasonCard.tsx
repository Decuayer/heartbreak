"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

interface Reason {
  id: string;
  reason_text: string;
  display_order: number;
}

interface Props {
  reason: Reason;
  index: number;
}

export default function ReasonCard({ reason, index }: Props) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{
        animationDelay: `${index * 0.06}s`,
        padding: "24px",
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
        cursor: "default",
      }}
    >
      {/* Order number */}
      <div
        style={{
          flexShrink: 0,
          width: 40,
          height: 40,
          background: "rgba(196,28,82,0.15)",
          border: "1px solid rgba(196,28,82,0.3)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.9rem",
          fontWeight: 700,
          color: "var(--color-blush)",
        }}
      >
        {reason.display_order}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "1rem",
            lineHeight: 1.7,
            color: "var(--color-text-secondary)",
          }}
        >
          {reason.reason_text}
        </p>
      </div>

      {/* Like button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        style={{
          flexShrink: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "4px",
          transition: "transform 0.2s ease",
          transform: isLiked ? "scale(1.2)" : "scale(1)",
        }}
        aria-label="Beğen"
      >
        <Heart
          size={20}
          style={{
            color: isLiked ? "var(--color-rose)" : "var(--color-text-muted)",
            fill: isLiked ? "var(--color-rose)" : "none",
            transition: "all 0.2s ease",
          }}
        />
      </button>
    </div>
  );
}
