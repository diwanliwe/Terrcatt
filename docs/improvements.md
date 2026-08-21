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

## 4. Results page — full redesign

Current state: three horizontal scrollable rankings, "very ugly", not designed at
all. Needs a real design pass. Goals:

- Make *my ranking* instantly readable (all 15 cards, my score for each).
- The reveal: comparison with the scientific "vérité terrain" — this is the payoff
  of the whole game and deserves a dedicated, well-designed moment (agreement /
  divergence per card, maybe an overall "convergence score").
- This page is also where the lead-magnet conversion lives (see onboarding spec:
  email capture "recevoir les résultats de l'étude" belongs here, post-value).
- Since the app is rating-only now, drop the three-ranking layout; design for one
  ranking + comparison.

## 5. Settings page — make it real

- Improve overall layout/design.
- Add the basic legitimacy items:
  - Send feedback (mailto or simple form).
  - Legal / privacy page (required anyway per the GDPR notes in the onboarding
    spec).
  - "Delete my data" (the anonymous-user equivalent of delete account — GDPR
    erasure; wipes local data + the server record for this UUID once sync exists).
- Toggle for haptic feedback on game-loop interactions (rating buttons etc.) —
  and actually add the haptics themselves to the core loop.

## 6. Data: anonymous user + storing all interactions

Decision already documented in `docs/onboarding/CLAUDE.md` → "Data storage & sync".
Summary: anonymous UUID created at first launch (no name, no account), offline-first
local persistence of everything (onboarding profile + every game interaction),
idempotent snapshot sync to a managed backend later. Even before any backend
exists, the app should create the user ID and persist onboarding + game data
locally — that's the first implementation step when we start this work.

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
