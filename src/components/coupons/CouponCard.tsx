"use client";

import { useState, useTransition } from "react";
import { useCoupon } from "@/lib/actions/coupons";
import { format, isPast, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Check, Lock, Calendar, Sparkles } from "lucide-react";

interface Coupon {
  id: string;
  title: string;
  description: string | null;
  expiry_date: string;
  is_used: boolean;
  icon: string;
}

interface Props {
  coupon: Coupon;
}

export default function CouponCard({ coupon }: Props) {
  const [isUsed, setIsUsed] = useState(coupon.is_used);
  const [isAnimating, setIsAnimating] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const expiryDate = (() => {
    try {
      return parseISO(coupon.expiry_date);
    } catch {
      return null;
    }
  })();

  const isExpired = expiryDate ? isPast(expiryDate) && !isUsed : false;
  const formattedExpiry = expiryDate
    ? format(expiryDate, "d MMMM yyyy", { locale: tr })
    : coupon.expiry_date;

  function handleUse() {
    if (isUsed || isExpired || isPending) return;
    setIsAnimating(true);
    startTransition(async () => {
      const result = await useCoupon(coupon.id);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsUsed(true);
      }
      setTimeout(() => setIsAnimating(false), 800);
    });
  }

  return (
    <div
      className={`glass-card coupon-card ${isUsed ? "used" : ""} ${isExpired ? "expired" : ""}`}
      style={{
        padding: "28px",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.4s ease",
      }}
    >
      {/* Ticket dashed divider */}
      <div className="coupon-tear" />

      {/* Status badge */}
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        {isUsed ? (
          <span className="badge badge-gray">
            <Check size={10} />
            Kullanıldı
          </span>
        ) : isExpired ? (
          <span className="badge badge-gray">
            <Lock size={10} />
            Süresi Doldu
          </span>
        ) : (
          <span className="badge badge-rose">
            <Sparkles size={10} />
            Aktif
          </span>
        )}
      </div>

      {/* Icon */}
      <div style={{ fontSize: "2.5rem", marginBottom: "16px" }}>
        {coupon.icon || "🎁"}
      </div>

      {/* Content */}
      <h3
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "1.25rem",
          marginBottom: "8px",
        }}
      >
        {coupon.title}
      </h3>

      {coupon.description && (
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.6,
            marginBottom: "20px",
          }}
        >
          {coupon.description}
        </p>
      )}

      {/* Expiry */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginBottom: "20px",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
        }}
      >
        <Calendar size={12} />
        <span>Son kullanma: {formattedExpiry}</span>
      </div>

      {/* Use button */}
      {!isUsed && !isExpired && (
        <button
          onClick={handleUse}
          disabled={isPending}
          className="btn-primary"
          style={{ width: "100%", fontSize: "0.9rem" }}
        >
          {isPending ? (
            <>
              <span
                style={{
                  display: "inline-block",
                  width: 14,
                  height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white",
                  borderRadius: "50%",
                  animation: "rotate-slow 0.8s linear infinite",
                }}
              />
              İşleniyor...
            </>
          ) : (
            "Kuponu Kullan 🎉"
          )}
        </button>
      )}

      {isUsed && (
        <div
          style={{
            padding: "12px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.875rem",
            color: "#86efac",
          }}
        >
          <Check size={16} />
          Bu kupon kullanıldı. Teşekkürler! 💕
        </div>
      )}

      {error && <p className="form-error" style={{ marginTop: 8 }}>{error}</p>}

      {/* Stamp effect when used */}
      {isUsed && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-15deg)",
            width: 100,
            height: 100,
            border: "4px solid rgba(34,197,94,0.3)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.15,
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#86efac", letterSpacing: "0.1em", textAlign: "center" }}>
            KULLANILDI
          </span>
        </div>
      )}
    </div>
  );
}
