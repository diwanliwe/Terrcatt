-- Participants: one row per anonymous participant (local UUID), holding the
-- latest full snapshot of their local state. Idempotent, last-write-wins.
--
-- Ownership without accounts: each device also mints a random secret at first
-- launch. Its hash is stored on first insert; later writes must present the
-- same secret. Someone holding only the public anon key can therefore create
-- rows but cannot overwrite another participant's data.

create extension if not exists pgcrypto;

create table if not exists public.participants (
  user_id        uuid primary key,
  secret_hash    text not null,
  schema_version integer not null,
  snapshot       jsonb not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.participants enable row level security;
-- No policies on purpose: the anon role can neither read nor write the table
-- directly. All writes go through the RPC below; reads are for the research
-- team via the dashboard / service role.

create or replace function public.upsert_participant(
  p_user_id uuid,
  p_secret text,
  p_schema_version integer,
  p_snapshot jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_hash text;
begin
  if p_user_id is null or p_secret is null or length(p_secret) < 16 then
    raise exception 'invalid participant';
  end if;

  select secret_hash into existing_hash from participants where user_id = p_user_id;

  if existing_hash is null then
    insert into participants (user_id, secret_hash, schema_version, snapshot)
    values (p_user_id, crypt(p_secret, gen_salt('bf')), p_schema_version, p_snapshot);
  elsif existing_hash = crypt(p_secret, existing_hash) then
    update participants
       set schema_version = p_schema_version,
           snapshot = p_snapshot,
           updated_at = now()
     where user_id = p_user_id;
  else
    raise exception 'not owner';
  end if;
end;
$$;

revoke all on function public.upsert_participant(uuid, text, integer, jsonb) from public;
grant execute on function public.upsert_participant(uuid, text, integer, jsonb) to anon;

-- GDPR erasure: the device that owns the row can delete it ("Supprimer mes données").
create or replace function public.delete_participant(p_user_id uuid, p_secret text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from participants
   where user_id = p_user_id
     and secret_hash = crypt(p_secret, secret_hash);
end;
$$;

revoke all on function public.delete_participant(uuid, text) from public;
grant execute on function public.delete_participant(uuid, text) to anon;
