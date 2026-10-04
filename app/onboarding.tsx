import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CARDS, useCards, UserProfile, ProfileRole } from '@/context/CardContext';
import { Card, MAX_LAYOUT_WIDTH } from '@/components/Card';

// Entry photograph: the Roya valley and Breil-sur-Roya seen from the Arpette summit.
// Horizon06, CC BY-SA 4.0, Wikimedia Commons (credited in « En savoir plus »).
const ENTRY_PHOTO = require('@/assets/images/roya-vallee.jpg');


const RATING_DOTS = [
  { score: '-2', color: '#F44336' },
  { score: '-1', color: '#FF9800' },
  { score: '0', color: '#9E9E9E' },
  { score: '+1', color: '#8BC34A' },
  { score: '+2', color: '#4CAF50' },
];

interface QuestionOption {
  value: string;
  emoji: string;
  label: string;
}

const ROLE_OPTIONS: QuestionOption[] = [
  { value: 'owner', emoji: '🏡', label: 'Propriétaire de terrasses ou de terrain' },
  { value: 'public-actor', emoji: '🏛️', label: 'Élu·e ou acteur public' },
  { value: 'researcher', emoji: '🔬', label: 'Chercheur·se ou étudiant·e' },
  { value: 'agri-professional', emoji: '🚜', label: "Professionnel·le de l'agriculture ou du paysage" },
  { value: 'resident', emoji: '🏘️', label: 'Habitant·e de la vallée' },
  { value: 'curious', emoji: '👀', label: 'Curieux·se' },
];

const TERRITORY_OPTIONS: QuestionOption[] = [
  { value: 'roya', emoji: '📍', label: "J'habite ou je connais bien la vallée de la Roya" },
  { value: 'similar-territory', emoji: '🌍', label: 'Mon territoire fait face à des défis similaires' },
  { value: 'no-link', emoji: '🗺️', label: 'Aucun lien particulier, je découvre' },
];

const SOURCE_OPTIONS: QuestionOption[] = [
  { value: 'university', emoji: '🎓', label: "L'université ou l'équipe de recherche" },
  { value: 'word-of-mouth', emoji: '💬', label: 'Bouche à oreille' },
  { value: 'event', emoji: '🎪', label: 'Un atelier ou événement du projet' },
  { value: 'social-media', emoji: '📱', label: 'Réseaux sociaux' },
  { value: 'press', emoji: '📰', label: 'Presse ou média' },
  { value: 'online-search', emoji: '🔎', label: 'Recherche en ligne' },
  { value: 'other', emoji: '✨', label: 'Autre' },
];

const DOT_CYCLE_MS = 2200;

function AnimatedRatingDot({
  dot,
  active,
}: {
  dot: { score: string; color: string };
  active: boolean;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (active) {
      // Gentle pulse: grow, hold briefly, settle back — fully done before the next dot starts.
      scale.value = withSequence(
        withTiming(1.25, { duration: 280 }),
        withDelay(350, withTiming(1, { duration: 280 }))
      );
    }
  }, [active, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.ratingDot, { backgroundColor: dot.color }, animatedStyle]}>
      <Text style={styles.ratingDotText}>{dot.score}</Text>
    </Animated.View>
  );
}

function AnimatedRatingScale() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        // Random pick, but never the same dot twice in a row
        const next = Math.floor(Math.random() * RATING_DOTS.length);
        return next === prev ? (next + 1) % RATING_DOTS.length : next;
      });
    }, DOT_CYCLE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.ratingScaleRow}>
      {RATING_DOTS.map((dot, i) => (
        <AnimatedRatingDot key={dot.score} dot={dot} active={i === activeIndex} />
      ))}
    </View>
  );
}

// Slow "Ken Burns" push-in on the entry photograph.
const KEN_BURNS_MS = 20000;
const KEN_BURNS_SCALE = 1.1;

