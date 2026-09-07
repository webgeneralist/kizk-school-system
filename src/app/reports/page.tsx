import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { logReportSend } from "./actions";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: sends }, { data: students }] = await Promise.all([
    supabase
      .from("report_sends")
      .select("id, student_id, report_year, report_month, send_method, sent_to, sent_at, students(name)")
      .order("sent_at", { ascending: false })
      .limit(50),
    supabase.from("students").select("id, name, guardian_email, school_id, schools(fax_number)").order("name"),
  ]);

  const now = new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="月次出席レポート送信" currentPath="/reports" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          ⚠ 実際のメール送信・FAX送信（DigiFAX API）は準備中です。現在は送信履歴の手動記録のみ可能です。
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">生徒</th>
                <th className="px-4 py-2 text-left">対象月</th>
                <th className="px-4 py-2 text-left">送信方法</th>
                <th className="px-4 py-2 text-left">送信先</th>
                <th className="px-4 py-2 text-left">送信日時</th>
              </tr>
            </thead>
            <tbody>
              {sends?.map((s) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">
                    {(s.students as unknown as { name: string } | null)?.name ?? `#${s.student_id}`}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{s.report_year}年{s.report_month}月</td>
                  <td className="px-4 py-2">
                    <span className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">
                      {s.send_method === "email" ? "メール" : "FAX"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{s.sent_to ?? "—"}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {s.sent_at ? new Date(s.sent_at).toLocaleString("ja-JP") : "—"}
                  </td>
                </tr>
              ))}
              {sends?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">送信履歴はまだありません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ 送信履歴を記録</h2>
          <form action={logReportSend} className="grid grid-cols-2 gap-3">
            <select name="student_id" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2">
              <option value="">生徒を選択</option>
              {students?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="number" name="report_year" defaultValue={now.getFullYear()} required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input type="number" name="report_month" defaultValue={now.getMonth() + 1} min={1} max={12} required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <select name="send_method" defaultValue="email" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="email">メール</option>
              <option value="fax">FAX</option>
            </select>
            <input name="sent_to" placeholder="送信先(メール/FAX番号)" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="memo" placeholder="メモ（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <button
              type="submit"
              className="col-span-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              記録する
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
