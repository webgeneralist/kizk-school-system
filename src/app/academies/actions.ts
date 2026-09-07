"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createAcademy(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("academies").insert({
    code: str(formData, "code"),
    name: str(formData, "name"),
    address: str(formData, "address"),
    phone: str(formData, "phone"),
    principal_name: str(formData, "principal_name"),
    contact_email: str(formData, "contact_email"),
  });
  revalidatePath("/academies");
}

export async function toggleAcademyActive(formData: FormData) {
  const id = Number(formData.get("id"));
  const is_active = formData.get("is_active") === "true";
  const supabase = await createClient();
  await supabase.from("academies").update({ is_active: !is_active }).eq("id", id);
  revalidatePath("/academies");
}
