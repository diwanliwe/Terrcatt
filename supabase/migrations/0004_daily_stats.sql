-- Daily usage summary + keep-alive, entirely inside Supabase.
--
-- Two goals:
--   1. A `daily_stats` row per day (participants, events, ratings...) so usage
--      can be read at a glance without touching the raw tables.
--   2. Keep the Free-plan project from being paused. Supabase pauses a project
--      after ~7 days without API requests, and a paused project also stops
--      pg_cron. Database-only activity does NOT count, so the daily job also
--      sends one HTTP request to this project's own REST API through pg_net,
--      which goes through the API gateway and resets the inactivity timer.
--
-- One-time setup after applying this migration (SQL editor, as postgres):
--   select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<publishable or anon key>', 'anon_key');
-- That key is the public one already bundled in the app (EXPO_PUBLIC_SUPABASE_*). Without these two
-- secrets the stats still run; only the keep-alive request is skipped (a notice
-- is raised in the cron job's log).

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- Table: one row per day, written by the cron job. RLS on, no policies: only
-- the dashboard / service role can read it.
-- ---------------------------------------------------------------------------
create table if not exists public.daily_stats (
  day                  date primary key,
  participants_total   integer not null,  -- rows in participants at run time
  participants_new     integer not null,  -- created that day
  onboarded_total      integer not null,  -- participants who finished the qualification
  participants_active  integer not null,  -- distinct participants with at least one event that day
  events_new           integer not null,  -- events that day
  events_total         integer not null,
  ratings_new          integer not null,  -- 'rate' events that day
  runs_started_new     integer not null,  -- « Recommencer » that day
  new_by_role          jsonb   not null,  -- {"owner": 2, "researcher": 1, ...} for new participants
  new_by_source        jsonb   not null,  -- {"word-of-mouth": 3, ...}
  computed_at          timestamptz not null default now()
);
alter table public.daily_stats enable row level security;

-- ---------------------------------------------------------------------------
-- Stats for one day (default: yesterday, since the job runs just after
-- midnight UTC). Re-running for the same day overwrites the row.
-- ---------------------------------------------------------------------------
create or replace function public.record_daily_stats(p_day date default (current_date - 1))
returns public.daily_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  d_start timestamptz := p_day::timestamptz;
  d_end   timestamptz := (p_day + 1)::timestamptz;
  result  public.daily_stats;
begin
  insert into daily_stats as s (
    day, participants_total, participants_new, onboarded_total, participants_active,
    events_new, events_total, ratings_new, runs_started_new, new_by_role, new_by_source
  )
  select
    p_day,
    (select count(*) from participants),
    (select count(*) from participants where created_at >= d_start and created_at < d_end),
    (select count(*) from participants where onboarded_at is not null),
    (select count(distinct user_id) from events where at >= d_start and at < d_end),
    (select count(*) from events where at >= d_start and at < d_end),
    (select count(*) from events),
    (select count(*) from events where type = 'rate' and at >= d_start and at < d_end),
    (select count(*) from events where type = 'run'  and at >= d_start and at < d_end),
    coalesce((
      select jsonb_object_agg(r_role, n) from (
        select unnest(roles) as r_role, count(*) as n
        from participants
        where created_at >= d_start and created_at < d_end and roles is not null
        group by 1
      ) r
    ), '{}'::jsonb),
    coalesce((
      select jsonb_object_agg(source, n) from (
        select source, count(*) as n
        from participants
        where created_at >= d_start and created_at < d_end and source is not null
        group by 1
      ) r
    ), '{}'::jsonb)
  on conflict (day) do update set
    participants_total  = excluded.participants_total,
    participants_new    = excluded.participants_new,
    onboarded_total     = excluded.onboarded_total,
    participants_active = excluded.participants_active,
    events_new          = excluded.events_new,
    events_total        = excluded.events_total,
    ratings_new         = excluded.ratings_new,
    runs_started_new    = excluded.runs_started_new,
    new_by_role         = excluded.new_by_role,
    new_by_source       = excluded.new_by_source,
    computed_at         = now()
  returning * into result;
  return result;
end;
$$;
revoke all on function public.record_daily_stats(date) from public;

-- ---------------------------------------------------------------------------
-- Keep-alive: one GET to this project's REST root, authenticated with the
-- public anon key. Both values come from Vault (see header).
-- ---------------------------------------------------------------------------
create or replace function public.keep_alive()
returns void
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_url text;
  v_key text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'anon_key';
  if v_url is null or v_key is null then
    raise notice 'keep_alive skipped: vault secrets project_url / anon_key are missing';
    return;
  end if;
  perform net.http_get(
    url := rtrim(v_url, '/') || '/rest/v1/',
    headers := jsonb_build_object('apikey', v_key)
  );
end;
$$;
revoke all on function public.keep_alive() from public;

-- ---------------------------------------------------------------------------
-- Schedule: every day at 00:15 UTC. Idempotent.
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from cron.job where jobname = 'terrcatt-daily') then
    perform cron.unschedule('terrcatt-daily');
  end if;
  perform cron.schedule(
    'terrcatt-daily',
    '15 0 * * *',
    $job$ select public.record_daily_stats(); select public.keep_alive(); $job$
  );
end;
$$;
