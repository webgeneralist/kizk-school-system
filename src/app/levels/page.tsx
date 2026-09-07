import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { setLevel, deleteLevel } from "./actions";
import { getSubjects, type Department } from "@/lib/masters";

export default async function LevelsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: levels }, { data: students }] = await Promise.all([
    supabase
      .from("student_subject_levels")
      .select("id, student_id, subject, difficulty, daily_problems, students(name, department)")
      .order("student_id"),
    supabase.from("students").select("id, name, department").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="生徒別科目レベル設定" currentPath="/levels" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">生徒</th>
                <th className="px-4 py-2 text-left">科目</th>
                <th className="px-4 py-2 text-left">難易度</th>
                <th className="px-4 py-2 text-left">1日の問題数</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {levels?.map((l) => (
                <tr key={l.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">
                    {(l.students as unknown as { name: string } | null)?.name ?? `#${l.student_id}`}
                  </td>
                  <td className="px-4 py-2">{l.subject}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">{l.difficulty}</span>
                  </td>
                  <td className="px-4 py-2">{l.daily_problems}問</td>
                  <td className="px-4 py-2">
                    <form action={deleteLevel}>
                      <input type="hidden" name="id" value={l.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">削除</button>
                    </form>
                  </td>
                </tr>
              ))}
              {levels?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">設定はまだありません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ レベルを設定</h2>
          <form action={setLevel} className="grid grid-cols-2 gap-3">
            <select name="student_id" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2">
              <option value="">生徒を選択</option>
              {students?.map((s) => <option key={s.id} value={s.id}>{s.name}（{s.department}）</option>)}
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
            <input type="number" name="daily_problems" defaultValue={10} min={1} placeholder="1日の問題数" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <button
              type="submit"
              className="col-span-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              設定する
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
