import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { DashboardShell } from "@/components/dashboard-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOnboardingStatus } from "@/lib/onboarding";
import { getUserTimezone, getMonthRange, getTodayLocalString, utcToLocalDate } from "@/lib/timezone";
import CalendarToolbar from "./Toolbar";

function monthKeyOf(year: number, monthIndex: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; date?: string }> }) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  const timezone = await getUserTimezone(user.id);
  const { completed } = await getOnboardingStatus();
  if (!completed) redirect("/onboarding");

  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(params.month ?? "");
  const nowLocal = getTodayLocalString(timezone);
  const year = match ? Number(match[1]) : Number(nowLocal.slice(0, 4));
  const monthIndex = match ? Number(match[2]) - 1 : Number(nowLocal.slice(5, 7)) - 1;

  const monthKey = monthKeyOf(year, monthIndex);
  const { start, end } = getMonthRange(year, monthIndex, timezone);
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const selectedDate = new RegExp(`^${monthKey}-(0[1-9]|[12]\\d|3[01])$`).test(params.date ?? "")
    && Number(params.date!.slice(-2)) <= lastDay
    ? params.date!
    : null;

  const [{ data: preferences }, { data: activities }, { data: habits }, { data: logs }] = await Promise.all([
    supabase.from("user_preferences").select("theme").eq("user_id", user.id).maybeSingle(),
    supabase.from("activities").select("id, title, scheduled_at, status").eq("user_id", user.id).gte("scheduled_at", start).lt("scheduled_at", end).order("scheduled_at"),
    supabase.from("habits").select("id, name").eq("user_id", user.id).eq("is_active", true),
    supabase.from("habit_logs").select("id, habit_id, log_date, note").eq("user_id", user.id).gte("log_date", `${monthKey}-01`).lte("log_date", `${monthKey}-${String(lastDay).padStart(2, "0")}`).order("log_date"),
  ]);
  if (!preferences) throw new Error("Preferensi pengguna tidak ditemukan.");

  const first = new Date(Date.UTC(year, monthIndex, 1));
  const offset = (first.getUTCDay() + 6) % 7;
  const previousYear = monthIndex === 0 ? year - 1 : year;
  const previousMonth = monthIndex === 0 ? 11 : monthIndex - 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const previousKey = monthKeyOf(previousYear, previousMonth);
  const nextKey = monthKeyOf(nextYear, nextMonthIndex);
  const dates = Array.from({ length: offset + lastDay }, (_, index) => index - offset + 1);

  const activityDays = new Set(
    (activities ?? []).map((a) => (a.scheduled_at ? utcToLocalDate(a.scheduled_at, timezone) : null)).filter(Boolean),
  );
  const logDays = new Set((logs ?? []).map((log) => log.log_date));

  const itemsForDate = selectedDate ? [
    ...(activities ?? [])
      .filter((a) => a.scheduled_at && utcToLocalDate(a.scheduled_at, timezone) === selectedDate)
      .map((a) => ({ id: a.id, title: a.title, kind: "Aktivitas", status: a.status })),
    ...(logs ?? [])
      .filter((log) => log.log_date === selectedDate)
      .map((log) => ({ id: log.id, title: habits?.find((h) => h.id === log.habit_id)?.name ?? "Habit", kind: "Habit selesai", status: log.note ?? "" })),
  ] : [];

  return (
    <DashboardShell initialTheme={preferences.theme} activePath="/calendar">
      <div className="dashboard-content calendar-page">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Calendar View</p>
            <h1 className="page-title">Kalendarmu</h1>
            <p className="dashboard-intro">Lihat aktivitas terjadwal dan habit yang tercatat.</p>
          </div>
        </header>

        <Card className="goals-create-card">
          <div className="calendar-toolbar flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Link className="button button--secondary" href={`/calendar?month=${previousKey}`}>Bulan sebelumnya</Link>
              <h2>{new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: timezone }).format(first)}</h2>
              <Link className="button button--secondary" href={`/calendar?month=${nextKey}`}>Bulan berikutnya</Link>
            </div>
            <CalendarToolbar monthKey={monthKey} selectedDate={selectedDate} todayDate={nowLocal} />
          </div>
          <div className="calendar-grid" role="grid" aria-label="Kalender bulanan">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => (
              <div className="calendar-weekday" key={day}>{day}</div>
            ))}
            {dates.map((day, index) =>
              day < 1 || day > lastDay ? (
                <div className="calendar-cell calendar-cell--empty" key={`e-${index}`} />
              ) : (
                <Link
                  key={day}
                  className={`calendar-cell${selectedDate === `${monthKey}-${String(day).padStart(2, "0")}` ? " calendar-cell--selected" : ""}`}
                  href={`/calendar?month=${monthKey}&date=${monthKey}-${String(day).padStart(2, "0")}`}
                >
                  <span>{day}</span>
                  {(activityDays.has(`${monthKey}-${String(day).padStart(2, "0")}`) || logDays.has(`${monthKey}-${String(day).padStart(2, "0")}`)) && (
                    <span className="calendar-dot" aria-label="Ada item" />
                  )}
                </Link>
              )
            )}
          </div>
        </Card>

        {selectedDate && (
          <section className="goals-section">
            <h2 className="section-title">Item tanggal {selectedDate}</h2>
            {itemsForDate.length ? (
              <ul className="activity-list">
                {itemsForDate.map((item) => (
                  <li className="activity-card" key={`${item.kind}-${item.id}`}>
                    <div className="activity-content">
                      <span className="eyebrow">{item.kind}</span>
                      <h3>{item.title}</h3>
                      <p>{item.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="dashboard-empty">
                <h3>Tidak ada item</h3>
                <p>Belum ada aktivitas atau log habit untuk tanggal ini.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </DashboardShell>
  );
}