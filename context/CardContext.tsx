import React, { createContext, useContext, useReducer, useEffect, useRef, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { load, save, clear, createUserId, createDeviceSecret } from './persistence';
import { pushSnapshot, pushEvents, deleteSnapshot } from './sync';
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

/**
 * Every meaningful interaction, in order, with a timestamp. The final
 * `{cardId: score}` maps are convenient for the UI; this log is what the
 * research side needs (revisions, order effects) and can't be rebuilt later.
 */
export interface InteractionEvent {
  type: 'rate' | 'swipe1' | 'swipe2' | 'compare' | 'profile' | 'comment' | 'run' | 'onboarding';
  at: number; // epoch ms
  /** Which playthrough this event belongs to (1-based) — runs must never be mixed in analysis. */
  run: number;
  cardId?: number;
  value?: number;
  /** compare: the losing card; 0 = tie. */
  otherId?: number;
}

interface CardState {
  /** Anonymous participant id, created at first launch. No accounts, ever. */
  userId: string;
  /** Random per-device secret proving ownership of the server row. Not part of the snapshot. */
  deviceSecret: string;
  createdAt: number;
  /** 1-based playthrough counter; « Recommencer » starts a new run. */
  runIndex: number;
  /** When the qualification onboarding was finished; null gates the whole app. */
  onboardingCompletedAt: number | null;
  events: InteractionEvent[];
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
  | { type: 'SET_ANIMATIONS_ENABLED'; enabled: boolean }
  | { type: 'HYDRATE'; state: CardState }
  | { type: 'NEW_RUN' }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET_ALL' };

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
  /** Wipes every local trace and starts as a brand-new anonymous participant. */
  resetAll: () => Promise<void>;
  /** Clears the game and starts the next run for the same participant. */
  startNewRun: () => void;
  /** Marks the qualification onboarding as done, unlocking the app. */
  completeOnboarding: () => void;
}

// Initial state
const initialState: CardState = {
  userId: '',
  deviceSecret: '',
  createdAt: 0,
  runIndex: 1,
  onboardingCompletedAt: null,
  events: [],
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

function freshState(): CardState {
  return { ...initialState, userId: createUserId(), deviceSecret: createDeviceSecret(), createdAt: Date.now() };
}

function logged(state: CardState, event: Omit<InteractionEvent, 'at' | 'run'>): CardState {
  return { ...state, events: [...state.events, { ...event, at: Date.now(), run: state.runIndex }] };
}

// Reducer
function cardReducer(state: CardState, action: CardAction): CardState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;
    case 'RESET_ALL':
      return freshState();
    case 'COMPLETE_ONBOARDING':
      if (state.onboardingCompletedAt) return state; // revisits from Paramètres don't re-log
      return { ...logged(state, { type: 'onboarding' }), onboardingCompletedAt: Date.now() };
    case 'NEW_RUN': {
      // Same participant, next playthrough: game progress is cleared, but the
      // identity and the full event history (tagged per run) are kept.
      const next = state.runIndex + 1;
      return {
        ...state,
        runIndex: next,
        events: [...state.events, { type: 'run', at: Date.now(), value: next, run: next }],
        swipeScores: {},
        swipeFirstPass: {},
        swipeStep: 1,
        currentSwipeIndex: 0,
        currentSwipeStep2Index: 0,
        compareScores: {},
        comparisonCount: 0,
        ratingScores: {},
        currentRatingIndex: 0,
        comments: {},
      };
    }
    case 'SET_GAME_MODE':
      return {
        ...state,
        gameMode: action.mode,
      };
    case 'SWIPE_FIRST_PASS':
      return {
        ...logged(state, { type: 'swipe1', cardId: action.cardId, value: action.value }),
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
        ...logged(state, { type: 'swipe2', cardId: action.cardId, value: action.value }),
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
        ...logged(state, { type: 'compare', cardId: action.winnerId, otherId: action.loserId }),
        compareScores: {
          ...state.compareScores,
          [action.winnerId]: (state.compareScores[action.winnerId] || 0) + 1,
          [action.loserId]: (state.compareScores[action.loserId] || 0) - 1,
        },
        comparisonCount: state.comparisonCount + 1,
      };
    case 'COMPARE_TIE':
      return {
        ...logged(state, { type: 'compare', otherId: 0 }),
        comparisonCount: state.comparisonCount + 1,
      };
    case 'RATE_CARD':
      return {
        ...logged(state, { type: 'rate', cardId: action.cardId, value: action.score }),
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
        ...logged(state, { type: 'comment', cardId: action.cardId }),
        comments: {
          ...state.comments,
          [action.cardId]: action.comment,
        },
      };
    case 'SET_ANIMATIONS_ENABLED':
      return { ...state, animationsEnabled: action.enabled };
    case 'SET_PROFILE':
      return {
        ...logged(state, { type: 'profile' }),
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
  const [hydrated, setHydrated] = useState(false);

  // Load the participant's local record once; create the identity on first launch.
  useEffect(() => {
    let cancelled = false;
    load<CardState>().then((stored) => {
      if (cancelled) return;
      // runIndex arrived after the first persisted snapshots: default old records to run 1.
      dispatch({
        type: 'HYDRATE',
        state: stored
          ? { ...stored, runIndex: stored.runIndex ?? 1, onboardingCompletedAt: stored.onboardingCompletedAt ?? null }
          : freshState(),
      });
      setHydrated(true);
      SplashScreen.hideAsync();
    });
    return () => { cancelled = true; };
  }, []);

  // Every change is written locally, debounced so a burst of dispatches costs one write.
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(state), 250);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, hydrated]);

  // Sync: push the whole snapshot after each meaningful moment (every logged
  // interaction) and whenever the app comes to the foreground. Offline-first —
  // a failed push just leaves the snapshot dirty for the next trigger.
  const dirty = useRef(false);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(state);
  latest.current = state;
  const flush = async () => {
    const s = latest.current;
    // The event log is NOT part of the snapshot: events are stored only in
    // the relational events table. The secret never leaves the device.
    const { deviceSecret, events, ...snapshot } = s;
    // Snapshot first (it creates the participant row the events reference).
    const snapOk = await pushSnapshot(s.userId, deviceSecret, snapshot);
    const eventsOk = snapOk && (await pushEvents(s.userId, deviceSecret, events));
    if (snapOk && eventsOk) dirty.current = false;
  };
  useEffect(() => {
    if (!hydrated) return;
    dirty.current = true;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(flush, 1500);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [state.events.length, hydrated]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active' && hydrated && dirty.current) flush();
    });
    return () => sub.remove();
  }, [hydrated]);

  const completeOnboarding = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const startNewRun = () => {
    dispatch({ type: 'NEW_RUN' });
  };

  const resetAll = async () => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    await deleteSnapshot(latest.current.userId, latest.current.deviceSecret);
    await clear();
    dispatch({ type: 'RESET_ALL' });
  };

  if (!hydrated) return null;

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
        resetAll,
        startNewRun,
        completeOnboarding,
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

