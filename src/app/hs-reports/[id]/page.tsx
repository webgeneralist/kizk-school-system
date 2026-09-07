import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { updateReportContent } from "../actions";

export default async function HsReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: report } = await supabase
    .from("hs_reports")
    .select("id, grade, subject, report_title, ocr_text, ai_answer, status, students(name)")
    .eq("id", id)
    .single();

  if (!report) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="高校レポート 詳細" currentPath="/hs-reports" userEmail={user.email} />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">
            {(report.students as unknown as { name: string } | null)?.name} — {report.grade} / {report.subject}
          </div>
          <div className="font-medium">{report.report_title ?? "（タイトルなし）"}</div>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          ⚠ 自動OCR・AI回答生成は準備中です。現場でスキャンした原稿をClaude Codeに渡して読み取らせ、
          その結果をここに貼り付ける運用を想定しています。
        </div>

        <form action={updateReportContent} className="bg-white rounded-lg shadow p-6 space-y-4">
          <input type="hidden" name="id" value={report.id} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OCR結果（原稿の書き起こし）</label>
            <textarea
              name="ocr_text"
              rows={10}
              defaultValue={report.ocr_text ?? ""}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AI回答案</label>
            <textarea
              name="ai_answer"
              rows={10}
              defaultValue={report.ai_answer ?? ""}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-5 py-2 text-sm font-medium hover:opacity-90"
          >
            保存する
          </button>
        </form>
      </main>
    </div>
  );
}
