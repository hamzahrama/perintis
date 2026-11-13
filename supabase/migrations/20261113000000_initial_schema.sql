create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(btrim(full_name)) > 0),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  timezone text,
  theme text not null default 'dark' check (theme in ('dark', 'light')),
  reminder_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.onboarding_responses (
  user_id uuid primary key references auth.users (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  description text,
  category text,
  target_date date,
  status text not null default 'active' check (status in ('active', 'archived')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.goal_whys (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  statement text not null check (length(btrim(statement)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (goal_id),
  foreign key (goal_id, user_id)
    references public.goals (id, user_id) on delete cascade
);

create table public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (goal_id, user_id)
    references public.goals (id, user_id) on delete cascade
);

create unique index roadmaps_one_active_per_goal
  on public.roadmaps (goal_id)
  where status = 'active';

create table public.roadmap_steps (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  description text,
  position integer not null check (position >= 0),
  status text not null check (status in ('not_started', 'in_progress', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (roadmap_id, position),
  foreign key (roadmap_id, user_id)
    references public.roadmaps (id, user_id) on delete cascade
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  roadmap_step_id uuid,
  title text not null check (length(btrim(title)) > 0),
  description text,
  scheduled_at timestamptz,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'completed', 'rescheduled', 'skipped')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (roadmap_step_id, user_id)
    references public.roadmap_steps (id, user_id) on delete cascade
);

create table public.activity_status_events (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  from_status text
    check (from_status is null or from_status in ('not_started', 'in_progress', 'completed', 'rescheduled', 'skipped')),
  to_status text not null
    check (to_status in ('not_started', 'in_progress', 'completed', 'rescheduled', 'skipped')),
  previous_scheduled_at timestamptz,
  new_scheduled_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (activity_id, user_id)
    references public.activities (id, user_id) on delete cascade
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid,
  name text not null check (length(btrim(name)) > 0),
  description text,
  schedule jsonb not null default '{}'::jsonb check (jsonb_typeof(schedule) = 'object'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (goal_id, user_id)
    references public.goals (id, user_id) on delete cascade
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  note text,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date),
  foreign key (habit_id, user_id)
    references public.habits (id, user_id) on delete cascade
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  remind_at timestamptz not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (activity_id, user_id)
    references public.activities (id, user_id) on delete cascade
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reminder_id uuid not null,
  scheduled_for timestamptz not null,
  title text not null check (length(btrim(title)) > 0),
  body text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (reminder_id, scheduled_for),
  foreign key (reminder_id, user_id)
    references public.reminders (id, user_id) on delete cascade
);

create table public.daily_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  reflection_date date not null,
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, reflection_date)
);

create table public.commitments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_id uuid,
  goal_id uuid,
  description text not null check (length(btrim(description)) > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (activity_id is null or goal_id is null),
  foreign key (activity_id, user_id)
    references public.activities (id, user_id) on delete cascade,
  foreign key (goal_id, user_id)
    references public.goals (id, user_id) on delete cascade
);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (new.id, nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''));

  insert into public.user_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create index goals_user_status_idx on public.goals (user_id, status);
create index goal_whys_user_id_idx on public.goal_whys (user_id);
create index roadmaps_user_id_idx on public.roadmaps (user_id);
create index roadmaps_goal_user_idx on public.roadmaps (goal_id, user_id);
create index roadmap_steps_user_id_idx on public.roadmap_steps (user_id);
create index roadmap_steps_roadmap_user_idx on public.roadmap_steps (roadmap_id, user_id);
create index activities_user_status_idx on public.activities (user_id, status);
create index activities_user_scheduled_at_idx on public.activities (user_id, scheduled_at);
create index activities_step_user_idx on public.activities (roadmap_step_id, user_id);
create index activity_status_events_user_id_idx on public.activity_status_events (user_id);
create index activity_status_events_activity_id_idx on public.activity_status_events (activity_id);
create index habits_user_id_idx on public.habits (user_id);
create index habits_goal_user_id_idx on public.habits (goal_id, user_id);
create index habit_logs_user_date_idx on public.habit_logs (user_id, log_date);
create index habit_logs_habit_user_idx on public.habit_logs (habit_id, user_id);
create index reminders_user_due_idx on public.reminders (user_id, remind_at, is_enabled);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index notifications_reminder_user_idx on public.notifications (reminder_id, user_id);
create index daily_reflections_user_date_idx on public.daily_reflections (user_id, reflection_date);
create index commitments_user_id_idx on public.commitments (user_id);
create index commitments_activity_user_idx on public.commitments (activity_id, user_id);
create index commitments_goal_user_idx on public.commitments (goal_id, user_id);

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.onboarding_responses enable row level security;
alter table public.goals enable row level security;
alter table public.goal_whys enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_steps enable row level security;
alter table public.activities enable row level security;
alter table public.activity_status_events enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.reminders enable row level security;
alter table public.notifications enable row level security;
alter table public.daily_reflections enable row level security;
alter table public.commitments enable row level security;

revoke all on public.profiles, public.user_preferences, public.onboarding_responses,
  public.goals, public.goal_whys, public.roadmaps, public.roadmap_steps,
  public.activities, public.activity_status_events, public.habits, public.habit_logs,
  public.reminders, public.notifications, public.daily_reflections, public.commitments
  from anon, authenticated;

grant select, insert, update on public.profiles, public.user_preferences,
  public.onboarding_responses, public.goals, public.goal_whys, public.roadmaps,
  public.roadmap_steps, public.activities, public.habits, public.habit_logs,
  public.reminders, public.notifications, public.daily_reflections, public.commitments
  to authenticated;

grant select, insert on public.activity_status_events to authenticated;

create policy "Users read their profile"
  on public.profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their profile"
  on public.profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their profile"
  on public.profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their preferences"
  on public.user_preferences for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their preferences"
  on public.user_preferences for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their preferences"
  on public.user_preferences for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their onboarding responses"
  on public.onboarding_responses for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their onboarding responses"
  on public.onboarding_responses for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their onboarding responses"
  on public.onboarding_responses for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their goals"
  on public.goals for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their goals"
  on public.goals for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their goals"
  on public.goals for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their goal whys"
  on public.goal_whys for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their goal whys"
  on public.goal_whys for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their goal whys"
  on public.goal_whys for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their roadmaps"
  on public.roadmaps for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their roadmaps"
  on public.roadmaps for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their roadmaps"
  on public.roadmaps for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their roadmap steps"
  on public.roadmap_steps for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their roadmap steps"
  on public.roadmap_steps for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their roadmap steps"
  on public.roadmap_steps for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their activities"
  on public.activities for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their activities"
  on public.activities for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their activities"
  on public.activities for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their activity status events"
  on public.activity_status_events for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users append their activity status events"
  on public.activity_status_events for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users read their habits"
  on public.habits for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their habits"
  on public.habits for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their habits"
  on public.habits for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their habit logs"
  on public.habit_logs for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their habit logs"
  on public.habit_logs for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their habit logs"
  on public.habit_logs for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their reminders"
  on public.reminders for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their reminders"
  on public.reminders for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their reminders"
  on public.reminders for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their notifications"
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their notifications"
  on public.notifications for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their notifications"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their daily reflections"
  on public.daily_reflections for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their daily reflections"
  on public.daily_reflections for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their daily reflections"
  on public.daily_reflections for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read their commitments"
  on public.commitments for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Users insert their commitments"
  on public.commitments for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Users update their commitments"
  on public.commitments for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
