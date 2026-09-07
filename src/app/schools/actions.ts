"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createSchool(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("schools").insert({
    department: str(formData, "department") ?? "小中等部",
    name: str(formData, "name"),
    address: str(formData, "address"),
    phone: str(formData, "phone"),
    principal_name: str(formData, "principal_name"),
    fax_number: str(formData, "fax_number"),
    email: str(formData, "email"),
  });
  revalidatePath("/schools");
}

export async function updateSchool(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase
    .from("schools")
    .update({
      department: str(formData, "department") ?? "小中等部",
      name: str(formData, "name"),
      address: str(formData, "address"),
      phone: str(formData, "phone"),
      principal_name: str(formData, "principal_name"),
      fax_number: str(formData, "fax_number"),
      email: str(formData, "email"),
    })
    .eq("id", id);
  revalidatePath("/schools");
}

export async function deleteSchool(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("schools").delete().eq("id", id);
  revalidatePath("/schools");
}
