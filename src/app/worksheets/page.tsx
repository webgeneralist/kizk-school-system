import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { createWorksheet, deleteWorksheet } from "./actions";
import { getGrades, getSubjects, type Department } from "@/lib/masters";

export default async function WorksheetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: worksheets } = await supabase
    .from("worksheet_files")
    .select("id, department, grade, subject, title, file_type, difficulty, page_count")
    .order("id", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="教材ライブラリ" currentPath="/worksheets" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          ⚠ ファイルのアップロード機能（Supabase Storage連携）は準備中です。現在はメタデータ（タイトル・科目・難易度など）のみ登録できます。
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">タイトル</th>
                <th className="px-4 py-2 text-left">部門・学年</th>
                <th className="px-4 py-2 text-left">科目</th>
                <th className="px-4 py-2 text-left">難易度</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {worksheets?.map((w) => (
                <tr key={w.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">{w.title}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{w.department} / {w.grade}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{w.subject}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">{w.difficulty}</span>
                  </td>
                  <td className="px-4 py-2">
                    <form action={deleteWorksheet}>
                      <input type="hidden" name="id" value={w.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">削除</button>
                    </form>
                  </td>
                </tr>
              ))}
              {worksheets?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">教材はまだ登録されていません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ 教材を登録（メタデータのみ）</h2>
          <form action={createWorksheet} className="grid grid-cols-2 gap-3">
            <input name="title" required placeholder="タイトル" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <select name="department" defaultValue="小中等部" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="小中等部">小中等部</option>
              <option value="高等部">高等部</option>
            </select>
            <select name="grade" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              {[...getGrades("小中等部" as Department), ...getGrades("高等部" as Department)].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select name="subject" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <optgroup label="小中等部">
                {getSubjects("小中等部" as Department).map((s) => <option key={s} value={s}>{s}</option>)}
              </optgroup>
              <optgroup label="高等部">
                {getSubjects("高等部" as Department).map((s) => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            </select>
            <select name="difficulty" defaultValue="普" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="易">易</option>
              <option value="普">普</option>
              <option value="難">難</option>
            </select>
            <select name="file_type" defaultValue="pdf" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="pdf">PDF</option>
              <option value="image">画像</option>
            </select>
            <input type="number" name="page_count" defaultValue={1} min={1} placeholder="ページ数" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="memo" placeholder="メモ（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
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