// Card images - must use require() for static imports.
// Final designs (Sept 2026): square 1024px, cropped to the card interior so
// the title baked into each image is always visible.
const cardImages: Record<string, ImageSourcePropType> = {
  'abandon-agricole': require('@/assets/cards/abandon-agricole.jpg'),
  'accumulation-eau': require('@/assets/cards/accumulation-eau.jpg'),
  'apiculture': require('@/assets/cards/apiculture.jpg'),
  'drainage-eau': require('@/assets/cards/drainage-eau.jpg'),
  'moyenne-montagne': require('@/assets/cards/moyenne-montagne.jpg'),
  'murs-non-entretenus': require('@/assets/cards/murs-non-entretenus.jpg'),
  'oliveraie-fleurie': require('@/assets/cards/oliveraie-fleurie.jpg'),
  'olivier-murette': require('@/assets/cards/olivier-murette.jpg'),
  'passe-agricole': require('@/assets/cards/passe-agricole.jpg'),
  'patrimoine-paysager': require('@/assets/cards/patrimoine-paysager.jpg'),
  'pente-tres-forte': require('@/assets/cards/pente-tres-forte.jpg'),
  'pluies-abondantes': require('@/assets/cards/pluies-abondantes.jpg'),
  'proximite-route': require('@/assets/cards/proximite-route.jpg'),
  'faune-sauvage-abandon': require('@/assets/cards/faune-sauvage-abandon.jpg'),
  'faune-sauvage': require('@/assets/cards/faune-sauvage.jpg'),
  'stockage-eau': require('@/assets/cards/stockage-eau.jpg'),
  'substrat-geologique': require('@/assets/cards/substrat-geologique.jpg'),
  'terrasse-fleurie': require('@/assets/cards/terrasse-fleurie.jpg'),
};

/** Card used as the generic "terrace" illustration outside the game (onboarding, detail page). */
export const HERO_CARD_ID = 10;

// Constants: the 18 cards of the Terrcatt game (order follows the design folder)
export const CARDS: CardData[] = [
  { id: 1, name: 'Abandon agricole', image: cardImages['abandon-agricole'] },
  { id: 2, name: "Accumulation d'eau au-dessus de la murette", image: cardImages['accumulation-eau'] },
  { id: 3, name: 'Apiculture', image: cardImages['apiculture'] },
  { id: 4, name: "Drainage de l'eau", image: cardImages['drainage-eau'] },
  { id: 5, name: 'Moyenne montagne', image: cardImages['moyenne-montagne'] },
  { id: 6, name: 'Murs non entretenus', image: cardImages['murs-non-entretenus'] },
  { id: 7, name: 'Oliveraie fleurie', image: cardImages['oliveraie-fleurie'] },
  { id: 8, name: "Olivier planté au bord d'une murette", image: cardImages['olivier-murette'] },
  { id: 9, name: 'Passé agricole', image: cardImages['passe-agricole'] },
  { id: 10, name: 'Patrimoine paysager', image: cardImages['patrimoine-paysager'] },
  { id: 11, name: 'Pente très forte', image: cardImages['pente-tres-forte'] },
  { id: 12, name: 'Pluies très abondantes', image: cardImages['pluies-abondantes'] },
  { id: 13, name: "Proximité d'une route", image: cardImages['proximite-route'] },
  { id: 14, name: "Rôle de la faune sauvage et de l'abandon agricole", image: cardImages['faune-sauvage-abandon'] },
  { id: 15, name: 'Rôle de la faune sauvage', image: cardImages['faune-sauvage'] },
  { id: 16, name: "Stockage de l'eau", image: cardImages['stockage-eau'] },
  { id: 17, name: 'Substrat géologique fragile (éboulis)', image: cardImages['substrat-geologique'] },
  { id: 18, name: 'Terrasse fleurie', image: cardImages['terrasse-fleurie'] },
];
