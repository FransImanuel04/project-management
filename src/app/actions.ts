"use server";

import { revalidatePath } from "next/cache";
import { projectSchema } from "@/lib/validators/project";
import { db } from "@/db";
import { projects } from "@/db/schema";

export async function createProject(formData: FormData) {
  const result = projectSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid project details." };
  }

  try {
    await db.insert(projects).values(result.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return { error: "A project with this slug already exists." };
    }

    return { error: "Unable to create the project right now." };
  }

  revalidatePath("/");
  return { success: true };
}