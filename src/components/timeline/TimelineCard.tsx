"use client";

import Image from "next/image";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar, MapPin } from "lucide-react";

interface TimelineEvent {
  id: string;
  event_date: string;
  title: string;
  description: string | null;
  image_url: string | null;
}

interface Props {
  events: TimelineEvent[];
  index: number;
}

export default function TimelineCard({ events, index }: { events: TimelineEvent[]; index: number }) {
  const event = events[index];
  const isLeft = index % 2 === 0;

  const formattedDate = (() => {
    try {
      return format(new Date(event.event_date + "T00:00:00"), "d MMMM yyyy", {
        locale: tr,
      });
    } catch {
      return event.event_date;
    }
  })();

  return (
    <div
      className="animate-fade-in-up"
      style={{
        animationDelay: `${index * 0.1}s`,
        display: "flex",
        flexDirection: isLeft ? "row" : "row-reverse",
        gap: "32px",
        alignItems: "flex-start",
        marginBottom: "48px",
        position: "relative",
      }}
    >
      {/* Content */}
      <div style={{ flex: 1 }}>
        <div
          className="glass-card"
          style={{ padding: "28px", position: "relative", overflow: "hidden" }}
        >
          {/* Gradient accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              [isLeft ? "left" : "right"]: 0,
              width: 4,
              height: "100%",
              background: "var(--gradient-btn)",
              borderRadius: "4px 0 0 4px",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: "12px",
            }}
          >
            <Calendar size={14} style={{ color: "var(--color-blush)" }} />
            <span
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-blush)",
                fontWeight: 500,
              }}
            >
              {formattedDate}
            </span>
          </div>

          <h3
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.25rem",
              marginBottom: "10px",
            }}
          >
            {event.title}
          </h3>

          {event.description && (
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                marginBottom: event.image_url ? "20px" : 0,
              }}
            >
              {event.description}
            </p>
          )}

          {event.image_url && (
            <div
              style={{
                position: "relative",
                width: "100%",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Image
                src={event.image_url}
                alt={event.title}
                width={0}
                height={0}
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Center dot (desktop only) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: 40,
          paddingTop: "32px",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            background: "var(--color-crimson)",
            border: "3px solid var(--color-bg-deep)",
            borderRadius: "50%",
            boxShadow: "0 0 12px rgba(196,28,82,0.6)",
            flexShrink: 0,
          }}
        />
      </div>

      {/* Empty space for alternating layout */}
      <div style={{ flex: 1 }} />
    </div>
  );
}
