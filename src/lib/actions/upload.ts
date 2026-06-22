"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/actions/auth";

export async function uploadMediaAction(formData: FormData) {
  const session = await getSession();
  if (!session?.isAuthenticated) {
    return { error: "Yetkisiz erişim" };
  }

  const file = formData.get("file") as File | null;
  const path = formData.get("path") as string | null;

  if (!file || !path) {
    return { error: "Geçersiz dosya veya yol" };
  }

  const supabase = createAdminClient();
  
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data, error } = await supabase.storage
    .from("heartbeat-media")
    .upload(path, buffer, { 
      cacheControl: "3600", 
      upsert: false,
      contentType: file.type || "image/webp"
    });

  if (error) {
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from("heartbeat-media")
    .getPublicUrl(path);

  return { url: urlData.publicUrl };
}
