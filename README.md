# Card Sorting Expo App

A React Native Expo app showcasing different card sorting mechanisms using 17 Terrcatt cards.

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

## Notes

- Rankings reset on app restart (no persistence)
- Swipe, compare, and rating scores are tracked independently
