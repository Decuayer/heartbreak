"use client";

import { useState, useTransition } from "react";
import { createReason, updateReason, deleteReason, getAllLoveReasons } from "@/lib/actions/reasons";
import { updateSettings } from "@/lib/actions/settings";
import Modal from "@/components/admin/Modal";
import { Plus, Trash2, Edit2, Calendar, Save } from "lucide-react";
interface Reason {
  id: string;
  reason_text: string;
  display_order: number;
}

export default function ReasonsAdmin({ 
  initialReasons, 
  initialRelationshipStartDate,
  initialCounterStartDate
}: { 
  initialReasons: Reason[];
  initialRelationshipStartDate: string;
  initialCounterStartDate: string;
}) {
  const [reasons, setReasons] = useState(initialReasons);
  const [relationshipStartDate, setRelationshipStartDate] = useState(initialRelationshipStartDate);
  const [counterStartDate, setCounterStartDate] = useState(initialCounterStartDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<Reason | null>(null);
  const [formError, setFormError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const nextOrder = reasons.length > 0 ? Math.max(...reasons.map((r) => r.display_order)) + 1 : 1;

  async function handleUpdateSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSettings(formData);
      if (result?.error) {
        setSettingsError(result.error);
      } else {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    });
  }

  async function handleSubmit(formData: FormData) {
    setFormError("");
    startTransition(async () => {
      let result;
      if (editingReason) {
        result = await updateReason(editingReason.id, formData);
      } else {
        result = await createReason(formData);
      }
      
      if (result?.error) {
        setFormError(result.error);
      } else {
        setIsModalOpen(false);
        setEditingReason(null);
        const updated = await getAllLoveReasons();
        setReasons(updated);
      }
    });
  }

  function handleEditClick(reason: Reason) {
    setEditingReason(reason);
    setFormError("");
    setIsModalOpen(true);
  }

  function handleAddNewClick() {
    setEditingReason(null);
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu sebebi silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      await deleteReason(id);
      setReasons((prev) => prev.filter((r) => r.id !== id));
    });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", marginBottom: 6 }}>
            Sevgi Sebepleri
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {reasons.length} sebep · display_order = kaçıncı gün açılacağı
          </p>
        </div>
        <button onClick={handleAddNewClick} className="btn-primary">
          <Plus size={16} />
          Yeni Sebep
        </button>
      </div>

      {/* Settings Card */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <Calendar size={20} style={{ color: "var(--color-blush)" }} />
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>Tarih Ayarları</h2>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: 20 }}>
          Birlikte olunan süreyi ve sebeplerin açılma sayacını belirleyin.
        </p>
        
        <form onSubmit={handleUpdateSettings} style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label" htmlFor="relationshipStartDate">
              İlişki Başlangıç Tarihi
            </label>
            <input
              id="relationshipStartDate"
              name="relationshipStartDate"
              type="date"
              className="form-input"
              value={relationshipStartDate}
              onChange={(e) => setRelationshipStartDate(e.target.value)}
              required
            />
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 4 }}>"Birlikte olduğumuz süre" gösterimi için.</p>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label" htmlFor="counterStartDate">
              Sayaç Başlangıç Tarihi
            </label>
            <input
              id="counterStartDate"
              name="counterStartDate"
              type="date"
              className="form-input"
              value={counterStartDate}
              onChange={(e) => setCounterStartDate(e.target.value)}
              required
            />
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: 4 }}>Mesajların açılmaya başlama tarihi.</p>
          </div>

          <button type="submit" className="btn-primary" disabled={isPending} style={{ height: 42, marginBottom: 20 }}>
            <Save size={16} />
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </form>
        {settingsError && <p className="form-error" style={{ marginTop: 12 }}>{settingsError}</p>}
        {settingsSuccess && <p style={{ color: "#10b981", fontSize: "0.875rem", marginTop: 12 }}>Tarihler başarıyla güncellendi!</p>}
      </div>

      <div
        className="glass-card"
        style={{
          padding: "12px 16px",
          marginBottom: "20px",
          background: "rgba(14,165,233,0.06)",
          border: "1px solid rgba(14,165,233,0.15)",
        }}
      >
        <p style={{ fontSize: "0.875rem", color: "rgba(14,165,233,0.9)" }}>
          💡 Her sebebin <strong>display_order</strong> değeri, başlangıç tarihinden kaç gün sonra kullanıcıya gösterileceğini belirtir.
        </p>
      </div>

      {reasons.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Henüz sebep eklenmemiş.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {reasons.map((reason) => (
            <div
              key={reason.id}
              className="glass-card"
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  background: "rgba(196,28,82,0.12)",
                  border: "1px solid rgba(196,28,82,0.25)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "var(--color-blush)",
                  flexShrink: 0,
                }}
              >
                {reason.display_order}
              </div>
              <p style={{ flex: 1, fontSize: "0.9375rem", color: "var(--color-text-secondary)" }}>
                {reason.reason_text}
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleEditClick(reason)}
                  className="btn-secondary"
                  disabled={isPending}
                  style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                >
                  <Edit2 size={12} />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(reason.id)}
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
        title={editingReason ? "Sebebi Güncelle" : "Yeni Sevgi Sebebi Ekle"} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingReason(null);
        }}
      >
        <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label className="form-label" htmlFor="display_order">
              Kaçıncı Gün Açılsın? (display_order) *
            </label>
            <input
              id="display_order"
              name="display_order"
              type="number"
              className="form-input"
              defaultValue={editingReason ? editingReason.display_order : nextOrder}
              min={1}
              required
            />
          </div>
          <div>
            <label className="form-label" htmlFor="reason_text">Sebep *</label>
            <textarea
              id="reason_text"
              name="reason_text"
              className="form-input"
              rows={4}
              placeholder="Seni sevmemin bir sebebi..."
              defaultValue={editingReason ? editingReason.reason_text : ""}
              required
            />
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button 
              type="button" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingReason(null);
              }} 
              className="btn-secondary"
            >
              İptal
            </button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : "Kaydet 💕"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
