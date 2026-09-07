import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

// 保護者マイページは未ログインの一般公開ページ。
// students テーブルへ直接クエリはせず、トークン一致時のみ返すRPC経由で取得する。
export default async function MyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [{ data, error }, { data: reports }] = await Promise.all([
    supabase
      .rpc("get_student_by_mypage_token", { p_token: token })
      .maybeSingle<{
        id: number;
        department: string;
        name: string;
        name_kana: string | null;
        school_grade: string | null;
        school_class: string | null;
        homeroom_teacher: string | null;
      }>(),
    supabase.rpc("get_daily_reports_by_mypage_token", { p_token: token, p_limit: 14 }) as unknown as Promise<{
      data: {
        report_date: string;
        auto_summary: string | null;
        staff_note: string | null;
        guidance_given: boolean;
        guidance_note: string | null;
      }[] | null;
    }>,
  ]);

  if (error || !data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-lg font-bold mb-1">🏠 KIZK.jp マイページ</h1>
        <p className="text-sm text-gray-500 mb-6">{data.name} さんの記録</p>

        <div className="space-y-3 text-sm mb-6">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">部門</span>
            <span>{data.department}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">学年・クラス</span>
            <span>{data.school_grade} {data.school_class}</span>
          </div>
          {data.homeroom_teacher && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">担任の先生</span>
              <span>{data.homeroom_teacher}</span>
            </div>
          )}
        </div>

        <h2 className="text-sm font-semibold mb-3">最近の様子</h2>
        <div className="space-y-3">
          {reports && reports.length > 0 ? (
            reports.map((r) => (
              <div key={r.report_date} className="border border-gray-100 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">{r.report_date}</div>
                {r.auto_summary && (
                  <p className="text-sm whitespace-pre-wrap text-gray-700">{r.auto_summary}</p>
                )}
                {r.staff_note && (
                  <p className="text-sm text-indigo-700 mt-2">📝 {r.staff_note}</p>
                )}
                {r.guidance_given && r.guidance_note && (
                  <p className="text-sm text-purple-700 mt-2">💬 {r.guidance_note}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">まだ記録がありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}
