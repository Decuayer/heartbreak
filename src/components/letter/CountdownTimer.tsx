"use client";

import { useState, useEffect } from "react";

interface Props {
  targetDate: string; // ISO date string YYYY-MM-DD
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDateStr: string): TimeLeft {
  const target = new Date(targetDateStr + "T00:00:00.000Z");
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function CountdownTimer({ targetDate }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(
    calculateTimeLeft(targetDate)
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    // SSR placeholder to avoid hydration mismatch
    return (
      <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
        {["Gün", "Saat", "Dakika", "Saniye"].map((label) => (
          <div key={label} className="countdown-unit skeleton" style={{ minWidth: 80, height: 100 }} />
        ))}
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Gün" },
    { value: timeLeft.hours, label: "Saat" },
    { value: timeLeft.minutes, label: "Dakika" },
    { value: timeLeft.seconds, label: "Saniye" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {units.map(({ value, label }) => (
          <div key={label} className="countdown-unit">
            <div className="number">{String(value).padStart(2, "0")}</div>
            <div className="label-text">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
