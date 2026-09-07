import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { createAssignment, markScored, deleteAssignment } from "./actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: assignments }, { data: students }, { data: worksheets }] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, student_id, worksheet_id, assigned_date, problem_start, problem_end, status, students(name), worksheet_files(title)")
      .order("assigned_date", { ascending: false }),
    supabase.from("students").select("id, name").order("name"),
    supabase.from("worksheet_files").select("id, title").order("title"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="課題割り当て・採点" currentPath="/assignments" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          ⚠ 問題ごとの正誤入力（採点の詳細記録）は準備中です。現在は「採点済みにする」で状態のみ切り替えられます。
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">生徒</th>
                <th className="px-4 py-2 text-left">教材</th>
                <th className="px-4 py-2 text-left">範囲</th>
                <th className="px-4 py-2 text-left">割当日</th>
                <th className="px-4 py-2 text-left">状態</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {assignments?.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">
                    {(a.students as unknown as { name: string } | null)?.name ?? `#${a.student_id}`}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {(a.worksheet_files as unknown as { title: string } | null)?.title ?? `#${a.worksheet_id}`}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{a.problem_start}〜{a.problem_end}問</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{a.assigned_date}</td>
                  <td className="px-4 py-2">
                    {a.status === "scored" ? (
                      <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">採点済み</span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-700 rounded px-2 py-0.5">割当中</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {a.status !== "scored" && (
                        <form action={markScored}>
                          <input type="hidden" name="id" value={a.id} />
                          <button type="submit" className="text-xs text-indigo-600 hover:underline">採点済みにする</button>
                        </form>
                      )}
                      <form action={deleteAssignment}>
                        <input type="hidden" name="id" value={a.id} />
                        <button type="submit" className="text-xs text-red-600 hover:underline">削除</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {assignments?.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">課題はまだ割り当てられていません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ 課題を割り当て</h2>
          {worksheets?.length === 0 ? (
            <p className="text-sm text-gray-500">
              先に<a href="/worksheets" className="text-indigo-600 underline">教材ライブラリ</a>で教材を登録してください。
            </p>
          ) : (
            <form action={createAssignment} className="grid grid-cols-2 gap-3">
              <select name="student_id" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
                <option value="">生徒を選択</option>
                {students?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select name="worksheet_id" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
                <option value="">教材を選択</option>
                {worksheets?.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
              </select>
              <input type="date" name="assigned_date" defaultValue={todayISO()} required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
              <div className="flex gap-2">
                <input type="number" name="problem_start" defaultValue={1} min={1} placeholder="開始番号" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-full" />
                <input type="number" name="problem_end" defaultValue={10} min={1} placeholder="終了番号" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm w-full" />
              </div>
              <button
                type="submit"
                className="col-span-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
              >
                割り当てる
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
