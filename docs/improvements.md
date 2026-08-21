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

## 3. Rating transition animation + end-of-game handoff

Two distinct problems:

**a. Card-to-card transition.** Currently the next card just appears — very basic.
Ideas: the card animates away in the direction of the verdict (flies left when
rated negative, right when positive, with a color flash of the chosen button), next
card scales/fades in. Reuse the Reanimated patterns from SwipeableCard.

**b. End of game → results (the real UX miss).** Today the screen says "done, go
look at the Results tab" and dies. The moment of maximum engagement gets a dead end.
Options:
- Auto-navigate to Results after the last rating (with a short "Terminé ! 🎉"
  beat/animation first so completion feels rewarded).
- Or a celebratory completion screen with a single big « Voir mes résultats »
  button.
- Either way: never leave the user to find the Results tab by themselves.

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
