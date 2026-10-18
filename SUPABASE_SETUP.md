# Athlete profile login setup

The Athletes page uses Supabase Auth and a protected Supabase database. The site only uses the project's public publishable/anon key; **never put a Supabase service-role key in frontend files**.

## 1. Create the Supabase project

Create a project at [supabase.com](https://supabase.com/). In **Project Settings → API**, copy the project URL and the public publishable key (or legacy anon key).

## 2. Set up the database

**For a new Supabase project:** open the Supabase **SQL Editor**, paste [`database/supabase-setup.sql`](./database/supabase-setup.sql), and run it once.

**For a project that already has the website tables and records:** do not rerun the full setup script to add features. In the Supabase SQL Editor, run only the migrations you have not already applied, once each:

- [`database/migrations/20261018_flexible_record_categories.sql`](./database/migrations/20261018_flexible_record_categories.sql) enables trials, sports events, and custom record categories.
- [`database/migrations/20261018_athlete_personal_bests.sql`](./database/migrations/20261018_athlete_personal_bests.sql) adds private-by-default athlete PBs with per-entry team sharing.
- [`database/migrations/20261018_personal_best_profile_sharing.sql`](./database/migrations/20261018_personal_best_profile_sharing.sql) adds the profile-level sharing preference and RLS rules that let admins manage their own PBs and all team entries.

After the initial setup or migrations, admins manage competition records through the admin dashboard, and athletes manage their own personal bests from Athlete Profiles. **No SQL is needed for everyday record or PB entry.** The setup script also imports the original published records without duplicating matching entries.

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

Admin sign-in uses the login form and Supabase password authentication. To recover a password, enter the account email on the admin sign-in page and choose **Forgot your password?**. The recovery email redirects to `auth/reset-password.html`; add that exact deployed and local URL to the Supabase **Redirect URLs** allow list. The reset page requires a valid Supabase recovery session before it allows a password update.

Open the Athletes page from the home page and sign in with the admin credentials. Team members can create their own accounts from the sign-in page. They must verify their email and wait for an admin to approve their request. Approved members can view the athlete directory and records on Athlete Profiles; the three-dot menu filters entries by competition or trial, and the Boys/Girls tabs filter by team. Athletes can create or edit only their own athlete profile and personal-best entries. PBs are private by default; an athlete can choose to share each PB with approved team members or turn sharing off later. Admins can see all PBs, including private ones, and remove entries if necessary from the [admin dashboard](./admin/). The dashboard groups approvals, records, personal bests, and profiles into tabs, paginates long lists, and opens data-entry forms only when adding or editing. Admins can also approve or reject membership requests, manage athlete profiles, and add, edit, or delete saved competition records. Database row-level security enforces these permissions.

Every signed-in approved member and admin can create and manage their own personal bests. The **Share all my personal bests with the team** preference is off by default; when enabled, all PBs for that account are visible to approved, email-verified members. Changing the preference updates database row-level security immediately, and live clients refresh the team PB list through Supabase Realtime. Existing PB rows are preserved; the migration initializes sharing as off for existing accounts until each owner opts in. The legacy per-entry sharing values remain stored but no longer control visibility. Admins can also manage all PBs from the admin dashboard.

In the admin dashboard's Records tab, Inter-IIT and Institute records have separate Boys/Girls views; other saved competition types remain under Other categories. Each form saves the category and team selected for that form. Admins can import records from Excel (.xlsx), CSV, or text-based PDFs: choose the category and team, review and edit the extracted rows, then confirm to save them. Files are parsed in the browser and are not uploaded. Excel and PDF parsing libraries load on demand from their public CDNs, so an internet connection is required for those formats. Scanned or ambiguously aligned PDFs are rejected with an explanation; export them as CSV or Excel instead. Imports use the existing admin-only Supabase insert policy and do not rewrite or reclassify existing database rows.

Athlete names, team, event, batch, photo URL, and a short bio are stored in Supabase. Profiles are visible only to approved, email-verified members and admins. The database policies enforce these permissions even if a user bypasses the website interface.
