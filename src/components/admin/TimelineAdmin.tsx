"use client";

import { useState, useActionState, useTransition } from "react";
import { getTimelineEvents, createTimelineEvent, updateTimelineEvent, deleteTimelineEvent } from "@/lib/actions/timeline";
import ImageUploadField from "@/components/timeline/ImageUploadField";
import Modal from "@/components/admin/Modal";
import { Plus, Trash2, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Image from "next/image";

interface TimelineEvent {
  id: string;
  event_date: string;
  title: string;
  description: string | null;
  image_url: string | null;
}

interface Props {
  initialEvents: TimelineEvent[];
}

export default function TimelineAdmin({ initialEvents }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSave(formData: FormData) {
    setFormError("");
    startTransition(async () => {
      let result;
      if (editingEvent) {
        result = await updateTimelineEvent(editingEvent.id, formData);
      } else {
        result = await createTimelineEvent(formData);
      }
      
      if (result?.error) {
        setFormError(result.error);
      } else {
        setIsModalOpen(false);
        setEditingEvent(null);
        const updated = await getTimelineEvents();
        setEvents(updated);
      }
    });
  }

  function handleEditClick(event: TimelineEvent) {
    setEditingEvent(event);
    setFormError("");
    setIsModalOpen(true);
  }

  function handleAddNewClick() {
    setEditingEvent(null);
    setFormError("");
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu anıyı silmek istediğinize emin misiniz?")) return;
    startTransition(async () => {
      await deleteTimelineEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    });
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.75rem", marginBottom: 6 }}>
            Zaman Tüneli
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {events.length} anı
          </p>
        </div>
        <button
          onClick={handleAddNewClick}
          className="btn-primary"
        >
          <Plus size={16} />
          Yeni Anı Ekle
        </button>
      </div>

      {/* Table */}
      {events.length === 0 ? (
        <div className="glass-card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ color: "var(--color-text-muted)" }}>Henüz anı eklenmemiş.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: "24px" }}>
          <table className="admin-table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Başlık</th>
                <th>Görsel</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
                      <Calendar size={13} style={{ color: "var(--color-blush)" }} />
                      {(() => {
                        try {
                          return format(new Date(event.event_date + "T00:00:00"), "d MMM yyyy", { locale: tr });
                        } catch { return event.event_date; }
                      })()}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontSize: "0.9375rem", fontWeight: 500, marginBottom: 2 }}>
                        {event.title}
                      </div>
                      {event.description && (
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {event.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {event.image_url ? (
                      <div
                        style={{
                          position: "relative",
                          width: 60,
                          height: 40,
                          borderRadius: 6,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <Image src={event.image_url} alt={event.title} fill style={{ objectFit: "cover" }} sizes="60px" />
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleEditClick(event)}
                        className="btn-secondary"
                        disabled={isPending}
                        style={{ padding: "6px 10px", fontSize: "0.8125rem" }}
                      >
                        <Edit size={13} />
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="btn-danger"
                        disabled={isPending}
                        style={{ padding: "6px 10px", fontSize: "0.8125rem" }}
                      >
                        <Trash2 size={13} />
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal title={editingEvent ? "Anıyı Düzenle" : "Yeni Anı Ekle"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form action={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label className="form-label" htmlFor="event_date">Tarih *</label>
            <input id="event_date" name="event_date" type="date" className="form-input" defaultValue={editingEvent?.event_date || ""} required />
          </div>
          <div>
            <label className="form-label" htmlFor="title">Başlık *</label>
            <input id="title" name="title" type="text" className="form-input" placeholder="Anınızın başlığı" defaultValue={editingEvent?.title || ""} required />
          </div>
          <div>
            <label className="form-label" htmlFor="description">Açıklama</label>
            <textarea id="description" name="description" className="form-input" placeholder="Bu an hakkında ne söylemek istersin?" defaultValue={editingEvent?.description || ""} rows={4} />
          </div>
          <ImageUploadField initialImageUrl={editingEvent?.image_url} />
          {formError && <p className="form-error">{formError}</p>}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
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
