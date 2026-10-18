begin;

create table if not exists public.athlete_personal_best_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  share_with_team boolean not null default false
);

insert into public.athlete_personal_best_preferences (user_id)
select id
from auth.users
on conflict (user_id) do nothing;

alter table public.athlete_personal_best_preferences enable row level security;
revoke all on public.athlete_personal_best_preferences from anon, authenticated;
grant select, insert, update on public.athlete_personal_best_preferences to authenticated;

create or replace function public.is_athlete_personal_best_shared(record_owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.athlete_personal_best_preferences as preference
    where preference.user_id = record_owner_id
      and preference.share_with_team
      and (
        exists (
          select 1
          from public.athlete_admins as admin
          where admin.user_id = record_owner_id
        )
        or exists (
          select 1
          from public.athlete_members as member
          join auth.users as account on account.id = member.user_id
          where member.user_id = record_owner_id
            and member.status = 'approved'
            and account.email_confirmed_at is not null
        )
      )
  );
$$;

revoke all on function public.is_athlete_personal_best_shared(uuid) from public;
grant execute on function public.is_athlete_personal_best_shared(uuid) to authenticated;

drop policy if exists "Owners and admins can read personal-best preferences" on public.athlete_personal_best_preferences;
drop policy if exists "Approved members can read personal-best sharing preferences" on public.athlete_personal_best_preferences;
create policy "Approved members can read personal-best sharing preferences"
on public.athlete_personal_best_preferences
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select public.is_athlete_admin())
  or (select public.is_approved_athlete_member())
);

drop policy if exists "Owners can create personal-best preferences" on public.athlete_personal_best_preferences;
create policy "Owners can create personal-best preferences"
on public.athlete_personal_best_preferences
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and (
    (select public.is_athlete_admin())
    or (select public.is_approved_athlete_member())
  )
);

drop policy if exists "Owners can update personal-best preferences" on public.athlete_personal_best_preferences;
create policy "Owners can update personal-best preferences"
on public.athlete_personal_best_preferences
for update
to authenticated
using (
  user_id = (select auth.uid())
  and (
    (select public.is_athlete_admin())
    or (select public.is_approved_athlete_member())
  )
)
with check (
  user_id = (select auth.uid())
  and (
    (select public.is_athlete_admin())
    or (select public.is_approved_athlete_member())
  )
);

drop policy if exists "Athletes can read their own or team-shared personal bests" on public.athlete_personal_bests;
drop policy if exists "Owners admins and approved members can read personal bests" on public.athlete_personal_bests;
create policy "Owners admins and approved members can read personal bests"
on public.athlete_personal_bests
for select
to authenticated
using (
  (select public.is_athlete_admin())
  or owner_user_id = (select auth.uid())
  or (
    (select public.is_approved_athlete_member())
    and (select public.is_athlete_personal_best_shared(owner_user_id))
  )
);

drop policy if exists "Approved athletes can add their own personal bests" on public.athlete_personal_bests;
drop policy if exists "Approved members and admins can add their own personal bests" on public.athlete_personal_bests;
create policy "Approved members and admins can add their own personal bests"
on public.athlete_personal_bests
for insert
to authenticated
with check (
  owner_user_id = (select auth.uid())
  and (
    (select public.is_athlete_admin())
    or (select public.is_approved_athlete_member())
  )
);

drop policy if exists "Athletes can update their own personal bests" on public.athlete_personal_bests;
create policy "Owners can update their own personal bests"
on public.athlete_personal_bests
for update
to authenticated
using (
  owner_user_id = (select auth.uid())
  and (
    (select public.is_athlete_admin())
    or (select public.is_approved_athlete_member())
  )
)
with check (
  owner_user_id = (select auth.uid())
  and (
    (select public.is_athlete_admin())
    or (select public.is_approved_athlete_member())
  )
);

drop policy if exists "Athlete admins can update personal bests" on public.athlete_personal_bests;
drop policy if exists "Athlete admins can update all personal bests" on public.athlete_personal_bests;
create policy "Athlete admins can update all personal bests"
on public.athlete_personal_bests
for update
to authenticated
using ((select public.is_athlete_admin()))
with check ((select public.is_athlete_admin()));

drop policy if exists "Athletes can delete their own personal bests" on public.athlete_personal_bests;
drop policy if exists "Owners can delete their own personal bests" on public.athlete_personal_bests;
create policy "Owners can delete their own personal bests"
on public.athlete_personal_bests
for delete
to authenticated
using (
  owner_user_id = (select auth.uid())
  and (
    (select public.is_athlete_admin())
    or (select public.is_approved_athlete_member())
  )
);

drop policy if exists "Athlete admins can delete personal bests" on public.athlete_personal_bests;
drop policy if exists "Athlete admins can delete all personal bests" on public.athlete_personal_bests;
create policy "Athlete admins can delete all personal bests"
on public.athlete_personal_bests
for delete
to authenticated
using ((select public.is_athlete_admin()));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1
       from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'athlete_personal_best_preferences'
     ) then
    execute 'alter publication supabase_realtime add table public.athlete_personal_best_preferences';
  end if;
end
$$;

commit;
