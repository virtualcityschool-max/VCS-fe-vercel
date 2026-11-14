# VCS App — report (14 Nov 2026)

The portal is now an installable app on iPhone, iPad, Android, Mac and Windows: same
logins, menus, colours and screens (it *is* the portal). Nothing is deployed and the
live database is unchanged.

- Frontend PR: branch `feature/vcs-app-pwa` (VCS-fe-vercel)
- Backend PR: branch `feature/vcs-app-push` (VCS-be-supabase), class reminders only

## What changed, in plain words

| Area | What | Files |
|---|---|---|
| Install | App name "VCS", icons made from the logo, iPhone home-screen settings | `public/manifest.webmanifest`, `public/app-icons/*`, `index.html` |
| Offline | Background helper keeps the site's own files; pages always come fresh; no internet → "You're offline" page with the student's/tutor's saved upcoming classes (no Meet links). Never stores API data. | `public/sw.js`, `public/offline.html`, `src/app/offlineTimetable.js`, `src/utils/axiosInstance.js` |
| Updates | "New version of VCS available · Refresh" bar; never reloads by itself | `src/app/registerSW.js` |
| Sign-in | One-time hint in the installed app: sign in with your usual email and password. Logout clears the saved timetable and this device's reminders. Password reset is a 6-digit email code, so it already works in the app. | `src/components/forms/AuthModals.jsx`, `src/utils/authStorage.js`, `src/store/slices/authSlice.js` |
| Join class | One `openMeet()` helper for every Join button; if a phone blocks the new window it opens Meet directly (iPhone / installed app could block it after the server check) | `src/utils/openMeet.js` + 12 screens |
| Reminders | "Turn on class reminders" card (student + tutor dashboards, on/off in Profile). Server sends "Class in 15 minutes" in each person's own time zone. iPhone: only in the installed app (iOS 16.4+), the card says so and links to /download. | `src/app/push.js`, `src/components/common/ClassRemindersCard.jsx`; backend `classroom/push.py`, `classroom/views/push.py`, `send_class_reminders` |
| /download | "Get the App" page: picks the visitor's device, one-tap Install on Chrome/Edge/Android, iPhone/iPad/Mac/Windows steps, Google Meet App Store / Google Play links, FAQ, SEO (HowTo + FAQ), prerendered, in sitemap. Links in top bar, phone menu and footer (desktop top menu left as is: it is full at 1280 px). | `src/pages/public/DownloadAppPage.jsx`, routes, `scripts/*` |
| Phones | **Students and guardians had no menu button on phones** (hidden under the top bar) — fixed. My Sessions rows pushed the class name and Join off-screen — fixed. Squeezed class cards — fixed. Join/Meet buttons 44 px. Form fields 16 px (no iPhone zoom). | `src/App.jsx`, `Sidebar.jsx`, `StudentClasses.jsx`, `TodayAgendaSidebar.jsx`, `TeacherModernDashboard.jsx`, `TeacherSessionCalendar.jsx`, `ChildCard.jsx`, `IssueInJoiningClassBanner.jsx`, `index.css` |

Big screens: student, tutor and guardian screens at 1440 px are identical to the live code.

## Tested
- Build passes; lint: 19 errors, all pre-existing (same as main), none new.
- Chrome: installable, no manifest or service-worker errors.
- Offline (server really stopped): offline page with saved classes; logo shows; empty state OK.
- Sign-out deletes the saved timetable.
- 375 px, local backend with test student/tutor/guardian (throwaway local database, not live):
  no sideways scroll, no text under 12 px, no field under 16 px; menu opens and navigates for all three.
- /download at iPhone, Android and Mac: right device picked, no sideways scroll, no hydration warnings, day + night.
- Backend reminders, end to end on a throwaway database: student and tutor each get one
  encrypted, signed notification with the right local time; unenrolled student, cancelled and later classes
  skipped; dead device removed (410); second run sends nothing; endpoints reject bad input,
  no token (401) and cron without secret (403); migration applies and rolls back.

Not yet done (needs the live site or real phones): Lighthouse scores on the live URL,
real-device checks (`docs/app/device-test-checklist.md`).

## To switch reminders on (after you approve) — backend `docs/app-class-reminders.md`
1. Create two keys (one command, free) → Vercel project **vcs-backend** → Environment Variables:
   `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (optional `VAPID_SUBJECT`).
2. **Migration awaiting approval**: `classroom/0015_push_reminders` adds 2 new tables
   (`push_subscriptions`, `class_reminders_sent`), changes nothing existing.
   Roll back: `python manage.py migrate classroom 0014`.
3. Supabase SQL: schedule `send_class_reminders` every 5 minutes (same cron + secret as the other jobs).
Until then the reminders card stays hidden (the server says reminders aren't set up). Everything else works without these steps.

No new frontend environment variables. No Supabase redirect-URL changes needed.

## Cost
Supabase: nothing measurable (2 small tables). Vercel: reminder job ≈ 8,600 short calls a month,
a few cents; frontend previews are cancelled on this project, so the PR doesn't build. Push delivery is free.

## Known limits
- iPhone/iPad: users sign in once more after installing (the app has its own storage).
- Reminders on iPhone/iPad need iOS 16.4+ and the app on the Home Screen.
- Meet opens in the Meet app (or browser); students come back to VCS afterwards.
- Remaining small (under 32 px) buttons on dashboards: tab and filter chips, the time-zone "Switch". Usable, not urgent.

## Later (not built)
Wrap the same app with Capacitor for App Store / Google Play listings: $99/year Apple, $25 once Google.
