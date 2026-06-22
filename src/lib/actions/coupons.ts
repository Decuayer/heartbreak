"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const CouponSchema = z.object({
  title: z.string().min(1, "Başlık zorunludur").max(255),
  description: z.string().optional(),
  expiry_date: z.string().min(1, "Son kullanma tarihi zorunludur"),
  icon: z.string().max(10).optional(),
});

export async function getCoupons() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("love_coupons")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function useCoupon(id: string) {
  const supabase = createAdminClient();

  // First check if already used or expired
  const { data: coupon } = await supabase
    .from("love_coupons")
    .select("is_used, expiry_date")
    .eq("id", id)
    .single();

  if (!coupon) return { error: "Kupon bulunamadı." };
  if (coupon.is_used) return { error: "Bu kupon zaten kullanılmış." };

  const today = new Date().toISOString().split("T")[0];
  if (coupon.expiry_date < today) {
    return { error: "Bu kuponun süresi dolmuş." };
  }

  const { error } = await supabase
    .from("love_coupons")
    .update({ is_used: true })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/coupons");
  return { success: true };
}

export async function createCoupon(formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    expiry_date: formData.get("expiry_date") as string,
    icon: formData.get("icon") as string,
  };

  const parsed = CouponSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createAdminClient();
  const { error } = await supabase.from("love_coupons").insert({
    ...parsed.data,
    icon: parsed.data.icon || "🎁",
    description: parsed.data.description || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/coupons");
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCoupon(id: string, formData: FormData) {
  const raw = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    expiry_date: formData.get("expiry_date") as string,
    icon: formData.get("icon") as string,
  };

  const parsed = CouponSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("love_coupons")
    .update({
      ...parsed.data,
      icon: parsed.data.icon || "🎁",
      description: parsed.data.description || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/coupons");
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCoupon(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("love_coupons")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/coupons");
  revalidatePath("/admin/coupons");
  return { success: true };
}
