import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import QuizForm from "@/components/quiz/QuizForm";

export const metadata: Metadata = {
  title: "Giriş | Nehir Polat'ın Paneli",
  description: "Seni tanımak için birkaç sorum var...",
};

async function getQuizQuestions() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("id, question_text, question_type, option_a, option_b, option_c, option_d, hint, display_order")
      .order("display_order", { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function QuizPage() {
  const questions = await getQuizQuestions();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div
        className="blob"
        style={{
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(196,28,82,0.3) 0%, transparent 70%)",
          top: -300,
          left: "50%",
          transform: "translateX(-50%)",
        }}
        aria-hidden="true"
      />
      <div
        className="blob"
        style={{
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 70%)",
          bottom: -100,
          right: -100,
        }}
        aria-hidden="true"
      />

      {/* Logo */}
      <div className="animate-fade-in" style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          className="animate-float"
          style={{ fontSize: "3.5rem", marginBottom: "16px" }}
        >
          💕
        </div>
        <h1
          className="gradient-text"
          style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "8px" }}
        >
          Nehir Polat'ın Paneli
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9375rem" }}>
          Seni tanımak için birkaç sorum var...
        </p>
      </div>

      {/* Quiz Form */}
      <div className="animate-fade-in-up" style={{ width: "100%", maxWidth: 480 }}>
        {questions.length === 0 ? (
          <div
            className="glass-card"
            style={{ padding: "40px", textAlign: "center" }}
          >
            <p style={{ color: "var(--color-text-muted)", marginBottom: "8px" }}>
              Henüz quiz soruları eklenmemiş.
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", opacity: 0.7 }}>
              Admin panelinden soruları ekleyin.
            </p>
          </div>
        ) : (
          <QuizForm questions={questions} />
        )}
      </div>
    </div>
  );
}
