"use client";

export default function DeleteButton({ name }: { name: string }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(`「${name}」を削除します。よろしいですか？`)) {
          e.preventDefault();
        }
      }}
      className="text-red-600 hover:underline text-xs"
    >
      削除
    </button>
  );
}
