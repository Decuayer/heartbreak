import type { Metadata } from "next";
import { getSettings } from "@/lib/actions/settings";
import HeroPhotoAdmin from "@/components/admin/HeroPhotoAdmin";

export const metadata: Metadata = {
  title: "Ana Sayfa Fotoğrafı | Admin",
};

export const dynamic = "force-dynamic";

export default async function HeroPhotoPage() {
  const settings = await getSettings();

  return (
    <div>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", marginBottom: 6 }}>
          Ana Sayfa Fotoğrafı
        </h1>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          Ana sayfada gün sayacı ile başlık arasında görüntülenecek fotoğrafı yönetin.
        </p>
      </div>

      <HeroPhotoAdmin initialPhotoUrl={settings.heroPhotoUrl} />
    </div>
  );
}
