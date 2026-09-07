"use client";

import { useState } from "react";
import { updateStaffProfile, deleteStaffProfile } from "./actions";

type Staff = {
  id: number;
  username: string;
  display_name: string;
  role: string;
  is_active: boolean;
  auth_user_id: string | null;
};

export default function StaffRow({ staff }: { staff: Staff }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-gray-100 bg-indigo-50/30">
        <td colSpan={5} className="px-4 py-3">
          <form action={updateStaffProfile} className="grid grid-cols-2 gap-3">
            <input type="hidden" name="id" value={staff.id} />
            <input name="display_name" defaultValue={staff.display_name} required placeholder="表示名" className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <select name="role" defaultValue={staff.role} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              <option value="staff">staff（一般スタッフ）</option>
              <option value="super">super（管理者）</option>
            </select>
            <input
              name="auth_user_id"
              defaultValue={staff.auth_user_id ?? ""}
              placeholder="Supabase Auth UUID(ログイン用アカウントと紐付け)"
              className="border border-gray-300 rounded-md px-2 py-1 text-sm col-span-2"
            />
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="is_active" defaultChecked={staff.is_active} /> 有効
            </label>
            <div className="col-span-2 flex gap-2">
              <button type="submit" onClick={() => setEditing(false)} className="text-xs bg-indigo-600 text-white rounded px-3 py-1.5">保存</button>
              <button type="button" onClick={() => setEditing(false)} className="text-xs border border-gray-300 rounded px-3 py-1.5">キャンセル</button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-2">
        <div className="font-medium">{staff.display_name}</div>
        <div className="text-xs text-gray-400">{staff.username}</div>
      </td>
      <td className="px-4 py-2">
        <span className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">{staff.role}</span>
      </td>
      <td className="px-4 py-2">
        {staff.is_active ? (
          <span className="text-xs bg-green-50 text-green-700 rounded px-2 py-0.5">有効</span>
        ) : (
          <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">無効</span>
        )}
      </td>
      <td className="px-4 py-2 text-xs text-gray-400">
        {staff.auth_user_id ? "連携済み" : "未連携"}
      </td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-indigo-600 hover:underline text-xs">編集</button>
          <form
            action={deleteStaffProfile}
            onSubmit={(e) => {
              if (!confirm(`「${staff.display_name}」を削除します。よろしいですか？`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={staff.id} />
            <button type="submit" className="text-red-600 hover:underline text-xs">削除</button>
          </form>
        </div>
      </td>
    </tr>
  );
}
