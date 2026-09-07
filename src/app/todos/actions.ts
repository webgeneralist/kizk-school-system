"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

export async function createTodo(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("todo_items").insert({
    academy_id: 1,
    target_type: str(formData, "target_type") ?? "all",
    target_dept: str(formData, "target_dept"),
    target_sid: formData.get("target_sid") ? Number(formData.get("target_sid")) : null,
    title: str(formData, "title"),
    content: str(formData, "content"),
    item_type: str(formData, "item_type") ?? "task",
    link_url: str(formData, "link_url"),
    due_date: str(formData, "due_date"),
    is_active: true,
  });
  revalidatePath("/todos");
}

export async function toggleTodoActive(formData: FormData) {
  const id = Number(formData.get("id"));
  const is_active = formData.get("is_active") === "true";
  const supabase = await createClient();
  await supabase.from("todo_items").update({ is_active: !is_active }).eq("id", id);
  revalidatePath("/todos");
}

export async function deleteTodo(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("todo_items").delete().eq("id", id);
  revalidatePath("/todos");
}
