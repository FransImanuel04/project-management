import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  key: z.string().trim().min(1).max(20).regex(/^[A-Z][A-Z0-9_-]*$/),
  description: z.string().trim().max(500).optional(),
  icon: z.string().trim().min(1).max(32),
  iconColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export type ProjectInput = z.infer<typeof projectSchema>;
