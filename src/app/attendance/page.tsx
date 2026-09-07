import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setAttendance } from "./actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateJa(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`;
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const targetDate = date ?? todayISO();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: students }, { data: records }] = await Promise.all([
    supabase
      .from("students")
      .select("id, department, name, name_kana")
      .order("id", { ascending: true }),
    supabase
      .from("attendance")
      .select("student_id, status, memo")
      .eq("attendance_date", targetDate),
  ]);

  const recordMap = new Map(
    (records ?? []).map((r) => [r.student_id, r])
  );

  const prevDate = new Date(targetDate + "T00:00:00");
  prevDate.setDate(prevDate.getDate() - 1);
  const nextDate = new Date(targetDate + "T00:00:00");
  nextDate.setDate(nextDate.getDate() + 1);
  const toISO = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">出欠管理</h1>
        <a href="/students" className="text-sm underline opacity-90">
          生徒一覧に戻る
        </a>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <a
              href={`/attendance?date=${toISO(prevDate)}`}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white hover:bg-gray-50"
            >
              ← 前日
            </a>
            <form method="get" className="flex items-center gap-2">
              <input
                type="date"
                name="date"
                defaultValue={targetDate}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white hover:bg-gray-50"
              >
                表示
              </button>
            </form>
            <a
              href={`/attendance?date=${toISO(nextDate)}`}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white hover:bg-gray-50"
            >
              翌日 →
            </a>
          </div>
          <div className="text-sm font-medium text-gray-600">
            {formatDateJa(targetDate)}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">氏名</th>
                <th className="px-4 py-2 text-left">状態</th>
                <th className="px-4 py-2 text-left">メモ・操作</th>
              </tr>
            </thead>
            <tbody>
              {students?.map((s) => {
                const rec = recordMap.get(s.id);
                const status = rec?.status;
                return (
                  <tr key={s.id} className="border-t border-gray-100">
                    <td className="px-4 py-2">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.department}</div>
                    </td>
                    <td className="px-4 py-2">
                      {status === "present" && (
                        <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">出席</span>
                      )}
                      {status === "absent" && (
                        <span className="text-xs bg-red-50 text-red-700 rounded px-2 py-0.5">欠席</span>
                      )}
                      {!status && (
                        <span className="text-xs text-gray-400">未記録</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <form action={setAttendance} className="flex items-center gap-2">
                        <input type="hidden" name="student_id" value={s.id} />
                        <input type="hidden" name="attendance_date" value={targetDate} />
                        <input
                          type="text"
                          name="memo"
                          defaultValue={rec?.memo ?? ""}
                          placeholder="メモ"
                          className="border border-gray-300 rounded-md px-2 py-1 text-xs w-40"
                        />
                        <button
                          type="submit"
                          name="status"
                          value="present"
                          className="text-xs bg-green-600 text-white rounded px-2 py-1 hover:opacity-90"
                        >
                          出席
                        </button>
                        <button
                          type="submit"
                          name="status"
                          value="absent"
                          className="text-xs bg-red-600 text-white rounded px-2 py-1 hover:opacity-90"
                        >
                          欠席
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
