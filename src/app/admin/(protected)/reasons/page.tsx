import { getAllLoveReasons } from "@/lib/actions/reasons";
import ReasonsAdmin from "@/components/admin/ReasonsAdmin";
import { getSettings } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";

export default async function AdminReasonsPage() {
  const reasons = await getAllLoveReasons();
  const { relationshipStartDate, counterStartDate } = await getSettings();
  
  return <ReasonsAdmin 
    initialReasons={reasons} 
    initialRelationshipStartDate={relationshipStartDate}
    initialCounterStartDate={counterStartDate} 
  />;
}
