"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createGoal(formData: FormData) {
  // AIによる日次投稿プラン自動生成は未実装（AI APIキー準備待ち）。
  // 目標自体の登録・進捗管理のみ先に用意する。
  const supabase = await createClient();
  await supabase.from("sns_goals").insert({
    theme: str(formData, "theme"),
    target_count: Number(formData.get("target_count")),
    duration_days: Number(formData.get("duration_days")),
    start_date: str(formData, "start_date"),
    end_date: str(formData, "end_date"),
    status: "active",
  });
  revalidatePath("/sns");
}

export async function cancelGoal(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase
    .from("sns_goals")
    .update({ status: "cancelled", checked_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/sns");
}
