import type { Metadata } from "next";
import MainNav from "@/components/nav/MainNav";
import { getSession } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Nehir Polat'ın Paneli 💕",
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session validation (in addition to middleware check)
  const session = await getSession();
  if (!session.isAuthenticated) {
    redirect("/quiz");
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Background decorations */}
      <div
        className="blob"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(196,28,82,0.4) 0%, transparent 70%)",
          top: -200,
          right: -200,
        }}
        aria-hidden="true"
      />
      <div
        className="blob"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 70%)",
          bottom: 100,
          left: -100,
        }}
        aria-hidden="true"
      />

      <MainNav />

      <main style={{ position: "relative", zIndex: 1 }}>
        {children}
      </main>
    </div>
  );
}
