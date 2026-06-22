"use client";

import { useState, useTransition } from "react";
import { createCoupon, updateCoupon, deleteCoupon, getCoupons } from "@/lib/actions/coupons";
import Modal from "@/components/admin/Modal";
import { Plus, Trash2, Edit2, CheckCircle, Clock } from "lucide-react";

interface Coupon {
  id: string;
  title: string;
  description: string | null;
  expiry_date: string;
  is_used: boolean;
  icon: string;
}

const COUPON_ICONS = ["🎁", "💝", "🌹", "🍕", "🎬", "☕", "🛁", "💆", "🎵", "🌙", "✈️", "🎂"];

export default function CouponsAdmin({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setFormError("");
    startTransition(async () => {
      let result;
      if (editingCoupon) {
        result = await updateCoupon(editingCoupon.id, formData);
      } else {
        result = await createCoupon(formData);
      }
      
      if (result?.error) {
        setFormError(result.error);
      } else {
        setIsModalOpen(false);
        setEditingCoupon(null);
        const updated = await getCoupons();
        setCoupons(updated);
      }
    });
  }

  function handleEditClick(coupon: Coupon) {
    setEditingCoupon(coupon);
    setFormError("");
    setIsModalOpen(true);
  }

  function handleAddNewClick() {
    setEditingCoupon(null);
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kuponu silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", marginBottom: 6 }}>
            Aşk Kuponları
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {coupons.length} kupon · {coupons.filter(c => c.is_used).length} kullanıldı
          </p>
        </div>
        <button onClick={handleAddNewClick} className="btn-primary">
          <Plus size={16} />
          Yeni Kupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Henüz kupon eklenmemiş.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px",
          }}
        >
          {coupons.map((coupon) => {
            const isExpired = coupon.expiry_date < today && !coupon.is_used;
            return (
              <div
                key={coupon.id}
                className="glass-card"
                style={{
                  padding: "20px",
                  opacity: coupon.is_used || isExpired ? 0.6 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontSize: "1.75rem" }}>{coupon.icon}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {coupon.is_used && <span className="badge badge-gray"><CheckCircle size={10} />Kullanıldı</span>}
                    {isExpired && <span className="badge badge-gray"><Clock size={10} />Süresi doldu</span>}
                    {!coupon.is_used && !isExpired && <span className="badge badge-rose">Aktif</span>}
                  </div>
                </div>
                <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>{coupon.title}</h3>
                {coupon.description && (
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: 12 }}>
                    {coupon.description}
                  </p>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Son: {coupon.expiry_date}
                  </span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEditClick(coupon)}
                      className="btn-secondary"
                      disabled={isPending}
                      style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                    >
                      <Edit2 size={12} />
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="btn-danger"
                      disabled={isPending}
                      style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                    >
                      <Trash2 size={12} />
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal 
        title={editingCoupon ? "Kuponu Güncelle" : "Yeni Kupon Oluştur"} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingCoupon(null);
        }}
      >
        <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label className="form-label">İkon</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COUPON_ICONS.map((icon) => {
                const isChecked = editingCoupon ? editingCoupon.icon === icon : icon === "🎁";
                return (
                  <label key={icon} style={{ cursor: "pointer" }}>
                    <input type="radio" name="icon" value={icon} defaultChecked={isChecked} style={{ display: "none" }} />
                    <span
                      style={{
                        display: "block",
                        fontSize: "1.5rem",
                        padding: "6px 10px",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        cursor: "pointer",
                      }}
                    >
                      {icon}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="form-label" htmlFor="coupon-title">Başlık *</label>
            <input 
              id="coupon-title" 
              name="title" 
              type="text" 
              className="form-input" 
              placeholder="Kupon başlığı" 
              defaultValue={editingCoupon?.title || ""}
              required 
            />
          </div>
          <div>
            <label className="form-label" htmlFor="coupon-desc">Açıklama</label>
            <textarea 
              id="coupon-desc" 
              name="description" 
              className="form-input" 
              rows={3} 
              placeholder="Kupon detayı..." 
              defaultValue={editingCoupon?.description || ""}
            />
          </div>
          <div>
            <label className="form-label" htmlFor="coupon-expiry">Son Kullanma Tarihi *</label>
            <input 
              id="coupon-expiry" 
              name="expiry_date" 
              type="date" 
              className="form-input" 
              defaultValue={editingCoupon?.expiry_date || ""}
              required 
            />
          </div>
          {formError && <p className="form-error">{formError}</p>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button 
              type="button" 
              onClick={() => {
                setIsModalOpen(false);
                setEditingCoupon(null);
              }} 
              className="btn-secondary"
            >
              İptal
            </button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? "Kaydediliyor..." : "Kaydet 🎁"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
