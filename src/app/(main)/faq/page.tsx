import type { Metadata } from "next";
import { getFaqQuestions } from "@/lib/actions/faq";
import FaqQuiz from "@/components/faq/FaqQuiz";

export const metadata: Metadata = {
  title: "Hakkımızda Quiz | Nehir Polat'ın Paneli",
  description: "Bizi ne kadar iyi tanıyorsunuz? Test edin!",
};

export const revalidate = 3600; // ISR: 1 hour

export default async function FaqPage() {
  const questions = await getFaqQuestions();

  return (
    <div className="container" style={{ paddingTop: "64px", paddingBottom: "80px" }}>
      <div className="page-header">
        <div className="label">💝 Hakkımızda Quiz</div>
        <h1>Bizi Ne Kadar İyi Tanıyorsun?</h1>
        <p>
          4 şıklı sorularla bizi test et! Skorun LocalStorage&apos;da saklanacak.
        </p>
      </div>

      <FaqQuiz questions={questions} />
    </div>
  );
}
