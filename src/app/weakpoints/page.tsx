import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { createWeakPoint, toggleResolved, deleteWeakPoint } from "./actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function WeakPointsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: weakPoints }, { data: students }] = await Promise.all([
    supabase
      .from("weak_points")
      .select("id, student_id, subject, topic, recorded_date, is_resolved, memo, students(name)")
      .order("recorded_date", { ascending: false }),
    supabase.from("students").select("id, name").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="苦手管理・克服記録" currentPath="/weakpoints" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">生徒</th>
                <th className="px-4 py-2 text-left">科目・単元</th>
                <th className="px-4 py-2 text-left">記録日</th>
                <th className="px-4 py-2 text-left">状態</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {weakPoints?.map((w) => (
                <tr key={w.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">
                    {(w.students as unknown as { name: string } | null)?.name ?? `#${w.student_id}`}
                  </td>
                  <td className="px-4 py-2">
                    {w.subject}
                    {w.topic && <span className="text-xs text-gray-400"> / {w.topic}</span>}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{w.recorded_date}</td>
                  <td className="px-4 py-2">
                    {w.is_resolved ? (
                      <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">克服済み</span>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-700 rounded px-2 py-0.5">未克服</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <form action={toggleResolved}>
                        <input type="hidden" name="id" value={w.id} />
                        <input type="hidden" name="is_resolved" value={String(w.is_resolved)} />
                        <button type="submit" className="text-xs text-indigo-600 hover:underline">
                          {w.is_resolved ? "未克服に戻す" : "克服済みにする"}
                        </button>
                      </form>
                      <form action={deleteWeakPoint}>
                        <input type="hidden" name="id" value={w.id} />
                        <button type="submit" className="text-xs text-red-600 hover:underline">削除</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {weakPoints?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">記録はまだありません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ 苦手を記録</h2>
          <form action={createWeakPoint} className="grid grid-cols-2 gap-3">
            <select name="student_id" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2">
              <option value="">生徒を選択</option>
              {students?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input name="subject" required placeholder="科目" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="topic" placeholder="単元・トピック（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input type="date" name="recorded_date" defaultValue={todayISO()} required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="memo" placeholder="メモ（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
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
