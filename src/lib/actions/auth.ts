"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session/config";
import { normalizeTurkish, compareTurkish } from "@/lib/utils/turkish";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const QuizAnswerSchema = z.object({
  answers: z.array(z.string().min(1, "Cevap boş olamaz")),
});

export type QuizAnswerState = {
  error?: string;
  wrongIndices?: number[];
  success?: boolean;
  redirectUrl?: string;
};

export async function submitQuizAnswers(
  _prevState: QuizAnswerState,
  formData: FormData
): Promise<QuizAnswerState> {
  const rawAnswers = formData.getAll("answer") as string[];

  const parsed = QuizAnswerSchema.safeParse({ answers: rawAnswers });
  if (!parsed.success) {
    return { error: "Lütfen tüm soruları cevaplayın.", wrongIndices: [] };
  }

  // Fetch quiz questions from DB (server-side only via service role)
  const supabase = createAdminClient();
  const { data: questions, error } = await supabase
    .from("quiz_questions")
    .select("id, correct_answer, display_order")
    .order("display_order", { ascending: true });

  if (error || !questions) {
    return { error: "Quiz soruları yüklenemedi. Lütfen tekrar deneyin.", wrongIndices: [] };
  }

  if (rawAnswers.length !== questions.length) {
    return { error: "Tüm soruları cevaplamanız gerekiyor.", wrongIndices: [] };
  }

  // Validate each answer
  let allCorrect = true;
  const wrongIndices: number[] = [];

  for (let i = 0; i < questions.length; i++) {
    const userAnswer = normalizeTurkish(rawAnswers[i]);
    const correctAnswer = normalizeTurkish(questions[i].correct_answer);
    if (!compareTurkish(userAnswer, correctAnswer)) {
      allCorrect = false;
      wrongIndices.push(i);
    }
  }

  if (!allCorrect) {
    console.log("Quiz check failed:", wrongIndices);
    return {
      error: "Bazı cevaplar yanlış. Tekrar deneyin! 💕",
      wrongIndices,
    };
  }

  console.log("Quiz all correct! Setting session cookie...");
  // Set session cookie
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.isAuthenticated = true;
  await session.save();

  console.log("Session saved! Returning success redirect state.");
  return { success: true, redirectUrl: "/" };
}

export async function signOut() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  session.destroy();
  redirect("/quiz");
}

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
  return session;
}
