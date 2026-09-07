"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createWorksheet(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("worksheet_files").insert({
    department: str(formData, "department") ?? "小中等部",
    grade: str(formData, "grade"),
    subject: str(formData, "subject"),
    title: str(formData, "title"),
    // ファイルアップロード(Supabase Storage)は未実装。準備が整うまでは仮のパスを保存する。
    file_path: `pending-upload/${Date.now()}`,
    file_type: str(formData, "file_type") ?? "pdf",
    difficulty: str(formData, "difficulty") ?? "普",
    page_count: Number(formData.get("page_count") || 1),
    memo: str(formData, "memo"),
  });
  revalidatePath("/worksheets");
}

export async function deleteWorksheet(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("worksheet_files").delete().eq("id", id);
  revalidatePath("/worksheets");
}
