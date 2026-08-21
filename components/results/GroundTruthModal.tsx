import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  useWindowDimensions,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import { CardComment } from '@/context/CardContext';
import {
  ResultEntry,
  AGREEMENT_META,
  GROUND_TRUTH_EXPLANATIONS,
  scoreToColor,
  formatScore,
  scoreLabel,
  gapLabel,
} from './resultsData';

// --- Ground Truth Modal ---

interface GroundTruthModalProps {
  visible: boolean;
  entry: ResultEntry | null;
  comment: CardComment | undefined;
  onComment: (comment: CardComment) => void;
  onClose: () => void;
}

export function GroundTruthModal({
  visible,
  entry,
  comment,
  onComment,
  onClose,
}: GroundTruthModalProps) {
  const card = entry?.card ?? null;
  const userScore = entry?.userScore;
  const groundTruthScore = entry?.gtScore ?? 0;
  const explanation = card ? (GROUND_TRUTH_EXPLANATIONS[card.id] ?? 'Aucune explication disponible.') : '';
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
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
    onClose();
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

  const gap = entry?.gap ?? 0;
  const meta = AGREEMENT_META[entry?.agreement ?? 'accord'];
  const userColor = scoreToColor(userScore);
  const gtColor = scoreToColor(groundTruthScore);
  const hasAudio = !!comment?.audioUri;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={modalStyles.backdrop} onPress={handleClose}>
          <View style={[modalStyles.sheet, { maxHeight: SCREEN_HEIGHT * 0.85 }]}>
            <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={modalStyles.handle} />

            <Text style={modalStyles.title}>{card.name}</Text>

            <View style={modalStyles.comparisonRow}>
              <View style={modalStyles.comparisonCol}>
                <Text style={modalStyles.colLabel}>Votre regard</Text>
                <View style={modalStyles.rankRow}>
                  <View style={[modalStyles.colorDot, { backgroundColor: userColor }]} />
                  <Text style={modalStyles.rankValue}>{formatScore(userScore)}</Text>
                </View>
                <Text style={modalStyles.scoreValue}>{scoreLabel(userScore)}</Text>
              </View>

              <View style={modalStyles.divider} />

              <View style={modalStyles.comparisonCol}>
                <Text style={modalStyles.colLabel}>Regard de l'étude</Text>
                <View style={modalStyles.rankRow}>
                  <View style={[modalStyles.colorDot, { backgroundColor: gtColor }]} />
                  <Text style={modalStyles.rankValue}>{formatScore(groundTruthScore)}</Text>
                </View>
                <Text style={modalStyles.scoreValue}>{scoreLabel(groundTruthScore)}</Text>
              </View>
            </View>

            <View style={[modalStyles.divergenceBadge, { backgroundColor: meta.color + '20' }]}>
              <Text style={[modalStyles.divergenceText, { color: meta.color }]}>
                {meta.label} · {gapLabel(gap)}
              </Text>
            </View>

            <ScrollView style={modalStyles.explanationScroll} bounces={false}>
              <Text style={modalStyles.explanationTitle}>Ce que l'étude a observé</Text>
              <Text style={modalStyles.explanationText}>{explanation}</Text>
            </ScrollView>

            {/* Comment section */}
            <View style={modalStyles.commentSection}>
              <Text style={modalStyles.commentLabel}>
                {gap >= 2 ? "Qu'est-ce qui explique votre regard ?" : 'Racontez-nous votre regard'}
              </Text>

              <View style={modalStyles.commentInputRow}>
                <TextInput
                  style={modalStyles.commentInput}
                  placeholder="Votre expérience, votre vécu du terrain..."
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
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
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
