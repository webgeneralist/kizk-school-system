import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createStaffProfile } from "./actions";
import StaffRow from "./StaffRow";
import AppHeader from "@/components/AppHeader";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: staff } = await supabase
    .from("admin_users")
    .select("id, username, display_name, role, is_active, auth_user_id")
    .order("id");

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader title="スタッフ管理" currentPath="/users" userEmail={user.email} />

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          新しいスタッフを追加する場合は、まず
          <a
            href="https://supabase.com/dashboard/project/tndscxvdcoknxgwxhzqp/auth/users"
            target="_blank"
            className="underline font-medium"
          >
            Supabaseダッシュボード → Authentication → Users
          </a>
          でログイン用アカウント（メール・パスワード）を作成し、そのUUIDを下のプロフィールの「編集」から登録してください。
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 text-xs">
              <tr>
                <th className="px-4 py-2 text-left">氏名 / ログインID</th>
                <th className="px-4 py-2 text-left">権限</th>
                <th className="px-4 py-2 text-left">状態</th>
                <th className="px-4 py-2 text-left">ログイン連携</th>
                <th className="px-4 py-2 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {staff?.map((s) => (
                <StaffRow key={s.id} staff={s} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-semibold mb-3">+ スタッフプロフィールを追加</h2>
          <form action={createStaffProfile} className="grid grid-cols-2 gap-3">
            <input name="username" required placeholder="ログインID(任意の識別名)" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <input name="display_name" required placeholder="表示名" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm" />
            <select name="role" defaultValue="staff" className="border border-gray-300 rounded-md px-2 py-1.5 text-sm col-span-2">
              <option value="staff">staff（一般スタッフ）</option>
              <option value="super">super（管理者）</option>
            </select>
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
