import type { Metadata } from "next";
import { getLetter } from "@/lib/actions/letter";
import CountdownTimer from "@/components/letter/CountdownTimer";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Lock, Scroll } from "lucide-react";

export const metadata: Metadata = {
  title: "Geleceğe Not | Nehir Polat'ın Paneli",
  description: "Sana özel, zamanı gelince açılacak bir mektup",
};

export const dynamic = "force-dynamic";

export default async function LetterPage() {
  const { isUnlocked, content, unlockDate } = await getLetter();

  const formattedUnlockDate = (() => {
    try {
      return format(new Date(unlockDate + "T00:00:00"), "d MMMM yyyy", { locale: tr });
    } catch {
      return unlockDate;
    }
  })();

  return (
    <div className="container" style={{ paddingTop: "64px", paddingBottom: "80px" }}>
      <div className="page-header">
        <div className="label">💌 Geleceğe Not</div>
        <h1>Sana Bir Mektup Var</h1>
        <p>
          {isUnlocked
            ? "Beklenilen an geldi. Bu mektubu sana yazarken kalbim doluydu..."
            : `Bu mektup ${formattedUnlockDate} tarihinde açılacak.`}
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {!isUnlocked ? (
          /* ── Locked State ────────────────────────────────────── */
          <div className="glass-card animate-fade-in" style={{ padding: "48px", textAlign: "center" }}>
            <div
              className="animate-float"
              style={{
                width: 80,
                height: 80,
                background: "rgba(196,28,82,0.12)",
                border: "1px solid rgba(196,28,82,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <Lock size={32} style={{ color: "var(--color-blush)" }} />
            </div>

            <h2 style={{ marginBottom: "12px" }}>Henüz Zamanı Gelmedi</h2>
            <p style={{ marginBottom: "40px", maxWidth: 400, margin: "0 auto 40px" }}>
              Bu mektup sana özel bir tarihte açılacak. O güne kadar sabırla bekliyorum... 💕
            </p>

            <div style={{ marginBottom: "32px" }}>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "20px",
                }}
              >
                Açılmasına kalan süre
              </p>
              <CountdownTimer targetDate={unlockDate} />
            </div>

            <div
              style={{
                padding: "16px 24px",
                background: "rgba(196,28,82,0.08)",
                border: "1px solid rgba(196,28,82,0.15)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                color: "var(--color-blush)",
              }}
            >
              📅 Kilit tarihi: <strong>{formattedUnlockDate}</strong>
            </div>
          </div>
        ) : (
          /* ── Unlocked Letter ─────────────────────────────────── */
          <div className="animate-fade-in-up">
            {/* Envelope decoration */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div
                className="animate-scale-in"
                style={{ fontSize: "3rem", marginBottom: 8 }}
              >
                💌
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--color-blush)", fontStyle: "italic" }}>
                Bugün için yazıldı, bugün açıldı.
              </p>
            </div>

            <div
              className="glass-card"
              style={{
                padding: "48px",
                background:
                  "linear-gradient(135deg, rgba(196,28,82,0.06) 0%, rgba(253,164,175,0.03) 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative corner */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: 0,
                  height: 0,
                  borderLeft: "40px solid transparent",
                  borderTop: "40px solid rgba(196,28,82,0.2)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: "28px",
                  paddingBottom: "20px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Scroll size={20} style={{ color: "var(--color-blush)" }} />
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: "1rem",
                    color: "var(--color-text-muted)",
                    fontStyle: "italic",
                  }}
                >
                  Sana yazdığım mektup...
                </span>
              </div>

              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.0625rem",
                  lineHeight: 1.9,
                  color: "var(--color-text-secondary)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {content || (
                  <span style={{ opacity: 0.5, fontStyle: "italic" }}>
                    Henüz mektup yazılmamış. Admin panelinden ekleyebilirsin.
                  </span>
                )}
              </div>

              <div
                style={{
                  marginTop: "40px",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  textAlign: "right",
                  fontFamily: "'Outfit', sans-serif",
                  fontStyle: "italic",
                  color: "var(--color-blush)",
                }}
              >
                Seninle her zaman, ❤️
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
