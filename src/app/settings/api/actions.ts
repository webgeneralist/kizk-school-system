"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const KEYS = [
  "gemini_api_key",
  "claude_api_key",
  "resend_api_key",
  "digifax_api_key",
] as const;

export async function saveApiSettings(formData: FormData) {
  const supabase = await createClient();

  for (const key of KEYS) {
    const value = formData.get(key);
    if (typeof value === "string") {
      await supabase
        .from("system_settings")
        .upsert({ setting_key: key, setting_value: value.trim() }, { onConflict: "setting_key" });
    }
  }

  revalidatePath("/settings/api");
}
