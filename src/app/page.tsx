import { desc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { ProjectWorkspace } from "@/components/project-workspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projectRows = await db.select().from(projects).orderBy(desc(projects.createdAt));
  return <ProjectWorkspace projects={projectRows} />;
}
