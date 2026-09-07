import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSchool } from "./actions";
import SchoolRow from "./SchoolRow";

export default async function SchoolsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: schools } = await supabase
    .from("schools")
    .select("id, department, name, address, phone, principal_name, fax_number, email")
    .order("id");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">所属学校管理</h1>
        <a href="/students" className="text-sm underline opacity-90">生徒一覧に戻る</a>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">区分</th>
                <th className="px-4 py-2 text-left">学校名</th>
                <th className="px-4 py-2 text-left">住所</th>
                <th className="px-4 py-2 text-left">電話番号</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {schools?.map((s) => (
                <SchoolRow key={s.id} school={s} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ 学校を追加</h2>
          <form action={createSchool} className="grid grid-cols-2 gap-3">
            <select name="department" defaultValue="小中等部" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm">
              <option value="小中等部">小中等部</option>
              <option value="高等部">高等部</option>
              <option value="両方">両方</option>
            </select>
            <input name="name" required placeholder="学校名" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="address" placeholder="住所" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="phone" placeholder="電話番号" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="principal_name" placeholder="校長先生" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="fax_number" placeholder="FAX番号" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="email" placeholder="メールアドレス" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2" />
            <button
              type="submit"
              className="col-span-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              追加する
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
