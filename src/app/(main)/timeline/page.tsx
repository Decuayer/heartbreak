import type { Metadata } from "next";
import { getTimelineEvents } from "@/lib/actions/timeline";
import HorizontalTimeline from "@/components/timeline/HorizontalTimeline";
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Zaman Tüneli | Nehir Polat'ın Paneli",
  description: "Birlikte yaşadığımız her güzel anın albümü",
};

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const events = await getTimelineEvents();

  return (
    <div style={{ paddingTop: "64px", paddingBottom: "0" }}>
      {/* Page Header */}
      <div className="container page-header" style={{ marginBottom: "20px" }}>
        <div className="label">🕰️ Zaman Tüneli</div>
        <h1>Birlikte Yaşadıklarımız</h1>
        <p>Her anımı seninle, baştan ve defalarca yaşamak istiyorum.</p>
      </div>

      {events.length === 0 ? (
        <div className="container">
          <div
            className="glass-card"
            style={{ padding: "64px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}
          >
            <Clock size={40} style={{ color: "var(--color-text-muted)", marginBottom: 16 }} />
            <h3 style={{ marginBottom: 8 }}>Henüz Anı Yok</h3>
            <p style={{ fontSize: "0.9rem" }}>
              Admin panelinden ilk anınızı ekleyin ve zaman tünelini doldurmaya başlayın.
            </p>
          </div>
        </div>
      ) : (
        <HorizontalTimeline events={events} />
      )}
    </div>
  );
}
