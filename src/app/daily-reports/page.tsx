import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { generateAndSaveReport, updateReport } from "./actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default async function DailyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ student_id?: string; date?: string }>;
}) {
  const { student_id, date } = await searchParams;
  const reportDate = date ?? todayISO();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: students } = await supabase.from("students").select("id, name").order("name");

  let report: {
    id?: number;
    auto_summary: string | null;
    staff_note: string | null;
    guidance_given: boolean;
    guidance_note: string | null;
  } | null = null;

  if (student_id) {
    const { data } = await supabase
      .from("daily_reports")
      .select("id, auto_summary, staff_note, guidance_given, guidance_note")
      .eq("student_id", student_id)
      .eq("report_date", reportDate)
      .maybeSingle();
    report = data;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="保護者向け日次レポート" currentPath="/daily-reports" userEmail={user.email} />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <form method="get" className="bg-white rounded-lg shadow p-4 flex gap-3 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-500 mb-1">生徒</label>
            <select name="student_id" defaultValue={student_id ?? ""} required className="border border-gray-300 rounded-md px-3 py-1.5 text-sm">
              <option value="">選択してください</option>
              {students?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">日付</label>
            <input type="date" name="date" defaultValue={reportDate} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
          </div>
          <button type="submit" className="border border-gray-300 rounded-md px-4 py-1.5 text-sm bg-white hover:bg-gray-50">
            表示
          </button>
        </form>

        {student_id && (
          <>
            <form action={generateAndSaveReport}>
              <input type="hidden" name="student_id" value={student_id} />
              <input type="hidden" name="report_date" value={reportDate} />
              <button
                type="submit"
                className="text-sm bg-indigo-600 text-white rounded-md px-4 py-2 hover:opacity-90"
              >
                ⚡ 出欠・学習記録から自動生成
              </button>
            </form>

            {report?.auto_summary && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-sm font-semibold mb-2">自動生成された要約</h2>
                <pre className="text-sm whitespace-pre-wrap text-gray-700">{report.auto_summary}</pre>
              </div>
            )}

            <form action={updateReport} className="bg-white rounded-lg shadow p-4 space-y-4">
              <input type="hidden" name="student_id" value={student_id} />
              <input type="hidden" name="report_date" value={reportDate} />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">先生からの補足コメント（保護者に表示されます）</label>
                <textarea
                  name="staff_note"
                  rows={3}
                  defaultValue={report?.staff_note ?? ""}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="guidance_given" defaultChecked={report?.guidance_given ?? false} />
                本日、指導・声かけを行った
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">指導内容（保護者に表示されます）</label>
                <textarea
                  name="guidance_note"
                  rows={3}
                  defaultValue={report?.guidance_note ?? ""}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-5 py-2 text-sm font-medium hover:opacity-90"
              >
                保存する
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
