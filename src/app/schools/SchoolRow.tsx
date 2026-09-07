"use client";

import { useState } from "react";
import { updateSchool, deleteSchool } from "./actions";

type School = {
  id: number;
  department: string;
  name: string;
  address: string | null;
  phone: string | null;
  principal_name: string | null;
  fax_number: string | null;
  email: string | null;
};

export default function SchoolRow({ school }: { school: School }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-gray-100 bg-indigo-50/30">
        <td colSpan={5} className="px-4 py-3">
          <form action={updateSchool} className="grid grid-cols-2 gap-3">
            <input type="hidden" name="id" value={school.id} />
            <select name="department" defaultValue={school.department} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              <option value="小中等部">小中等部</option>
              <option value="高等部">高等部</option>
              <option value="両方">両方</option>
            </select>
            <input name="name" defaultValue={school.name} required placeholder="学校名" className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <input name="address" defaultValue={school.address ?? ""} placeholder="住所" className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <input name="phone" defaultValue={school.phone ?? ""} placeholder="電話番号" className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <input name="principal_name" defaultValue={school.principal_name ?? ""} placeholder="校長先生" className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <input name="fax_number" defaultValue={school.fax_number ?? ""} placeholder="FAX番号" className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <input name="email" defaultValue={school.email ?? ""} placeholder="メールアドレス" className="border border-gray-300 rounded-md px-2 py-1 text-sm col-span-2" />
            <div className="col-span-2 flex gap-2">
              <button
                type="submit"
                onClick={() => setEditing(false)}
                className="text-xs bg-indigo-600 text-white rounded px-3 py-1.5"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs border border-gray-300 rounded px-3 py-1.5"
              >
                キャンセル
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-gray-100">
      <td className="px-4 py-2">
        <span className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">
          {school.department}
        </span>
      </td>
      <td className="px-4 py-2 font-medium">{school.name}</td>
      <td className="px-4 py-2 text-gray-500">{school.address ?? "—"}</td>
      <td className="px-4 py-2 text-gray-500">{school.phone ?? "—"}</td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-indigo-600 hover:underline text-xs">
            編集
          </button>
          <form
            action={deleteSchool}
            onSubmit={(e) => {
              if (!confirm(`「${school.name}」を削除します。よろしいですか？`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={school.id} />
            <button type="submit" className="text-red-600 hover:underline text-xs">
              削除
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