function DriftingPhoto({ animated }: { animated: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (animated) scale.value = withTiming(KEN_BURNS_SCALE, { duration: KEN_BURNS_MS });
  }, [animated, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.Image
      source={ENTRY_PHOTO}
      style={[StyleSheet.absoluteFill, styles.image, animatedStyle]}
      resizeMode="cover"
    />
  );
}

type StepKey =
  | 'hook'
  | 'hookPhoto'
  | 'role'
  | 'territory'
  | 'source'
  // How the game works, one idea per page: the cards, the vote, no wrong answer.
  | 'howCards'
  | 'howVote'
  | 'howCompare';

// Two candidate first screens shown one after another while the client compares them
// (then delete the other one, its step and the version badges).
const STEPS: StepKey[] = [
  'hook',
  'hookPhoto',
  'role',
  'territory',
  'source',
  'howCards',
  'howVote',
  'howCompare',
];

/** Key words in a paragraph, bold so the text can be skimmed. `onLight` also darkens
 *  them; on the photo or on accent-coloured text they keep the inherited colour. */
function Strong({ children, onLight = false }: { children: React.ReactNode; onLight?: boolean }) {
  return <Text style={[styles.strong, onLight && styles.strongOnLight]}>{children}</Text>;
}

// "How it works" page: the cards go by one after another, as in the game, so the player
// sees there are many of them. Same slide-out / slide-in feel as RateMode.
const CAROUSEL_FIRST_HOLD_MS = 700;
const CAROUSEL_HOLD_MS = 1800;
const CAROUSEL_EXIT_MS = 260;
const CAROUSEL_ENTER_MS = 220;

function CardCarousel({ size, animated }: { size: number; animated: boolean }) {
  const [index, setIndex] = useState(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const advance = () => {
      if (!animated) {
        setIndex((i) => (i + 1) % CARDS.length);
        timer = setTimeout(advance, CAROUSEL_HOLD_MS);
        return;
      }
      translateX.value = withTiming(-size * 0.6, { duration: CAROUSEL_EXIT_MS });
      opacity.value = withTiming(0, { duration: CAROUSEL_EXIT_MS });
      timer = setTimeout(() => {
        setIndex((i) => (i + 1) % CARDS.length);
        translateX.value = size * 0.4;
        translateX.value = withTiming(0, { duration: CAROUSEL_ENTER_MS });
        opacity.value = withTiming(1, { duration: CAROUSEL_ENTER_MS });
        timer = setTimeout(advance, CAROUSEL_ENTER_MS + CAROUSEL_HOLD_MS);
      }, CAROUSEL_EXIT_MS);
    };
    // First change comes quickly, so players who tap through still see the cards move.
    timer = setTimeout(advance, CAROUSEL_FIRST_HOLD_MS);
    return () => clearTimeout(timer);
  }, [animated, size, translateX, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.carousel}>
      <Animated.View style={animatedStyle}>
        <Card card={CARDS[index]} style={{ width: size, height: size }} />
      </Animated.View>
    </View>
  );
}

const HOOK_VERSIONS: Partial<Record<StepKey, string>> = {
  hook: 'Version A : écran titre',
  hookPhoto: 'Version B : photo en haut',
};

