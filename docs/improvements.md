# Improvements backlog — reflection notes

Running list of things to improve across the app, captured before designing each one.
Deeper specs live next to their feature (e.g. `docs/onboarding/CLAUDE.md`); this file
is the entry point. Items are roughly in game-flow order, not priority order.

## 1. Progress indicator on the Rate screen

Current: plain text `1/15` at the top. It works, but it's the least we could do.

Ideas to explore:
- A thin progress bar (accent `#C4956A`) filling as cards are rated — instant read,
  no counting.
- A row of 15 tiny dots/ticks that take the color of the rating given (−2 red …
  +2 green): progress *and* a mini-recap of your answers in one glance.
- Keep the `1/15` text alongside whichever visual we pick; numbers reassure.

## 2. Card flip — explanation on the back

Idea: tapping the card flips it (3D flip animation) to reveal explanatory content.

Open question: what lives on the back? Candidates:
- A one-paragraph definition of the characteristic (what does "TWI" mean? — some
  cards are opaque to non-experts, so this doubles as accessibility of the method).
- A photo caption / where the photo was taken in the Roya valley.
- Later: what the science says about this characteristic (but NOT before the user
  has rated it — it would bias the answer; maybe the back changes after rating).

Content needs to come from Prof. Cohen's material; the mechanism (flip + per-card
text in `CARDS`) is straightforward.

## 3. Rating transition animation + end-of-game handoff — ✅ DONE (2026-08-21)

Implemented in `components/RateMode.tsx`:
- **a. Card-to-card transition**: card flies off toward the verdict side (left =
  negative, right = positive, slight rotation; neutral shrinks and fades in place),
  next card fades/scales in. Double-taps guarded during the animation.
- **b. End of game**: celebratory completion view (🎉 + message, FadeInDown) with a
  single big « Voir mes résultats » button → `router.push('/results')`. Chose the
  button over auto-navigation: gives a completion beat and keeps control with the
  user.
- Still possible later: color flash of the chosen button, haptics (see item 5).

## 4. Results page — full redesign — ✅ DONE (2026-08-21)

Implemented in `app/(tabs)/results.tsx` + `components/results/`:
- **Reveal only after completion** (locked state with progress + CTA before), so
  the study's view can't bias remaining ratings.
- **Perspective framing, not right/wrong**: per card, *Vous* vs *L'étude* scores;
  cards classified by score gap into *Regard différent* (≥2) / *Regard proche* (1)
  / *Même regard* (0), with a neutral violet/blue/teal palette. "Vérité terrain"
  never appears in the UI. Headline: « Vous partagez le regard de l'étude sur N
  cartes sur 15 ».
- **Carousel only** (2026-08-22): one centred card, neighbours peeking, dots
  tracking the focused card. The *Groupes* grid and the header view selector were
  tried and removed; the tab header is hidden (same as Jeu) so the page is the
  headline + carousel.
- Unified type scale (24/15/13) and 8/16/24 spacing in `components/results/theme.ts`.
- Entrance choreography on both views (title → hint → cards → dots), replayed on
  revisit, with an **Animations** toggle in Paramètres. ⚠️ Web constraint: only
  Reanimated presets or shared-value animations — custom `Keyframe` entering
  animations break on web (see `components/results/Reveal.tsx` comments).
- Ground-truth data is still a **placeholder** in `components/results/resultsData.ts`.
- Email capture ("recevoir les résultats de l'étude") not done yet — belongs here,
  post-value; do it with item 6 / 9.

## 5. Settings page — make it real

- Rework the whole page (structure + design), not just add items. Now also hosts
  the *Animations* toggle (section « Affichage »).
- Improve overall layout/design.
- Add the basic legitimacy items:
  - Send feedback (mailto or simple form).
  - Legal / privacy page (required anyway per the GDPR notes in the onboarding
    spec).
  - "Delete my data" (the anonymous-user equivalent of delete account — GDPR
    erasure; wipes local data + the server record for this UUID once sync exists).
- Toggle for haptic feedback on game-loop interactions (rating buttons etc.) —
  and actually add the haptics themselves to the core loop.

## 6. Data: anonymous user + storing all interactions — ✅ DONE (2026-08-25, backend live + verified)

Decision already documented in `docs/onboarding/CLAUDE.md` → "Data storage & sync".
Summary: anonymous UUID created at first launch (no name, no account), offline-first
local persistence of everything (onboarding profile + every game interaction),
idempotent snapshot sync to a managed backend later. Even before any backend
exists, the app should create the user ID and persist onboarding + game data
locally — that's the first implementation step when we start this work.

