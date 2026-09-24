import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useInstallState, InstallPlatform } from '@/lib/installPrompt';

/**
 * "Add Terrcatt to your home screen" explainer. Self-contained so it can live
 * on its own screen (app/install.tsx) or be dropped into the onboarding as a
 * step. Picks the right instructions for the visitor's device.
 */

type Step = { icon: React.ComponentProps<typeof FontAwesome>['name']; text: string };

const STEPS: Record<Exclude<InstallPlatform, 'native'>, { intro: string; steps: Step[] }> = {
  ios: {
    intro: 'Sur iPhone et iPad, l\'installation se fait depuis Safari.',
    steps: [
      { icon: 'share-square-o', text: 'Touchez le bouton Partager, en bas de l\'écran (le carré avec une flèche).' },
      { icon: 'plus-square-o', text: 'Faites défiler le menu et touchez « Sur l\'écran d\'accueil ».' },
      { icon: 'check', text: 'Touchez « Ajouter » en haut à droite. Terrcatt apparaît parmi vos applications.' },
    ],
  },
  android: {
    intro: 'Sur Android, l\'installation se fait depuis Chrome.',
    steps: [
      { icon: 'ellipsis-v', text: 'Touchez le menu à trois points, en haut à droite de Chrome.' },
      { icon: 'download', text: 'Touchez « Installer l\'application » ou « Ajouter à l\'écran d\'accueil ».' },
      { icon: 'check', text: 'Confirmez. Terrcatt apparaît parmi vos applications.' },
    ],
  },
  desktop: {
    intro: 'Sur ordinateur, Chrome et Edge peuvent installer Terrcatt comme une application.',
    steps: [
      { icon: 'download', text: 'Cliquez sur l\'icône d\'installation à droite de la barre d\'adresse.' },
      { icon: 'check', text: 'Confirmez. Terrcatt s\'ouvre dans sa propre fenêtre, sans onglets.' },
    ],
  },
};

export function InstallGuide({ compact = false }: { compact?: boolean }) {
  const { platform, installed, canPrompt, promptInstall } = useInstallState();

  if (platform === 'native' || installed) {
    return (
      <View style={styles.doneBox}>
        <FontAwesome name="check-circle" size={28} color="#5B9A6C" />
        <Text style={styles.doneTitle}>Terrcatt est déjà installé</Text>
        <Text style={styles.doneText}>Vous utilisez l'application depuis votre écran d'accueil.</Text>
      </View>
    );
  }

  const guide = STEPS[platform];

  return (
    <View style={styles.container}>
      {!compact && (
        <Text style={styles.lead}>
          Terrcatt fonctionne sans téléchargement. Ajoutez-le à votre écran d'accueil pour
          le retrouver comme une application, en plein écran.
        </Text>
      )}

      {canPrompt && (
        <Pressable
          style={({ pressed }) => [styles.installButton, pressed && { opacity: 0.8 }]}
          onPress={promptInstall}
        >
          <FontAwesome name="download" size={16} color="#fff" />
          <Text style={styles.installButtonText}>Installer Terrcatt</Text>
        </Pressable>
      )}

      <Text style={styles.intro}>{canPrompt ? 'Ou manuellement :' : guide.intro}</Text>
      <View style={styles.steps}>
        {guide.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <FontAwesome name={step.icon} size={20} color="#C4956A" style={styles.stepIcon} />
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 16 },
  lead: { fontSize: 16, lineHeight: 24, color: '#555', textAlign: 'center' },
  intro: { fontSize: 14, lineHeight: 20, color: '#8A8580', textAlign: 'center' },
  steps: { width: '100%', gap: 12 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAE5DF',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#C4956A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stepIcon: { width: 24, textAlign: 'center' },
  stepText: { flex: 1, fontSize: 15, lineHeight: 21, color: '#333' },
  installButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#C4956A',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  installButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  doneBox: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F7F2',
    borderRadius: 14,
    padding: 24,
  },
  doneTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  doneText: { fontSize: 14, lineHeight: 20, color: '#666', textAlign: 'center' },
});
