import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ImageSourcePropType } from 'react-native';

// Types
export type GameMode = 'swipe' | 'compare' | 'rate';

export interface CardComment {
  text: string;
  audioUri?: string;
}

export type ProfileRole =
  | 'owner'
  | 'public-actor'
  | 'researcher'
  | 'agri-professional'
  | 'resident'
  | 'curious';

export type TerritoryLink = 'roya' | 'similar-territory' | 'no-link';

export type AcquisitionSource =
  | 'university'
  | 'word-of-mouth'
  | 'event'
  | 'social-media'
  | 'press'
  | 'online-search'
  | 'other';

export interface UserProfile {
  roles: ProfileRole[];
  territoryLink: TerritoryLink | null;
  source: AcquisitionSource | null;
}

interface CardState {
  gameMode: GameMode;
  swipeScores: Record<number, number>;
  swipeFirstPass: Record<number, number>; // Step 1 results: 1=favorable, -1=unfavorable, 0=neutral
  swipeStep: 1 | 2;
  currentSwipeIndex: number;
  currentSwipeStep2Index: number;
  compareScores: Record<number, number>;
  ratingScores: Record<number, number>;
  currentRatingIndex: number;
  comparisonCount: number;
  comments: Record<number, CardComment>;
  profile: UserProfile;
  animationsEnabled: boolean;
}

type CardAction =
  | { type: 'SET_GAME_MODE'; mode: GameMode }
  | { type: 'SWIPE_FIRST_PASS'; cardId: number; value: number }
  | { type: 'SWIPE_SECOND_PASS'; cardId: number; value: number }
  | { type: 'NEXT_SWIPE_CARD' }
  | { type: 'NEXT_SWIPE_STEP2_CARD' }
  | { type: 'START_SWIPE_STEP2' }
  | { type: 'COMPARE_WIN'; winnerId: number; loserId: number }
  | { type: 'COMPARE_TIE' }
  | { type: 'RATE_CARD'; cardId: number; score: number }
  | { type: 'RESET_SWIPE' }
  | { type: 'RESET_COMPARE' }
  | { type: 'RESET_RATING' }
  | { type: 'NEXT_RATING_CARD' }
  | { type: 'SET_COMMENT'; cardId: number; comment: CardComment }
  | { type: 'SET_PROFILE'; profile: Partial<UserProfile> }
  | { type: 'SET_ANIMATIONS_ENABLED'; enabled: boolean };

interface CardContextType {
  state: CardState;
  swipeFirstPass: (cardId: number, value: number) => void;
  swipeSecondPass: (cardId: number, value: number) => void;
  nextSwipeCard: () => void;
  nextSwipeStep2Card: () => void;
  startSwipeStep2: () => void;
  compareWin: (winnerId: number, loserId: number) => void;
  compareTie: () => void;
  rateCard: (cardId: number, score: number) => void;
  resetSwipe: () => void;
  resetCompare: () => void;
  resetRating: () => void;
  nextRatingCard: () => void;
  setGameMode: (mode: GameMode) => void;
  setComment: (cardId: number, comment: CardComment) => void;
  setProfile: (profile: Partial<UserProfile>) => void;
  setAnimationsEnabled: (enabled: boolean) => void;
}

// Initial state
const initialState: CardState = {
  gameMode: 'rate',
  swipeScores: {},
  swipeFirstPass: {},
  swipeStep: 1,
  currentSwipeIndex: 0,
  currentSwipeStep2Index: 0,
  compareScores: {},
  ratingScores: {},
  currentRatingIndex: 0,
  comparisonCount: 0,
  comments: {},
  profile: {
    roles: [],
    territoryLink: null,
    source: null,
  },
  animationsEnabled: true,
};

