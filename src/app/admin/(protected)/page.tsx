import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Ticket, Mail, Sparkles, HelpCircle, MessageSquare, BarChart3, Image } from "lucide-react";
import { getTimelineEvents } from "@/lib/actions/timeline";
import { getCoupons } from "@/lib/actions/coupons";
import { getAllLoveReasons } from "@/lib/actions/reasons";
import { getFaqQuestions } from "@/lib/actions/faq";

export const metadata: Metadata = {
  title: "Admin Dashboard | Nehir Polat'ın Paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [events, coupons, reasons, faqQuestions] = await Promise.all([
    getTimelineEvents(),
    getCoupons(),
    getAllLoveReasons(),
    getFaqQuestions(),
  ]);

  const usedCoupons = coupons.filter((c) => c.is_used).length;

  const STATS = [
    { label: "Zaman Tüneli Anısı", value: events.length, icon: Clock, href: "/admin/timeline" },
    { label: "Toplam Kupon", value: coupons.length, sub: `${usedCoupons} kullanıldı`, icon: Ticket, href: "/admin/coupons" },
    { label: "Sevgi Sebebi", value: reasons.length, icon: Sparkles, href: "/admin/reasons" },
    { label: "Quiz Sorusu", value: faqQuestions.length, icon: HelpCircle, href: "/admin/faq" },
  ];

  const QUICK_LINKS = [
    { href: "/admin/timeline", label: "Zaman Tüneli", icon: Clock, desc: "Anı ekle, düzenle, sil" },
    { href: "/admin/coupons", label: "Kuponlar", icon: Ticket, desc: "Kupon yönet" },
    { href: "/admin/letter", label: "Mektup", icon: Mail, desc: "Dijital mektup yaz" },
    { href: "/admin/reasons", label: "Sevgi Sebepleri", icon: Sparkles, desc: "Sıralı sebep yönet" },
    { href: "/admin/faq", label: "Quiz Soruları", icon: HelpCircle, desc: "FAQ soruları düzenle" },
    { href: "/admin/quiz", label: "Giriş Soruları", icon: MessageSquare, desc: "Login quiz sorularını yönet" },
    { href: "/admin/hero-photo", label: "Ana Sayfa Fotoğrafı", icon: Image, desc: "Çift fotoğrafını güncelle" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", marginBottom: 8 }}>
          Yönetim Paneli
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          Nehir Polat'ın Paneli içeriklerini buradan yönetebilirsin.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        {STATS.map(({ label, value, sub, icon: Icon, href }) => (
          <Link
            key={href}
            href={href}
            className="glass-card"
            style={{ padding: "24px", textDecoration: "none" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <Icon size={18} style={{ color: "var(--color-blush)" }} />
              <BarChart3 size={14} style={{ color: "var(--color-text-muted)" }} />
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "2rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              {value}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
              {label}
            </div>
            {sub && (
              <div style={{ fontSize: "0.75rem", color: "var(--color-blush)", marginTop: 4 }}>
                {sub}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.25rem", marginBottom: "20px" }}>
          Hızlı Erişim
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {QUICK_LINKS.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="glass-card"
              style={{
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: "rgba(196,28,82,0.12)",
                  border: "1px solid rgba(196,28,82,0.2)",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} style={{ color: "var(--color-blush)" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: 2 }}>
                  {label}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                  {desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
