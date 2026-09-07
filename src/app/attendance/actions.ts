"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setAttendance(formData: FormData) {
  const supabase = await createClient();

  const student_id = Number(formData.get("student_id"));
  const attendance_date = formData.get("attendance_date") as string;
  const status = formData.get("status") as string;
  const memoRaw = formData.get("memo");
  const memo = typeof memoRaw === "string" && memoRaw.trim() !== "" ? memoRaw.trim() : null;

  await supabase
    .from("attendance")
    .upsert(
      { student_id, attendance_date, status, memo },
      { onConflict: "student_id,attendance_date" }
    );

  revalidatePath("/attendance");
}
