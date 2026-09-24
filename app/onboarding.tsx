import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
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
import { CARDS, HERO_CARD_ID, useCards, UserProfile, ProfileRole } from '@/context/CardContext';
import { MAX_LAYOUT_WIDTH } from '@/components/Card';

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

type StepKey = 'hook' | 'role' | 'territory' | 'source' | 'bridge';

const STEPS: StepKey[] = ['hook', 'role', 'territory', 'source', 'bridge'];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { state, setProfile, completeOnboarding } = useCards();
  const [stepIndex, setStepIndex] = useState(0);
  // Revisit from « En savoir plus » (already qualified) vs first arrival (gated).
  const isRevisit = state.onboardingCompletedAt !== null;

  const contentWidth = Math.min(width, MAX_LAYOUT_WIDTH);
  const imageSize = contentWidth * 0.55;
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
      case 'hook': {
        const image = CARDS.find((c) => c.id === HERO_CARD_ID)?.image;
        return (
          <View style={styles.narrativePage}>
            {image && (
              <View style={[styles.imageFrame, { width: imageSize, height: imageSize }]}>
                <Image source={image} style={styles.image} resizeMode="cover" />
              </View>
            )}
            <Text style={styles.title}>Bienvenue sur Terrcatt</Text>
            <Text style={styles.body}>
              En octobre 2020, la tempête Alex a dévasté la vallée de la Roya. Ses 23 000
              terrasses de culture, largement abandonnées, pourraient être une clé de la
              reconstruction. Ce projet de recherche participatif (Sorbonne Université) a
              besoin de votre regard.
            </Text>
          </View>
        );
      }
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
      case 'bridge':
        return (
          <View style={styles.narrativePage}>
            <AnimatedRatingScale />
            <Text style={styles.title}>À vous de jouer</Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletRow}>
                <Text style={styles.bulletEmoji}>🃏</Text>
                <Text style={styles.bulletText}>
                  18 cartes, chacune une caractéristique du paysage de la Roya.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletEmoji}>🗳️</Text>
                <Text style={styles.bulletText}>
                  Votez : favorable ou défavorable à la réhabilitation des terrasses ?
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletEmoji}>🔭</Text>
                <Text style={styles.bulletText}>
                  À la fin, explorez vos résultats et découvrez l'étude scientifique.
                </Text>
              </View>
            </View>

            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                Il n'y a pas de mauvaise réponse : ce jeu croise ce que pensent les
                participants avec ce que dit la science.
              </Text>
            </View>
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

  const buttonLabel = step === 'bridge' ? 'Commencer' : step === 'hook' ? 'Suivant' : 'Valider';

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

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {STEPS.map((key, i) => (
            <View key={key} style={[styles.dot, i === stepIndex && styles.dotActive]} />
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
  imageFrame: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#DEDDDA',
    backgroundColor: '#E3ECFF',
    marginBottom: 28,
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
  bulletList: {
    width: '100%',
    gap: 18,
    marginTop: 10,
    marginBottom: 28,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bulletEmoji: {
    fontSize: 38,
    lineHeight: 46,
    width: 48,
    textAlign: 'center',
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
    color: '#555',
  },
  noteBox: {
    width: '100%',
    backgroundColor: '#FAF3EC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8D9C8',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noteText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#8A6240',
    textAlign: 'center',
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
    fontSize: 24,
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
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'center',
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
  dotActive: {
    backgroundColor: '#C4956A',
    width: 20,
  },
});
