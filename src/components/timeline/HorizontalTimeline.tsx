"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar } from "lucide-react";

interface TimelineEvent {
  id: string;
  event_date: string;
  title: string;
  description: string | null;
  image_url: string | null;
}

interface Props {
  events: TimelineEvent[];
}

export default function HorizontalTimeline({ events }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!containerRef.current) return;
    
    // Calculate which card is currently most visible in the center
    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const centerPosition = scrollLeft + container.clientWidth / 2;
    
    // Find the card whose center is closest to the container's center
    let closestIndex = 0;
    let minDistance = Infinity;
    
    Array.from(container.children).forEach((child, index) => {
      const childElement = child as HTMLElement;
      const childCenter = childElement.offsetLeft + childElement.offsetWidth / 2;
      const distance = Math.abs(centerPosition - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  const scrollTo = (index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const child = container.children[index] as HTMLElement;
    if (child) {
      container.scrollTo({
        left: child.offsetLeft - container.clientWidth / 2 + child.offsetWidth / 2,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  // Auto-scroll the top navigation bar to keep the active dot visible
  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const activeChild = nav.children[activeIndex] as HTMLElement;
    if (activeChild) {
      nav.scrollTo({
        left: activeChild.offsetLeft - nav.clientWidth / 2 + activeChild.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeIndex]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", minHeight: "calc(100vh - 64px)" }}>
      {/* Top Navigation Timeline (Scrollable) */}
      <div 
        style={{
          position: "sticky",
          top: "64px", // Assuming top navbar height is 64px
          zIndex: 10,
          background: "rgba(10, 6, 8, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div 
          ref={navRef}
          className="hide-scrollbar"
          style={{ 
            display: "flex", 
            alignItems: "center",
            overflowX: "auto",
            padding: "24px 40px",
            gap: "48px",
            scrollBehavior: "smooth"
          }}
        >
          {events.map((event, index) => {
            const isActive = index === activeIndex;
            const isPast = index <= activeIndex;
            
            let dateLabel = event.event_date;
            try { dateLabel = format(new Date(event.event_date + "T00:00:00"), "d MMM yyyy", { locale: tr }); } catch {}

            return (
              <div 
                key={event.id}
                onClick={() => scrollTo(index)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  flexShrink: 0
                }}
              >
                {/* Connecting Line (except for first item) */}
                {index > 0 && (
                  <div style={{
                    position: "absolute",
                    top: "6px", // Center of the 12px dot
                    right: "50%",
                    width: "48px", // matches the gap
                    height: "2px",
                    background: isPast ? "var(--color-crimson)" : "rgba(255,255,255,0.1)",
                    transform: "translateX(-12px)", // offset past the dot
                    zIndex: -1,
                    transition: "background 0.3s ease"
                  }} />
                )}

                <div style={{
                  width: isActive ? 16 : 12,
                  height: isActive ? 16 : 12,
                  borderRadius: "50%",
                  background: isActive ? "var(--color-blush)" : (isPast ? "var(--color-crimson)" : "var(--color-bg-deep)"),
                  border: `2px solid ${isPast ? "var(--color-crimson)" : "rgba(255,255,255,0.3)"}`,
                  boxShadow: isActive ? "0 0 12px rgba(255,182,193,0.6)" : "none",
                  marginBottom: 8,
                  transition: "all 0.3s ease",
                }} />
                <span style={{
                  fontSize: "0.8rem",
                  color: isActive ? "white" : "rgba(255,255,255,0.5)",
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: "nowrap",
                }}>
                  {dateLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Horizontal Scroll Container (Multiple Cards Visible) */}
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          display: "flex",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          width: "100%",
          flex: 1,
          padding: "40px 24px",
          gap: "24px", // Space between cards
          alignItems: "stretch"
        }}
        className="hide-scrollbar"
      >
        {events.map((event) => {
          let fullDate = event.event_date;
          try { fullDate = format(new Date(event.event_date + "T00:00:00"), "d MMMM yyyy", { locale: tr }); } catch {}

          return (
            <div 
              key={event.id}
              style={{
                flex: "0 0 auto",
                width: "100%",
                maxWidth: "400px", // Limits the card width so multiple fit on screen
                scrollSnapAlign: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div 
                className="glass-card hover-glow"
                style={{ 
                  width: "100%", 
                  height: "100%",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  transition: "transform 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={16} style={{ color: "var(--color-blush)" }} />
                  <span style={{ color: "var(--color-blush)", fontWeight: 500, fontSize: "0.95rem" }}>{fullDate}</span>
                </div>
                
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", lineHeight: 1.2 }}>
                  {event.title}
                </h2>
                
                {event.description && (
                  <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6, fontSize: "0.95rem", flexGrow: 1 }}>
                    {event.description}
                  </p>
                )}

                {event.image_url && (
                  <div style={{ 
                    position: "relative", 
                    width: "100%", 
                    background: "rgba(0,0,0,0.2)", // Dark backdrop for photos with different aspect ratios
                    borderRadius: "var(--radius-md)", 
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.06)",
                    marginTop: "auto", // Pushes the image to the bottom if description is short
                  }}>
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      width={0}
                      height={0}
                      sizes="(max-width: 450px) 100vw, 400px"
                      style={{ 
                        width: "100%", 
                        height: "auto", 
                        maxHeight: "45vh", // Prevents the photo from getting too tall, eliminating vertical scroll
                        objectFit: "contain", // Shows the entire uncropped image
                        display: "block" 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
