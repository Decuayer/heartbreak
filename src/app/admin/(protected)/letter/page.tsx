import { getLetter } from "@/lib/actions/letter";
import LetterAdmin from "@/components/admin/LetterAdmin";

export const dynamic = "force-dynamic";

export default async function AdminLetterPage() {
  const { content, unlockDate, isUnlocked } = await getLetter();
  return (
    <LetterAdmin
      initialContent={content ?? ""}
      unlockDate={unlockDate}
      isUnlocked={isUnlocked}
    />
  );
}
