import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { projects } from "../src/db/schema";

const slug = `foundation-check-${Date.now()}`;
async function main() {
  const inserted = await db
    .insert(projects)
    .values({ name: "Foundation check", slug })
    .returning({ id: projects.id, slug: projects.slug });
  const found = await db
    .select({ id: projects.id, slug: projects.slug })
    .from(projects)
    .where(eq(projects.slug, slug));

  db.$client.prepare("DELETE FROM projects WHERE slug = ?").run(slug);

  if (found.length !== 1 || found[0]?.id !== inserted[0]?.id) {
    throw new Error("SQLite round trip did not return the inserted project.");
  }

  console.log("SQLite create/read/write check passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
