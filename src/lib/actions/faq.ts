"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const FaqQuestionSchema = z.object({
  question_text: z.string().min(1, "Soru metni zorunludur"),
  option_a: z.string().min(1, "A şıkkı zorunludur").max(500),
  option_b: z.string().min(1, "B şıkkı zorunludur").max(500),
  option_c: z.string().min(1, "C şıkkı zorunludur").max(500),
  option_d: z.string().min(1, "D şıkkı zorunludur").max(500),
  correct_option: z.enum(["A", "B", "C", "D"]),
  display_order: z.coerce.number().int().min(0),
});

export async function getFaqQuestions() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("faq_questions")
    .select("id, question_text, option_a, option_b, option_c, option_d, display_order")
    .order("display_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function checkFaqAnswer(
  questionId: string,
  selectedOption: "A" | "B" | "C" | "D"
): Promise<{ isCorrect: boolean }> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("faq_questions")
    .select("correct_option")
    .eq("id", questionId)
    .single();

  if (error || !data) return { isCorrect: false };
  return { isCorrect: data.correct_option === selectedOption };
}

export async function createFaqQuestion(formData: FormData) {
  const raw = {
    question_text: formData.get("question_text") as string,
    option_a: formData.get("option_a") as string,
    option_b: formData.get("option_b") as string,
    option_c: formData.get("option_c") as string,
    option_d: formData.get("option_d") as string,
    correct_option: formData.get("correct_option") as string,
    display_order: formData.get("display_order") as string,
  };

  const parsed = FaqQuestionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createAdminClient();
  const { error } = await supabase.from("faq_questions").insert(parsed.data);

  if (error) return { error: error.message };
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
  return { success: true };
}

export async function updateFaqQuestion(id: string, formData: FormData) {
  const raw = {
    question_text: formData.get("question_text") as string,
    option_a: formData.get("option_a") as string,
    option_b: formData.get("option_b") as string,
    option_c: formData.get("option_c") as string,
    option_d: formData.get("option_d") as string,
    correct_option: formData.get("correct_option") as string,
    display_order: formData.get("display_order") as string,
  };

  const parsed = FaqQuestionSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("faq_questions")
    .update(parsed.data)
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
  return { success: true };
}

export async function deleteFaqQuestion(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("faq_questions")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/faq");
  revalidatePath("/admin/faq");
  return { success: true };
}

// Quiz entry question actions (admin only)
export async function getQuizQuestionsAdmin() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function upsertQuizQuestion(formData: FormData) {
  const id = formData.get("id") as string | null;
  const question_type = (formData.get("question_type") as string) || "open_ended";
  
  const raw: any = {
    question_type,
    question_text: formData.get("question_text") as string,
    correct_answer: formData.get("correct_answer") as string,
    display_order: parseInt(formData.get("display_order") as string),
    hint: formData.get("hint") as string,
  };

  if (question_type === "multiple_choice") {
    raw.option_a = formData.get("option_a") as string;
    raw.option_b = formData.get("option_b") as string;
    raw.option_c = formData.get("option_c") as string;
    raw.option_d = formData.get("option_d") as string;
  } else {
    raw.option_a = null;
    raw.option_b = null;
    raw.option_c = null;
    raw.option_d = null;
  }

  const supabase = createAdminClient();
  if (id) {
    const { error } = await supabase
      .from("quiz_questions")
      .update(raw)
      .eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("quiz_questions").insert(raw);
    if (error) return { error: error.message };
  }

  return { success: true };
}

export async function deleteQuizQuestion(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/quiz");
  return { success: true };
}
