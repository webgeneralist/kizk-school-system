import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { createProgress, deleteProgress } from "./actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: progress }, { data: students }] = await Promise.all([
    supabase
      .from("learning_progress")
      .select("id, student_id, progress_date, subject, content, duration_min, teacher_note, students(name)")
      .order("progress_date", { ascending: false })
      .limit(100),
    supabase.from("students").select("id, name").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="学習進捗記録" currentPath="/progress" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">日付</th>
                <th className="px-4 py-2 text-left">生徒</th>
                <th className="px-4 py-2 text-left">科目</th>
                <th className="px-4 py-2 text-left">内容</th>
                <th className="px-4 py-2 text-left">時間</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {progress?.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-xs text-gray-500">{p.progress_date}</td>
                  <td className="px-4 py-2 font-medium">
                    {(p.students as unknown as { name: string } | null)?.name ?? `#${p.student_id}`}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{p.subject ?? "—"}</td>
                  <td className="px-4 py-2 text-xs">{p.content}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{p.duration_min ? `${p.duration_min}分` : "—"}</td>
                  <td className="px-4 py-2">
                    <form action={deleteProgress}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-xs text-red-600 hover:underline">削除</button>
                    </form>
                  </td>
                </tr>
              ))}
              {progress?.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">記録はまだありません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ 進捗を記録</h2>
          <form action={createProgress} className="grid grid-cols-2 gap-3">
            <select name="student_id" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2">
              <option value="">生徒を選択</option>
              {students?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" name="progress_date" defaultValue={todayISO()} required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="subject" placeholder="科目（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <textarea name="content" required placeholder="学習内容" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <input type="number" name="duration_min" placeholder="学習時間（分・任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="teacher_note" placeholder="先生からのコメント（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
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
