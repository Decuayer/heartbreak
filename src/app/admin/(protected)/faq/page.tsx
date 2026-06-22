import { getFaqQuestions } from "@/lib/actions/faq";
import FaqAdmin from "@/components/admin/FaqAdmin";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const questions = await getFaqQuestions();
  return <FaqAdmin initialQuestions={questions} />;
}
