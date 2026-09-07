"use client";

import { useState } from "react";
import { updateEvent, deleteEvent } from "./actions";

type EventRowType = {
  id: number;
  source_type: string;
  school_id: number | null;
  title: string;
  event_date: string;
  end_date: string | null;
  event_category: string;
  is_closed: boolean;
  memo: string | null;
};

type School = { id: number; name: string };

const CATEGORIES = ["休校日", "行事", "定期テスト", "長期休暇", "お知らせ", "その他"];

export default function EventRow({ event, schools }: { event: EventRowType; schools: School[] }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-gray-100 bg-indigo-50/30">
        <td colSpan={5} className="px-4 py-3">
          <form action={updateEvent} className="grid grid-cols-3 gap-3">
            <input type="hidden" name="id" value={event.id} />
            <input name="title" defaultValue={event.title} required placeholder="タイトル" className="border border-gray-300 rounded-md px-2 py-1 text-sm col-span-2" />
            <select name="event_category" defaultValue={event.event_category} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" name="event_date" defaultValue={event.event_date} required className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <input type="date" name="end_date" defaultValue={event.end_date ?? ""} placeholder="終了日(任意)" className="border border-gray-300 rounded-md px-2 py-1 text-sm" />
            <select name="source_type" defaultValue={event.source_type} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              <option value="学院">学院</option>
              <option value="学校">学校</option>
            </select>
            <select name="school_id" defaultValue={event.school_id ?? ""} className="border border-gray-300 rounded-md px-2 py-1 text-sm">
              <option value="">対象学校なし</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label className="flex items-center gap-1 text-sm">
              <input type="checkbox" name="is_closed" defaultChecked={event.is_closed} /> 休校日
            </label>
            <input name="memo" defaultValue={event.memo ?? ""} placeholder="メモ" className="border border-gray-300 rounded-md px-2 py-1 text-sm col-span-3" />
            <div className="col-span-3 flex gap-2">
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
      <td className="px-4 py-2 whitespace-nowrap">
        {event.event_date}
        {event.end_date && event.end_date !== event.event_date ? ` 〜 ${event.end_date}` : ""}
      </td>
      <td className="px-4 py-2">
        <span className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">{event.event_category}</span>
        {event.is_closed && (
          <span className="ml-1 text-xs bg-red-50 text-red-600 rounded px-2 py-0.5">休校</span>
        )}
      </td>
      <td className="px-4 py-2 font-medium">{event.title}</td>
      <td className="px-4 py-2 text-gray-500 text-xs">{event.memo ?? "—"}</td>
      <td className="px-4 py-2">
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-indigo-600 hover:underline text-xs">編集</button>
          <form
            action={deleteEvent}
            onSubmit={(e) => {
              if (!confirm(`「${event.title}」を削除します。よろしいですか？`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={event.id} />
            <button type="submit" className="text-red-600 hover:underline text-xs">削除</button>
          </form>
        </div>
      </td>
    </tr>
  );
}
