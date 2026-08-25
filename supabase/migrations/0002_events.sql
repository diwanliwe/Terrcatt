-- One row per interaction event (vote, swipe, comparison, run start, ...),
-- for every participant.
-- Relational mirror of snapshot->'events' so research queries are plain SQL.
-- Append-only and idempotent: idx is the event's position in the device's
-- local log, so re-sending the whole log after a retry can never duplicate.

create table if not exists public.events (
  user_id  uuid not null references public.participants(user_id) on delete cascade,
  idx      integer not null,
  run      integer not null,
  type     text not null,
  card_id  integer,
  value    integer,
  other_id integer,
  at       timestamptz not null,
  primary key (user_id, idx)
);

alter table public.events enable row level security;
-- No policies: anon can neither read nor write directly; writes go through the
-- RPC below, reads are for the research team via dashboard / service role.

create or replace function public.append_events(
  p_user_id uuid,
  p_secret text,
  p_events jsonb
) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  existing_hash text;
begin
  select secret_hash into existing_hash from participants where user_id = p_user_id;
  if existing_hash is null or existing_hash <> crypt(p_secret, existing_hash) then
    raise exception 'not owner';
  end if;

  insert into events (user_id, idx, run, type, card_id, value, other_id, at)
  select p_user_id,
         (e.value->>'idx')::int,
         coalesce((e.value->>'run')::int, 1),
         e.value->>'type',
         (e.value->>'cardId')::int,
         (e.value->>'value')::int,
         (e.value->>'otherId')::int,
         to_timestamp(((e.value->>'at')::bigint) / 1000.0)
  from jsonb_array_elements(p_events) e
  on conflict (user_id, idx) do nothing;
end;
$$;

revoke all on function public.append_events(uuid, text, jsonb) from public;
grant execute on function public.append_events(uuid, text, jsonb) to anon;
