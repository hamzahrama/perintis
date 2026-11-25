import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card } from "@/components/ui";
import { getOnboardingStatus } from "@/lib/onboarding";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  formatForDisplay,
  validateTimezone,
  getTodayLocalString,
  localDateToUtcStart,
  localDateToUtcEnd,
} from "@/lib/timezone";

function formatActivityDate(value: string | null, timezone: string) {
  if (!value) return "Belum dijadwalkan";
  return formatForDisplay(value, timezone);
}

export default async function ProtectedPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  const { completed: onboardingCompleted } = await getOnboardingStatus();
  if (!onboardingCompleted) redirect("/onboarding");

  const {
    data: preferences,
    error: preferencesError,
  } = await supabase
    .from("user_preferences")
    .select("theme, timezone")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .maybeSingle();

  // Existing goal fetch
  const {
    data: goals,
    error: goalsError,
  } = await supabase
    .from("goals")
    .select("id, title, description, category, target_date, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Existing activities fetch (next 5)
  const {
    data: activities,
    error: activitiesError,
  } = await supabase
    .from("activities")
    .select("id, title, description, scheduled_at, status")
    .eq("user_id", user.id)
    .in("status", ["not_started", "in_progress", "rescheduled"])
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .limit(5);

  // --- NEW: Today's activities (same timezone as user) ---
  const timezone = validateTimezone(preferences?.timezone ?? "Asia/Jakarta");
  const todayLocal = getTodayLocalString(timezone);
  const todayStart = localDateToUtcStart(todayLocal, timezone);
  const todayEnd = localDateToUtcEnd(todayLocal, timezone);

  const {
    data: todayActivities,
    error: todayActivitiesError,
  } = await supabase
    .from("activities")
    .select("id, title, description, scheduled_at, status")
    .eq("user_id", user.id)
    .gte("scheduled_at", todayStart)
    .lte("scheduled_at", todayEnd)
    .order("scheduled_at", { ascending: true, nullsFirst: false });

  // NEW: Active habits
  const {
    data: activeHabits,
    error: habitsError,
  } = await supabase
    .from("habits")
    .select("id, name, description, is_active, schedule")
    .eq("user_id", user.id)
    .eq("is_active", true);

  // NEW: Today's habit log count
  const {
    count: todayHabitLogCount,
    error: habitLogsError,
  } = await supabase
    .from("habit_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("log_date", todayLocal);

  if (
    preferencesError ||
    profileError ||
    goalsError ||
    activitiesError ||
    todayActivitiesError ||
    habitsError ||
    habitLogsError
  ) {
    throw new Error("Ringkasan dashboard belum dapat dimuat.");
  }

  if (!preferences) {
    throw new Error("Preferensi pengguna tidak ditemukan.");
  }

  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] ?? "Teman";

  const activeGoals = goals ?? [];
  const plannedActivities = activities ?? [];
  const todayActivitiesData = todayActivities ?? [];
  const activeHabitsList = activeHabits ?? [];
  const todayHabitLogs = todayHabitLogCount ?? 0;

  // Calculate consistency percentage
  const habitConsistency =
    activeHabitsList.length > 0
      ? Math.round((todayHabitLogs / activeHabitsList.length) * 100)
      : 0;

  return (
    <DashboardShell initialTheme={preferences.theme}>
      <div className="dashboard-content dashboard-overview">
        {/* === PRIORITAS 1: Greeting & Konteks Hari Ini === */}
        <header
          className="dashboard-header"
          style={{
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <p
              className="eyebrow"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Ringkasan hari ini
            </p>
            <h1
              className="page-title"
              style={{ color: "var(--color-text-primary)" }}
            >
              Halo, {firstName}
            </h1>
            <p
              className="dashboard-intro"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Lihat hal yang sudah kamu pilih untuk dibangun, tanpa tekanan untuk
              menyelesaikan semuanya sekaligus.
            </p>
          </div>
          <Link
            className="button button--primary dashboard-action"
            href="/profile"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            Buka pengaturan
          </Link>
        </header>

        {/* === PRIORITAS 3: Fokus Utama / Prioritas Hari Ini === */}
        <section
          aria-labelledby="today-title"
          className="dashboard-grid"
          style={{ gap: "1rem" }}
        >
          <Card
            className="dashboard-panel dashboard-panel--wide"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <div
              className="panel-heading"
              style={{
                gap: "1rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <p
                  className="panel-kicker"
                  style={{ color: "var(--color-accent)" }}
                >
                  Fokus hari ini
                </p>
                <h2
                  className="section-title"
                  id="today-title"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Aktivitas yang sudah kamu jadwalkan
                </h2>
              </div>
              <span
                className="panel-count"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {todayActivitiesData.length} tersimpan
              </span>
            </div>
            {todayActivitiesData.length > 0 ? (
              <ul
                className="dashboard-list"
                style={{ gap: "0.75rem" }}
              >
                {todayActivitiesData.map((activity) => (
                  <li
                    className="dashboard-list-item"
                    key={activity.id}
                    style={{ gap: "1rem" }}
                  >
                    <div>
                      <h3
                        style={{
                          color: "var(--color-text-primary)",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {activity.title}
                      </h3>
                      <p
                        style={{
                          color: "var(--color-text-secondary)",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {activity.description || "Tidak ada catatan tambahan."}
                      </p>
                    </div>
                    <span
                      className="item-meta"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {formatActivityDate(
                        activity.scheduled_at,
                        timezone,
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="dashboard-empty"
                style={{
                  border: "1px dashed var(--color-border)",
                  background: "var(--color-surface-muted)",
                }}
              >
                <h3
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Belum ada aktivitas terjadwal
                </h3>
                <p
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Setelah punya goal dan roadmap, aktivitas pilihanmu akan muncul di
                  sini.
                </p>
                <Link
                  className="text-link"
                  href="/goals"
                  style={{ color: "var(--color-accent)" }}
                >
                  Tetap di ringkasan
                </Link>
              </div>
            )}
          </Card>
        </section>

        {/* === PRIORITAS 4: Aktivitas dan Roadmap yang Perlu Dilanjutkan === */}
        <section className="dashboard-grid" style={{ gap: "1rem" }}>
          <Card
            className="dashboard-panel dashboard-panel--wide"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <div
              className="panel-heading"
              style={{
                gap: "1rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <p className="panel-kicker" style={{ color: "var(--color-accent)" }}>
                  Langkah berikutnya
                </p>
                <h2 className="section-title" style={{ color: "var(--color-text-primary)" }}>
                  Aktivitas yang perlu dilanjutkan
                </h2>
              </div>
              <span className="panel-count" style={{ color: "var(--color-text-secondary)" }}>
                {plannedActivities.length} aktivitas
              </span>
            </div>
            {plannedActivities.length > 0 ? (
              <ul className="dashboard-list" style={{ gap: "0.75rem" }}>
                {plannedActivities.map((activity) => (
                  <li className="dashboard-list-item" key={activity.id} style={{ gap: "1rem" }}>
                    <div>
                      <h3 style={{ color: "var(--color-text-primary)", overflowWrap: "anywhere" }}>
                        {activity.title}
                      </h3>
                      <p style={{ color: "var(--color-text-secondary)", overflowWrap: "anywhere" }}>
                        {activity.description || "Tidak ada catatan tambahan."}
                      </p>
                    </div>
                    <span className="item-meta" style={{ color: "var(--color-text-secondary)" }}>
                      {formatActivityDate(activity.scheduled_at, timezone)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="dashboard-empty"
                style={{
                  border: "1px dashed var(--color-border)",
                  background: "var(--color-surface-muted)",
                }}
              >
                <h3 style={{ color: "var(--color-text-muted)" }}>Belum ada aktivitas mendatang</h3>
                <p style={{ color: "var(--color-text-secondary)" }}>
                  Saat kamu menjadwalkan langkah dari goal, daftar ini akan membantumu lanjut.
                </p>
                <Link className="text-link" href="/daily" style={{ color: "var(--color-accent)" }}>
                  Lihat daily plan
                </Link>
              </div>
            )}
          </Card>
        </section>

        {/* === PRIORITAS 2 & 5: Progress + Habit Konsistensi === */}
        <section className="dashboard-grid" style={{ gap: "1rem" }}>
          <Card
            className="dashboard-panel"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <div
              className="panel-heading"
              style={{
                gap: "1rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <p
                  className="panel-kicker"
                  style={{ color: "var(--color-accent)" }}
                >
                  Goal aktif
                </p>
                <h2
                  className="section-title"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Arahmu
                </h2>
              </div>
              <span
                className="panel-count"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {activeGoals.length} goal
              </span>
            </div>
            {activeGoals.length > 0 ? (
              <ul
                className="dashboard-list dashboard-list--compact"
                style={{ gap: "0.5rem" }}
              >
                {activeGoals.map((goal) => (
                  <li
                    className="dashboard-list-item"
                    key={goal.id}
                    style={{ gap: "0.75rem" }}
                  >
                    <div>
                      <h3
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {goal.title}
                      </h3>
                      <p
                        style={{
                          color: "var(--color-text-secondary)",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {goal.description || goal.category || "Goal aktif"}
                      </p>
                      {goal.target_date && (
                        <span
                          className="item-meta"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Target {goal.target_date}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="dashboard-empty"
                style={{
                  padding: "1rem",
                  textAlign: "center",
                }}
              >
                <h3
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Belum ada goal
                </h3>
                <p
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Mulai dari satu arah yang terasa penting bagimu.
                </p>
                <Link
                  className="button button--secondary"
                  href="/goals"
                  style={{
                    marginTop: "0.5rem",
                    background: "var(--color-secondary)",
                    color: "var(--color-secondary-foreground)",
                  }}
                >
                  Buat goal pertama
                </Link>
              </div>
            )}
          </Card>

          <Card
            className="dashboard-panel"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <div
              className="panel-heading"
              style={{
                gap: "1rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <p
                  className="panel-kicker"
                  style={{ color: "var(--color-accent)" }}
                >
                  Habit aktif
                </p>
                <h2
                  className="section-title"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Jalankannya
                </h2>
              </div>
              <span
                className="panel-count"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {activeHabitsList.length} habit
              </span>
            </div>
            {activeHabitsList.length > 0 ? (
              <ul
                className="dashboard-list"
                style={{ gap: "0.75rem" }}
              >
                {activeHabitsList.map((habit) => (
                  <li
                    className="dashboard-list-item"
                    key={habit.id}
                    style={{ gap: "0.75rem" }}
                  >
                    <div>
                      <strong
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {habit.name}
                      </strong>
                      <p
                        style={{
                          color: "var(--color-text-secondary)",
                          overflowWrap: "anywhere",
                          fontSize: "0.875rem",
                        }}
                      >
                        {habit.description || "Tetap konsisten"}
                      </p>
                    </div>
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.75rem",
                      }}
                    >
                      Konsisten: {habitConsistency}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div
                className="dashboard-empty"
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                }}
              >
                <h3>Belum ada habit</h3>
                <p>
                  Mulai dengan satu kebiasaan kecil yang bisa kamu lakukan setiap
                  hari.
                </p>
              </div>
            )}
          </Card>
        </section>

        {/* === PRIORITAS 6: Akses Cepat ke Fitur yang Relevan === */}
        <section
          className="dashboard-grid"
          style={{ gap: "0.75rem", marginTop: "1.5rem" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
              gap: "0.75rem",
            }}
          >
            <Link
              className="button button--secondary button--full"
              href="/goals"
              style={{
                background: "var(--color-secondary)",
                color: "var(--color-secondary-foreground)",
              }}
            >
              Goal
            </Link>
            <Link
              className="button button--secondary button--full"
              href="/daily"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-accent-foreground)",
              }}
            >
              Daily
            </Link>
            <Link
              className="button button--secondary button--full"
              href="/habits"
              style={{
                background: "var(--color-success)",
                color: "var(--color-success-foreground)",
              }}
            >
              Habit
            </Link>
            <Link
              className="button button--secondary button--full"
              href="/profile"
              style={{
                background: "var(--color-surface)",
                color: "var(--color-text-primary)",
              }}
            >
              Profil
            </Link>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}