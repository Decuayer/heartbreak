"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Ticket,
  Mail,
  Sparkles,
  HelpCircle,
  LogOut,
  Shield,
  MessageSquare,
  Image,
} from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/timeline", label: "Zaman Tüneli", icon: Clock },
  { href: "/admin/coupons", label: "Kuponlar", icon: Ticket },
  { href: "/admin/letter", label: "Mektup", icon: Mail },
  { href: "/admin/reasons", label: "Sevgi Sebepleri", icon: Sparkles },
  { href: "/admin/faq", label: "Quiz Soruları", icon: HelpCircle },
  { href: "/admin/quiz", label: "Giriş Soruları", icon: MessageSquare },
  { href: "/admin/hero-photo", label: "Ana Sayfa Fotoğrafı", icon: Image },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div style={{ marginBottom: "32px", padding: "0 8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--gradient-btn)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={16} style={{ color: "white" }} />
          </div>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1rem",
              fontWeight: 700,
            }}
          >
            Admin Panel
          </span>
        </div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            marginLeft: "40px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {userEmail}
        </p>
      </div>

      {/* Navigation */}
      <nav>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 2 }}>
          {ADMIN_NAV.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  style={{ width: "100%", borderRadius: "var(--radius-sm)" }}
                >
                  <Icon size={16} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign out */}
      <div className="admin-sidebar-footer" style={{ marginTop: "auto", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <Link
          href="/"
          className="nav-link"
          style={{ marginBottom: 4 }}
        >
          <LayoutDashboard size={16} />
          Ana Sayfaya Git
        </Link>
        <button
          onClick={handleSignOut}
          className="nav-link btn-ghost"
          style={{ width: "100%", justifyContent: "flex-start", color: "#fca5a5" }}
        >
          <LogOut size={16} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
