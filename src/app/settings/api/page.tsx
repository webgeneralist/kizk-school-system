import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { saveApiSettings } from "./actions";

const FIELDS: { key: string; label: string; purpose: string }[] = [
  { key: "gemini_api_key", label: "Gemini APIキー", purpose: "高校レポートのOCR" },
  { key: "claude_api_key", label: "Claude APIキー", purpose: "AI回答案・SNS投稿ネタ生成" },
  { key: "resend_api_key", label: "メール送信APIキー（Resend等）", purpose: "保護者への連絡・招待メール" },
  { key: "digifax_api_key", label: "DigiFAX APIキー", purpose: "月次出席レポートのFAX送信" },
];

export default async function ApiSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: settings } = await supabase
    .from("system_settings")
    .select("setting_key, setting_value");

  const settingMap = new Map((settings ?? []).map((s) => [s.setting_key, s.setting_value]));

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="API設定" currentPath="/settings/api" userEmail={user.email} />
      <main className="max-w-2xl mx-auto p-6 space-y-6">
        <p className="text-sm text-gray-500">
          外部サービスのAPIキーをここに登録すると、各機能（OCR・AI回答生成・メール送信・FAX送信）が有効になります。
          未設定の間は該当機能が「準備中」表示のままになります。
        </p>

        <form action={saveApiSettings} className="bg-white rounded-lg shadow p-6 space-y-5">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {f.label}
                <span className="ml-2 text-xs text-gray-400 font-normal">{f.purpose}</span>
              </label>
              <input
                type="password"
                name={f.key}
                defaultValue={settingMap.get(f.key) ?? ""}
                placeholder={settingMap.get(f.key) ? "●●●●●●●●（設定済み）" : "未設定"}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
              />
            </div>
          ))}
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-5 py-2 text-sm font-medium hover:opacity-90"
          >
            保存する
          </button>
        </form>
      </main>
    </div>
  );
}
