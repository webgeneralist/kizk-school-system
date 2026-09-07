"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

function studentPayload(formData: FormData) {
  return {
    department: str(formData, "department"),
    name: str(formData, "name"),
    name_kana: str(formData, "name_kana"),
    birth_date: str(formData, "birth_date"),
    gender: str(formData, "gender"),
    school_id: formData.get("school_id") ? Number(formData.get("school_id")) : null,
    guardian_name: str(formData, "guardian_name"),
    guardian_phone: str(formData, "guardian_phone"),
    guardian_email: str(formData, "guardian_email"),
    school_grade: str(formData, "school_grade"),
    school_class: str(formData, "school_class"),
    homeroom_teacher: str(formData, "homeroom_teacher"),
    notes: str(formData, "notes"),
  };
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const payload = studentPayload(formData);

  const { error } = await supabase.from("students").insert(payload);
  if (error) {
    redirect(`/students/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/students");
  redirect("/students");
}

export async function updateStudent(id: number, formData: FormData) {
  const supabase = await createClient();
  const payload = studentPayload(formData);

  const { error } = await supabase.from("students").update(payload).eq("id", id);
  if (error) {
    redirect(`/students/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/students");
  redirect("/students");
}

export async function issueMypageToken(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  const token = crypto.randomUUID().replace(/-/g, "");

  await supabase.from("students").update({ mypage_token: token }).eq("id", id);
  revalidatePath("/students");
}

export async function deleteStudent(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();

  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) {
    redirect(`/students?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/students");
  redirect("/students");
}
