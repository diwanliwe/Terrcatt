import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useInstallState, InstallPlatform } from '@/lib/installPrompt';
import { useT } from '@/i18n';

/**
 * "Add Terrcatt to your home screen" explainer. Self-contained so it can live
 * on its own screen (app/install.tsx) or be dropped into the onboarding as a
 * step. Picks the right instructions for the visitor's device.
 */

type Icon = React.ComponentProps<typeof FontAwesome>['name'];

// Step texts are translated (t.install.<platform>.steps); icons follow the same order.
const STEP_ICONS: Record<Exclude<InstallPlatform, 'native'>, Icon[]> = {
  ios: ['share-square-o', 'plus-square-o', 'check'],
  android: ['ellipsis-v', 'download', 'check'],
  desktop: ['download', 'check'],
};

export function InstallGuide({ compact = false }: { compact?: boolean }) {
  const { platform, installed, canPrompt, promptInstall } = useInstallState();
  const t = useT();

  if (platform === 'native' || installed) {
    return (
      <View style={styles.doneBox}>
        <FontAwesome name="check-circle" size={28} color="#5B9A6C" />
        <Text style={styles.doneTitle}>{t.install.installedTitle}</Text>
        <Text style={styles.doneText}>{t.install.installedText}</Text>
      </View>
    );
  }

  const guide = t.install[platform];
  const icons = STEP_ICONS[platform];

  return (
    <View style={styles.container}>
      {!compact && (
        <Text style={styles.lead}>{t.install.lead}</Text>
      )}

      {canPrompt && (
        <Pressable
          style={({ pressed }) => [styles.installButton, pressed && { opacity: 0.8 }]}
          onPress={promptInstall}
        >
          <FontAwesome name="download" size={16} color="#fff" />
          <Text style={styles.installButtonText}>{t.install.button}</Text>
        </Pressable>
      )}

      <Text style={styles.intro}>{canPrompt ? t.install.orManually : guide.intro}</Text>
      <View style={styles.steps}>
        {guide.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepNumber}>{i + 1}</Text>
            </View>
            <FontAwesome name={icons[i]} size={20} color="#C4956A" style={styles.stepIcon} />
            <Text style={styles.stepText}>{step}</Text>
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
