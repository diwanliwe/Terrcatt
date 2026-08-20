import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CARDS } from '@/context/CardContext';
import { MAX_LAYOUT_WIDTH } from '@/components/Card';

const RATING_DOTS = [
  { score: '-2', color: '#F44336' },
  { score: '-1', color: '#FF9800' },
  { score: '0', color: '#9E9E9E' },
  { score: '+1', color: '#8BC34A' },
  { score: '+2', color: '#4CAF50' },
];

interface OnboardingPage {
  key: string;
  title: string;
  body: string;
  imageCardId?: number;
  showRatingScale?: boolean;
}

const PAGES: OnboardingPage[] = [
  {
    key: 'welcome',
    title: 'Bienvenue sur Terrcatt',
    body:
      "En octobre 2020, la tempête Alex a dévasté la vallée de la Roya. " +
      "Ce projet de recherche participatif étudie comment les terrasses de culture " +
      "peuvent aider le territoire à se reconstruire.",
    imageCardId: 14, // Terrasses
  },
  {
    key: 'heritage',
    title: 'Un patrimoine à réhabiliter',
    body:
      "La vallée compte près de 23 000 terrasses agricoles, aujourd'hui largement abandonnées. " +
      "Les recherches montrent qu'elles renforcent la résilience du territoire face aux " +
      "événements climatiques extrêmes.",
    imageCardId: 5, // Abandon
  },
  {
    key: 'rate',
    title: 'Notez 15 cartes',
    body:
      "Chaque carte présente une caractéristique du paysage. Indiquez si elle vous semble " +
      "favorable ou défavorable à la réhabilitation des terrasses, de −2 à +2.",
    imageCardId: 1, // Olivier Murette
    showRatingScale: true,
  },
  {
    key: 'results',
    title: 'Comparez votre regard',
    body:
      "Retrouvez votre classement dans l'onglet Résultats et comparez-le à la « vérité terrain » " +
      "établie par les scientifiques. Votre perception nourrit la recherche.",
    imageCardId: 12, // Stockage Eau
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingPage>>(null);
  const [pageIndex, setPageIndex] = useState(0);

  const contentWidth = Math.min(width, MAX_LAYOUT_WIDTH);
  const imageSize = contentWidth * 0.55;
  const isLastPage = pageIndex === PAGES.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== pageIndex && index >= 0 && index < PAGES.length) {
      setPageIndex(index);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleNext = () => {
    if (isLastPage) {
      handleClose();
    } else {
      listRef.current?.scrollToIndex({ index: pageIndex + 1, animated: true });
    }
  };

  const renderPage = ({ item }: { item: OnboardingPage }) => {
    const cardImage = item.imageCardId
      ? CARDS.find((c) => c.id === item.imageCardId)?.image
      : undefined;

    return (
      <View style={[styles.page, { width }]}>
        <View style={[styles.pageContent, { maxWidth: MAX_LAYOUT_WIDTH }]}>
          {cardImage && (
            <View style={[styles.imageFrame, { width: imageSize, height: imageSize }]}>
              <Image source={cardImage} style={styles.image} resizeMode="cover" />
            </View>
          )}

          {item.showRatingScale && (
            <View style={styles.ratingScaleRow}>
              {RATING_DOTS.map((dot) => (
                <View key={dot.score} style={[styles.ratingDot, { backgroundColor: dot.color }]}>
                  <Text style={styles.ratingDotText}>{dot.score}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={10}>
          <Text style={styles.skipText}>Passer</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(page) => page.key}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        onScroll={handleScroll}
        scrollEventThrottle={64}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {PAGES.map((page, i) => (
            <View
              key={page.key}
              style={[styles.dot, i === pageIndex && styles.dotActive]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>{isLastPage ? 'Commencer' : 'Suivant'}</Text>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#C4956A',
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  pageContent: {
    alignItems: 'center',
  },
  imageFrame: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#DEDDDA',
    backgroundColor: '#000',
    marginBottom: 28,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingScaleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
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
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 28,
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
  nextButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
