create table if not exists public.athlete_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(trim(full_name)) between 1 and 100),
  team text not null check (team in ('Boys', 'Girls')),
  event text check (event is null or length(event) <= 80),
  batch text check (batch is null or length(batch) <= 30),
  photo_url text check (photo_url is null or length(photo_url) <= 500),
  bio text check (bio is null or length(bio) <= 600),
  created_at timestamptz not null default now()
);

alter table public.athletes
  add column if not exists owner_user_id uuid references auth.users (id) on delete set null;

create unique index if not exists athletes_owner_user_id_unique
  on public.athletes (owner_user_id)
  where owner_user_id is not null;

create table if not exists public.athlete_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default 'Team member' check (length(trim(full_name)) between 1 and 100),
  email text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.athlete_admins enable row level security;
alter table public.athletes enable row level security;
alter table public.athlete_members enable row level security;

create or replace function public.is_athlete_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.athlete_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_athlete_admin() from public;
grant execute on function public.is_athlete_admin() to authenticated;

create or replace function public.is_approved_athlete_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.athlete_members as member
    join auth.users as account on account.id = member.user_id
    where member.user_id = (select auth.uid())
      and member.status = 'approved'
      and account.email_confirmed_at is not null
  );
$$;

revoke all on function public.is_approved_athlete_member() from public;
grant execute on function public.is_approved_athlete_member() to authenticated;

create or replace function public.add_pending_athlete_member()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.athlete_members (user_id, full_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Team member'),
    coalesce(new.email, '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.add_pending_athlete_member() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_add_athlete_member on auth.users;
create trigger on_auth_user_created_add_athlete_member
after insert on auth.users
for each row execute function public.add_pending_athlete_member();

insert into public.athlete_members (user_id, full_name, email)
select
  account.id,
  coalesce(nullif(trim(account.raw_user_meta_data ->> 'full_name'), ''), 'Team member'),
  coalesce(account.email, '')
from auth.users as account
where not exists (
  select 1
  from public.athlete_admins as admin
  where admin.user_id = account.id
)
on conflict (user_id) do nothing;

revoke all on public.athlete_admins from anon, authenticated;
grant select on public.athlete_admins to authenticated;

revoke all on public.athletes from anon, authenticated;
grant select, insert, update, delete on public.athletes to authenticated;

revoke all on public.athlete_members from anon, authenticated;
grant select, update on public.athlete_members to authenticated;

drop policy if exists "Athlete admins can read their own admin entry" on public.athlete_admins;
create policy "Athlete admins can read their own admin entry"
on public.athlete_admins
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Athlete admins can read profiles" on public.athletes;
create policy "Athlete admins can read profiles"
on public.athletes
for select
to authenticated
using ((select public.is_athlete_admin()) or (select public.is_approved_athlete_member()));

drop policy if exists "Athlete admins can create profiles" on public.athletes;
create policy "Athlete admins can create profiles"
on public.athletes
for insert
to authenticated
with check (
  (select public.is_athlete_admin())
  or (
    (select public.is_approved_athlete_member())
    and owner_user_id = (select auth.uid())
  )
);

drop policy if exists "Athlete admins can update profiles" on public.athletes;
create policy "Athlete admins can update profiles"
on public.athletes
for update
to authenticated
using ((select public.is_athlete_admin()))
with check ((select public.is_athlete_admin()));

drop policy if exists "Approved members can update their own profile" on public.athletes;
create policy "Approved members can update their own profile"
on public.athletes
for update
to authenticated
using (
  (select public.is_approved_athlete_member())
  and owner_user_id = (select auth.uid())
)
with check (
  (select public.is_approved_athlete_member())
  and owner_user_id = (select auth.uid())
);

drop policy if exists "Athlete admins can delete profiles" on public.athletes;
create policy "Athlete admins can delete profiles"
on public.athletes
for delete
to authenticated
using ((select public.is_athlete_admin()));

drop policy if exists "Members can read their own membership" on public.athlete_members;
create policy "Members can read their own membership"
on public.athlete_members
for select
to authenticated
using (user_id = (select auth.uid()) or (select public.is_athlete_admin()));

drop policy if exists "Admins can approve or reject team members" on public.athlete_members;
create policy "Admins can approve or reject team members"
on public.athlete_members
for update
to authenticated
using ((select public.is_athlete_admin()))
with check ((select public.is_athlete_admin()));