function VersionBadge({ label, top }: { label: string; top: number }) {
  return (
    <View style={[styles.versionBadge, { top: top + 12 }]} pointerEvents="none">
      <Text style={styles.versionBadgeText}>{label}</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { state, setProfile, completeOnboarding } = useCards();
  const [stepIndex, setStepIndex] = useState(0);
  // Revisit from « En savoir plus » (already qualified) vs first arrival (gated).
  const isRevisit = state.onboardingCompletedAt !== null;

  // Smaller than in the game, to leave room for the text, but the same card.
  const carouselSize = Math.min(Math.min(width, MAX_LAYOUT_WIDTH) * 0.62, height * 0.36, 280);
  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const handleClose = () => {
    if (isRevisit && router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const goNext = () => {
    if (isLastStep) {
      completeOnboarding();
      handleClose();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const toggleRole = (value: string) => {
    const role = value as ProfileRole;
    const roles = state.profile.roles.includes(role)
      ? state.profile.roles.filter((r) => r !== role)
      : [...state.profile.roles, role];
    setProfile({ roles });
  };

  const selectSingle = (field: 'territoryLink' | 'source', value: string) => {
    setProfile({ [field]: value } as Partial<UserProfile>);
  };

  const renderOptions = (
    options: QuestionOption[],
    selectedValues: string[],
    onToggle: (value: string) => void
  ) => (
    <View style={styles.optionsList}>
      {options.map((option) => {
        const selected = selectedValues.includes(option.value);
        return (
          <Pressable
            key={option.value}
            style={({ pressed }) => [
              styles.optionCard,
              selected && styles.optionCardSelected,
              pressed && styles.optionCardPressed,
            ]}
            onPress={() => onToggle(option.value)}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 'hook':
      case 'hookPhoto':
        // Rendered full-screen by renderHook(), outside the padded step container.
        return null;
      case 'role':
        return (
          <View style={styles.questionPage}>
            <Text style={styles.title}>Qui êtes-vous ?</Text>
            <Text style={styles.subtitle}>
              Votre profil nous aide à comparer les regards sur le paysage.
            </Text>
            {renderOptions(ROLE_OPTIONS, state.profile.roles, toggleRole)}
            <Text style={styles.optionsHint}>Plusieurs réponses possibles</Text>
          </View>
        );
      case 'territory':
        return (
          <View style={styles.questionPage}>
            <Text style={styles.title}>Quel est votre lien avec le territoire ?</Text>
            {renderOptions(
              TERRITORY_OPTIONS,
              state.profile.territoryLink ? [state.profile.territoryLink] : [],
              (value) => selectSingle('territoryLink', value)
            )}
          </View>
        );
      case 'source':
        return (
          <View style={styles.questionPage}>
            <Text style={styles.title}>Comment avez-vous découvert Terrcatt ?</Text>
            {renderOptions(
              SOURCE_OPTIONS,
              state.profile.source ? [state.profile.source] : [],
              (value) => selectSingle('source', value)
            )}
          </View>
        );
      case 'howCards':
        return (
          <View style={styles.narrativePage}>
            <CardCarousel size={carouselSize} animated={state.animationsEnabled} />
            <Text style={styles.title}>Une carte, une situation</Text>
            <Text style={styles.slideBody}>
              Vous allez découvrir <Strong onLight>18 cartes</Strong>. Chacune montre une
              terrasse dans <Strong onLight>une situation particulière</Strong> : une pente très
              forte, des pluies abondantes, des ruches…
            </Text>
          </View>
        );
      case 'howVote':
        return (
          <View style={styles.narrativePage}>
            <AnimatedRatingScale />
            <View style={styles.scaleLabels}>
              <Text style={styles.scaleLabel}>Très défavorable</Text>
              <Text style={styles.scaleLabel}>Très favorable</Text>
            </View>
            <Text style={styles.title}>Donnez votre avis</Text>
            <Text style={styles.slideBody}>
              Pour chaque carte, dites si cette situation est{' '}
              <Strong onLight>favorable ou défavorable</Strong> à la{' '}
              <Strong onLight>réhabilitation des terrasses</Strong>, de{' '}
              <Strong onLight>-2 à +2</Strong>, selon votre ressenti.
            </Text>
          </View>
        );
      case 'howCompare':
        return (
          <View style={styles.narrativePage}>
            <View style={styles.compareRow}>
              <View style={styles.compareChip}>
                <Text style={styles.compareEmoji}>🙋</Text>
                <Text style={styles.compareLabel}>Votre regard</Text>
              </View>
              <Text style={styles.compareArrow}>⇄</Text>
              <View style={styles.compareChip}>
                <Text style={styles.compareEmoji}>🔬</Text>
                <Text style={styles.compareLabel}>L'étude</Text>
              </View>
            </View>
            <Text style={styles.title}>Il n'y a pas de mauvaise réponse</Text>
            <Text style={styles.slideBody}>
              Ce n'est <Strong onLight>pas un test</Strong> : nous voulons simplement connaître{' '}
              <Strong onLight>votre point de vue</Strong>.
            </Text>
            <Text style={[styles.slideBody, styles.slideBodyLast]}>
              À la fin, découvrez comment votre regard se compare aux{' '}
              <Strong onLight>résultats de l'étude scientifique</Strong>.
            </Text>
          </View>
        );
    }
  };

  const stepAnswered = (() => {
    switch (step) {
      case 'role':
        return state.profile.roles.length > 0;
      case 'territory':
        return state.profile.territoryLink !== null;
      case 'source':
        return state.profile.source !== null;
      default:
        return true;
    }
  })();

  const isHook = step === 'hook' || step === 'hookPhoto';
  const isExplanation = step === 'howCards' || step === 'howVote';
  const buttonLabel = isLastStep
    ? 'Commencer'
    : isHook
      ? 'Découvrir'
      : isExplanation
        ? 'Suivant'
        : 'Valider';

  const renderFooter = (onPhoto: boolean) => (
    <View style={styles.footer}>
      <View style={styles.dotsRow}>
        {STEPS.map((key, i) => (
          <View key={key} style={[styles.dot, onPhoto && styles.dotOnPhoto, i === stepIndex && styles.dotActive]} />
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.nextButton,
          !stepAnswered && styles.nextButtonDisabled,
          pressed && stepAnswered && styles.nextButtonPressed,
        ]}
        onPress={goNext}
        disabled={!stepAnswered}
      >
        <Text style={styles.nextButtonText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );

  // Title screen: the name, what it is (a game), then where the valley is and why it matters.
  const renderHook = () => (
    <View style={[styles.container, styles.splashContainer]}>
      <DriftingPhoto animated={state.animationsEnabled} />
      <LinearGradient
        colors={['rgba(20,14,8,0.45)', 'rgba(20,14,8,0.4)', 'rgba(20,14,8,0.88)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <VersionBadge label={HOOK_VERSIONS.hook ?? ''} top={insets.top} />
      <View style={[styles.splashContent, { paddingTop: insets.top }]}>
        <Text style={styles.splashWordmark}>Terrcatt</Text>
        <Text style={styles.splashPhrase}>
          Un <Strong>jeu</Strong> de partage des connaissances pour aider à la décision de{' '}
          <Strong>réhabiliter les terrasses</Strong>.
        </Text>
      </View>
      <Text style={styles.splashValley}>
        Dans la <Strong>vallée de la Roya</Strong>, entre Mercantour et Méditerranée,{' '}
        <Strong>23 000 terrasses en pierre sèche</Strong>, un savoir-faire{' '}
        <Strong>reconnu par l'UNESCO</Strong>.
      </Text>
      <View style={{ paddingBottom: insets.bottom + 20 }}>{renderFooter(true)}</View>
    </View>
  );

  // Version B: the photograph fills the top half with rounded bottom corners, the same
  // three lines of text below on the page background.
  const renderHookPhoto = () => (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Short screens give the photo less room so the three lines stay above the fold. */}
        <View style={[styles.photoHalf, { height: height < 720 ? height * 0.38 : Math.min(height * 0.5, 560) }]}>
          <DriftingPhoto animated={state.animationsEnabled} />
        </View>
        <VersionBadge label={HOOK_VERSIONS.hookPhoto ?? ''} top={insets.top} />
        <View style={[styles.photoHalfText, { maxWidth: MAX_LAYOUT_WIDTH }]}>
          <Text style={styles.photoHalfName}>Terrcatt</Text>
          <Text style={styles.photoHalfPhrase}>
            Un <Strong>jeu</Strong> de partage des connaissances pour aider à la décision de{' '}
            <Strong>réhabiliter les terrasses</Strong>.
          </Text>
          <Text style={styles.photoHalfValley}>
            Dans la <Strong onLight>vallée de la Roya</Strong>, entre Mercantour et
            Méditerranée, <Strong onLight>23 000 terrasses en pierre sèche</Strong>, un
            savoir-faire <Strong onLight>reconnu par l'UNESCO</Strong>.
          </Text>
        </View>
      </ScrollView>
      <View style={{ paddingBottom: insets.bottom + 20 }}>{renderFooter(false)}</View>
    </View>
  );

  if (step === 'hook') return renderHook();
  if (step === 'hookPhoto') return renderHookPhoto();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        {stepIndex > 0 ? (
          <Pressable onPress={goBack} hitSlop={10}>
            <Text style={styles.backText}>← Retour</Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.stepContainer, { maxWidth: MAX_LAYOUT_WIDTH }]}>{renderStep()}</View>
      </ScrollView>

      {renderFooter(false)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C4956A',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  stepContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 28,
  },
  narrativePage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionPage: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
  },
  versionBadge: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  versionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6240',
  },
  photoHalf: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#E3ECFF',
  },
  photoHalfText: {
    width: '100%',
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  photoHalfName: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
    letterSpacing: -1,
    color: '#2B2620',
    marginBottom: 10,
  },
  photoHalfPhrase: {
    fontSize: 18,
    lineHeight: 25,
    fontWeight: '600',
    color: '#8A6240',
    textAlign: 'center',
    marginBottom: 16,
  },
  photoHalfValley: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center',
  },
  splashContainer: {
    backgroundColor: '#2A2118',
    overflow: 'hidden',
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  splashWordmark: {
    fontSize: 60,
    lineHeight: 68,
    fontWeight: '800',
    letterSpacing: -1,
    color: '#FFFFFF',
    marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  splashPhrase: {
    fontSize: 19,
    lineHeight: 27,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    maxWidth: 340,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  splashValley: {
    alignSelf: 'center',
    maxWidth: 420,
    paddingHorizontal: 32,
    marginBottom: 4,
    fontSize: 15,
    lineHeight: 22,
    color: '#F1D3B0',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingScaleRow: {
    flexDirection: 'row',
    gap: 10,
    alignSelf: 'center',
    marginBottom: 28,
    paddingVertical: 8,
  },
  carousel: {
    alignItems: 'center',
    marginBottom: 28,
  },
  strong: {
    fontWeight: '800',
  },
  strongOnLight: {
    color: '#2B2620',
  },
  slideBody: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'center',
  },
  slideBodyLast: {
    marginTop: 12,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
    marginTop: -20,
    marginBottom: 24,
  },
  scaleLabel: {
    fontSize: 12,
    color: '#888',
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  compareChip: {
    alignItems: 'center',
    gap: 6,
    width: 104,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8D9C8',
    backgroundColor: '#FFFFFF',
  },
  compareEmoji: {
    fontSize: 32,
  },
  compareLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A6240',
  },
  compareArrow: {
    fontSize: 24,
    color: '#C4956A',
  },
  ratingDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingDotText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 14,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#777',
    textAlign: 'center',
    marginBottom: 10,
  },
  optionsList: {
    width: '100%',
    gap: 10,
    marginTop: 12,
  },
  optionsHint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DEDDDA',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  optionCardSelected: {
    borderColor: '#C4956A',
    backgroundColor: '#FAF3EC',
  },
  optionCardPressed: {
    opacity: 0.85,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: '#444',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#8A6240',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#C4956A',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 220,
    alignItems: 'center',
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonDisabled: {
    backgroundColor: '#E0D5C9',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 16,
    gap: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0D5C9',
  },
  dotOnPhoto: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotActive: {
    backgroundColor: '#C4956A',
    width: 20,
  },
});
