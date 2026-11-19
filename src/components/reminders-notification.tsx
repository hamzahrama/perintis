"use client";

import { useState } from "react";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  scheduled_for: string;
};

export function RemindersNotification({ notifications }: { notifications: Notification[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const visible = notifications.filter((item) => !dismissed.has(item.id));
  if (visible.length === 0) return null;

  return (
    <div className="reminders-notification" role="status">
      <div className="reminders-header">
        <h3>Reminder Aktif</h3>
        <span className="reminders-count">{visible.length}</span>
      </div>
      <ul className="reminders-list">
        {visible.map((item) => (
          <li key={item.id} className="reminder-item">
            <div className="reminder-content">
              <strong>{item.title}</strong>
              <p>{item.body ?? "Waktunya menjalankan langkah kecilmu."}</p>
            </div>
            <button
              className="button button--ghost button--small"
              onClick={() => setDismissed((current) => new Set(current).add(item.id))}
              type="button"
            >
              Tutup
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
