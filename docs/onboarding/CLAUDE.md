# Onboarding — Design Spec

This document is the reference for (re)building `app/onboarding.tsx`. It defines the purpose,
content, and layout of each screen. Read it before touching onboarding code.

## Goals (in priority order)

1. **Qualify the visitor.** The app is a lead magnet for participatory research. Every screen
   after the hook must capture one segmentation data point: who they are, what their link to
   the territory is, how they found us. This data is what makes the collected ratings
   scientifically usable and what identifies collaboration leads.
2. **Set expectations, not teach.** Onboarding says *what* the experience is in one screen.
   *How* to use the app is taught in-app, contextually (see "Tutorial strategy" below),
   never as onboarding pages.

## Non-negotiable principles

- **No skip button.** Onboarding is short (~45 seconds) precisely so it can be mandatory.
  A skip destroys the segmentation data that is the whole point. The existing "Passer"
  button must be removed.
- **One question per screen.** Never two inputs on the same page.
- **Select, then validate.** Tapping an option only selects it (toggles it, for
  multi-select). A « Valider » button confirms the answer and advances. The button is
  visible but disabled until at least one option is selected. Narrative screens use
  « Suivant » (S1) and « Commencer » (S5) on the same button.
- **Going back is allowed** (swipe back / back arrow) so people can correct an answer.
- **Every answer is stored**, even before the user rates a single card. A visitor who
  answers 3 questions and leaves is still a data point.
- **All user-facing copy in French** (project-wide rule). Copy below is final unless
  changed here first.

## Screen flow

Paragraphs bold their key words (`Strong` in `app/onboarding.tsx`) so they can be read
diagonally: e.g. « 18 cartes », « favorable ou défavorable », « pas un test ».

Hook → Role → Territory link → Acquisition source → How it works (3 pages) → app (Rate tab)

### S1 — Hook (narrative)

Purpose: emotional + credibility hook in one screen. Condensed from the current two
story pages (welcome + heritage) — one strong screen beats two good ones when four
questions follow.

- Layout (chosen 4 Oct 2026, out of three versions): title screen. The photograph
  fills the whole screen behind a dark gradient, with a slow Ken Burns push-in. Photo:
  the Roya valley and Breil-sur-Roya from the Arpette summit
  (`assets/images/roya-vallee.jpg`, Horizon06, CC BY-SA 4.0, contrast retouched,
  credited in « En savoir plus »). No icon.
- Comparison in progress (4 Oct 2026): a second candidate, step `hookPhoto` (« Version
  B »), shows the photo on the top half with rounded bottom corners and the same three
  lines below on the page background. Both screens carry a version badge
  (`HOOK_VERSIONS` in `app/onboarding.tsx`); keep one, delete the other step and badges.
- Text, in this order (client asked for a positive anchoring, no storm, short):
  1. Name: **« Terrcatt »**, large, so the app's name is known at first glance.
  2. What it is: « Un jeu de partage des connaissances pour aider à la décision de
     réhabiliter les terrasses. »
  3. The valley, at the bottom above the button: « Dans la vallée de la Roya, entre
     Mercantour et Méditerranée, 23 000 terrasses en pierre sèche, un savoir-faire
     reconnu par l'UNESCO. »
- CTA: « Découvrir »

### S2 — Role: « Qui êtes-vous ? »

