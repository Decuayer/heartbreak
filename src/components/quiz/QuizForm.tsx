"use client";

import { useActionState, useState, useEffect } from "react";
import { submitQuizAnswers, type QuizAnswerState } from "@/lib/actions/auth";
import { Heart, ChevronRight, AlertCircle } from "lucide-react";

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  hint?: string;
  display_order: number;
}

interface Props {
  questions: QuizQuestion[];
}

const initialState: QuizAnswerState = {};

export default function QuizForm({ questions }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    new Array(questions.length).fill("")
  );
  const [state, formAction, isPending] = useActionState(
    submitQuizAnswers,
    initialState
  );

  const currentQ = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;
  const canGoNext = answers[currentStep]?.trim().length > 0;

  useEffect(() => {
    if (state?.success && state?.redirectUrl) {
      window.location.href = state.redirectUrl;
    } else if (state?.wrongIndices && state.wrongIndices.length > 0) {
      setCurrentStep(0);
      setAnswers(new Array(questions.length).fill(""));
    }
  }, [state, questions.length]);

  function handleNext() {
    if (canGoNext && !isLastStep) {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !isLastStep && canGoNext) {
      e.preventDefault();
      handleNext();
    }
  }

  if (!questions.length) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <p style={{ color: "var(--color-text-muted)" }}>
          Quiz soruları yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
      {/* Progress bar */}
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
            Soru {currentStep + 1} / {questions.length}
          </span>
          <span style={{ fontSize: "0.8125rem", color: "var(--color-blush)" }}>
            {Math.round(((currentStep + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: "rgba(255,255,255,0.08)",
            borderRadius: 9999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((currentStep + 1) / questions.length) * 100}%`,
              background: "var(--gradient-btn)",
              borderRadius: 9999,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div
        className="glass-card"
        style={{ padding: "36px 32px", marginBottom: "20px" }}
        key={currentStep}
      >
        <div
          style={{
            width: 48,
            height: 48,
            background: "rgba(196,28,82,0.15)",
            border: "1px solid rgba(196,28,82,0.3)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <Heart size={22} style={{ color: "var(--color-blush)" }} />
        </div>

        <h2
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1.375rem",
            marginBottom: "8px",
            lineHeight: 1.3,
          }}
        >
          {currentQ.question_text}
        </h2>

        {currentQ.hint && (
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              marginBottom: "24px",
              fontStyle: "italic",
            }}
          >
            💡 {currentQ.hint}
          </p>
        )}

        {currentQ.question_type === "multiple_choice" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {["A", "B", "C", "D"].map((opt) => {
              const optText = currentQ[`option_${opt.toLowerCase()}` as keyof QuizQuestion] as string;
              if (!optText) return null;
              
              const isSelected = answers[currentStep] === opt;
              const isWrong = state?.wrongIndices?.includes(currentStep);

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[currentStep] = opt;
                      return next;
                    });
                  }}
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    background: isSelected 
                      ? "rgba(196,28,82,0.15)" 
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${
                      isSelected 
                        ? "rgba(196,28,82,0.5)" 
                        : "rgba(255,255,255,0.1)"
                    }`,
                    borderRadius: "var(--radius-md)",
                    color: isSelected ? "var(--color-blush)" : "var(--color-text)",
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                  }}
                  className={isWrong && isSelected ? "error animate-shake" : ""}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: isSelected ? "var(--color-blush)" : "rgba(255,255,255,0.1)",
                      color: isSelected ? "white" : "var(--color-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {opt}
                  </div>
                  <span style={{ fontSize: "1rem" }}>{optText}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            className={`form-input ${
              state?.wrongIndices?.includes(currentStep) ? "error" : ""
            }`}
            placeholder="Cevabını buraya yaz..."
            value={answers[currentStep]}
            onChange={(e) =>
              setAnswers((prev) => {
                const next = [...prev];
                next[currentStep] = e.target.value;
                return next;
              })
            }
            onKeyDown={handleKeyDown}
            id={`answer-${currentStep}`}
            autoComplete="off"
            autoFocus
          />
        )}

        {state?.wrongIndices?.includes(currentStep) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 16,
            }}
          >
            <AlertCircle size={14} style={{ color: "#fca5a5" }} />
            <span className="form-error">Bu cevap yanlış, tekrar dene 💕</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <form action={formAction}>
        {/* Hidden inputs for all answers */}
        {answers.map((ans, i) => (
          <input key={i} type="hidden" name="answer" value={ans} />
        ))}

        {!isLastStep ? (
          <button
            type="button"
            className="btn-primary"
            style={{ width: "100%" }}
            onClick={handleNext}
            disabled={!canGoNext}
          >
            Sonraki Soru
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%" }}
            disabled={!canGoNext || isPending}
          >
            {isPending ? (
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
                Kontrol ediliyor...
              </>
            ) : (
              <>
                Gönder 💕
                <ChevronRight size={18} />
              </>
            )}
          </button>
        )}
      </form>

      {/* General error */}
      {state?.error && (
        <div
          className="animate-shake"
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} style={{ color: "#fca5a5" }} />
          <span style={{ fontSize: "0.9rem", color: "#fca5a5" }}>{state.error}</span>
        </div>
      )}
    </div>
  );
}
