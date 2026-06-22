"use client";

import { useState, useTransition } from "react";
import { upsertQuizQuestion, getQuizQuestionsAdmin, deleteQuizQuestion } from "@/lib/actions/faq";
import Modal from "@/components/admin/Modal";
import { Plus, Trash2, Edit2, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface QuizQuestion {
  id: string;
  question_text: string;
  question_type?: string;
  correct_answer: string;
  display_order: number;
  hint?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
}

export default function QuizQuestionsAdmin({ initialQuestions }: { initialQuestions: QuizQuestion[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [questionType, setQuestionType] = useState<"open_ended" | "multiple_choice">("open_ended");
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setFormError("");
    startTransition(async () => {
      const result = await upsertQuizQuestion(formData);
      if (result?.error) {
        setFormError(result.error);
      } else {
        setIsModalOpen(false);
        setEditingQuestion(null);
        const updated = await getQuizQuestionsAdmin();
        setQuestions(updated);
      }
    });
  }

  function handleEditClick(q: QuizQuestion) {
    setEditingQuestion(q);
    setQuestionType((q.question_type as "open_ended" | "multiple_choice") || "open_ended");
    setFormError("");
    setIsModalOpen(true);
  }

  function handleAddNewClick() {
    setEditingQuestion(null);
    setQuestionType("open_ended");
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      await deleteQuizQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", marginBottom: 6 }}>
            Giriş Quiz Soruları
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            Bu sorular kullanıcı girişinde sorulur. Doğru cevapları girilmeden giriş yapılamaz.
          </p>
        </div>
        <button onClick={handleAddNewClick} className="btn-primary">
          <Plus size={16} />
          Yeni Soru
        </button>
      </div>

      <div
        className="glass-card"
        style={{
          padding: "12px 16px",
          marginBottom: "20px",
          background: "rgba(196,28,82,0.06)",
          border: "1px solid rgba(196,28,82,0.15)",
        }}
      >
        <p style={{ fontSize: "0.875rem", color: "var(--color-blush)" }}>
          🔒 Doğru cevaplar veritabanında saklanır ve hiçbir zaman tarayıcıya gönderilmez.
          Cevap eşleştirmesi sunucu tarafında yapılır.
        </p>
      </div>

      {questions.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
          <MessageSquare size={32} style={{ color: "var(--color-text-muted)", marginBottom: 12 }} />
          <p style={{ color: "var(--color-text-muted)" }}>Henüz giriş sorusu eklenmemiş.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {questions.map((q) => (
            <div
              key={q.id}
              className="glass-card"
              style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(196,28,82,0.12)",
                  border: "1px solid rgba(196,28,82,0.25)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--color-blush)",
                  flexShrink: 0,
                }}
              >
                {q.display_order}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 4 }}>
                  <p style={{ fontSize: "0.9375rem", fontWeight: 500 }}>{q.question_text}</p>
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "2px 6px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "4px",
                    color: "var(--color-text-muted)"
                  }}>
                    {q.question_type === "multiple_choice" ? "Çoktan Seçmeli" : "Açık Uçlu"}
                  </span>
                </div>
                {q.hint && (
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                    💡 {q.hint}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleEditClick(q)}
                  className="btn-secondary"
                  disabled={isPending}
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                >
                  <Edit2 size={12} />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="btn-danger"
                  disabled={isPending}
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                >
                  <Trash2 size={12} />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal 
        title={editingQuestion ? "Giriş Sorusunu Güncelle" : "Yeni Giriş Sorusu Ekle"} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
      >
        <form key={editingQuestion?.id || "new"} action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {editingQuestion && <input type="hidden" name="id" value={editingQuestion.id} />}
          
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="quiz-order">Sıra (display_order) *</label>
              <input
                id="quiz-order"
                name="display_order"
                type="number"
                className="form-input"
                defaultValue={editingQuestion ? editingQuestion.display_order : questions.length + 1}
                min={1}
                required
              />
            </div>
            <div style={{ flex: 2 }}>
              <label className="form-label" htmlFor="question_type">Soru Türü *</label>
              <select
                id="question_type"
                name="question_type"
                className="form-input"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as "open_ended" | "multiple_choice")}
              >
                <option value="open_ended">Açık Uçlu (Metin Girişi)</option>
                <option value="multiple_choice">Çoktan Seçmeli (4 Şık)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="quiz-question">Soru *</label>
            <input
              id="quiz-question"
              name="question_text"
              type="text"
              className="form-input"
              placeholder="Örn: İlk randevumuzda nereye gittik?"
              defaultValue={editingQuestion?.question_text || ""}
              required
            />
          </div>

          {questionType === "multiple_choice" && (
            <div id="mc-options">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label className="form-label" htmlFor="option_a">A Şıkkı</label>
                  <input id="option_a" name="option_a" type="text" className="form-input" placeholder="A Şıkkı" defaultValue={editingQuestion?.option_a || ""} required />
                </div>
                <div>
                  <label className="form-label" htmlFor="option_b">B Şıkkı</label>
                  <input id="option_b" name="option_b" type="text" className="form-input" placeholder="B Şıkkı" defaultValue={editingQuestion?.option_b || ""} required />
                </div>
                <div>
                  <label className="form-label" htmlFor="option_c">C Şıkkı</label>
                  <input id="option_c" name="option_c" type="text" className="form-input" placeholder="C Şıkkı" defaultValue={editingQuestion?.option_c || ""} required />
                </div>
                <div>
                  <label className="form-label" htmlFor="option_d">D Şıkkı</label>
                  <input id="option_d" name="option_d" type="text" className="form-input" placeholder="D Şıkkı" defaultValue={editingQuestion?.option_d || ""} required />
                </div>
              </div>
            </div>
          )}

          {questionType === "open_ended" && (
            <div id="open-answer-input">
              <label className="form-label" htmlFor="quiz-answer">Doğru Cevap *</label>
              <input
                id="quiz-answer"
                name="correct_answer"
                type="text"
                className="form-input"
                placeholder="Cevabı yazın (Türkçe karakterler otomatik normalize edilir)"
                defaultValue={editingQuestion?.correct_answer || ""}
                required
              />
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: 6 }}>
                Açık uçlu sorularda cevap sunucuda normalize edilir (küçük harf, Türkçe karakter dönüşümü).
              </p>
            </div>
          )}

          {questionType === "multiple_choice" && (
            <div id="mc-answer-select">
              <label className="form-label" htmlFor="quiz-answer-mc">Doğru Cevap Şıkkı *</label>
              <select
                id="quiz-answer-mc"
                name="correct_answer"
                className="form-input"
                defaultValue={editingQuestion?.correct_answer || "A"}
                required
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          )}

          <div>
            <label className="form-label" htmlFor="quiz-hint">İpucu (isteğe bağlı)</label>
            <input
              id="quiz-hint"
              name="hint"
              type="text"
              className="form-input"
              placeholder="Kullanıcıya gösterilecek ipucu..."
            />
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button 
              type="button" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingQuestion(null);
              }} 
              className="btn-secondary"
            >
              İptal
            </button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : "Soruyu Kaydet 🔒"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
