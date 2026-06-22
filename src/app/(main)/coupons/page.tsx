import type { Metadata } from "next";
import { getCoupons } from "@/lib/actions/coupons";
import CouponCard from "@/components/coupons/CouponCard";
import { Ticket } from "lucide-react";

export const metadata: Metadata = {
  title: "Aşk Kuponları | Nehir Polat'ın Paneli",
  description: "Sana özel hazırlanmış gönül kuponları",
};

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await getCoupons();

  const active = coupons.filter((c) => {
    const today = new Date().toISOString().split("T")[0];
    return !c.is_used && c.expiry_date >= today;
  });
  const inactive = coupons.filter((c) => {
    const today = new Date().toISOString().split("T")[0];
    return c.is_used || c.expiry_date < today;
  });

  return (
    <div className="container" style={{ paddingTop: "64px", paddingBottom: "80px" }}>
      <div className="page-header">
        <div className="label">🎫 Aşk Kuponları</div>
        <h1>Sana Özel Sürprizler</h1>
        <p>Bana her istediğini yaptırabileceğin o sihirli bölüme geldin. Keyfini çıkar, kuponları biriktirme!</p>
      </div>

      {coupons.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: "64px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}
        >
          <Ticket size={40} style={{ color: "var(--color-text-muted)", marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>Henüz Kupon Yok</h3>
          <p style={{ fontSize: "0.9rem" }}>Admin panelinden kupon eklemeye başlayın.</p>
        </div>
      ) : (
        <>
          {/* Active Coupons */}
          {active.length > 0 && (
            <section style={{ marginBottom: "48px" }}>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.25rem",
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    background: "var(--color-crimson)",
                    borderRadius: "50%",
                    display: "inline-block",
                    boxShadow: "0 0 8px rgba(196,28,82,0.8)",
                    animation: "pulse-heart 1.5s ease-in-out infinite",
                  }}
                />
                Aktif Kuponlar ({active.length})
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {active.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            </section>
          )}

          {/* Used/Expired Coupons */}
          {inactive.length > 0 && (
            <section>
              <h2
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "1.25rem",
                  marginBottom: "24px",
                  color: "var(--color-text-muted)",
                }}
              >
                Kullanılmış / Süresi Dolmuş ({inactive.length})
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "20px",
                }}
              >
                {inactive.map((coupon) => (
                  <CouponCard key={coupon.id} coupon={coupon} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
