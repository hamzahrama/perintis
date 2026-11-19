import { createSupabaseServerClient } from "./supabase/server";

export async function getUserTimezone(userId: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("timezone")
    .eq("user_id", userId)
    .maybeSingle();

  const timezone = preferences?.timezone ?? "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format();
    return timezone;
  } catch {
    return "UTC";
  }
}

// Instant UTC untuk tengah malam tanggal lokal (YYYY-MM-DD) di timezone user.
export function zonedDateToUtc(date: string, timezone: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const guess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(guess)
      .map((p) => [p.type, p.value]),
  );
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return new Date(guess.getTime() - (asUTC - guess.getTime())).toISOString();
}

// Tanggal lokal (YYYY-MM-DD) dari instant UTC di timezone user.
export function utcToZonedDate(instant: string | Date, timezone: string): string {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatForDisplay(date: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timezone,
    }).format(new Date(date));
  } catch {
    return date;
  }
}
