# Athlete profile login setup

The Athletes page uses Supabase Auth and a protected Supabase database. The site only uses the project's public publishable/anon key; **never put a Supabase service-role key in frontend files**.

## 1. Create the Supabase project

Create a project at [supabase.com](https://supabase.com/). In **Project Settings → API**, copy the project URL and the public publishable key (or legacy anon key).

## 2. Set up the database

**For a new Supabase project:** open the Supabase **SQL Editor**, paste [`database/supabase-setup.sql`](./database/supabase-setup.sql), and run it once.

**For a project that already has the website tables and records:** do not rerun the full setup script just to add a record category. Run [`database/migrations/20261018_flexible_record_categories.sql`](./database/migrations/20261018_flexible_record_categories.sql) once in the SQL Editor. It updates the existing record-category constraint while preserving saved records.

After the initial setup or migration, admins add, edit, and delete every record through the admin dashboard. **No SQL is needed when adding or changing records.** The setup script also imports the original published records without duplicating matching entries. Record categories include Inter-IIT, institute, trials, Sportsfest, summer trials, Sangram, and custom competitions.

Turn on **Authentication → Providers → Email → Allow new users to sign up** and keep email verification enabled. Self-registration only creates a pending request; it does not grant access to profiles. Supabase's email rate limits still apply.

## 3. Create the first admin

In **Authentication → Users**, create the admin account with the admin's email and password.

Copy that user's UUID from the Users page. In the SQL Editor, run the following after replacing the example UUID:

```sql
insert into public.athlete_admins (user_id)
values ('00000000-0000-0000-0000-000000000000');
```

To add another admin later, create their Auth user and insert their UUID into `public.athlete_admins` in the same way. Remove an admin by deleting their row from that table. Admins can approve or reject member sign-up requests from the separate [admin dashboard](./admin/).

## 4. Connect the website

Edit [`config/supabase-config.js`](./config/supabase-config.js) and set `url` and `anonKey` to the values from Project Settings → API. These are public client settings; do not use a service-role key.

## 5. Run and deploy

Serve the site over HTTP/HTTPS (for local development, use a local web server rather than opening the HTML file directly). In **Authentication → URL Configuration**, add the deployed site's origin and local development URL to the allowed redirect URLs.

Open the Athletes page from the home page and sign in with the admin credentials. Team members can create their own accounts from the sign-in page. They must verify their email and wait for an admin to approve their request. Approved members can view the athlete directory and records on Athlete Profiles; the three-dot menu filters entries by competition or trial, and the Boys/Girls tabs filter by team. They can create or edit only their own athlete profile. Admins can open the separate [admin dashboard](./admin/) to approve or reject membership requests, manage athlete profiles, and add, edit, or delete saved records. Admins can use the built-in categories or add a custom competition category such as Udghosh. For each timing, add the event, athlete(s), year/meet/trial label, performance, and (optionally) college. Record changes ask for confirmation before saving or deleting. Database policies enforce admin-only record changes and public read access to records.

Athlete names, team, event, batch, photo URL, and a short bio are stored in Supabase. Profiles are visible only to approved, email-verified members and admins. The database policies enforce these permissions even if a user bypasses the website interface.
