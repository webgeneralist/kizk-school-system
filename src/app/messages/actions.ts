"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createMessage(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("messages").insert({
    academy_id: 1,
    title: str(formData, "title"),
    body: str(formData, "body"),
    target_type: str(formData, "target_type") ?? "all",
    target_dept: str(formData, "target_dept"),
    target_sid: formData.get("target_sid") ? Number(formData.get("target_sid")) : null,
    is_published: false,
  });
  revalidatePath("/messages");
}

export async function publishMessage(formData: FormData) {
  // メール配信自体は未実装（メール送信サービスのAPIキー準備待ち）。
  // ここでは配信済みフラグのみ立てる。
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase
    .from("messages")
    .update({ is_published: true, published_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/messages");
}

export async function deleteMessage(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("messages").delete().eq("id", id);
  revalidatePath("/messages");
}
