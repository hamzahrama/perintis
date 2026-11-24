/**
 * Personal context retrieval for AI assistant.
 *
 * Fetches only data owned by the authenticated user.
 * Limited scope to avoid excessive tokens and ensure privacy.
 */

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUserTimezone, localDateToUtcStart, utcToLocalDate } from "@/lib/timezone";

export type AssistantContext = {
  userTimezone: string;
  activeGoals: Array<{
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    target_date: string | null;
  }>;
  todayActivities: Array<{
    id: string;
    title: string;
    description: string | null;
    scheduled_at: string | null;
    status: string;
  }>;
  upcomingActivities: Array<{
    id: string;
    title: string;
    description: string | null;
    scheduled_at: string;
    status: string;
  }>;
  activeHabits: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  recentReflections: Array<{
    reflection_date: string;
    answers: { wins?: string; blockers?: string };
  }>;
  activeCommitment: {
    description: string;
    goal_id: string | null;
    activity_id: string | null;
  } | null;
};

export async function getAssistantContext(userId: string): Promise<AssistantContext> {
  const supabase = await createSupabaseServerClient();

  const userTimezone = await getUserTimezone(userId);
  const now = new Date();
  const today = utcToLocalDate(now, userTimezone);
  const todayStart = localDateToUtcStart(today, userTimezone);
  const nextDay = new Date(`${today}T00:00:00Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const nextDayKey = nextDay.toISOString().slice(0, 10);
  const tomorrowStart = localDateToUtcStart(nextDayKey, userTimezone);
  const sevenDaysLaterDate = new Date(`${today}T00:00:00Z`);
  sevenDaysLaterDate.setUTCDate(sevenDaysLaterDate.getUTCDate() + 7);
  const sevenDaysLater = localDateToUtcStart(sevenDaysLaterDate.toISOString().slice(0, 10), userTimezone);
  const recentReflectionStart = new Date(`${today}T00:00:00Z`);
  recentReflectionStart.setUTCDate(recentReflectionStart.getUTCDate() - 6);
  const recentReflectionDate = recentReflectionStart.toISOString().slice(0, 10);

  // Fetch all context in parallel
  const results = await Promise.all([
    // Active goals
    supabase
      .from("goals")
      .select("id, title, description, category, target_date")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(5),

    // Today's activities (scheduled for today in user's timezone)
    supabase
      .from("activities")
      .select("id, title, description, scheduled_at, status")
      .eq("user_id", userId)
      .in("status", ["not_started", "in_progress", "rescheduled"])
      .gte("scheduled_at", todayStart)
      .lt("scheduled_at", tomorrowStart)
      .order("scheduled_at", { ascending: true, nullsFirst: false })
      .limit(10),

    // Upcoming activities (next 7 days)
    supabase
      .from("activities")
      .select("id, title, description, scheduled_at, status")
      .eq("user_id", userId)
      .in("status", ["not_started", "in_progress", "rescheduled"])
      .gte("scheduled_at", tomorrowStart)
      .lte("scheduled_at", sevenDaysLater)
      .order("scheduled_at", { ascending: true })
      .limit(10),

    // Active habits
    supabase
      .from("habits")
      .select("id, name, description")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(10),

    // Recent reflections (last 7 days)
    supabase
      .from("daily_reflections")
      .select("reflection_date, answers")
      .eq("user_id", userId)
      .gte("reflection_date", recentReflectionDate)
      .order("reflection_date", { ascending: false })
      .limit(7),

    // Active commitment
    supabase
      .from("commitments")
      .select("description, goal_id, activity_id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  if (results.some((result) => result.error)) {
    throw new Error("Gagal memuat konteks pengguna.");
  }

  const [
    { data: goals },
    { data: todayActivities },
    { data: upcomingActivities },
    { data: habits },
    { data: reflections },
    { data: commitment },
  ] = results;

  return {
    userTimezone,
    activeGoals: goals ?? [],
    todayActivities: todayActivities ?? [],
    upcomingActivities: upcomingActivities ?? [],
    activeHabits: habits ?? [],
    recentReflections: reflections ?? [],
    activeCommitment: commitment ?? null,
  };
}

export function formatContextForAI(context: AssistantContext): string {
  const lines: string[] = ["=== KONTEKS PENGGUNA ==="];

  lines.push(`Zona waktu: ${context.userTimezone}`);
  lines.push("");

  if (context.activeGoals.length > 0) {
    lines.push("GOAL AKTIF:");
    for (const g of context.activeGoals) {
      lines.push(`- ${g.title}${g.description ? `: ${g.description}` : ""}${g.target_date ? ` (target: ${g.target_date})` : ""}`);
    }
    lines.push("");
  }

  if (context.todayActivities.length > 0) {
    lines.push("AKTIVITAS HARI INI:");
    for (const a of context.todayActivities) {
      const time = a.scheduled_at ? new Date(a.scheduled_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: context.userTimezone }) : "tanpa jadwal";
      lines.push(`- ${a.title} [${a.status}] (${time})${a.description ? `: ${a.description}` : ""}`);
    }
    lines.push("");
  }

  if (context.upcomingActivities.length > 0) {
    lines.push("AKTIVITAS MENDATANG (7 hari):");
    for (const a of context.upcomingActivities) {
      const date = new Date(a.scheduled_at).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: context.userTimezone });
      const time = new Date(a.scheduled_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: context.userTimezone });
      lines.push(`- ${a.title} [${a.status}] (${date} ${time})`);
    }
    lines.push("");
  }

  if (context.activeHabits.length > 0) {
    lines.push("HABIT AKTIF:");
    for (const h of context.activeHabits) {
      lines.push(`- ${h.name}${h.description ? `: ${h.description}` : ""}`);
    }
    lines.push("");
  }

  if (context.recentReflections.length > 0) {
    lines.push("REFLEKSI & KEMAJUAN TERBARU:");
    for (const r of context.recentReflections) {
      const wins = r.answers?.wins ? `"${r.answers.wins}"` : "—";
      const blockers = r.answers?.blockers ? `"${r.answers.blockers}"` : "—";
      lines.push(`- ${r.reflection_date}:`);
      lines.push(`  Berhasil: ${wins}`);
      lines.push(`  Hambatan: ${blockers}`);
    }
    lines.push("");
  }

  if (context.activeCommitment) {
    lines.push("KOMITMEN AKTIF:");
    lines.push(`- ${context.activeCommitment.description}`);
    lines.push("");
  }

  lines.push("=== AKHIR KONTEKS ===");
  return lines.join("\n");
}

export function truncateContext(context: string, maxChars: number = 8000): string {
  if (context.length <= maxChars) return context;
  // Prefer keeping recent reflections and today's activities
  return context.slice(-maxChars);
}