"use client";

import { useState, useTransition } from "react";
import { createFaqQuestion, updateFaqQuestion, deleteFaqQuestion, getFaqQuestionsAdmin } from "@/lib/actions/faq";
import Modal from "@/components/admin/Modal";
import { Plus, Trash2, Edit2, CheckCircle } from "lucide-react";

interface FaqQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string;
  display_order: number;
}

export default function FaqAdmin({ initialQuestions }: { initialQuestions: FaqQuestion[] }) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FaqQuestion | null>(null);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setFormError("");
    startTransition(async () => {
      let result;
      if (editingQuestion) {
        result = await updateFaqQuestion(editingQuestion.id, formData);
      } else {
        result = await createFaqQuestion(formData);
      }
      
      if (result?.error) {
        setFormError(result.error);
      } else {
        setIsModalOpen(false);
        setEditingQuestion(null);
        const updated = await getFaqQuestionsAdmin();
        setQuestions(updated);
      }
    });
  }

  function handleEditClick(q: FaqQuestion) {
    setEditingQuestion(q);
    setFormError("");
    setIsModalOpen(true);
  }

  function handleAddNewClick() {
    setEditingQuestion(null);
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      await deleteFaqQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    });
  }

  const CORRECT_OPTIONS = ["A", "B", "C", "D"] as const;
  const OPTION_COLORS = { A: "#0ea5e9", B: "#a855f7", C: "#eab308", D: "#22c55e" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", marginBottom: 6 }}>
            Quiz Soruları
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {questions.length} soru
          </p>
        </div>
        <button onClick={handleAddNewClick} className="btn-primary">
          <Plus size={16} />
          Yeni Soru
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Henüz soru eklenmemiş.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {questions.map((q, idx) => (
            <div key={q.id} className="glass-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "1rem", flex: 1, marginRight: 16 }}>
                  <span style={{ color: "var(--color-blush)", marginRight: 8 }}>S{idx + 1}.</span>
                  {q.question_text}
                </h3>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {(["A", "B", "C", "D"] as const).map((opt) => {
                  const optKey = `option_${opt.toLowerCase()}` as keyof FaqQuestion;
                  return (
                    <div
                      key={opt}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 12px",
                        background: `${OPTION_COLORS[opt]}15`,
                        border: `1px solid ${OPTION_COLORS[opt]}30`,
                        borderRadius: "var(--radius-sm)",
                        fontSize: "0.8125rem",
                      }}
                    >
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          background: `${OPTION_COLORS[opt]}25`,
                          border: `1px solid ${OPTION_COLORS[opt]}50`,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: OPTION_COLORS[opt],
                          flexShrink: 0,
                        }}
                      >
                        {opt}
                      </span>
                      <span style={{ flex: 1, color: "var(--color-text-secondary)" }}>{q[optKey] as string}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal 
        title={editingQuestion ? "Soruyu Güncelle" : "Yeni Soru Ekle"} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }} 
        size="lg"
      >
        <form key={editingQuestion?.id || "new"} action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label className="form-label" htmlFor="faq-q-text">Soru *</label>
            <input 
              id="faq-q-text" 
              name="question_text" 
              type="text" 
              className="form-input" 
              placeholder="Soruyu yazın..." 
              defaultValue={editingQuestion?.question_text || ""}
              required 
            />
          </div>
          <div>
            <label className="form-label" htmlFor="faq-order">Sıra (display_order)</label>
            <input 
              id="faq-order" 
              name="display_order" 
              type="number" 
              className="form-input" 
              defaultValue={editingQuestion ? editingQuestion.display_order : questions.length} 
              min={0} 
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {(["A", "B", "C", "D"] as const).map((opt) => {
              const optKey = `option_${opt.toLowerCase()}` as keyof FaqQuestion;
              return (
                <div key={opt}>
                  <label className="form-label" htmlFor={`faq-opt-${opt}`} style={{ color: OPTION_COLORS[opt] }}>
                    {opt} Şıkkı *
                  </label>
                  <input
                    id={`faq-opt-${opt}`}
                    name={`option_${opt.toLowerCase()}`}
                    type="text"
                    className="form-input"
                    placeholder={`${opt} şıkkı...`}
                    defaultValue={editingQuestion ? editingQuestion[optKey] as string : ""}
                    required
                  />
                </div>
              );
            })}
          </div>
          <div>
            <label className="form-label" htmlFor="correct_option">Doğru Cevap *</label>
            <select 
              id="correct_option" 
              name="correct_option" 
              className="form-input" 
              defaultValue={editingQuestion?.correct_option || "A"}
              required
            >
              {CORRECT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
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
              {isPending ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
