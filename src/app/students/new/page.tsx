import { createClient } from "@/lib/supabase/server";
import { createStudent } from "../actions";
import StudentForm from "../StudentForm";

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const { data: schools } = await supabase
    .from("schools")
    .select("id, name, department")
    .order("name");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
        <h1 className="text-lg font-bold">生徒の新規登録</h1>
      </header>
      <main className="max-w-3xl mx-auto p-6">
        <StudentForm action={createStudent} schools={schools ?? []} error={error} />
      </main>
    </div>
  );
}
