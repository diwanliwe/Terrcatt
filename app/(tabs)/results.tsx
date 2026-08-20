import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import { useCards, CARDS, CardData, CardComment } from '@/context/CardContext';
import { Card } from '@/components/Card';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// --- PLACEHOLDER: Replace with real terrain truth data ---
const GROUND_TRUTH_SCORES: Record<number, number> = {
  1: 2, 2: -1, 3: -2, 4: 1, 5: -2, 6: 1, 7: 2, 8: 0,
  9: -1, 10: -1, 11: 0, 12: 2, 13: 0, 14: 2, 15: 1,
};

const GROUND_TRUTH_EXPLANATIONS: Record<number, string> = {
  1: "Les oliviers en murette sont un indicateur fort de terrasses bien entretenues. Leur présence signale un système agricole traditionnel résilient et productif.",
  2: "Une pente forte augmente le risque d'érosion et rend la réhabilitation des terrasses plus difficile et coûteuse.",
  3: "La proximité d'une route facilite l'accès mais peut aussi fragmenter le paysage et augmenter les risques de ruissellement concentré.",
  4: "Un indice topographique d'humidité élevé indique une bonne rétention d'eau, favorable à la végétation et à la stabilité des terrasses.",
  5: "L'abandon prolongé des terrasses entraîne une dégradation rapide des murs de soutènement et une perte de la capacité de rétention d'eau.",
  6: "L'apiculture bénéficie de la biodiversité des terrasses fleuries et contribue à la pollinisation des cultures en terrasses.",
  7: "Un bon drainage est essentiel pour la stabilité des murs de terrasses et prévient les glissements de terrain lors de fortes pluies.",
  8: "La faune sauvage a un impact ambivalent : elle peut endommager les murs mais aussi contribuer à la dispersion des graines et à la biodiversité.",
  9: "L'hyper-pluviosité met à rude épreuve les terrasses, augmentant le risque d'effondrement des murs et de saturation des sols.",
  10: "L'irrégularité topographique complique la mécanisation et l'entretien régulier des terrasses.",
  11: "La pâture modérée peut aider à entretenir la végétation des terrasses, mais un surpâturage dégrade les sols et les murs.",
  12: "Le stockage d'eau est une fonction clé des terrasses, réduisant le ruissellement et augmentant la résilience face aux sécheresses.",
  13: "Le substrat géologique influence directement la stabilité des murs et la capacité de drainage naturel des terrasses.",
  14: "Les terrasses elles-mêmes sont le cœur du système : elles retiennent les sols, stockent l'eau et créent des microclimats favorables.",
  15: "L'utilisation agricole active des terrasses est le meilleur garant de leur entretien et de leur pérennité.",
};

// --- Color mapping ---

const SCORE_COLORS: Record<number, string> = {
  '-2': '#D9534F', // red
  '-1': '#E8943A', // orange
  '0': '#A0A0A0',  // gray
  '1': '#8BC34A',  // light green
  '2': '#4CAF50',  // green
};

