import { getCoupons } from "@/lib/actions/coupons";
import CouponsAdmin from "@/components/admin/CouponsAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await getCoupons();
  return <CouponsAdmin initialCoupons={coupons} />;
}
