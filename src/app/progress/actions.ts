"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createProgress(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("learning_progress").insert({
    student_id: Number(formData.get("student_id")),
    progress_date: str(formData, "progress_date"),
    subject: str(formData, "subject"),
    content: str(formData, "content"),
    duration_min: formData.get("duration_min") ? Number(formData.get("duration_min")) : null,
    teacher_note: str(formData, "teacher_note"),
  });
  revalidatePath("/progress");
}

export async function deleteProgress(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("learning_progress").delete().eq("id", id);
  revalidatePath("/progress");
}