function lerpColor(a: string, b: string, t: number): string {
  const parseHex = (hex: string) => {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const [r1, g1, b1] = parseHex(a);
  const [r2, g2, b2] = parseHex(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
}

function scoreToColor(score: number): string {
  const clamped = Math.max(-2, Math.min(2, score));
  if (Number.isInteger(clamped)) return SCORE_COLORS[`${clamped}`];
  const lower = Math.floor(clamped);
  const upper = Math.ceil(clamped);
  const t = clamped - lower;
  return lerpColor(SCORE_COLORS[`${lower}`], SCORE_COLORS[`${upper}`], t);
}

function normalizeCompareScores(scores: Record<number, number>): Record<number, number> {
  const values = Object.values(scores);
  if (values.length === 0) return {};
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const normalized: Record<number, number> = {};
  for (const [id, val] of Object.entries(scores)) {
    normalized[Number(id)] = range === 0 ? 0 : ((val - min) / range) * 4 - 2;
  }
  return normalized;
}

// --- Divergence helpers ---

function divergenceLabel(gap: number): string {
  if (gap === 0) return 'Identique';
  return `Écart : ${gap} position${gap > 1 ? 's' : ''}`;
}

function divergenceColor(gap: number): string {
  if (gap <= 2) return '#4CAF50';
  if (gap <= 5) return '#E8943A';
  return '#D9534F';
}

// --- Ground Truth Modal ---

interface GroundTruthModalProps {
  visible: boolean;
  card: CardData | null;
  userRank: number;
  userScore: number | undefined;
  groundTruthRank: number;
  groundTruthScore: number;
  explanation: string;
  comment: CardComment | undefined;
  onComment: (comment: CardComment) => void;
  onClose: () => void;
}

function GroundTruthModal({
  visible,
  card,
  userRank,
  userScore,
  groundTruthRank,
  groundTruthScore,
  explanation,
  comment,
  onComment,
  onClose,
}: GroundTruthModalProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [commentText, setCommentText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync text with stored comment when card changes
  useEffect(() => {
    if (visible && card) {
      setCommentText(comment?.text ?? '');
    }
  }, [visible, card?.id]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      soundRef.current?.unloadAsync();
    };
  }, []);

  const handleClose = () => {
    // Save text comment if changed
    if (card && (commentText.trim() !== (comment?.text ?? ''))) {
      onComment({ text: commentText.trim(), audioUri: comment?.audioUri });
    }
    stopPlayback();
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current || !card) return;
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setIsRecording(false);
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (uri) {
        onComment({ text: commentText.trim(), audioUri: uri });
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const stopPlayback = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async () => {
    const uri = comment?.audioUri;
    if (!uri) return;

    if (isPlaying) {
      await stopPlayback();
      return;
    }

    try {
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
      await sound.playAsync();
    } catch (err) {
      console.error('Failed to play audio', err);
      setIsPlaying(false);
    }
  };

  const deleteAudio = () => {
    if (card) {
      stopPlayback();
      onComment({ text: commentText.trim(), audioUri: undefined });
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!card) return null;

  const gap = Math.abs(userRank - groundTruthRank);
  const userScoreDisplay = userScore !== undefined ? (userScore > 0 ? `+${userScore}` : `${userScore}`) : '-';
  const gtScoreDisplay = groundTruthScore > 0 ? `+${groundTruthScore}` : `${groundTruthScore}`;
  const userColor = userScore !== undefined ? scoreToColor(userScore) : '#A0A0A0';
  const gtColor = scoreToColor(groundTruthScore);
  const hasAudio = !!comment?.audioUri;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={modalStyles.backdrop} onPress={handleClose}>
          <Animated.View style={[modalStyles.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={modalStyles.handle} />

            <Text style={modalStyles.title}>{card.name}</Text>

            <View style={modalStyles.comparisonRow}>
              <View style={modalStyles.comparisonCol}>
                <Text style={modalStyles.colLabel}>Votre classement</Text>
                <View style={modalStyles.rankRow}>
                  <View style={[modalStyles.colorDot, { backgroundColor: userColor }]} />
                  <Text style={modalStyles.rankValue}>#{userRank}</Text>
                </View>
                <Text style={modalStyles.scoreValue}>Score : {userScoreDisplay}</Text>
              </View>

              <View style={modalStyles.divider} />

              <View style={modalStyles.comparisonCol}>
                <Text style={modalStyles.colLabel}>Vérité terrain</Text>
                <View style={modalStyles.rankRow}>
                  <View style={[modalStyles.colorDot, { backgroundColor: gtColor }]} />
                  <Text style={modalStyles.rankValue}>#{groundTruthRank}</Text>
                </View>
                <Text style={modalStyles.scoreValue}>Score : {gtScoreDisplay}</Text>
              </View>
            </View>

            <View style={[modalStyles.divergenceBadge, { backgroundColor: divergenceColor(gap) + '20' }]}>
              <Text style={[modalStyles.divergenceText, { color: divergenceColor(gap) }]}>
                {divergenceLabel(gap)}
              </Text>
            </View>

            <ScrollView style={modalStyles.explanationScroll} bounces={false}>
              <Text style={modalStyles.explanationTitle}>Pourquoi ce classement terrain ?</Text>
              <Text style={modalStyles.explanationText}>{explanation}</Text>
            </ScrollView>

            {/* Comment section */}
            <View style={modalStyles.commentSection}>
              <Text style={modalStyles.commentLabel}>Votre commentaire</Text>

              <View style={modalStyles.commentInputRow}>
                <TextInput
                  style={modalStyles.commentInput}
                  placeholder="Ajouter un commentaire..."
                  placeholderTextColor="#999"
                  value={commentText}
                  onChangeText={setCommentText}
                  onBlur={() => {
                    if (card && commentText.trim() !== (comment?.text ?? '')) {
                      onComment({ text: commentText.trim(), audioUri: comment?.audioUri });
                    }
                  }}
                  multiline
                  maxLength={500}
                />

                <Pressable
                  onPress={isRecording ? stopRecording : startRecording}
                  style={[
                    modalStyles.micButton,
                    isRecording && modalStyles.micButtonRecording,
                  ]}
                >
                  <FontAwesome
                    name={isRecording ? 'stop' : 'microphone'}
                    size={18}
                    color={isRecording ? '#fff' : '#C4956A'}
                  />
                </Pressable>
              </View>

              {isRecording && (
                <View style={modalStyles.recordingIndicator}>
                  <View style={modalStyles.recordingDot} />
                  <Text style={modalStyles.recordingText}>
                    Enregistrement... {formatDuration(recordingDuration)}
                  </Text>
                </View>
              )}

              {hasAudio && !isRecording && (
                <View style={modalStyles.audioRow}>
                  <Pressable onPress={playAudio} style={modalStyles.audioPlayButton}>
                    <FontAwesome
                      name={isPlaying ? 'pause' : 'play'}
                      size={14}
                      color="#fff"
                    />
                  </Pressable>
                  <Text style={modalStyles.audioLabel}>
                    {isPlaying ? 'Lecture en cours...' : 'Note vocale enregistrée'}
                  </Text>
                  <Pressable onPress={deleteAudio} style={modalStyles.audioDeleteButton}>
                    <FontAwesome name="trash-o" size={16} color="#D9534F" />
                  </Pressable>
                </View>
              )}
            </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// --- Mode config ---

const MODE_CONFIG = {
  swipe: {
    title: 'Classement Glisser',
    emptyMessage: 'Jouez en mode Glisser pour commencer',
  },
  compare: {
    title: 'Classement Comparaison',
    emptyMessage: 'Jouez en mode Comparer pour commencer',
  },
  rate: {
    title: 'Votre classement',
    emptyMessage: 'Notez les cartes dans l\'onglet Jeu pour commencer',
  },
} as const;

// --- Main screen ---

export default function ResultsScreen() {
  const { state, setComment } = useCards();
  const { gameMode } = state;
  const config = MODE_CONFIG[gameMode];

  const [selectedCard, setSelectedCard] = useState<{ card: CardData; rank: number } | null>(null);

  const scores =
    gameMode === 'swipe' ? state.swipeScores :
    gameMode === 'compare' ? state.compareScores :
    state.ratingScores;

  const hasData = Object.keys(scores).length > 0;

  const normalizedScores = useMemo(() => {
    if (gameMode === 'compare') return normalizeCompareScores(scores);
    return scores;
  }, [scores, gameMode]);

  const ranking = useMemo(() => {
    const fallback = gameMode === 'rate' ? -999 : 0;
    return [...CARDS].sort((a, b) => {
      const scoreA = scores[a.id] ?? fallback;
      const scoreB = scores[b.id] ?? fallback;
      return scoreB - scoreA;
    });
  }, [scores, gameMode]);

  const groundTruthRanking = useMemo(() => {
    const sorted = [...CARDS].sort((a, b) => {
      return (GROUND_TRUTH_SCORES[b.id] ?? 0) - (GROUND_TRUTH_SCORES[a.id] ?? 0);
    });
    const ranks: Record<number, number> = {};
    sorted.forEach((card, i) => { ranks[card.id] = i + 1; });
    return ranks;
  }, []);

  const formatScore = (card: CardData) => {
    const score = scores[card.id];
    if (score === undefined) {
      return gameMode === 'rate' ? '-' : '0';
    }
    return score > 0 ? `+${score}` : `${score}`;
  };

  const getRowColor = (card: CardData): string | null => {
    if (!hasData) return null;
    const ns = normalizedScores[card.id];
    if (ns === undefined) return null;
    return scoreToColor(ns);
  };

  const renderItem = ({ item, index }: { item: CardData; index: number }) => {
    const color = getRowColor(item);
    const cardComment = state.comments[item.id];
    const hasComment = cardComment && (cardComment.text || cardComment.audioUri);

    return (
      <Pressable
        onPress={() => setSelectedCard({ card: item, rank: index + 1 })}
        style={({ pressed }) => [
          styles.cardRow,
          color ? { backgroundColor: color + '18', borderLeftWidth: 4, borderLeftColor: color } : null,
          pressed && styles.cardRowPressed,
        ]}
      >
        <Text style={styles.rankText}>#{index + 1}</Text>
        <Card card={item} size="small" />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.scoreText}>{formatScore(item)}</Text>
        </View>
        {hasComment && (
          <FontAwesome name="comment" size={14} color="#C4956A" style={{ marginRight: 4 }} />
        )}
        <FontAwesome name="chevron-right" size={14} color="#C4956A" style={styles.chevron} />
      </Pressable>
    );
  };

  const selectedGtRank = selectedCard ? (groundTruthRanking[selectedCard.card.id] ?? 1) : 1;
  const selectedGtScore = selectedCard ? (GROUND_TRUTH_SCORES[selectedCard.card.id] ?? 0) : 0;
  const selectedExplanation = selectedCard
    ? (GROUND_TRUTH_EXPLANATIONS[selectedCard.card.id] ?? 'Aucune explication disponible.')
    : '';

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{config.title}</Text>

      {hasData ? (
        <FlatList
          data={ranking}
          keyExtractor={(card) => `result-${card.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune donnée</Text>
          <Text style={styles.emptySubtext}>{config.emptyMessage}</Text>
        </View>
      )}

      <GroundTruthModal
        visible={selectedCard !== null}
        card={selectedCard?.card ?? null}
        userRank={selectedCard?.rank ?? 1}
        userScore={selectedCard ? scores[selectedCard.card.id] : undefined}
        groundTruthRank={selectedGtRank}
        groundTruthScore={selectedGtScore}
        explanation={selectedExplanation}
        comment={selectedCard ? state.comments[selectedCard.card.id] : undefined}
        onComment={(c) => {
          if (selectedCard) setComment(selectedCard.card.id, c);
        }}
        onClose={() => setSelectedCard(null)}
      />
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFA',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  cardRowPressed: {
    opacity: 0.7,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C4956A',
    width: 32,
    textAlign: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 4,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  scoreText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chevron: {
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#999',
  },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonCol: {
    flex: 1,
    alignItems: 'center',
  },
  colLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  rankValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  scoreValue: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  divergenceBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  divergenceText: {
    fontSize: 15,
    fontWeight: '600',
  },
  explanationScroll: {
    maxHeight: 180,
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  commentSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 16,
  },
  commentLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    maxHeight: 80,
    backgroundColor: '#FAFAFA',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF5EE',
    borderWidth: 1,
    borderColor: '#C4956A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonRecording: {
    backgroundColor: '#D9534F',
    borderColor: '#D9534F',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9534F',
  },
  recordingText: {
    fontSize: 13,
    color: '#D9534F',
    fontWeight: '600',
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#F5F0EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  audioPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C4956A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioLabel: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  audioDeleteButton: {
    padding: 6,
  },
});