Done (local half): `context/persistence.ts` (AsyncStorage, versioned envelope
`{schemaVersion, state}`, `expo-crypto` UUID) + `CardContext`: `userId`,
`createdAt`, and an ordered `events` log (`rate`/`swipe1`/`swipe2`/`compare`/
`profile`/`comment`, epoch-ms timestamps) alongside the existing score maps.
Hydrates before first render (splash hides after hydration), saves debounced
250 ms on every change, `resetAll()` wipes storage and mints a new participant
(for item 5's "Supprimer mes données"). Nothing is sent anywhere yet.

Sync half (2026-08-22) — **Supabase, EU region** (decided: EU storage is a
requirement, Convex cloud is US-hosted). `lib/supabase.ts` (null client when
`EXPO_PUBLIC_SUPABASE_*` env vars are absent → app runs fully offline),
`context/sync.ts` (`pushSnapshot` / `deleteSnapshot`, never throw),
`supabase/migrations/0001_participants.sql`. Model: one `participants` row per
local UUID with the full snapshot as jsonb; RLS on with **no policies** — all
writes go through `upsert_participant` (security definer). Ownership without
accounts: a per-device random secret, bcrypt-hashed on first insert, required
on every later write/delete — the public anon key alone can't overwrite or
read anyone's data. Triggers: debounced 1.5 s after every logged interaction
+ app-foreground when dirty. `resetAll()` deletes the server row then local.

Backend live 2026-08-25: Supabase project `gcnxupyqnjryrjzeuqyr` (EU), migration
0001 applied (note: RPC `search_path` must include `extensions` — pgcrypto lives
there on Supabase). Verified by direct REST probe: upsert + update own row OK,
wrong-secret overwrite rejected (`not owner`), anon reads blocked by RLS,
delete idempotent. `.env` holds the bare project URL + `sb_publishable_` key
(NOT the `/rest/v1/` URL, NOT `sb_secret_`). Still to do with item 9: same two
env vars in Vercel. Research export: dashboard → `participants` → CSV/JSON, or
SQL over `snapshot -> 'events'`.

## 7. Game page after completion — avoid the permanent dead end

The game is one-shot by design (no reset button in the finished version), but that
creates a problem: once you've rated the 15 cards, the Jeu tab is stuck on the
completion screen forever. The app becomes single-use. To think through:

- What does the Jeu tab *become* after completion? Ideas: a "contribution recorded"
  state with your summary + entry to results; a gallery to revisit the 15 cards
  (pairs well with the card-flip idea, item 2); revise-my-answers mode (allowed or
  not? — research implications); share/invite ("faites jouer votre entourage" —
  serves the lead-magnet goal).
- Related tension to settle: one-shot for data integrity vs. replayability for
  engagement. Maybe ratings stay final but the tab stays *alive* (explore, learn,
  share) rather than replayable.

## 8. Card detail — page instead of modal — ✅ DONE (2026-08-22)

Current: tapping a result card opens a bottom-sheet modal (`components/results/
GroundTruthModal.tsx`) with the two scores, the study's explanation and a
comment/voice-note capture. Not convinced by the modal: once there is real
content per card (definition, photo context, what the study observed, why
perspectives differ, maybe several paragraphs and visuals) a sheet is too
cramped and scrolls awkwardly.

To explore:
- A dedicated **detail page** (`/card/[id]`, native push on mobile, route on web)
  with room for long-form content. Can be reused from the Jeu tab later (item 7,
  gallery) and from the card-flip idea (item 2).
- **Drop comments and voice notes for now**: unknown engagement, and they add
  audio permissions + storage complexity. Keep the reducer shape (`comments`) so
  they can come back once the data layer (item 6) exists and we know people
  actually read the detail pages.
- Reuse the results vocabulary: *Votre regard* / *Regard de l'étude*, perspective
  colour as accent, same type scale.

Implemented: `app/card/[id].tsx` (stack route, own back row, no native header),
pushed from the carousel. Hero image framed in the perspective colour, title,
perspective badge + one-line description, *Votre regard* / *Regard de l'étude*
score columns, « Ce que l'étude a observé », and a prev/next pager that follows
the carousel order. Deep links before completion show a locked message.
Score/entry derivation moved to `components/results/useResultEntries.ts`, shared
with the Résultats tab. `GroundTruthModal` and the comment/voice UI are gone; the
`comments` reducer slice stays. `expo-av` is now unused — drop it when item 6 lands
if voice notes don't come back.

## 9. Hosting + first client review wave — 🔜 groundwork

- Deploy the web build to **Vercel** (Expo web export, static). Needs: a build
  script, `app.json` web config check, a stable URL to share.
- Once items 6 (data) and 8 are in: send to the client for a first wave of
  feedback. Before that, a lightweight "preview" deploy is fine for the visual
  pass (results page, onboarding).
- Open question: do we gate the preview (simple password / unlisted URL)? Decide
  with the client.
