"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

async function buildAutoSummary(
  supabase: Awaited<ReturnType<typeof createClient>>,
  studentId: number,
  date: string
) {
  const [{ data: attendance }, { data: progress }, { data: weakPoints }, { data: events }] =
    await Promise.all([
      supabase
        .from("attendance")
        .select("status, memo")
        .eq("student_id", studentId)
        .eq("attendance_date", date)
        .maybeSingle(),
      supabase
        .from("learning_progress")
        .select("subject, content, duration_min")
        .eq("student_id", studentId)
        .eq("progress_date", date),
      supabase
        .from("weak_points")
        .select("subject, topic, is_resolved")
        .eq("student_id", studentId)
        .eq("recorded_date", date),
      supabase
        .from("calendar_events")
        .select("title, event_category")
        .or(`event_date.eq.${date},and(event_date.lte.${date},end_date.gte.${date})`),
    ]);

  const lines: string[] = [];

  if (attendance) {
    lines.push(attendance.status === "present" ? "本日は出席しました。" : "本日は欠席しました。");
    if (attendance.memo) lines.push(`（${attendance.memo}）`);
  } else {
    lines.push("本日の出欠記録はまだありません。");
  }

  if (progress && progress.length > 0) {
    for (const p of progress) {
      const dur = p.duration_min ? `（約${p.duration_min}分）` : "";
      lines.push(`学習: ${p.subject ?? "教科未記入"} — ${p.content}${dur}`);
    }
  }

  if (weakPoints && weakPoints.length > 0) {
    for (const w of weakPoints) {
      lines.push(
        `${w.is_resolved ? "克服" : "苦手として記録"}: ${w.subject}${w.topic ? `（${w.topic}）` : ""}`
      );
    }
  }

  if (events && events.length > 0) {
    for (const e of events) {
      lines.push(`本日の予定: ${e.title}（${e.event_category}）`);
    }
  }

  return lines.join("\n");
}

export async function generateAndSaveReport(formData: FormData) {
  const supabase = await createClient();
  const student_id = Number(formData.get("student_id"));
  const report_date = formData.get("report_date") as string;

  const auto_summary = await buildAutoSummary(supabase, student_id, report_date);

  await supabase
    .from("daily_reports")
    .upsert(
      { student_id, report_date, auto_summary },
      { onConflict: "student_id,report_date" }
    );

  revalidatePath("/daily-reports");
}

export async function updateReport(formData: FormData) {
  const supabase = await createClient();
  const student_id = Number(formData.get("student_id"));
  const report_date = formData.get("report_date") as string;

  await supabase
    .from("daily_reports")
    .upsert(
      {
        student_id,
        report_date,
        staff_note: str(formData, "staff_note"),
        guidance_given: formData.get("guidance_given") === "on",
        guidance_note: str(formData, "guidance_note"),
      },
      { onConflict: "student_id,report_date" }
    );

  revalidatePath("/daily-reports");
}
