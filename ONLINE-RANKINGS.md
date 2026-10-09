## Connected project (2026-10-09)

Project: `unicorn-vs-dragon` (`zlgwzaybzaivqhvvojaa`, Free, US East Ohio).
The SQL schema was applied successfully and the public top-ten endpoint returned HTTP 200 with an empty list. Both local project directories now have ignored `.env.local` files containing only the public URL and publishable key. The local game displays ONLINE RANKING. Anonymous sign-ins are enabled. A real local RPS run was submitted as Connection Test (1 win), verified through the public API, and displayed as rank 1 with Dragon ownership in the game. This clearly labelled test record remains available for verification. Fixed handling of empty successful RPC responses. Deployment is now authorized. The manual GitHub Pages workflow includes the public Supabase configuration and runs the game tests before building.
# Online rankings connection

The current build runs locally. No deployment or push was performed for this revision.
With no environment configuration, the UI explicitly shows LOCAL TEST RANKING. These test records are not uploaded later.

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor.
2. Enable **Authentication → Sign In / Providers → Anonymous sign-ins**.
3. Copy `.env.example` to `.env.local` in the running project (`unicorn-vs-dragon` nested checkout). Set the project URL and the public anon/publishable key. Never put service-role or secret keys in Vite variables.
4. Restart the local Vite server. The ranking panel should display ONLINE RANKING.
5. Test from two browser profiles: submit a record in the same district. Rankings refresh every 30 seconds and on window focus. The highest record determines ownership. A tie retains the earlier record.

Online records are personal bests per anonymous authenticated browser identity and district. Clearing the browser's saved auth session creates a new identity; stable cross-device accounts require adding an explicit login flow. Nicknames are display names, not unique account identifiers. Offline practice groups by nickname for easy multi-player testing on one device.

RPS values are consecutive wins; draws preserve streaks and one loss ends a run. Other values are elapsed active milliseconds; pauses do not count. Rank 1's faction owns that district. A recordless district is neutral. Ranking submission replaces a personal best only when strictly higher. Top 10 and ownership are derived from the same ordered list.

This is a casual leaderboard, not a verified competitive backend: games run in the browser and submit their own scores. SQL enforces authentication, ownership, numeric bounds, atomic best-score updates, and top-10 ordering, but does not verify gameplay. Server-issued run sessions, input replay validation, and rate limits are needed before using scores for prizes or cheat-resistant competition.

Automatic push-triggered deployment is removed from the local workflow. The GitHub-hosted workflow remains unchanged until this workflow file is committed/pushed or disabled in GitHub Actions. Do not push until publication is intended. This task does not publish.
