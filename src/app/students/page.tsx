import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { deleteStudent } from "./actions";
import DeleteButton from "./DeleteButton";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; dept?: string }>;
}) {
  const { q, dept } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let query = supabase
    .from("students")
    .select("id, department, name, name_kana, school_grade, school_class, guardian_name, guardian_phone")
    .order("id", { ascending: true });

  if (dept === "小中等部" || dept === "高等部") {
    query = query.eq("department", dept);
  }
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,name_kana.ilike.%${q}%,guardian_name.ilike.%${q}%`
    );
  }

  const { data: students, error } = await query;

  const { count: totalCount } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true });
  const { count: juniorCount } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("department", "小中等部");
  const { count: highCount } = await supabase
    .from("students")
    .select("id", { count: "exact", head: true })
    .eq("department", "高等部");

  const tabs: { label: string; value?: string }[] = [
    { label: "全員", value: undefined },
    { label: "小中等部", value: "小中等部" },
    { label: "高等部", value: "高等部" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">UGO学院 生徒管理システム</h1>
          <p className="text-xs opacity-80">KIZK.jp 学院支援システム（Supabase版）</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/attendance" className="text-sm underline opacity-90">出欠管理</a>
          <a href="/schools" className="text-sm underline opacity-90">学校管理</a>
          <a href="/calendar" className="text-sm underline opacity-90">カレンダー</a>
          <a href="/users" className="text-sm underline opacity-90">スタッフ管理</a>
          <span className="text-sm opacity-90">{user.email}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{totalCount ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">在籍生徒 合計</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{juniorCount ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">小中等部（フリースクール）</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{highCount ?? 0}</div>
            <div className="text-xs text-gray-500 mt-1">高等部（サポート校）</div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex gap-2">
            {tabs.map((t) => {
              const active = (dept ?? "") === (t.value ?? "");
              return (
                <a
                  key={t.label}
                  href={`/students${t.value ? `?dept=${encodeURIComponent(t.value)}` : ""}`}
                  className={`text-sm px-3 py-1.5 rounded-md ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </a>
              );
            })}
          </div>

          <form method="get" className="flex gap-2">
            {dept && <input type="hidden" name="dept" value={dept} />}
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="氏名・カナ・保護者名で検索"
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm w-64"
            />
            <button
              type="submit"
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              検索
            </button>
          </form>

          <a
            href="/students/new"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-4 py-1.5 text-sm font-medium hover:opacity-90"
          >
            + 新規登録
          </a>
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
                <th className="px-4 py-2 text-left">保護者連絡先</th>
                <th className="px-4 py-2 text-left">操作</th>
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
                  <td className="px-4 py-2">{s.guardian_phone ?? "—"}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <a
                        href={`/students/${s.id}/edit`}
                        className="text-indigo-600 hover:underline text-xs"
                      >
                        編集
                      </a>
                      <form action={deleteStudent}>
                        <input type="hidden" name="id" value={s.id} />
                        <DeleteButton name={s.name} />
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {students?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
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