// Reducer
function cardReducer(state: CardState, action: CardAction): CardState {
  switch (action.type) {
    case 'SET_GAME_MODE':
      return {
        ...state,
        gameMode: action.mode,
      };
    case 'SWIPE_FIRST_PASS':
      return {
        ...state,
        swipeFirstPass: {
          ...state.swipeFirstPass,
          [action.cardId]: action.value,
        },
        swipeScores: {
          ...state.swipeScores,
          [action.cardId]: action.value,
        },
      };
    case 'SWIPE_SECOND_PASS':
      return {
        ...state,
        swipeScores: {
          ...state.swipeScores,
          [action.cardId]: action.value,
        },
      };
    case 'NEXT_SWIPE_CARD':
      return {
        ...state,
        currentSwipeIndex: state.currentSwipeIndex + 1,
      };
    case 'NEXT_SWIPE_STEP2_CARD':
      return {
        ...state,
        currentSwipeStep2Index: state.currentSwipeStep2Index + 1,
      };
    case 'START_SWIPE_STEP2':
      return {
        ...state,
        swipeStep: 2,
        currentSwipeStep2Index: 0,
      };
    case 'COMPARE_WIN':
      return {
        ...state,
        compareScores: {
          ...state.compareScores,
          [action.winnerId]: (state.compareScores[action.winnerId] || 0) + 1,
          [action.loserId]: (state.compareScores[action.loserId] || 0) - 1,
        },
        comparisonCount: state.comparisonCount + 1,
      };
    case 'COMPARE_TIE':
      return {
        ...state,
        comparisonCount: state.comparisonCount + 1,
      };
    case 'RATE_CARD':
      return {
        ...state,
        ratingScores: {
          ...state.ratingScores,
          [action.cardId]: action.score,
        },
      };
    case 'NEXT_RATING_CARD':
      return {
        ...state,
        currentRatingIndex: state.currentRatingIndex + 1,
      };
    case 'RESET_SWIPE':
      return {
        ...state,
        swipeScores: {},
        swipeFirstPass: {},
        swipeStep: 1,
        currentSwipeIndex: 0,
        currentSwipeStep2Index: 0,
      };
    case 'RESET_COMPARE':
      return {
        ...state,
        compareScores: {},
        comparisonCount: 0,
      };
    case 'RESET_RATING':
      return {
        ...state,
        ratingScores: {},
        currentRatingIndex: 0,
      };
    case 'SET_COMMENT':
      return {
        ...state,
        comments: {
          ...state.comments,
          [action.cardId]: action.comment,
        },
      };
    case 'SET_ANIMATIONS_ENABLED':
      return { ...state, animationsEnabled: action.enabled };
    case 'SET_PROFILE':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.profile,
        },
      };
    default:
      return state;
  }
}

// Context
const CardContext = createContext<CardContextType | undefined>(undefined);

// Provider
export function CardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cardReducer, initialState);

  const swipeFirstPass = (cardId: number, value: number) => {
    dispatch({ type: 'SWIPE_FIRST_PASS', cardId, value });
  };

  const swipeSecondPass = (cardId: number, value: number) => {
    dispatch({ type: 'SWIPE_SECOND_PASS', cardId, value });
  };

  const nextSwipeCard = () => {
    dispatch({ type: 'NEXT_SWIPE_CARD' });
  };

  const nextSwipeStep2Card = () => {
    dispatch({ type: 'NEXT_SWIPE_STEP2_CARD' });
  };

  const startSwipeStep2 = () => {
    dispatch({ type: 'START_SWIPE_STEP2' });
  };

  const compareWin = (winnerId: number, loserId: number) => {
    dispatch({ type: 'COMPARE_WIN', winnerId, loserId });
  };

  const compareTie = () => {
    dispatch({ type: 'COMPARE_TIE' });
  };

  const resetSwipe = () => {
    dispatch({ type: 'RESET_SWIPE' });
  };

  const resetCompare = () => {
    dispatch({ type: 'RESET_COMPARE' });
  };

  const rateCard = (cardId: number, score: number) => {
    dispatch({ type: 'RATE_CARD', cardId, score });
  };

  const resetRating = () => {
    dispatch({ type: 'RESET_RATING' });
  };

  const nextRatingCard = () => {
    dispatch({ type: 'NEXT_RATING_CARD' });
  };

  const setGameMode = (mode: GameMode) => {
    dispatch({ type: 'SET_GAME_MODE', mode });
  };

  const setComment = (cardId: number, comment: CardComment) => {
    dispatch({ type: 'SET_COMMENT', cardId, comment });
  };

  const setProfile = (profile: Partial<UserProfile>) => {
    dispatch({ type: 'SET_PROFILE', profile });
  };

  const setAnimationsEnabled = (enabled: boolean) => {
    dispatch({ type: 'SET_ANIMATIONS_ENABLED', enabled });
  };

  return (
    <CardContext.Provider
      value={{
        state,
        swipeFirstPass,
        swipeSecondPass,
        nextSwipeCard,
        nextSwipeStep2Card,
        startSwipeStep2,
        compareWin,
        compareTie,
        rateCard,
        resetSwipe,
        resetCompare,
        resetRating,
        nextRatingCard,
        setGameMode,
        setComment,
        setProfile,
        setAnimationsEnabled,
      }}
    >
      {children}
    </CardContext.Provider>
  );
}

