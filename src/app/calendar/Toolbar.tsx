'use client';

import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";

/**
 * Toolbar for the Calendar page.
 * Provides:
 *   - Native date picker (input[type="date"]).
 *   - Month and year dropdowns.
 *   - "Hari Ini" button.
 *
 * All navigation is performed via Next.js router.replace to keep the URL in sync
 * with the query parameters used by the server component (month=YYYY-MM, date=YYYY-MM-DD).
 */
export default function CalendarToolbar({
  monthKey,
  selectedDate,
  todayDate,
}: {
  monthKey: string; // currently displayed month key "YYYY-MM"
  selectedDate: string | null; // currently selected date "YYYY-MM-DD" or null
  todayDate: string; // local today string "YYYY-MM-DD"
}) {
  const router = useRouter();

  // Helper to construct month key from year and month number (1‑12)
  const makeMonthKey = (year: number, month: number) =>
    `${year}-${String(month).padStart(2, "0")}`;

  // Extract current year/month from monthKey
  const currentYear = Number(monthKey.slice(0, 4));
  const currentMonth = Number(monthKey.slice(5, 7));

  // Build year options (2020‑2035) and ensure currentYear is present
  const startYear = 2020;
  const endYear = 2035;
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  if (!years.includes(currentYear)) years.push(currentYear);
  years.sort((a, b) => a - b);

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value; // format YYYY-MM-DD (local)
    if (!newDate) return;
    const newMonthKey = newDate.slice(0, 7);
    router.replace(`/calendar?month=${newMonthKey}&date=${newDate}`);
  };

  const handleMonthChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newMonth = Number(e.target.value); // 1‑12
    const newMonthKey = makeMonthKey(currentYear, newMonth);
    // Preserve selectedDate only if it belongs to the new month
    const dateParam = selectedDate && selectedDate.startsWith(newMonthKey)
      ? `&date=${selectedDate}`
      : "";
    router.replace(`/calendar?month=${newMonthKey}${dateParam}`);
  };

  const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newYear = Number(e.target.value);
    const newMonthKey = makeMonthKey(newYear, currentMonth);
    const dateParam = selectedDate && selectedDate.startsWith(newMonthKey)
      ? `&date=${selectedDate}`
      : "";
    router.replace(`/calendar?month=${newMonthKey}${dateParam}`);
  };

  const handleToday = () => {
    const todayMonthKey = todayDate.slice(0, 7);
    router.replace(`/calendar?month=${todayMonthKey}&date=${todayDate}`);
  };

  // Determine picker value:
  // If selectedDate is set, use it.
  // Otherwise, only default to todayDate if the currently viewed month is the same as today's month.
  // If viewing a different month with no selectedDate, leave empty so it doesn't display a mismatched date.
  const isViewingCurrentMonth = todayDate.startsWith(monthKey);
  const pickerValue = selectedDate ?? (isViewingCurrentMonth ? todayDate : "");

  return (
    <div className="calendar-toolbar-controls flex flex-wrap items-center gap-2">
      {/* Date picker */}
      <label className="sr-only" htmlFor="calendar-date-picker">
        Pilih tanggal
      </label>
      <input
        id="calendar-date-picker"
        type="date"
        className="field"
        value={pickerValue}
        onChange={handleDateChange}
      />

      {/* Month dropdown */}
      <label className="sr-only" htmlFor="calendar-month-select">
        Pilih bulan
      </label>
      <select
        id="calendar-month-select"
        className="field"
        value={currentMonth}
        onChange={handleMonthChange}
      >
        {months.map((name, idx) => (
          <option key={idx + 1} value={idx + 1}>
            {name}
          </option>
        ))}
      </select>

      {/* Year dropdown */}
      <label className="sr-only" htmlFor="calendar-year-select">
        Pilih tahun
      </label>
      <select
        id="calendar-year-select"
        className="field"
        value={currentYear}
        onChange={handleYearChange}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* Today button */}
      <button type="button" className="button button--secondary" onClick={handleToday}>
        Hari Ini
      </button>
    </div>
  );
}
