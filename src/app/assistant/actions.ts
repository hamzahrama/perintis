"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const conversationSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

export async function createConversationAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid" };

  const parsed = conversationSchema.safeParse({
    title: formData.get("title") || "Percakapan baru",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { data, error } = await supabase
    .from("assistant_conversations")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
    })
    .select()
    .single();

  if (error) return { error: "Gagal membuat percakapan" };

  revalidatePath("/assistant");
  return { data };
}

export async function deleteConversationAction(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid" };

  const { error } = await supabase
    .from("assistant_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Gagal menghapus percakapan" };

  revalidatePath("/assistant");
  return { success: true };
}

export async function saveMessageAction(
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid" };

  const { error } = await supabase
    .from("assistant_messages")
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role,
      content,
    });

  if (error) return { error: "Gagal menyimpan pesan" };

  revalidatePath(`/assistant/${conversationId}`);
  return { success: true };
}