// Hook
export function useCards() {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCards must be used within a CardProvider');
  }
  return context;
}

// Card type
export interface CardData {
  id: number;
  name: string;
  image: ImageSourcePropType;
}

// Card images - must use require() for static imports
const cardImages: Record<string, ImageSourcePropType> = {
  'olivier-murette': require('@/assets/cards/OLIVIER-MURETTE.jpg'),
  'pente': require('@/assets/cards/PENTE.jpg'),
  'route': require('@/assets/cards/ROUTE.jpg'),
  'twi': require('@/assets/cards/TWI.jpg'),
  'abandon': require('@/assets/cards/abandon.jpg'),
  'apiculture': require('@/assets/cards/apiculture.jpg'),
  'drainage': require('@/assets/cards/drainage.jpg'),
  'faune-sauvage': require('@/assets/cards/faune-sauvage.jpg'),
  'hyper-pluviosite': require('@/assets/cards/hyper-pluviosite.jpg'),
  'irregularite-topographique': require('@/assets/cards/irregularite-topographique.jpg'),
  'pature': require('@/assets/cards/pature19s.jpg'),
  'stockage-eau': require('@/assets/cards/stockage-eau.jpg'),
  'substrat-geologique': require('@/assets/cards/substrat-geologique.jpg'),
  'terrasses': require('@/assets/cards/terrasses.jpg'),
  'utilagric': require('@/assets/cards/utilagric.jpg'),
};

// Constants
export const CARDS: CardData[] = [
  { id: 1, name: 'Olivier Murette', image: cardImages['olivier-murette'] },
  { id: 2, name: 'Pente', image: cardImages['pente'] },
  { id: 3, name: 'Route', image: cardImages['route'] },
  { id: 4, name: 'TWI', image: cardImages['twi'] },
  { id: 5, name: 'Abandon', image: cardImages['abandon'] },
  { id: 6, name: 'Apiculture', image: cardImages['apiculture'] },
  { id: 7, name: 'Drainage', image: cardImages['drainage'] },
  { id: 8, name: 'Faune Sauvage', image: cardImages['faune-sauvage'] },
  { id: 9, name: 'Hyper-pluviosité', image: cardImages['hyper-pluviosite'] },
  { id: 10, name: 'Irrégularité Topographique', image: cardImages['irregularite-topographique'] },
  { id: 11, name: 'Pâture', image: cardImages['pature'] },
  { id: 12, name: 'Stockage Eau', image: cardImages['stockage-eau'] },
  { id: 13, name: 'Substrat Géologique', image: cardImages['substrat-geologique'] },
  { id: 14, name: 'Terrasses', image: cardImages['terrasses'] },
  { id: 15, name: 'Utilisation Agricole', image: cardImages['utilagric'] },
];
