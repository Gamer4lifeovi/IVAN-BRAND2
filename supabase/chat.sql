-- IVAN customer chat: each customer can ONLY read/write their own thread.
-- Approved partners (rows in public.staff) can read/write all threads.
-- Enable "Anonymous sign-ins" in Supabase Auth so guests get a real user id.

create table public.staff (user_id uuid primary key references auth.users(id) on delete cascade);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.staff    enable row level security;
alter table public.threads  enable row level security;
alter table public.messages enable row level security;

create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.staff where user_id = auth.uid()) $$;

-- staff can read their own row (needed by the /admin gate)
create policy "staff reads self" on public.staff for select using (user_id = auth.uid());

-- threads
create policy "customer reads own thread" on public.threads for select using (customer_id = auth.uid() or public.is_staff());
create policy "customer creates own thread" on public.threads for insert with check (customer_id = auth.uid());

-- messages
create policy "read own thread messages" on public.messages for select using (
  public.is_staff() or exists (select 1 from public.threads t where t.id = thread_id and t.customer_id = auth.uid())
);
create policy "send into own thread" on public.messages for insert with check (
  sender_id = auth.uid() and (
    public.is_staff() or exists (select 1 from public.threads t where t.id = thread_id and t.customer_id = auth.uid())
  )
);

-- Live updates
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.threads;

-- AFTER creating you and your partner in Auth -> Users (email + password):
-- insert into public.staff (user_id) values ('YOUR-USER-ID'), ('PARTNER-USER-ID');
-- Or add staff by email after creating their Auth users:
-- insert into public.staff (user_id)
-- select id from auth.users where email in ('admin@example.com')
-- on conflict (user_id) do nothing;
