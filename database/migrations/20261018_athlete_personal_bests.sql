begin;

do $$
begin
  if to_regprocedure('public.is_approved_athlete_member()') is null
     or to_regprocedure('public.is_athlete_admin()') is null then
    raise exception 'Run the athlete account setup in database/supabase-setup.sql before adding personal bests.';
  end if;
end
$$;

create table if not exists public.athlete_personal_bests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  event text not null check (
    event in (
      '100m', '200m', '400m', '800m', '1500m', '5000m',
      '110m H', '400m H', '100m H',
      'Long Jump', 'Triple Jump', 'High Jump', 'Pole Vault',
      'Shot Put', 'Discus', 'Javelin', 'Hammer',
      '4×100m Relay', '4×400m Relay', '4×400m Mixed Relay'
    )
  ),
  performance text not null check (length(trim(performance)) between 1 and 50),
  achieved_on date,
  note text not null default '' check (length(note) <= 240),
  share_with_team boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists athlete_personal_bests_owner_created_idx
  on public.athlete_personal_bests (owner_user_id, created_at desc);
create index if not exists athlete_personal_bests_shared_created_idx
  on public.athlete_personal_bests (created_at desc)
  where share_with_team;

alter table public.athlete_personal_bests enable row level security;
revoke all on public.athlete_personal_bests from anon, authenticated;
grant select, insert, update, delete on public.athlete_personal_bests to authenticated;

drop policy if exists "Athletes can read their own or team-shared personal bests" on public.athlete_personal_bests;
create policy "Athletes can read their own or team-shared personal bests"
on public.athlete_personal_bests
for select
to authenticated
using (
  (select public.is_athlete_admin())
  or (
    (select public.is_approved_athlete_member())
    and (owner_user_id = (select auth.uid()) or share_with_team)
  )
);

drop policy if exists "Approved athletes can add their own personal bests" on public.athlete_personal_bests;
create policy "Approved athletes can add their own personal bests"
on public.athlete_personal_bests
for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and (select public.is_approved_athlete_member())
);

drop policy if exists "Athletes can update their own personal bests" on public.athlete_personal_bests;
create policy "Athletes can update their own personal bests"
on public.athlete_personal_bests
for update
to authenticated
using (
  owner_user_id = (select auth.uid())
  and (select public.is_approved_athlete_member())
)
with check (
  owner_user_id = (select auth.uid())
  and (select public.is_approved_athlete_member())
);

drop policy if exists "Athletes can delete their own personal bests" on public.athlete_personal_bests;
create policy "Athletes can delete their own personal bests"
on public.athlete_personal_bests
for delete
to authenticated
using (
  owner_user_id = (select auth.uid())
  and (select public.is_approved_athlete_member())
);

drop policy if exists "Athlete admins can delete personal bests" on public.athlete_personal_bests;
create policy "Athlete admins can delete personal bests"
on public.athlete_personal_bests
for delete
to authenticated
using ((select public.is_athlete_admin()));

commit;
