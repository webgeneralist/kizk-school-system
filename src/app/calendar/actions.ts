"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string" || v.trim() === "") return null;
  return v.trim();
}

function eventPayload(formData: FormData) {
  return {
    source_type: str(formData, "source_type") ?? "学院",
    school_id: formData.get("school_id") ? Number(formData.get("school_id")) : null,
    title: str(formData, "title"),
    event_date: str(formData, "event_date"),
    end_date: str(formData, "end_date"),
    event_category: str(formData, "event_category") ?? "その他",
    is_closed: formData.get("is_closed") === "on",
    memo: str(formData, "memo"),
  };
}

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  await supabase.from("calendar_events").insert(eventPayload(formData));
  revalidatePath("/calendar");
}

export async function updateEvent(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("calendar_events").update(eventPayload(formData)).eq("id", id);
  revalidatePath("/calendar");
}

export async function deleteEvent(formData: FormData) {
  const id = Number(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("calendar_events").delete().eq("id", id);
  revalidatePath("/calendar");
}
