create table public.assistant_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Percakapan baru' check (length(btrim(title)) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.assistant_conversations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (length(btrim(content)) between 1 and 12000),
  created_at timestamptz not null default now(),
  foreign key (conversation_id, user_id) references public.assistant_conversations (id, user_id) on delete cascade
);

alter table public.assistant_conversations add constraint assistant_conversations_id_user_key unique (id, user_id);
create index assistant_conversations_user_updated_idx on public.assistant_conversations (user_id, updated_at desc);
create index assistant_messages_conversation_created_idx on public.assistant_messages (conversation_id, created_at);
create index assistant_messages_user_created_idx on public.assistant_messages (user_id, created_at desc);

alter table public.assistant_conversations enable row level security;
alter table public.assistant_messages enable row level security;
revoke all on public.assistant_conversations, public.assistant_messages from anon, authenticated;
grant select, insert, update, delete on public.assistant_conversations, public.assistant_messages to authenticated;

create policy "Users manage their assistant conversations"
  on public.assistant_conversations for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users manage their assistant messages"
  on public.assistant_messages for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
