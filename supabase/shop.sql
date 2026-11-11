-- IVAN shop backend, part 2 (applied to the Supabase project already).
-- Orders and payments tables came from the earlier "orders_and_payments" migration:
--   orders(id, reference, customer_name, email, phone, address, city, state, notes, items jsonb,
--          subtotal, shipping, total, currency, status, payment_status, paid_at, created_at)
--   payments(id, order_id, provider, reference, amount, currency, status, raw, created_at)
-- Orders are created ONLY by the server (service role) so prices can never be tampered with in the browser.
-- This file adds: friendly order numbers, staff notifications, and the automatic chat welcome message.

alter table public.orders add column if not exists order_no bigint generated always as identity (start with 1001);
create unique index if not exists orders_order_no_key on public.orders (order_no);
create index if not exists messages_thread_id_idx on public.messages (thread_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('order','payment','chat')),
  title text not null,
  body text not null default '',
  link text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_created_at_idx on public.notifications (created_at desc);
alter table public.notifications enable row level security;
create policy "staff read notifications" on public.notifications for select using (public.is_staff());
create policy "staff update notifications" on public.notifications for update using (public.is_staff()) with check (public.is_staff());

-- new order -> notification
create or replace function public.notify_new_order() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (kind, title, body, link)
  values ('order', 'New order #' || new.order_no, new.customer_name || ' · ₦' || to_char(new.total, 'FM999,999,999') || ' · awaiting payment', '/admin/orders');
  return new;
end $$;
create trigger on_order_created after insert on public.orders for each row execute function public.notify_new_order();

-- payment confirmed -> notification
create or replace function public.notify_payment() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (kind, title, body, link)
  values ('payment', 'Payment received · ₦' || to_char(new.total, 'FM999,999,999'), 'Order #' || new.order_no || ' from ' || new.customer_name || ' is paid', '/admin/payments');
  return new;
end $$;
create trigger on_order_paid after update of payment_status on public.orders
  for each row when (old.payment_status is distinct from 'paid' and new.payment_status = 'paid') execute function public.notify_payment();

-- chat: system messages have no sender; customer messages notify staff; first message triggers the welcome
alter table public.messages alter column sender_id drop not null;
alter table public.messages add column if not exists kind text not null default 'user';

create or replace function public.notify_new_chat() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.sender_id is not null and exists (select 1 from public.threads t where t.id = new.thread_id and t.customer_id = new.sender_id) then
    insert into public.notifications (kind, title, body, link)
    values ('chat', 'New message from Guest ' || upper(left(new.thread_id::text, 4)), left(new.body, 140), '/admin/inbox');
  end if;
  return new;
end $$;
create trigger on_chat_message after insert on public.messages for each row execute function public.notify_new_chat();

create or replace function public.send_welcome_message() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.sender_id is not null
     and exists (select 1 from public.threads t where t.id = new.thread_id and t.customer_id = new.sender_id)
     and (select count(*) from public.messages m where m.thread_id = new.thread_id) = 1 then
    insert into public.messages (thread_id, sender_id, body, kind, created_at)
    values (new.thread_id, null,
      'Welcome to IVAN 🖤 Thanks for reaching out! Every piece we make is custom, hand-finished and meant to be one of a kind, so tell us what you are looking for, whether that is a drop, your size, or a custom cap or kicks you have been dreaming up, and someone from the team will reply right here as soon as we can.',
      'welcome', now() + interval '1 second');
  end if;
  return new;
end $$;
create trigger on_first_message after insert on public.messages for each row execute function public.send_welcome_message();

revoke execute on function public.notify_new_order() from public, anon, authenticated;
revoke execute on function public.notify_payment() from public, anon, authenticated;
revoke execute on function public.notify_new_chat() from public, anon, authenticated;
revoke execute on function public.send_welcome_message() from public, anon, authenticated;
alter publication supabase_realtime add table public.notifications;
