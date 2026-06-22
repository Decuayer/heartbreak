"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// We use a dummy UUID to store settings in the digital_letters table.
// This allows us to avoid complex database schema migrations for a simple key-value configuration.
const SETTINGS_ID = "00000000-0000-0000-0000-000000000002";

export interface AppSettings {
  relationshipStartDate: string;
  counterStartDate: string;
}

export async function getSettings(): Promise<AppSettings> {
  const defaultSettings: AppSettings = {
    relationshipStartDate: process.env.RELATIONSHIP_START_DATE ?? "2025-01-01",
    counterStartDate: "2026-06-23",
  };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("digital_letters")
    .select("letter_content")
    .eq("id", SETTINGS_ID)
    .single();

  if (error || !data || !data.letter_content) {
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(data.letter_content);
    return {
      relationshipStartDate: parsed.relationshipStartDate || defaultSettings.relationshipStartDate,
      counterStartDate: parsed.counterStartDate || defaultSettings.counterStartDate,
    };
  } catch {
    return defaultSettings;
  }
}

export async function updateSettings(formData: FormData) {
  const relationshipStartDate = formData.get("relationshipStartDate") as string;
  const counterStartDate = formData.get("counterStartDate") as string;
  
  if (!relationshipStartDate || !counterStartDate) return { error: "Tüm tarihler zorunludur." };

  const currentSettings = await getSettings();
  const newSettings = { ...currentSettings, relationshipStartDate, counterStartDate };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("digital_letters")
    .upsert({
      id: SETTINGS_ID,
      letter_content: JSON.stringify(newSettings),
      updated_at: new Date().toISOString(),
    });

  if (error) return { error: error.message };
  
  // Revalidate relevant pages so changes apply instantly
  revalidatePath("/counter");
  revalidatePath("/admin/reasons");
  return { success: true };
}
