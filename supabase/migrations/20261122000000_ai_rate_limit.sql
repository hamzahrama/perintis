create table public.assistant_rate_limits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0)
);

alter table public.assistant_rate_limits enable row level security;
revoke all on public.assistant_rate_limits from anon, authenticated;

create or replace function public.consume_assistant_rate_limit(
  p_user_id uuid,
  p_limit integer,
  p_window_seconds integer
) returns table (allowed boolean, retry_after integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  current_row public.assistant_rate_limits%rowtype;
  elapsed integer;
begin
  if p_user_id is null or p_user_id <> (select auth.uid()) then
    return query select false, p_window_seconds;
    return;
  end if;

  insert into public.assistant_rate_limits (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into current_row
  from public.assistant_rate_limits
  where user_id = p_user_id
  for update;

  elapsed := greatest(0, floor(extract(epoch from (now() - current_row.window_started_at)))::integer);
  if elapsed >= p_window_seconds then
    update public.assistant_rate_limits
    set window_started_at = now(), request_count = 1
    where user_id = p_user_id;
    return query select true, 0;
  elsif current_row.request_count < p_limit then
    update public.assistant_rate_limits
    set request_count = request_count + 1
    where user_id = p_user_id;
    return query select true, p_window_seconds - elapsed;
  else
    return query select false, p_window_seconds - elapsed;
  end if;
end;
$$;

revoke execute on function public.consume_assistant_rate_limit(uuid, integer, integer) from public, anon;
grant execute on function public.consume_assistant_rate_limit(uuid, integer, integer) to authenticated;
