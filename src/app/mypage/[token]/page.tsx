import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

// 保護者マイページは未ログインの一般公開ページ。
// students テーブルへ直接クエリはせず、トークン一致時のみ1件返すRPC経由で取得する。
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

  const { data, error } = await supabase
    .rpc("get_student_by_mypage_token", { p_token: token })
    .maybeSingle<{
      id: number;
      department: string;
      name: string;
      name_kana: string | null;
      school_grade: string | null;
      school_class: string | null;
      homeroom_teacher: string | null;
    }>();

  if (error || !data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 px-4 py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-lg font-bold mb-1">🏠 KIZK.jp マイページ</h1>
        <p className="text-sm text-gray-500 mb-6">{data.name} さんの記録</p>

        <div className="space-y-3 text-sm">
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

        <div className="mt-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          ⚠ 出欠・課題・お知らせの閲覧機能は準備中です。もうしばらくお待ちください。
        </div>
      </div>
    </div>
  );
}
