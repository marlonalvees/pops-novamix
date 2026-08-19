import { db } from "@/lib/db";
import TagsClient from "@/components/admin/TagsClient";

export default async function TagsPage() {
  const result = await db.query(`SELECT id, nome FROM pops.tags ORDER BY nome`);

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-gray-text mb-6">Tags</h1>
      <TagsClient tagsIniciais={result.rows} />
    </main>
  );
}
