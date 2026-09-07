"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setLevel(formData: FormData) {
  const supabase = await createClient();
  const student_id = Number(formData.get("student_id"));
  const subject = formData.get("subject") as string;
  const difficulty = formData.get("difficulty") as string;
  const daily_problems = Number(formData.get("daily_problems") || 10);

  await supabase
    .from("student_subject_levels")
    .upsert(
      { student_id, subject, difficulty, daily_problems },
      { onConflict: "student_id,subject" }
    );
  revalidatePath("/levels");
}

export async function deleteLevel(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("student_subject_levels").delete().eq("id", id);
  revalidatePath("/levels");
}
