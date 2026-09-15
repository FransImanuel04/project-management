import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { projects } from "../src/db/schema";

const key = `VERIFY_${Date.now()}`;
async function main() {
  const inserted = await db
    .insert(projects)
    .values({
      name: "Foundation check",
      key,
      description: "CRUD verification",
      icon: "folder",
      iconColor: "#d7774b",
    })
    .returning({ id: projects.id, key: projects.key });
  const found = await db
    .select({ id: projects.id, key: projects.key })
    .from(projects)
    .where(eq(projects.key, key));

  await db
    .update(projects)
    .set({ name: "Updated foundation check", updatedAt: new Date() })
    .where(eq(projects.id, inserted[0]!.id));
  const updated = await db
    .select({ name: projects.name })
    .from(projects)
    .where(eq(projects.id, inserted[0]!.id));

  db.$client.prepare("DELETE FROM projects WHERE key = ?").run(key);

  const deleted = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, inserted[0]!.id));

  if (
    found.length !== 1 ||
    found[0]?.id !== inserted[0]?.id ||
    found[0]?.key !== inserted[0]?.key ||
    updated[0]?.name !== "Updated foundation check" ||
    deleted.length !== 0
  ) {
    throw new Error("SQLite round trip did not return the inserted project.");
  }

  console.log("SQLite create/read/write check passed.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
