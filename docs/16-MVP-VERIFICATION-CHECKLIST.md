# MVP Verification Checklist

Tanggal: 2026-11-19

| Area | Test | Hasil | Evidence / catatan |
|---|---|---|---|
| Build | `npm run lint` | PASS | Exit code 0 |
| Build | `npm run typecheck` | PASS | Exit code 0 |
| Build | `npm run build` | PASS | Exit code 0 |
| DB schema | `npx prisma validate` | PASS | Schema valid |
| Diff | `git diff --check` | PASS | Tidak ada whitespace error |
| Habit | Active/inactive toggle UI + ownership action | NOT TESTED | Browser/DB smoke belum tersedia |
| Habit | Duplicate log protection | NOT TESTED | Code path + DB unique constraint tersedia |
| Commitment | Edit, target ownership, deactivate | NOT TESTED | Browser/DB smoke belum tersedia |
| Reminder | Due check saat page open | NOT TESTED | Browser/DB smoke belum tersedia |
| Reminder | Idempotent notification insert | NOT TESTED | DB execution belum dilakukan |
| Timezone | Daily/calendar/review boundary | NOT TESTED | Perlu browser/device timezone nyata |
| Roadmap | Reorder failure/atomicity | NOT TESTED | Implementasi rollback defensif; transaction DB belum tersedia |
| E2E | Login sampai logout | BLOCKED | Playwright/browser install gagal |
| Security | Dua akun cross-user isolation | BLOCKED | Hanya satu akun demo; smoke DB belum tersedia |
| Demo | Local seed + login | BLOCKED | Supabase CLI/browser smoke tidak tersedia untuk verifikasi aktual |

## Known limitations

- Manual browser smoke test belum dilakukan.
- Dua akun security test belum tersedia.
- Roadmap reorder memakai rollback kompensasi, bukan DB transaction/RPC; masih ada race window.
- Reminder diproses hanya ketika `/reminders` dibuka; tidak ada push/email/background delivery.
