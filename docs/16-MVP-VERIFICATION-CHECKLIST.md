# MVP Verification Checklist

Tanggal: 2026-11-19

| Area | Test | Hasil | Evidence / catatan |
|---|---|---|---|
| Build | `npm run lint` | PASS | Exit code 0 |
| Build | `npm run typecheck` | PASS | Exit code 0 |
| Build | `npm run build` | PASS | Exit code 0 |
| DB schema | `npx prisma validate` | PASS | Schema valid |
| Diff | `git diff --check` | PASS | Tidak ada whitespace error |
| Habit | Duplicate log protection | PASS | Code path tangani error 23505 (unique constraint) |
| Reminder | Read state persistence | PASS | MarkNotificationReadAction update read_at di DB |
| Timezone | Central helper stability | PASS | Helper local date/time + range teruji secara code |
| Coach | Navigation activePath | PASS | Fixed to /coach |
| API | Reflection endpoint | PASS | API route dihapus, pindah ke server action |

## Known limitations

- Manual browser smoke test belum dilakukan.
- Dua akun security test belum tersedia.
- Roadmap reorder memakai rollback kompensasi, bukan DB transaction/RPC; masih ada race window.
- Reminder diproses hanya ketika `/reminders` dibuka; tidak ada push/email/background delivery.
