"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDatePassed } from "@/lib/utils/date";

const LETTER_ID = "00000000-0000-0000-0000-000000000001";

export async function getLetter(): Promise<{
  isUnlocked: boolean;
  content: string | null;
  unlockDate: string;
}> {
  const unlockDate =
    process.env.LETTER_UNLOCK_DATE ?? "2099-12-31";
  const isUnlocked = isDatePassed(unlockDate);

  if (!isUnlocked) {
    return { isUnlocked: false, content: null, unlockDate };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("digital_letters")
    .select("letter_content")
    .eq("id", LETTER_ID)
    .single();

  if (error || !data) {
    return { isUnlocked: true, content: "", unlockDate };
  }

  return { isUnlocked: true, content: data.letter_content, unlockDate };
}

export async function updateLetter(formData: FormData) {
  const content = formData.get("letter_content") as string;
  if (!content) return { error: "Mektup içeriği boş olamaz." };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("digital_letters")
    .upsert({
      id: LETTER_ID,
      letter_content: content,
      updated_at: new Date().toISOString(),
    });

  if (error) return { error: error.message };
  revalidatePath("/letter");
  revalidatePath("/admin/letter");
  return { success: true };
}
