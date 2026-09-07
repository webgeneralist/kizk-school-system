import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateStudent } from "../../actions";
import StudentForm from "../../StudentForm";

export default async function EditStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: student }, { data: schools }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).single(),
    supabase.from("schools").select("id, name, department").order("name"),
  ]);

  if (!student) notFound();

  const updateStudentWithId = updateStudent.bind(null, Number(id));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4">
        <h1 className="text-lg font-bold">生徒情報の編集 — {student.name}</h1>
      </header>
      <main className="max-w-3xl mx-auto p-6">
        <StudentForm
          action={updateStudentWithId}
          schools={schools ?? []}
          student={student}
          error={error}
        />
      </main>
    </div>
  );
}
