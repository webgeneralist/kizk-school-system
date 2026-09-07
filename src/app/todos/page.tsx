import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { createTodo, toggleTodoActive, deleteTodo } from "./actions";

export default async function TodosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: todos }, { data: students }] = await Promise.all([
    supabase
      .from("todo_items")
      .select("id, target_type, target_dept, target_sid, title, content, item_type, link_url, due_date, is_active")
      .order("id", { ascending: false }),
    supabase.from("students").select("id, name").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="やることリスト" currentPath="/todos" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">タイトル</th>
                <th className="px-4 py-2 text-left">対象</th>
                <th className="px-4 py-2 text-left">種別</th>
                <th className="px-4 py-2 text-left">期限</th>
                <th className="px-4 py-2 text-left">状態</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {todos?.map((t) => (
                <tr key={t.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">{t.title}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {t.target_type === "all" ? "全員" : t.target_type === "department" ? t.target_dept : `生徒ID:${t.target_sid}`}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">{t.item_type}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{t.due_date ?? "—"}</td>
                  <td className="px-4 py-2">
                    {t.is_active ? (
                      <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">有効</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">無効</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <form action={toggleTodoActive}>
                        <input type="hidden" name="id" value={t.id} />
                        <input type="hidden" name="is_active" value={String(t.is_active)} />
                        <button type="submit" className="text-xs text-indigo-600 hover:underline">
                          {t.is_active ? "無効化" : "有効化"}
                        </button>
                      </form>
                      <form action={deleteTodo}>
                        <input type="hidden" name="id" value={t.id} />
                        <button type="submit" className="text-xs text-red-600 hover:underline">削除</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {todos?.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">やることはまだ登録されていません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ やることを追加</h2>
          <form action={createTodo} className="grid grid-cols-2 gap-3">
            <input name="title" required placeholder="タイトル" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <textarea name="content" placeholder="内容（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <select name="target_type" defaultValue="all" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="all">全員</option>
              <option value="department">部門指定</option>
              <option value="student">生徒指定</option>
            </select>
            <select name="target_dept" defaultValue="" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="">部門なし</option>
              <option value="小中等部">小中等部</option>
              <option value="高等部">高等部</option>
            </select>
            <select name="target_sid" defaultValue="" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="">生徒指定なし</option>
              {students?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select name="item_type" defaultValue="task" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="task">タスク</option>
              <option value="text">お知らせ文</option>
              <option value="link">リンク</option>
            </select>
            <input name="link_url" placeholder="リンクURL（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input type="date" name="due_date" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <button
              type="submit"
              className="col-span-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              追加する
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
