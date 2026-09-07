"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createWeakPoint(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("weak_points").insert({
    student_id: Number(formData.get("student_id")),
    subject: str(formData, "subject"),
    topic: str(formData, "topic"),
    recorded_date: str(formData, "recorded_date"),
    memo: str(formData, "memo"),
    is_resolved: false,
  });
  revalidatePath("/weakpoints");
}

export async function toggleResolved(formData: FormData) {
  const id = Number(formData.get("id"));
  const is_resolved = formData.get("is_resolved") === "true";
  const supabase = await createClient();
  await supabase.from("weak_points").update({ is_resolved: !is_resolved }).eq("id", id);
  revalidatePath("/weakpoints");
}

export async function deleteWeakPoint(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("weak_points").delete().eq("id", id);
  revalidatePath("/weakpoints");
}
