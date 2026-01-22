# Terrcatt - Participatory Territorial Decision Support

A React Native Expo app that digitizes a participatory card sorting method for territorial decision-making, developed in collaboration with **Prof. Marianne Cohen** (Sorbonne Université) as part of the **TTERCAT research project**.

## Project Purpose

### Background

The Roya Valley (French Maritime Alps) was devastated by Storm Alex in October 2020. The region contains ~23,000 agricultural terraces, largely abandoned, which research shows provide resilience against extreme weather events. The TTERCAT project aims to support decision-making for terrace rehabilitation through participatory methods.

### What This App Does

This app digitizes a **card sorting method** where participants classify 16 landscape characteristics (slope, drainage, road access, etc.) from "Very Favorable" to "Very Unfavorable" for terrace rehabilitation.

**Original method:** Physical card game facilitating discussion between researchers and stakeholders (terrace owners, public/private actors).

**Digital version goals:**
1. **Scale data collection** - Gather perceptions from more participants than physical workshops allow
2. **Lead magnet** - Demonstrate the value of participatory analysis to attract communities facing similar territorial challenges
3. **Compare perspectives** - Analyze how different stakeholder groups (landowners vs. public actors vs. researchers) perceive the same characteristics
4. **Validate with terrain truth** - Compare crowdsourced ratings with scientific field data

### Who Is This For?

- **Terrace owners** - Share local knowledge about what matters for rehabilitation
- **Public actors** - Understand community priorities for policy decisions
- **Researchers** - Collect structured data on stakeholder perceptions
- **Anyone interested** - Explore the methodology and reach out for collaboration on similar projects

---

## Features

### Tab 1 - Swipe Sorting
- Tinder-like swipe interface
- Swipe right to "like" (+1 score)
- Swipe left to "dislike" (-1 score)
- Animated card transitions
- Progress indicator showing current card

### Tab 2 - Comparison Sorting
- Two cards displayed side by side
- Tap a card to select it as the winner
- Winner gets +1, loser gets -1
- Random pair generation
- Comparison counter

### Tab 3 - Rating
- 5-point rating scale for each card
- Very favorable (+2)
- Favorable (+1)
- Neutral (0)
- Unfavorable (-1)
- Very unfavorable (-2)
- Progress indicator showing current card

### Tab 4 - Results
- Three horizontal scrollable rankings
- Swipe Ranking - cards ordered by swipe scores
- Compare Ranking - cards ordered by comparison wins
- Rating Ranking - cards ordered by rating scores
- Rank badges and score display on each card

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo Go app on your mobile device (optional)

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running the App

After starting the dev server:
- Press `i` to open in iOS Simulator
- Press `a` to open in Android Emulator
- Scan the QR code with Expo Go app on your phone

## Project Structure

```
/app
  _layout.tsx           # Root layout with providers
  (tabs)/
    _layout.tsx         # Tab navigator configuration
    index.tsx           # Swipe tab
    compare.tsx         # Compare tab
    rate.tsx            # Rate tab
    results.tsx         # Results tab
/assets
  /cards                # Card images (17 Terrcatt cards)
/components
  Card.tsx              # Base card component
  SwipeableCard.tsx     # Animated swipeable card
/context
  CardContext.tsx       # State management
```

## Tech Stack

- Expo SDK 54
- Expo Router (file-based navigation)
- React Native Gesture Handler (swipe gestures)
- React Native Reanimated (animations)
- React Context + useReducer (state management)

## Cards

The app includes 17 Terrcatt cards:
- Olivier Murette, Pente, Route, TWI, Abandon
- Apiculture, Drainage, Faune Sauvage, Hyper-pluviosité
- Irrégularité Topographique, Négatif, Pâture, Positif
- Stockage Eau, Substrat Géologique, Terrasses, Utilisation Agricole

## Methodology

The app implements three sorting mechanisms to study which best captures stakeholder preferences:

| Method | Cognitive Process | Best For |
|--------|-------------------|----------|
| **Direct Rating** | Absolute judgment ("Is this favorable?") | Clean data, matches original physical method |
| **Pairwise Compare** | Relative trade-offs ("Which matters more?") | Reveals hidden preferences within same rating tier |
| **Swipe Sort** | Quick intuitive reactions | Mobile-native engagement, initial screening |

### Future Development

- **CrowdBT aggregation** - Combine pairwise comparisons across users for global ranking
- **User profiling** - Capture persona (terrace owner, public actor, researcher) to segment analysis
- **Terrain truth comparison** - Show divergence from Prof. Cohen's scientific reference data
- **A/B testing** - Compare engagement and data quality across methods

### Scientific References

This approach draws from established participatory decision-support literature:
- Multi-Criteria Decision Analysis (MCDA) for land use planning
- Participatory GIS (PGIS) combining local knowledge with spatial data
- Q-Methodology for identifying stakeholder viewpoint archetypes
- CrowdBT for crowdsourced ranking aggregation

## Contact

Interested in applying this methodology to your territorial challenges? This project demonstrates how digital tools can scale participatory analysis for environmental decision-making.

## Notes

- Rankings reset on app restart (no persistence)
- Swipe, compare, and rating scores are tracked independently
