import { createSupabaseServerClient } from "./supabase/server";

/**
 * Validasi timezone IANA.
 * Return timezone yang valid atau "UTC" sebagai fallback.
 */
export function validateTimezone(timezone: string | null | undefined): string {
  const tz = timezone ?? "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz }).format();
    return tz;
  } catch {
    return "UTC";
  }
}

/**
 * Ambil timezone user dari database.
 */
export async function getUserTimezone(userId: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("timezone")
    .eq("user_id", userId)
    .maybeSingle();

  return validateTimezone(preferences?.timezone);
}

/**
 * Helper internal: ambil bagian tanggal/waktu dalam timezone tertentu.
 * Menggunakan formatToParts untuk akurasi DST.
 */
function getPartsInTimezone(date: Date, timezone: string, options: Intl.DateTimeFormatOptions = {}): Record<string, string> {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    ...options,
  };
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-US", defaultOptions)
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
}

/**
 * Konversi tanggal lokal (YYYY-MM-DD) ke UTC start of day (00:00:00.000Z).
 * Input: "2026-11-22", "Asia/Jakarta"
 * Output: "2026-11-21T17:00:00.000Z" (contoh)
 */
function assertLocalDate(value: string): [number, number, number] {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error(`Format tanggal tidak valid: ${value}`);
  const [year, month, day] = match.slice(1).map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error(`Tanggal tidak valid: ${value}`);
  }
  return [year, month, day];
}

function localFieldsToUtc(year: number, month: number, day: number, hour: number, minute: number, second: number, millisecond: number, timezone: string): string {
  const tz = validateTimezone(timezone);
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
  const parts = getPartsInTimezone(guess, tz);
  const asUTC = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second), millisecond);
  return new Date(guess.getTime() - (asUTC - guess.getTime())).toISOString();
}

export function localDateToUtcStart(date: string, timezone: string): string {
  const [year, month, day] = assertLocalDate(date);
  return localFieldsToUtc(year, month, day, 0, 0, 0, 0, timezone);
}

/**
 * Konversi tanggal lokal (YYYY-MM-DD) ke UTC end of day (23:59:59.999Z).
 */
export function localDateToUtcEnd(date: string, timezone: string): string {
  const [year, month, day] = assertLocalDate(date);
  return localFieldsToUtc(year, month, day, 23, 59, 59, 999, timezone);
}

/**
 * Konversi datetime lokal (ISO string atau Date) ke UTC.
 * Input bisa "2026-11-22T10:30:00" (tanpa Z) atau Date object.
 */
export function localDateTimeToUtc(localDateTime: string | Date, timezone: string): string {
  if (localDateTime instanceof Date) {
    if (Number.isNaN(localDateTime.getTime())) throw new Error(`Datetime tidak valid: ${localDateTime}`);
    return localDateTime.toISOString();
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(localDateTime);
  if (!match) throw new Error(`Datetime tidak valid: ${localDateTime}`);
  const [year, month, day] = assertLocalDate(`${match[1]}-${match[2]}-${match[3]}`);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");
  const millisecond = Number((match[7] ?? "").padEnd(3, "0") || "0");
  if (hour > 23 || minute > 59 || second > 59) throw new Error(`Datetime tidak valid: ${localDateTime}`);
  return localFieldsToUtc(year, month, day, hour, minute, second, millisecond, timezone);
}

/**
 * Konversi instant UTC (ISO string atau Date) ke tanggal lokal (YYYY-MM-DD).
 */
export function utcToLocalDate(instant: string | Date, timezone: string): string {
  const tz = validateTimezone(timezone);
  const date = typeof instant === "string" ? new Date(instant) : instant;
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Instant tidak valid: ${instant}`);
  }
  const parts = getPartsInTimezone(date, tz, { hour: undefined, minute: undefined, second: undefined });
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Konversi instant UTC ke datetime lokal lengkap untuk display.
 */
export function utcToLocalDateTime(instant: string | Date, timezone: string): string {
  const tz = validateTimezone(timezone);
  const date = typeof instant === "string" ? new Date(instant) : instant;
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Instant tidak valid: ${instant}`);
  }
  const parts = getPartsInTimezone(date, tz);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
}

/**
 * Dapatkan start/end of month dalam timezone user.
 * Return ISO string UTC untuk query database.
 */
export function getMonthRange(year: number, monthIndex: number, timezone: string): { start: string; end: string } {
  const tz = validateTimezone(timezone);
  // Start: 1 hari bulan ini 00:00
  const start = localDateToUtcStart(`${year}-${String(monthIndex + 1).padStart(2, "0")}-01`, tz);
  // End: 1 hari bulan depan 00:00 (eksklusif)
  const nextMonth = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  const end = localDateToUtcStart(`${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-01`, tz);
  return { start, end };
}

/**
 * Dapatkan start/end of week (Senin-Minggu) dalam timezone user.
 * Input: Date object (biasanya now) dan timezone.
 * Return ISO string UTC untuk query database.
 */
export function getWeekRange(date: Date, timezone: string): { start: string; end: string; mondayKey: string; sundayKey: string } {
  const tz = validateTimezone(timezone);
  // Dapatkan tanggal lokal hari ini
  const todayLocal = utcToLocalDate(date, tz);
  const [y, m, d] = todayLocal.split("-").map(Number);
  const today = new Date(Date.UTC(y, m - 1, d));

  const day = today.getUTCDay(); // 0 = Minggu
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);

  const mondayKey = `${monday.getUTCFullYear()}-${String(monday.getUTCMonth() + 1).padStart(2, "0")}-${String(monday.getUTCDate()).padStart(2, "0")}`;
  const sundayKey = `${sunday.getUTCFullYear()}-${String(sunday.getUTCMonth() + 1).padStart(2, "0")}-${String(sunday.getUTCDate()).padStart(2, "0")}`;

  const start = localDateToUtcStart(mondayKey, tz);
  const end = localDateToUtcEnd(sundayKey, tz);

  return { start, end, mondayKey, sundayKey };
}

/**
 * Format date untuk display dalam timezone user.
 * Input: ISO string UTC dari database.
 */
export function formatForDisplay(date: string, timezone: string): string {
  try {
    const tz = validateTimezone(timezone);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: tz,
    }).format(new Date(date));
  } catch {
    return date;
  }
}

/**
 * Format date-only untuk display (tanpa waktu).
 */
export function formatDateOnly(date: string, timezone: string): string {
  try {
    const tz = validateTimezone(timezone);
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeZone: tz,
    }).format(new Date(date));
  } catch {
    return date;
  }
}

/**
 * Helper untuk client-side: dapatkan tanggal lokal hari ini sebagai YYYY-MM-DD.
 * Digunakan di form default value.
 */
export function getTodayLocalString(timezone: string): string {
  const tz = validateTimezone(timezone);
  const now = new Date();
  const parts = getPartsInTimezone(now, tz, { hour: undefined, minute: undefined, second: undefined });
  return `${parts.year}-${parts.month}-${parts.day}`;
}