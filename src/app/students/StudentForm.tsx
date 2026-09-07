"use client";

import { useState } from "react";
import { getGrades, type Department } from "@/lib/masters";

type School = { id: number; name: string; department: string };

type Student = {
  id?: number;
  department?: string;
  name?: string;
  name_kana?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  school_id?: number | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_email?: string | null;
  school_grade?: string | null;
  school_class?: string | null;
  homeroom_teacher?: string | null;
  notes?: string | null;
};

export default function StudentForm({
  action,
  schools,
  student,
  error,
}: {
  action: (formData: FormData) => void;
  schools: School[];
  student?: Student;
  error?: string;
}) {
  const [dept, setDept] = useState<Department>(
    (student?.department as Department) ?? "小中等部"
  );

  return (
    <form action={action} className="space-y-6 max-w-2xl">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">部門</label>
        <select
          name="department"
          value={dept}
          onChange={(e) => setDept(e.target.value as Department)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="小中等部">小中等部</option>
          <option value="高等部">高等部</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">氏名 *</label>
          <input
            type="text" name="name" required defaultValue={student?.name ?? ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">氏名カナ</label>
          <input
            type="text" name="name_kana" defaultValue={student?.name_kana ?? ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
          <input
            type="date" name="birth_date" defaultValue={student?.birth_date ?? ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">性別</label>
          <select
            name="gender" defaultValue={student?.gender ?? ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">未選択</option>
            <option value="男">男</option>
            <option value="女">女</option>
            <option value="その他">その他</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
          <select
            name="school_grade" defaultValue={student?.school_grade ?? ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">未選択</option>
            {getGrades(dept).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">クラス</label>
          <input
            type="text" name="school_class" defaultValue={student?.school_class ?? ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">所属学校</label>
          <select
            name="school_id" defaultValue={student?.school_id ?? ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="">未選択</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">担任の先生</label>
          <input
            type="text" name="homeroom_teacher" defaultValue={student?.homeroom_teacher ?? ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-xs font-medium text-gray-500 px-1">保護者情報</legend>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">保護者名</label>
            <input
              type="text" name="guardian_name" defaultValue={student?.guardian_name ?? ""}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">保護者電話番号</label>
            <input
              type="text" name="guardian_phone" defaultValue={student?.guardian_phone ?? ""}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">保護者メール</label>
          <input
            type="email" name="guardian_email" defaultValue={student?.guardian_email ?? ""}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </fieldset>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
        <textarea
          name="notes" rows={6} defaultValue={student?.notes ?? ""}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md px-5 py-2 text-sm font-medium hover:opacity-90"
        >
          {student?.id ? "更新する" : "登録する"}
        </button>
        <a
          href="/students"
          className="border border-gray-300 rounded-md px-5 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          キャンセル
        </a>
      </div>
    </form>
  );
}
