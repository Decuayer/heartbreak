"use client";

import { useState } from "react";
import { checkFaqAnswer } from "@/lib/actions/faq";
import { CheckCircle2, XCircle } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  display_order: number;
}

type Option = "A" | "B" | "C" | "D";

const OPTION_LABELS: Option[] = ["A", "B", "C", "D"];
const OPTION_COLORS: Record<string, string> = {
  A: "rgba(14, 165, 233, 0.15)",
  B: "rgba(168, 85, 247, 0.15)",
  C: "rgba(234, 179, 8, 0.15)",
  D: "rgba(34, 197, 94, 0.15)",
};
const OPTION_BORDERS: Record<string, string> = {
  A: "rgba(14, 165, 233, 0.4)",
  B: "rgba(168, 85, 247, 0.4)",
  C: "rgba(234, 179, 8, 0.4)",
  D: "rgba(34, 197, 94, 0.4)",
};

interface Props {
  questions: Question[];
}

export default function FaqQuiz({ questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Option | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  async function handleSelect(option: Option) {
    if (selected || isPending) return;
    setSelected(option);
    setIsPending(true);

    const { isCorrect } = await checkFaqAnswer(currentQ.id, option);
    const resultType = isCorrect ? "correct" : "wrong";
    setResult(resultType);

    // Update session score
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    setIsPending(false);
  }

  function handleNext() {
    if (currentIndex >= questions.length - 1) {
      setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setResult(null);
    }
  }

  function handleReset() {
    setCurrentIndex(0);
    setSelected(null);
    setResult(null);
    setIsFinished(false);
    setScore({ correct: 0, total: 0 });
  }

  if (!questions.length) {
    return (
      <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
        <p style={{ color: "var(--color-text-muted)" }}>
          Henüz soru eklenmemiş. Admin panelinden ekleyebilirsin.
        </p>
      </div>
    );
  }

  if (isFinished) {
    const pct = Math.round((score.correct / score.total) * 100) || 0;
    return (
      <div className="glass-card animate-scale-in" style={{ padding: "48px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>
          {pct >= 80 ? "🏆" : pct >= 50 ? "💝" : "💕"}
        </div>
        <h2 style={{ marginBottom: 12 }}>Quiz Bitti!</h2>
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "4rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #fda4af, #c41c52)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          {pct}%
        </div>
        <p style={{ marginBottom: 24, color: "var(--color-text-muted)" }}>
          {score.correct} / {score.total} doğru cevap
        </p>
        <p style={{ marginBottom: 32, fontStyle: "italic" }}>
          {pct >= 80
            ? "Harika! Bizi çok iyi tanıyorsun! 💕"
            : pct >= 50
            ? "Fena değil! Biraz daha pratik yapalım! 😊"
            : "Birlikte daha çok zaman geçirmeliyiz! 🌸"}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={handleReset} className="btn-primary">
            Tekrar Dene 🔄
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      {/* Score & Progress */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 4,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 9999,
          overflow: "hidden",
          marginBottom: "28px",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
            background: "var(--gradient-btn)",
            borderRadius: 9999,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Question Card */}
      <div
        key={currentIndex}
        className="glass-card animate-fade-in"
        style={{ padding: "36px", marginBottom: "16px" }}
      >
        <h3
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1.25rem",
            marginBottom: "28px",
            lineHeight: 1.4,
          }}
        >
          {currentQ.question_text}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {OPTION_LABELS.map((opt) => {
            const optKey = `option_${opt.toLowerCase()}` as keyof Question;
            const optText = currentQ[optKey] as string;
            const isSelected = selected === opt;
            const isCorrectAns = result === "correct" && isSelected;
            const isWrongAns = result === "wrong" && isSelected;

            return (
              <button
                key={opt}
                id={`faq-option-${currentIndex}-${opt}`}
                onClick={() => handleSelect(opt)}
                disabled={!!selected || isPending}
                className={`quiz-option ${isSelected ? "selected" : ""} ${
                  isCorrectAns ? "correct" : ""
                } ${isWrongAns ? "wrong" : ""}`}
                style={{
                  background: isCorrectAns
                    ? "rgba(34,197,94,0.15)"
                    : isWrongAns
                    ? "rgba(239,68,68,0.15)"
                    : OPTION_COLORS[opt],
                  borderColor: isCorrectAns
                    ? "rgba(34,197,94,0.5)"
                    : isWrongAns
                    ? "rgba(239,68,68,0.5)"
                    : isSelected
                    ? OPTION_BORDERS[opt]
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    background: isCorrectAns
                      ? "rgba(34,197,94,0.2)"
                      : isWrongAns
                      ? "rgba(239,68,68,0.2)"
                      : OPTION_COLORS[opt],
                    border: `1px solid ${OPTION_BORDERS[opt]}`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {opt}
                </span>
                <span style={{ flex: 1, textAlign: "left" }}>{optText}</span>
                {isCorrectAns && <CheckCircle2 size={18} style={{ color: "#86efac" }} />}
                {isWrongAns && <XCircle size={18} style={{ color: "#fca5a5" }} />}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {result && (
          <div
            className="animate-fade-in"
            style={{
              marginTop: "20px",
              padding: "14px 18px",
              background:
                result === "correct"
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(239,68,68,0.1)",
              border: `1px solid ${
                result === "correct"
                  ? "rgba(34,197,94,0.25)"
                  : "rgba(239,68,68,0.25)"
              }`,
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {result === "correct" ? (
              <CheckCircle2 size={18} style={{ color: "#86efac" }} />
            ) : (
              <XCircle size={18} style={{ color: "#fca5a5" }} />
            )}
            <span
              style={{
                fontSize: "0.9375rem",
                color: result === "correct" ? "#86efac" : "#fca5a5",
              }}
            >
              {result === "correct"
                ? "Harika! Doğru cevap! 🎉"
                : "Yanlış cevap, ama sorun değil! 💕"}
            </span>
          </div>
        )}
      </div>

      {/* Next button */}
      {result && (
        <button onClick={handleNext} className="btn-primary" style={{ width: "100%" }}>
          {currentIndex >= questions.length - 1 ? "Sonucu Gör 🏆" : "Sonraki Soru →"}
        </button>
      )}
    </div>
  );
}
