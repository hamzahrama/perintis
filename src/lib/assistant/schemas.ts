import { z } from "zod";

export const conversationSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export const idSchema = z.string().uuid();
export const contentSchema = z.string().trim().min(1).max(4000);
