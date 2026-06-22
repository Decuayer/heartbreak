"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDaysSince } from "@/lib/utils/date";
import { z } from "zod";
import { getSettings } from "@/lib/actions/settings";

const ReasonSchema = z.object({
  reason_text: z.string().min(1, "Sebep metni zorunludur"),
  display_order: z.coerce.number().int().min(1),
});

export async function getLoveReasons() {
  const { relationshipStartDate, counterStartDate } = await getSettings();
  const relationshipDaysSince = getDaysSince(relationshipStartDate);
  const counterDaysSince = getDaysSince(counterStartDate);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("love_reasons")
    .select("*")
    .lte("display_order", counterDaysSince)
    .order("display_order", { ascending: true });

  if (error) throw new Error(error.message);
  return { reasons: data ?? [], relationshipDaysSince, counterDaysSince, relationshipStartDate, counterStartDate };
}

export async function getAllLoveReasons() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("love_reasons")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createReason(formData: FormData) {
  const raw = {
    reason_text: formData.get("reason_text") as string,
    display_order: formData.get("display_order") as string,
  };

  const parsed = ReasonSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createAdminClient();
  const { error } = await supabase.from("love_reasons").insert(parsed.data);

  if (error) return { error: error.message };
  revalidatePath("/counter");
  revalidatePath("/admin/reasons");
  return { success: true };
}

export async function updateReason(id: string, formData: FormData) {
  const raw = {
    reason_text: formData.get("reason_text") as string,
    display_order: formData.get("display_order") as string,
  };

  const parsed = ReasonSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("love_reasons")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/counter");
  revalidatePath("/admin/reasons");
  return { success: true };
}

export async function deleteReason(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("love_reasons")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/counter");
  revalidatePath("/admin/reasons");
  return { success: true };
}
