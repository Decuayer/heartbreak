"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Clock, Ticket, Mail, Sparkles, HelpCircle, LogOut, Menu, X } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

const NAV_ITEMS = [
  { href: "/", label: "Ana Sayfa", icon: Heart },
  { href: "/timeline", label: "Zaman Tüneli", icon: Clock },
  { href: "/coupons", label: "Kuponlar", icon: Ticket },
  { href: "/letter", label: "Mektup", icon: Mail },
  { href: "/counter", label: "Sevgi Sayacı", icon: Sparkles },
  { href: "/faq", label: "Hakkımızda", icon: HelpCircle },
];

export default function MainNav() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Otomatik olarak route değişince menüyü kapat
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <nav className="nav">
      <Link href="/" className="nav-brand" style={{ textDecoration: "none" }}>
        <span className="heart-pulse" style={{ fontSize: "1.75rem" }} aria-hidden="true">❤️</span>
        <span style={{ fontSize: "1.25rem", color: "var(--color-text-primary)" }}>Nehir Polat'ın Sitesi</span>
      </Link>

      <ul className="nav-links">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="nav-actions">
        <form action={signOut} className="desktop-logout">
          <button type="submit" className="btn-ghost" style={{ fontSize: "0.8125rem" }}>
            <LogOut size={14} />
            Çıkış
          </button>
        </form>
        
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Menüyü aç/kapat"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={`mobile-nav-overlay ${isMobileOpen ? "open" : ""}`}>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`nav-link ${isActive ? "active" : ""}`}
              onClick={() => setIsMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
        
        <div className="divider" style={{ width: "100%", margin: "16px 0" }} />
        
        <form action={signOut} style={{ width: "100%" }}>
          <button type="submit" className="btn-ghost" style={{ width: "100%", justifyContent: "flex-start", padding: "16px 24px", fontSize: "1.1rem" }}>
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </form>
      </div>
    </nav>
  );
}
