import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard-shell";
import { ChatInterface } from "./chat-interface";
import { isAIConfigured } from "@/lib/ai/provider";

export const metadata: Metadata = {
  title: "Assistant | PERINTIS",
};

export default async function AssistantPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("theme")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: conversations } = await supabase
    .from("assistant_conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const configured = isAIConfigured();

  return (
    <DashboardShell initialTheme={preferences?.theme || "dark"} activePath="/assistant">
      <main className="assistant-container">
        <header className="page-header">
          <h1 className="page-title">Personal Assistant</h1>
          <p className="page-description">
            Pendamping setiamu untuk tumbuh lebih baik setiap hari.
          </p>
        </header>

        {!configured && (
          <div className="card border-error bg-error/10 p-4 mb-6">
            <p className="text-error font-medium">AI Provider belum dikonfigurasi.</p>
            <p className="text-sm">Set <code>AI_API_KEY</code> di server untuk mengaktifkan fitur ini.</p>
          </div>
        )}

        <ChatInterface 
          initialConversations={conversations || []} 
          isConfigured={configured}
        />
      </main>
    </DashboardShell>
  );
}
