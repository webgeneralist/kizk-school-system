import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEvent } from "./actions";
import EventRow from "./EventRow";

const CATEGORIES = ["休校日", "行事", "定期テスト", "長期休暇", "お知らせ", "その他"];

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: events }, { data: schools }] = await Promise.all([
    supabase
      .from("calendar_events")
      .select("id, source_type, school_id, title, event_date, end_date, event_category, is_closed, memo")
      .order("event_date", { ascending: true }),
    supabase.from("schools").select("id, name").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">カレンダー（休校日・行事）</h1>
        <a href="/students" className="text-sm underline opacity-90">生徒一覧に戻る</a>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">日付</th>
                <th className="px-4 py-2 text-left">分類</th>
                <th className="px-4 py-2 text-left">タイトル</th>
                <th className="px-4 py-2 text-left">メモ</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {events?.map((e) => (
                <EventRow key={e.id} event={e} schools={schools ?? []} />
              ))}
              {events?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    予定はまだ登録されていません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ 予定を追加</h2>
          <form action={createEvent} className="grid grid-cols-3 gap-3">
            <input name="title" required placeholder="タイトル" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <select name="event_category" defaultValue="その他" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" name="event_date" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input type="date" name="end_date" placeholder="終了日(任意)" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <select name="source_type" defaultValue="学院" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="学院">学院</option>
              <option value="学校">学校</option>
            </select>
            <select name="school_id" defaultValue="" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="">対象学校なし</option>
              {schools?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="is_closed" /> 休校日
            </label>
            <input name="memo" placeholder="メモ" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-3" />
            <button
              type="submit"
              className="col-span-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              追加する
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
