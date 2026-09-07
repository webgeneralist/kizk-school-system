"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createHsReport(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("hs_reports").insert({
    student_id: Number(formData.get("student_id")),
    grade: str(formData, "grade"),
    subject: str(formData, "subject"),
    report_title: str(formData, "report_title"),
    // ファイルアップロード・OCR・AI回答生成は未実装（Gemini/Claude APIキー準備待ち）
    file_path: `pending-upload/${Date.now()}`,
    file_type: str(formData, "file_type") ?? "image",
    status: "uploaded",
  });
  revalidatePath("/hs-reports");
}

export async function updateReportContent(formData: FormData) {
  // Claude Codeが原稿をOCR・整理した結果をここに書き込む運用を想定。
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase
    .from("hs_reports")
    .update({
      ocr_text: str(formData, "ocr_text"),
      ai_answer: str(formData, "ai_answer"),
      ai_processed_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/hs-reports");
  revalidatePath(`/hs-reports/${id}`);
}

export async function markDone(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("hs_reports").update({ status: "done" }).eq("id", id);
  revalidatePath("/hs-reports");
}

export async function deleteHsReport(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("hs_reports").delete().eq("id", id);
  revalidatePath("/hs-reports");
}
