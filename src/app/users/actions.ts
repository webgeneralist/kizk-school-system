"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createStaffProfile(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("admin_users").insert({
    username: str(formData, "username"),
    display_name: str(formData, "display_name"),
    role: str(formData, "role") ?? "staff",
    is_active: true,
  });
  revalidatePath("/users");
}

export async function updateStaffProfile(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase
    .from("admin_users")
    .update({
      display_name: str(formData, "display_name"),
      role: str(formData, "role") ?? "staff",
      is_active: formData.get("is_active") === "on",
      auth_user_id: str(formData, "auth_user_id"),
    })
    .eq("id", id);
  revalidatePath("/users");
}

export async function deleteStaffProfile(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("admin_users").delete().eq("id", id);
  revalidatePath("/users");
}
