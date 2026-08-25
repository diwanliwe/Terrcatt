-- Qualification from onboarding, promoted to real columns on participants so
-- the research team can filter/segment without digging into the jsonb.
-- Filled by upsert_participant from the snapshot on every sync.

alter table public.participants
  add column if not exists roles          text[],
  add column if not exists territory_link text,
  add column if not exists source         text,
  add column if not exists onboarded_at   timestamptz;

create or replace function public.upsert_participant(
  p_user_id uuid,
  p_secret text,
  p_schema_version integer,
  p_snapshot jsonb
) returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  existing_hash text;
  v_roles text[];
  v_territory text;
  v_source text;
  v_onboarded timestamptz;
begin
  if p_user_id is null or p_secret is null or length(p_secret) < 16 then
    raise exception 'invalid participant';
  end if;

  select array_agg(x) into v_roles
    from jsonb_array_elements_text(coalesce(p_snapshot->'profile'->'roles', '[]'::jsonb)) x;
  v_territory := p_snapshot->'profile'->>'territoryLink';
  v_source    := p_snapshot->'profile'->>'source';
  v_onboarded := case
    when p_snapshot->>'onboardingCompletedAt' is not null
    then to_timestamp((p_snapshot->>'onboardingCompletedAt')::bigint / 1000.0)
  end;

  select secret_hash into existing_hash from participants where user_id = p_user_id;

  if existing_hash is null then
    insert into participants (user_id, secret_hash, schema_version, snapshot,
                              roles, territory_link, source, onboarded_at)
    values (p_user_id, crypt(p_secret, gen_salt('bf')), p_schema_version, p_snapshot,
            v_roles, v_territory, v_source, v_onboarded);
  elsif existing_hash = crypt(p_secret, existing_hash) then
    update participants
       set schema_version = p_schema_version,
           snapshot = p_snapshot,
           roles = v_roles,
           territory_link = v_territory,
           source = v_source,
           onboarded_at = v_onboarded,
           updated_at = now()
     where user_id = p_user_id;
  else
    raise exception 'not owner';
  end if;
end;
$$;
