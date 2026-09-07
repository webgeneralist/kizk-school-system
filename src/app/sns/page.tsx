import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { createGoal, cancelGoal } from "./actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_LABEL: Record<string, string> = {
  active: "進行中",
  achieved: "達成",
  not_achieved: "未達成",
  cancelled: "中止",
};

export default async function SnsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: goals } = await supabase
    .from("sns_goals")
    .select("id, theme, target_count, duration_days, start_date, end_date, status")
    .order("id", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="SNS投稿ネタツール" currentPath="/sns" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          ⚠ AIによる日次投稿プランの自動生成は準備中です（AI APIキー設定後に有効化）。現在は目標の登録・進行状況の管理のみ可能です。
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">テーマ</th>
                <th className="px-4 py-2 text-left">目標</th>
                <th className="px-4 py-2 text-left">期間</th>
                <th className="px-4 py-2 text-left">状態</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {goals?.map((g) => (
                <tr key={g.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">{g.theme}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">+{g.target_count}</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{g.start_date} 〜 {g.end_date}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">
                      {STATUS_LABEL[g.status] ?? g.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {g.status === "active" && (
                      <form action={cancelGoal}>
                        <input type="hidden" name="id" value={g.id} />
                        <button type="submit" className="text-xs text-red-600 hover:underline">中止する</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {goals?.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">目標はまだ設定されていません</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ 目標を設定</h2>
          <form action={createGoal} className="grid grid-cols-2 gap-3">
            <input name="theme" required placeholder="今回のテーマ" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <input type="number" name="target_count" required placeholder="目標増加数" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input type="number" name="duration_days" required defaultValue={14} placeholder="期間(日数)" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input type="date" name="start_date" defaultValue={todayISO()} required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input type="date" name="end_date" required className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
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
