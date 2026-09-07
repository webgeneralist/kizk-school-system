import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function StudentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: students, error } = await supabase
    .from("students")
    .select("id, department, name, name_kana, school_grade, school_class, guardian_name, created_at")
    .order("id", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
        <h1 className="text-lg font-bold">UGO学院 生徒管理システム</h1>
        <p className="text-xs opacity-80">KIZK.jp 学院支援システム（Supabase版・移行中）</p>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">生徒一覧</h2>
          <span className="text-sm text-gray-500">
            ログイン中: {user.email}
          </span>
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            データ取得エラー: {error.message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">部門</th>
                <th className="px-4 py-2 text-left">氏名</th>
                <th className="px-4 py-2 text-left">学年・クラス</th>
                <th className="px-4 py-2 text-left">保護者</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((s, i) => (
                <tr key={s.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2">
                    <span className="inline-block text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">
                      {s.department}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.name_kana}</div>
                  </td>
                  <td className="px-4 py-2">
                    {s.school_grade} {s.school_class}
                  </td>
                  <td className="px-4 py-2">{s.guardian_name ?? "—"}</td>
                </tr>
              ))}
              {students?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    該当する生徒が見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
