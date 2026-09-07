import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { createHsReport, markDone, deleteHsReport } from "./actions";

export default async function HsReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: reports }, { data: students }] = await Promise.all([
    supabase
      .from("hs_reports")
      .select("id, student_id, grade, subject, report_title, status, ocr_text, ai_answer, students(name)")
      .order("id", { ascending: false }),
    supabase.from("students").select("id, name").eq("department", "高等部").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="高校レポート管理" currentPath="/hs-reports" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          ⚠ 画像アップロード・OCR（Gemini）・AI回答案生成（Claude）は準備中です。APIキー設定後に有効化します。現在はレポートの登録・ステータス管理のみ可能です。
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">生徒</th>
                <th className="px-4 py-2 text-left">科目</th>
                <th className="px-4 py-2 text-left">タイトル</th>
                <th className="px-4 py-2 text-left">状態</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {reports?.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">
                    {(r.students as unknown as { name: string } | null)?.name ?? `#${r.student_id}`}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{r.grade} / {r.subject}</td>
                  <td className="px-4 py-2 text-xs">{r.report_title ?? "—"}</td>
                  <td className="px-4 py-2">
                    {r.status === "done" ? (
                      <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">完了</span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-700 rounded px-2 py-0.5">未処理</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {r.status !== "done" && (
                        <form action={markDone}>
                          <input type="hidden" name="id" value={r.id} />
                          <button type="submit" className="text-xs text-indigo-600 hover:underline">完了にする</button>
                        </form>
                      )}
                      <form action={deleteHsReport}>
                        <input type="hidden" name="id" value={r.id} />
                        <button type="submit" className="text-xs text-red-600 hover:underline">削除</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {reports?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">レポートはまだ登録されていません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ レポートを登録</h2>
          <form action={createHsReport} className="grid grid-cols-2 gap-3">
            <select name="student_id" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2">
              <option value="">生徒を選択（高等部）</option>
              {students?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select name="grade" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="高校1年">高校1年</option>
              <option value="高校2年">高校2年</option>
              <option value="高校3年">高校3年</option>
            </select>
            <input name="subject" required placeholder="科目" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="report_title" placeholder="レポートタイトル（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <select name="file_type" defaultValue="image" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="image">画像</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              type="submit"
              className="col-span-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              登録する
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
