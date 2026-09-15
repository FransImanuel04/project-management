"use server";

import { revalidatePath } from "next/cache";
import { projectSchema } from "@/lib/validators/project";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";

export async function createProject(formData: FormData) {
  const result = projectSchema.safeParse({
    name: formData.get("name"),
    key: String(formData.get("key") ?? "").toUpperCase(),
    description: formData.get("description") || undefined,
    icon: formData.get("icon"),
    iconColor: formData.get("iconColor"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid project details." };
  }

  try {
    await db.insert(projects).values(result.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return { error: "A project with this key already exists." };
    }

    return { error: "Unable to create the project right now." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateProject(id: string, formData: FormData) {
  const result = projectSchema.safeParse({
    name: formData.get("name"),
    key: String(formData.get("key") ?? "").toUpperCase(),
    description: formData.get("description") || undefined,
    icon: formData.get("icon"),
    iconColor: formData.get("iconColor"),
  });

  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid project details." };
  }

  try {
    const updated = await db
      .update(projects)
      .set({ ...result.data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning({ id: projects.id });

    if (!updated.length) return { error: "Project not found." };
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return { error: "A project with this key already exists." };
    }
    return { error: "Unable to update the project right now." };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteProject(id: string) {
  try {
    const deleted = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
    if (!deleted.length) return { error: "Project not found." };
  } catch {
    return { error: "Unable to delete the project right now." };
  }

  revalidatePath("/");
  return { success: true };
}