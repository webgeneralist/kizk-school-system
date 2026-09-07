"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function logReportSend(formData: FormData) {
  // 実際のメール/FAX送信は未実装（メール送信サービス・DigiFAX APIキー準備待ち）。
  // ここでは送信履歴のみ記録する。
  const supabase = await createClient();
  await supabase.from("report_sends").insert({
    student_id: Number(formData.get("student_id")),
    report_year: Number(formData.get("report_year")),
    report_month: Number(formData.get("report_month")),
    send_method: str(formData, "send_method") ?? "email",
    sent_to: str(formData, "sent_to"),
    memo: str(formData, "memo"),
  });
  revalidatePath("/reports");
}
