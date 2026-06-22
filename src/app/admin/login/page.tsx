"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("E-posta veya şifre hatalı.");
      setIsLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
    setIsLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        position: "relative",
      }}
    >
      <div
        className="blob"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, rgba(196,28,82,0.25) 0%, transparent 70%)",
          top: -200,
          left: "50%",
          transform: "translateX(-50%)",
        }}
        aria-hidden="true"
      />

      <div
        className="glass-card animate-fade-in"
        style={{ width: "100%", maxWidth: 420, padding: "40px" }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            className="animate-float"
            style={{
              width: 56,
              height: 56,
              background: "var(--gradient-btn)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Shield size={24} style={{ color: "white" }} />
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.5rem",
              marginBottom: "6px",
            }}
          >
            Admin Girişi
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Nehir Polat'ın Paneli Yönetim Paneli
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label className="form-label" htmlFor="admin-email">
              E-posta
            </label>
            <div style={{ position: "relative" }}>
              <Mail
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                id="admin-email"
                type="email"
                className="form-input"
                style={{ paddingLeft: "42px" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ornek.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="admin-password">
              Şifre
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-text-muted)",
                  pointerEvents: "none",
                }}
              />
              <input
                id="admin-password"
                type={showPw ? "text" : "password"}
                className="form-input"
                style={{ paddingLeft: "42px", paddingRight: "42px" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  padding: 4,
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 14px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <AlertCircle size={15} style={{ color: "#fca5a5" }} />
              <span style={{ fontSize: "0.875rem", color: "#fca5a5" }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "rotate-slow 0.8s linear infinite",
                  }}
                />
                Giriş yapılıyor...
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
