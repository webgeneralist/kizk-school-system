"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createAssignment(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("assignments").insert({
    student_id: Number(formData.get("student_id")),
    worksheet_id: Number(formData.get("worksheet_id")),
    assigned_date: formData.get("assigned_date") as string,
    problem_start: Number(formData.get("problem_start") || 1),
    problem_end: Number(formData.get("problem_end") || 10),
    status: "assigned",
  });
  revalidatePath("/assignments");
}

export async function markScored(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("assignments").update({ status: "scored" }).eq("id", id);
  revalidatePath("/assignments");
}

export async function deleteAssignment(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("assignments").delete().eq("id", id);
  revalidatePath("/assignments");
}
