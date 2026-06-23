import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Ticket, Mail, Sparkles, HelpCircle, Heart } from "lucide-react";
import { getDaysSince } from "@/lib/utils/date";
import { getSettings } from "@/lib/actions/settings";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Ana Sayfa | Nehir Polat'ın Paneli",
  description: "Seninle geçirdiğimiz her an, kalbimde özel bir yerde.",
};

const MODULES = [
  {
    href: "/timeline",
    icon: Clock,
    emoji: "🕰️",
    title: "Zaman Tüneli",
    description: "Birlikte yaşadığımız en güzel anların fotğraf albümü",
    color: "rgba(234, 179, 8, 0.15)",
    borderColor: "rgba(234, 179, 8, 0.3)",
  },
  {
    href: "/coupons",
    icon: Ticket,
    emoji: "🎫",
    title: "Aşk Kuponları",
    description: "Sana özel, gönülden hazırlanmış sürpriz kuponlar",
    color: "rgba(168, 85, 247, 0.15)",
    borderColor: "rgba(168, 85, 247, 0.3)",
  },
  {
    href: "/letter",
    icon: Mail,
    emoji: "💌",
    title: "Geleceğe Not",
    description: "Sana yazdığım, zamanı gelince açılacak özel mektup",
    color: "rgba(196, 28, 82, 0.15)",
    borderColor: "rgba(196, 28, 82, 0.3)",
  },
  {
    href: "/counter",
    icon: Sparkles,
    emoji: "✨",
    title: "Sevgi Sayacı",
    description: "Seninle geçirdiğimiz her gün için bir sebep daha",
    color: "rgba(14, 165, 233, 0.15)",
    borderColor: "rgba(14, 165, 233, 0.3)",
  },
  {
    href: "/faq",
    icon: HelpCircle,
    emoji: "💝",
    title: "Hakkımızda Quiz",
    description: "Bizi ne kadar iyi tanıyorsunuz? Skor tablosu burada!",
    color: "rgba(34, 197, 94, 0.15)",
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
];

export default async function HomePage() {
  const startDate = process.env.RELATIONSHIP_START_DATE ?? "2024-01-01";
  const daysTogether = getDaysSince(startDate);
  const settings = await getSettings();

  return (
    <div className="container" style={{ paddingTop: "64px", paddingBottom: "80px" }}>
      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginBottom: "80px",
          gap: 0,
        }}
      >
        {/* Badge */}
        <div
          className="animate-fade-in"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 20px",
            background: "rgba(196, 28, 82, 0.12)",
            border: "1px solid rgba(196, 28, 82, 0.25)",
            borderRadius: "9999px",
            marginBottom: "24px",
          }}
        >
          <span className="animate-pulse-heart">❤️</span>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-blush)", fontWeight: 500 }}>
            {daysTogether} gündür birlikte
          </span>
        </div>

        {/* Days counter display */}
        <div
          className="animate-scale-in"
          style={{
            animationDelay: "0.1s",
            display: "inline-flex",
            gap: "16px",
            padding: "24px 40px",
            background: "var(--color-glass)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--color-glass-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          {[
            { value: Math.floor(daysTogether / 365), label: "Yıl" },
            { value: Math.floor((daysTogether % 365) / 30), label: "Ay" },
            { value: daysTogether % 30, label: "Gün" },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center", minWidth: 60 }}>
              <div
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "2.5rem",
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
                  letterSpacing: "0.08em",
                  marginTop: 6,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Hero couple photo — shown between counter and title */}
        {settings.heroPhotoUrl && (
          <div
            className="animate-fade-in-up"
            style={{
              animationDelay: "0.25s",
              marginTop: "48px",
              width: "min(420px, 88vw)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "4 / 3",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                border: "2px solid rgba(196, 28, 82, 0.3)",
                boxShadow: "0 0 48px rgba(196, 28, 82, 0.2), 0 24px 64px rgba(0,0,0,0.5)",
              }}
            >
              <Image
                src={settings.heroPhotoUrl}
                alt="Biz"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 480px) 88vw, 420px"
                priority
              />
              {/* Heart badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  right: 12,
                  width: 36,
                  height: 36,
                  background: "rgba(196,28,82,0.9)",
                  backdropFilter: "blur(8px)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Heart size={16} fill="white" style={{ color: "white" }} />
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <h1
          className="gradient-text animate-fade-in-up"
          style={{
            animationDelay: settings.heroPhotoUrl ? "0.4s" : "0.2s",
            marginBottom: "20px",
            marginTop: "48px",
          }}
        >
          Seninle Her An Özel 💕
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in-up"
          style={{
            animationDelay: settings.heroPhotoUrl ? "0.5s" : "0.3s",
            maxWidth: 560,
            margin: "0 auto",
            fontSize: "1.125rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
          }}
        >
          Burası tamamen bize, tamamen sana ait küçük bir dünya. Bizim hikayemiz burada başlıyor.
        </p>
      </section>

      {/* Module Cards Grid */}
      <section>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {MODULES.map(({ href, emoji, title, description, color, borderColor }, i) => (
            <Link
              key={href}
              href={href}
              className="glass-card animate-fade-in-up"
              style={{
                animationDelay: `${0.1 + i * 0.08}s`,
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: color,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.75rem",
                  marginBottom: "16px",
                }}
              >
                {emoji}
              </div>
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.25rem",
                  marginBottom: "8px",
                  color: "var(--color-text-primary)",
                }}
              >
                {title}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                {description}
              </p>
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: "0.875rem",
                  color: "var(--color-blush)",
                  fontWeight: 500,
                }}
              >
                Keşfet →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer quote */}
      <div
        style={{
          textAlign: "center",
          marginTop: "80px",
          padding: "24px",
          opacity: 0.6,
        }}
      >
        <p style={{ fontSize: "0.875rem", fontStyle: "italic", color: "var(--color-text-muted)" }}>
          &ldquo;Seninle geçirilen her an, hayatımın en güzel bölümü.&rdquo; 💕
        </p>
      </div>
    </div>
  );
}
