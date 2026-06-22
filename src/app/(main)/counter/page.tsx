import type { Metadata } from "next";
import { getLoveReasons } from "@/lib/actions/reasons";
import { getDaysSince, formatDuration } from "@/lib/utils/date";
import ReasonCard from "@/components/counter/ReasonCard";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Sevgi Sayacı | Nehir Polat'ın Paneli",
  description: "Seninle geçirdiğimiz her gün için bir sebep daha",
};

export const dynamic = "force-dynamic";

export default async function CounterPage() {
  const { reasons, relationshipDaysSince, counterDaysSince } = await getLoveReasons();
  const { years, months, days } = formatDuration(relationshipDaysSince);

  return (
    <div className="container" style={{ paddingTop: "64px", paddingBottom: "80px" }}>
      <div className="page-header">
        <div className="label">✨ Sevgi Sayacı</div>
        <h1>Seninle Her Gün Bir Sebep Daha</h1>
        <p>
          Her geçen gün, seni daha çok sevmem için bir neden daha ekleniyor.
        </p>
      </div>

      {/* Duration display */}
      <div
        className="glass-card animate-scale-in"
        style={{
          padding: "40px",
          textAlign: "center",
          maxWidth: 600,
          margin: "0 auto 64px",
          background: "linear-gradient(135deg, rgba(196,28,82,0.1) 0%, rgba(253,164,175,0.05) 100%)",
        }}
      >
        <div style={{ fontSize: "1rem", color: "var(--color-text-muted)", marginBottom: "24px" }}>
          Birlikte olduğumuz süre
        </div>

        <div
          style={{
            display: "flex",
            gap: "24px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          {[
            { value: years, label: "Yıl" },
            { value: months, label: "Ay" },
            { value: days, label: "Gün" },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "3.5rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #fda4af, #c41c52)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginTop: 8,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            padding: "12px 24px",
            background: "rgba(196,28,82,0.1)",
            border: "1px solid rgba(196,28,82,0.2)",
            borderRadius: "var(--radius-full)",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.875rem",
            color: "var(--color-blush)",
          }}
        >
          <span className="heart-pulse">💕</span>
          <span>Toplam {relationshipDaysSince} gün birlikte</span>
        </div>
      </div>

      {/* Reasons list */}
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1.5rem",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          Seni Sevmemin{" "}
          <span className="gradient-text">{reasons.length} Sebebi</span>
        </h2>

        {reasons.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: "48px", textAlign: "center" }}
          >
            <Sparkles size={36} style={{ color: "var(--color-text-muted)", marginBottom: 16 }} />
            <p style={{ color: "var(--color-text-muted)" }}>
              Henüz sebep eklenmemiş. Admin panelinden ekleyebilirsin.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {reasons.map((reason, index) => (
              <ReasonCard key={reason.id} reason={reason} index={index} />
            ))}
          </div>
        )}

        {/* Hint for more */}
        <div
          style={{
            textAlign: "center",
            marginTop: "40px",
            padding: "20px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: "var(--radius-lg)",
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
            💫 Her yeni günle birlikte yeni sebepler bu listeye eklenecek...
          </p>
        </div>
      </div>
    </div>
  );
}
