import { getTimelineEvents } from "@/lib/actions/timeline";
import TimelineAdmin from "@/components/admin/TimelineAdmin";

export const dynamic = "force-dynamic";

export default async function AdminTimelinePage() {
  const events = await getTimelineEvents();
  return <TimelineAdmin initialEvents={events} />;
}
