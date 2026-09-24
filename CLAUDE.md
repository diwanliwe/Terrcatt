# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

### Research Background

This app is a **digital prototype** of a participatory card sorting method developed by **Prof. Marianne Cohen** (Sorbonne Université) for the **Terrcatt project** (Terrasses de culture et reconstruction d'un territoire post-catastrophe).

**Scientific context:**
- The Roya Valley (French Alps) was devastated by Storm Alex (October 2020)
- ~23,000 agricultural terraces exist in the valley, largely abandoned
- Research shows terraces provide resilience against extreme weather events
- The project aims to help decision-making for terrace rehabilitation

**Original method:**
- Physical card game with 16 landscape characteristics
- Participants classify cards into 5 categories: Very Favorable → Very Unfavorable
- Facilitates discussion between researchers and stakeholders (terrace owners, public actors)
- Compares subjective perceptions with "terrain truth" from scientific studies

### Project Goals

**Primary goal: Lead magnet for participatory research**
1. Gather data from communities at scale (crowdsourced)
2. Demonstrate how digital tools can amplify impact of participatory analysis
3. Attract stakeholders facing similar geo/territorial challenges to reach out for collaboration

**Data collection objectives:**
- Capture ordinal classification (-2 to +2) for 16 characteristics
- Segment by user persona (terrace owner, public actor, researcher, etc.)
- Compare user ratings with scientific "terrain truth"
- Identify viewpoint clusters across stakeholder groups

### Methodology References

The app draws from established participatory decision-support literature:

| Method | Relevance |
|--------|-----------|
| **MCDA** (Multi-Criteria Decision Analysis) | Weighting criteria for land use decisions |
| **PGIS** (Participatory GIS) | Combining local knowledge with spatial data |
| **Q-Methodology** | Identifying stakeholder viewpoint archetypes |
| **CrowdBT** (Crowd Bradley-Terry) | Aggregating pairwise comparisons at scale |
| **All Our Ideas** (Princeton) | Wiki surveys for collective prioritization |

### Future Development

- **CrowdBT implementation**: Aggregate pairwise comparisons across users for global ranking
- **User profiling**: Capture persona/role to segment analysis
- **Confidence indicators**: Optional "how sure are you?" after ratings
- **Qualitative capture**: "Why?" prompts for extreme ratings (+2/-2)
- **Terrain truth comparison**: Show divergence from Prof. Cohen's reference data
- **A/B testing**: Compare engagement/data quality across rating methods

## Development Commands

```bash
npm install           # Install dependencies
npm start             # Start Expo dev server (i=iOS, a=Android, w=web)
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web browser
```

No build, lint, or test scripts are currently configured.

## Architecture Overview

This is a **React Native Expo app** (SDK 54) for interactive card sorting using three different mechanisms. It uses Expo Router for file-based routing and React Context + useReducer for state management.

### State Management (context/CardContext.tsx)

The app tracks three independent scoring systems via a reducer pattern:

- **swipeScores**: Two-pass swipe sorting (step 1: favorable/unfavorable/neutral, step 2: refinement to -2/+2)
- **compareScores**: Pairwise comparison wins/losses
- **ratingScores**: 5-point scale ratings (-2 to +2)

Key reducer actions: `SWIPE_FIRST_PASS`, `SWIPE_SECOND_PASS`, `COMPARE_WIN`, `COMPARE_TIE`, `RATE_CARD`, `RESET_*`

### Tab Screens (/app/(tabs)/)

| Tab | File | Purpose |
|-----|------|---------|
| Swipe | index.tsx | Two-step swipe interface (initial sort → refinement) |
| Compare | compare.tsx | Random pair generation, tap to select winner |
| Rate | rate.tsx | Sequential 5-point rating per card |
| Results | results.tsx | Three horizontal scrollable rankings |

### Key Components

- **Card.tsx**: Base card display with optional rank badge (sizes: small/medium/normal)
- **SwipeableCard.tsx**: Gesture-driven animated wrapper using React Native Reanimated with pan gesture detection, spring physics for snap-back, and directional label opacity interpolation

### Animation Thresholds (SwipeableCard.tsx)

- Horizontal: 25% of screen width triggers swipe
- Vertical: 100px triggers up-swipe

## Card Data

18 cards defined in `context/CardContext.tsx` with square 1024px JPG images in `/assets/cards/` (final designs, Sept 2026; terrain-truth scores in `components/results/resultsData.ts`). Card images use `require()` for static Expo imports.

## Language

All user-facing text in the app **must be in French**. This includes tab labels, buttons, instructions, status messages, and any new UI text. Code comments and variable names remain in English.

## Key Patterns

- All state is in-memory only (resets on app restart)
- Provider hierarchy in `app/_layout.tsx`: GestureHandlerRootView → ThemeProvider → CardProvider
- TypeScript strict mode enabled
- New React Native architecture enabled (`newArchEnabled: true` in app.json)
