import { getQuizQuestionsAdmin } from "@/lib/actions/faq";
import QuizQuestionsAdmin from "@/components/admin/QuizQuestionsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminQuizPage() {
  const questions = await getQuizQuestionsAdmin();
  return <QuizQuestionsAdmin initialQuestions={questions} />;
}
