import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { createMessage, publishMessage, deleteMessage } from "./actions";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: messages }, { data: students }] = await Promise.all([
    supabase
      .from("messages")
      .select("id, title, body, target_type, target_dept, target_sid, is_published, published_at")
      .order("id", { ascending: false }),
    supabase.from("students").select("id, name").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="連絡・メッセージ" currentPath="/messages" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          ⚠ 実際のメール配信は準備中です（メール送信サービスのAPIキー設定後に有効化）。現在は下書き作成と「配信済みにする」フラグの管理のみ可能です。
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">タイトル</th>
                <th className="px-4 py-2 text-left">配信対象</th>
                <th className="px-4 py-2 text-left">状態</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {messages?.map((m) => (
                <tr key={m.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">{m.title}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {m.target_type === "all" ? "全員" : m.target_type === "department" ? m.target_dept : `生徒ID:${m.target_sid}`}
                  </td>
                  <td className="px-4 py-2">
                    {m.is_published ? (
                      <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">配信済み</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">下書き</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      {!m.is_published && (
                        <form action={publishMessage}>
                          <input type="hidden" name="id" value={m.id} />
                          <button type="submit" className="text-xs text-indigo-600 hover:underline">配信済みにする</button>
                        </form>
                      )}
                      <form action={deleteMessage}>
                        <input type="hidden" name="id" value={m.id} />
                        <button type="submit" className="text-xs text-red-600 hover:underline">削除</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {messages?.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">メッセージはまだありません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ メッセージを作成</h2>
          <form action={createMessage} className="grid grid-cols-2 gap-3">
            <input name="title" required placeholder="タイトル" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <textarea name="body" required rows={4} placeholder="本文" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
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
            <select name="target_sid" defaultValue="" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2">
              <option value="">生徒指定なし</option>
              {students?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button
              type="submit"
              className="col-span-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              下書き保存
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
