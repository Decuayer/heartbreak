"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const TimelineEventSchema = z.object({
  event_date: z.string().min(1, "Tarih zorunludur"),
  title: z.string().min(1, "Başlık zorunludur").max(255),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export async function getTimelineEvents() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTimelineEvent(formData: FormData) {
  const raw = {
    event_date: formData.get("event_date") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    image_url: formData.get("image_url") as string,
  };

  const parsed = TimelineEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("timeline_events").insert({
    ...parsed.data,
    image_url: parsed.data.image_url || null,
    description: parsed.data.description || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  return { success: true };
}

export async function updateTimelineEvent(id: string, formData: FormData) {
  const raw = {
    event_date: formData.get("event_date") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    image_url: formData.get("image_url") as string,
  };

  const parsed = TimelineEventSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("timeline_events")
    .update({
      ...parsed.data,
      image_url: parsed.data.image_url || null,
      description: parsed.data.description || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  return { success: true };
}

export async function deleteTimelineEvent(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("timeline_events")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/timeline");
  revalidatePath("/admin/timeline");
  return { success: true };
}
