"use client";

import { useActionState } from "react";
import { markNotificationReadAction } from "@/app/reminders/actions";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  scheduled_for: string;
};

function MarkReadButton({ notificationId }: { notificationId: string }) {
  const [state, action, pending] = useActionState(markNotificationReadAction, {});
  return (
    <form action={action}>
      <input type="hidden" name="notificationId" value={notificationId} />
      {state.error && <p style={{ color: "var(--color-error)", fontSize: "0.75rem", margin: "0.25rem 0 0" }}>{state.error}</p>}
      <button className="button button--ghost button--small" disabled={pending} type="submit">
        {pending ? "Menandai..." : "Tutup"}
      </button>
    </form>
  );
}

export function RemindersNotification({ notifications }: { notifications: Notification[] }) {
  if (notifications.length === 0) return null;

  return (
    <div className="reminders-notification" role="status">
      <div className="reminders-header">
        <h3>Reminder Aktif</h3>
        <span className="reminders-count">{notifications.length}</span>
      </div>
      <ul className="reminders-list">
        {notifications.map((item) => (
          <li key={item.id} className="reminder-item">
            <div className="reminder-content">
              <strong>{item.title}</strong>
              <p>{item.body ?? "Waktunya menjalankan langkah kecilmu."}</p>
            </div>
            <MarkReadButton notificationId={item.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
