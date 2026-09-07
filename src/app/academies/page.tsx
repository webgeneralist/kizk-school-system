import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { createAcademy, toggleAcademyActive } from "./actions";

export default async function AcademiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: academies } = await supabase
    .from("academies")
    .select("id, code, name, is_active, contact_email")
    .order("id");

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="学院（テナント）管理" currentPath="/academies" userEmail={user.email} />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <p className="text-sm text-gray-500">
          KIZK運営本部として、このシステムを利用する学院（契約先）を追加・管理します。
        </p>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">学院名</th>
                <th className="px-4 py-2 text-left">コード</th>
                <th className="px-4 py-2 text-left">状態</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {academies?.map((a) => (
                <tr key={a.id} className="border-t border-gray-100">
                  <td className="px-4 py-2 font-medium">{a.name}</td>
                  <td className="px-4 py-2 text-gray-500">{a.code}</td>
                  <td className="px-4 py-2">
                    {a.is_active ? (
                      <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">有効</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">無効</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <form action={toggleAcademyActive}>
                      <input type="hidden" name="id" value={a.id} />
                      <input type="hidden" name="is_active" value={String(a.is_active)} />
                      <button type="submit" className="text-xs text-indigo-600 hover:underline">
                        {a.is_active ? "無効化" : "有効化"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ 学院を追加</h2>
          <form action={createAcademy} className="grid grid-cols-2 gap-3">
            <input name="name" required placeholder="学院名 例: UGO学院" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="code" required placeholder="学院コード 例: ugo" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="address" placeholder="住所（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="phone" placeholder="電話番号（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="principal_name" placeholder="代表者名（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="contact_email" placeholder="連絡先メール（任意）" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
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