Purpose: primary segmentation axis (matches the research method's stakeholder groups).

- **Multi-select**: real people overlap categories (an elected official who owns
  terraces). Tapping toggles; « Valider » confirms.
- Title: **« Qui êtes-vous ? »**
- Subtitle: « Votre profil nous aide à comparer les regards sur le paysage. »
- Small italic hint *below* the options list: « Plusieurs réponses possibles »
- Options (tappable option cards, one per line):
  - 🏡 Propriétaire de terrasses ou de terrain
  - 🏛️ Élu·e ou acteur public
  - 🔬 Chercheur·se ou étudiant·e
  - 🚜 Professionnel·le de l'agriculture ou du paysage
  - 🏘️ Habitant·e de la vallée
  - 👀 Curieux·se
- Stored as `profile.roles` (array).

### S3 — Territory link: « Et votre territoire ? »

Purpose: **lead scoring.** This is the screen the original 4-step vision was missing.
Someone from *another* territory facing similar challenges is exactly the collaboration
lead the project wants to attract — this one question separates data contributors from
potential partners.

- Title: **« Quel est votre lien avec le territoire ? »**
- Options:
  - 📍 J'habite ou je connais bien la vallée de la Roya
  - 🌍 Mon territoire fait face à des défis similaires
  - 🗺️ Aucun lien particulier, je découvre
- Stored as `profile.territoryLink`. A `similar-territory` answer is the strongest
  lead signal in the app; future work can branch on it (e.g. a dedicated contact
  prompt on the results screen).

### S4 — Acquisition: « Comment nous avez-vous connus ? »

Purpose: measure which channels bring which personas (lead-magnet analytics).

- Title: **« Comment avez-vous découvert Terrcatt ? »**
- Options:
  - 🎓 L'université ou l'équipe de recherche
  - 💬 Bouche à oreille
  - 🎪 Un atelier ou événement du projet
  - 📱 Réseaux sociaux
  - 📰 Presse ou média
  - 🔎 Recherche en ligne
  - ✨ Autre
- Stored as `profile.source`.

### S5 — How it works (3 narrative pages, steps `howCards` / `howVote` / `howCompare`)

Replaced the single « À vous de jouer » page on 4 Oct 2026: on the client call, several
people found it confusing. One idea per page. Vocabulary: a card shows a terrace in a
**« situation »** (not « contrainte »: some situations are favourable, e.g. beehives),
and the question is always about **« la réhabilitation des terrasses »**, the same
wording as the tagline.

1. **« Une carte, une situation »**: one card at a time, drawn with the game's `Card`
   component (smaller than in the game), no counter. The cards go by on
   their own: the first change after 0.7 s (so players tapping through still see it),
   then every ~2 s, sliding out to the left and in from the right as in the
   game, so the player sees there are many of them (`CardCarousel`; with animations
   off they swap without sliding).
   « Vous allez découvrir 18 cartes. Chacune montre une terrasse dans une situation
   particulière : une pente très forte, des pluies abondantes, des ruches… » CTA
   « Suivant ».
2. **« Donnez votre avis »**: the animated -2…+2 dots with « Très défavorable » /
   « Très favorable » under the ends, then the same title + paragraph layout as the
   other pages: « Pour chaque carte, dites si cette situation est favorable ou
   défavorable à la réhabilitation des terrasses, de -2 à +2, selon votre ressenti. »
   CTA « Suivant ».
3. **« Il n'y a pas de mauvaise réponse »**: two chips « Votre regard » ⇄ « L'étude ».
   « Ce n'est pas un test : nous voulons simplement connaître votre point de vue. » and
   « À la fin, découvrez comment votre regard se compare aux résultats de l'étude
   scientifique. » CTA « Commencer » → closes onboarding, lands on the Rate tab.

## Tutorial strategy (deliberately NOT in onboarding)

- First time the Rate screen mounts: a one-shot contextual hint (overlay or inline
  banner) showing the scale meaning. Dismissed on first rating.
- First visit to Results: one-line hint explaining the « vérité terrain » comparison.
- Rule of thumb: teach a control at the moment it's on screen, never before.

## What is deliberately NOT in onboarding

- **Email capture.** Asking for an email before delivering value converts terribly.
  The conversion moment is the results screen, after the user has rated the cards and
  seen their comparison with the terrain truth: « Recevoir les résultats de l'étude /
  proposer une collaboration ». Design that as part of the Results tab, not here.
- **Detailed how-to** (see Tutorial strategy).
- **Consent walls / long RGPD text.** One short line + link is enough at the email
  step; onboarding answers are anonymous segmentation data.

## Layout & visual system

- Keep the existing visual language: background `#FDFCFA`, accent `#C4956A`,
  inactive dot `#E0D5C9`, text `#333`/`#555`, framed card images (rounded 24,
  border `#DEDDDA`), `MAX_LAYOUT_WIDTH` centering for web.
- Progress dots at the bottom for all 5 screens (existing component style).
- Option cards: full-width within `MAX_LAYOUT_WIDTH`, min height 56, rounded 12–14,
  white background with `#DEDDDA` border, emoji left + label; selected state = accent
  border + tinted background. Vertical stack, generous 10–12px gaps. Never dropdowns,
  never radio buttons.
- Question screens are top-aligned (title high, options below) so 6 options fit
  without scrolling on small phones; narrative screens stay center-aligned.
- Horizontal paging is fine for S1↔S5 back-navigation, but forward scroll must be
  blocked on question screens until an answer is chosen (or replace the FlatList with
  state-driven step rendering — simpler and avoids partial-swipe states).

## Data model

- `profile` state: `{ roles: ProfileRole[], territoryLink, source }` — implemented as
  an extension of `CardContext` (`SET_PROFILE` action, `setProfile` helper).
- Attach the profile to every exported/collected rating so responses are segmentable.
- Current app state is in-memory only; when persistence lands, the profile +
  "onboarding completed" flag are the first things to persist (so onboarding shows
  once, not per launch).

## Data storage & sync (decided direction — local half implemented 2026-08-22, see docs/improvements.md §6)

When we build the sync half, follow this architecture:

- **Offline-first, not either/or.** Local storage is ALWAYS the source of truth;
  every answer/rating writes locally immediately (AsyncStorage persisting the
  reducer state). A background sync pushes to the server when connectivity allows.
  Never branch at runtime on "am I online?"; never block gameplay on the network;
  never surface sync errors to the player.
- **Identity = anonymous UUID** generated at first launch and persisted locally.
  No accounts ever — a login wall would kill the lead-magnet funnel. Accepted
  consequences (conscious decision): same person on two devices = two participants;
  reinstall = new participant. Comparable to the anonymity of physical workshops.
- **Sync = idempotent full-snapshot upsert** keyed by the UUID, last-write-wins.
  One device = one user, so there are no multi-device conflicts to merge — no CRDTs
  needed. Retry is free because the upsert is idempotent. Sync on meaningful moments
  (onboarding finished, each rating, game completed) AND on app-foreground — partial
  sessions are still data points.
- **Backend**: Supabase (Postgres) in an **EU region** — EU data residency is a
  requirement for the Sorbonne/GDPR context (Convex cloud is US-hosted, dropped).
  "No third-party data provider" means no analytics resellers, not no backend.
- **Voice notes are a separate milestone.** v1 sync is text-only; audio needs blob
  storage, upload retry, and size handling — don't let it block the snapshot sync.
- **Stamp `schemaVersion` on every synced payload** from day one (rating-only now;
  compare/swipe/confidence/why-prompts will change the shape).
- **Capture rating timestamps/event order locally**, not just the final
  `{cardId: score}` map — revisions and order effects are research-relevant and
  can't be reconstructed later.
- **GDPR before scale**: anonymous UUID + free text + voice recordings is personal
  data (a voice is identifying); Sorbonne research context likely imposes ethics/
  data-handling requirements. Needs a consent line + retention policy, stricter once
  email capture exists.

## Later ideas (parked, not for the current iteration)

- **S1 as a real splash**: replace the hook screen's framed card image with a
  full-bleed beautiful illustration / splash treatment.
- **A human touch**: make the project feel personal — either a letter-style page
  in the onboarding (signed by the team) or photos of the people behind the
  project/studio. Placement TBD (onboarding vs. an "À propos" surface).

## Open questions (decide before or during implementation)

- Should "Autre" answers (role, source) open a free-text field, or is the bucket enough
  for v1? (Leaning: bucket only for v1.)
- Does S3's `similar-territory` answer trigger a tailored message immediately, or only
  change what the Results screen offers? (Leaning: Results only, keep onboarding uniform.)
- ~~Multi-role people: single choice or multi-select?~~ Decided: **multi-select** for
  the role question (S2); territory (S3) and source (S4) stay single-select.
