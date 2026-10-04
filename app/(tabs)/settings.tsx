import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Linking, Switch, Platform, Image } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useCards } from '@/context/CardContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useT } from '@/i18n';

const CONTACT_EMAIL = 'marianne.cohen@sorbonne-universite.fr';

// Research team shown in « L'équipe ». Edit this list once the client validates
// names and roles (meeting of 25 Sept 2026).
// Published work behind the game. The study scores players compare themselves
// with come from these studies.
// Titles are the published (English) titles; the detail line is translated.
const PUBLICATIONS: { key: 'resilience' | 'erosion' | 'story'; title: string; url: string }[] = [
  {
    key: 'resilience',
    title: 'Resilience of Terraced Landscapes to Human and Natural Impacts',
    url: 'https://doi.org/10.3390/land13050592',
  },
  {
    key: 'erosion',
    title: 'Do Terraced Landscapes Reduce Erosion?',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7029382',
  },
  {
    key: 'story',
    title: 'STORY',
    url: 'https://projetstory.wordpress.com/',
  },
];

// Card illustrations are deposited on HAL (MediHAL) under a Creative Commons
// licence. TODO: confirm the exact variant (e.g. CC BY 4.0) with the client.
// The citation keeps the deposit's original (French) title in every language.
const ILLUSTRATIONS_CREDIT = {
  citation: 'Marianne Cohen, Maciej Nowak, Christian Gorini, Titouan Le Vot, Raphaël Kerverdo et al. '
    + '« Comment préserver et adapter les terrasses de culture au changement climatique ? », 2026.',
  url: 'https://media.hal.science/view/index/docid/5750828',
};

// Welcome-screen valley view (onboarding), freely licensed: attribution required.
const ENTRY_PHOTO_CREDIT = {
  citation: "Horizon06, « Breil-sur-Roya, vue depuis le sommet de l'Arpette ».",
  url: 'https://commons.wikimedia.org/wiki/File:Breil-sur-Roya_Vue_depuis_le_sommet_de_l%27Arpette.jpg',
};

// Landscape photographs sent by the client (30 Sept 2026), taken in the Roya
// valley in April 2025. TODO: confirm the photographer's name for the credit.
const BANNER_PHOTO = require('@/assets/images/roya-oliviers.jpg');

// Roles are translated (t.about.teamRoles).
const TEAM: { name: string; key: 'cohen' | 'gorini' | 'levot' }[] = [
  { name: 'Marianne Cohen', key: 'cohen' },
  { name: 'Christian Gorini', key: 'gorini' },
  { name: 'Titouan Le Vot', key: 'levot' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { state, setAnimationsEnabled, setExpertMode, resetAll } = useCards();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const t = useT();

  const handleContact = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t.about.contactSubject)}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.banner}>
        <Image source={BANNER_PHOTO} style={styles.bannerImage} resizeMode="cover" />
        <Text style={styles.bannerCaption}>{t.about.bannerCaption}</Text>
      </View>

      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>{t.about.projectName}</Text>
        <Text style={styles.projectSubtitle}>{t.about.projectSubtitle}</Text>
        <Text style={styles.projectInstitution}>Sorbonne Université</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.about.researchTitle}</Text>
        <Text style={styles.paragraph}>{t.about.researchBody1}</Text>
        <Text style={styles.paragraph}>{t.about.researchBody2}</Text>
        <Text style={styles.paragraph}>{t.about.researchBody3}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.about.teamTitle}</Text>
        {TEAM.map((member) => (
          <View key={member.name} style={styles.memberRow}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{t.about.teamRoles[member.key]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.ctaBox}>
        <FontAwesome name="map-marker" size={24} color="#C4956A" style={styles.ctaIcon} />
        <Text style={styles.ctaTitle}>{t.about.ctaTitle}</Text>
        <Text style={styles.ctaDescription}>{t.about.ctaBody}</Text>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
          onPress={handleContact}
        >
          <FontAwesome name="envelope" size={16} color="#fff" />
          <Text style={styles.ctaButtonText}>{t.about.ctaButton}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.about.publicationsTitle}</Text>
        <Text style={styles.paragraph}>{t.about.publicationsBody}</Text>
        {PUBLICATIONS.map((pub) => (
          <Pressable
            key={pub.url}
            style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.6 }]}
            onPress={() => Linking.openURL(pub.url)}
          >
            <View style={styles.prefText}>
              <Text style={styles.linkTitle}>{pub.title}</Text>
              <Text style={styles.memberRole}>{t.about.publicationDetails[pub.key]}</Text>
            </View>
            <FontAwesome name="external-link" size={14} color="#C4956A" />
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.about.creditsTitle}</Text>
        <Text style={styles.paragraph}>{t.about.creditsCards}</Text>
        <Pressable
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.6 }]}
          onPress={() => Linking.openURL(ILLUSTRATIONS_CREDIT.url)}
        >
          <View style={styles.prefText}>
            <Text style={styles.memberRole}>{ILLUSTRATIONS_CREDIT.citation}</Text>
            <Text style={styles.memberRole}>{t.about.creditsCardsLicence}</Text>
          </View>
          <FontAwesome name="external-link" size={14} color="#C4956A" />
        </Pressable>
        <Text style={styles.paragraph}>{t.about.creditsPhotos}</Text>
        <Pressable
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.6 }]}
          onPress={() => Linking.openURL(ENTRY_PHOTO_CREDIT.url)}
        >
          <View style={styles.prefText}>
            <Text style={styles.memberRole}>{ENTRY_PHOTO_CREDIT.citation}</Text>
            <Text style={styles.memberRole}>{t.about.creditsEntryPhotoLicence}</Text>
          </View>
          <FontAwesome name="external-link" size={14} color="#C4956A" />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.about.preferencesTitle}</Text>
        <View style={styles.prefRow}>
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>{t.language.label}</Text>
            <Text style={styles.prefHint}>{t.language.hint}</Text>
          </View>
          <LanguageSwitcher />
        </View>
        <View style={styles.prefRow}>
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>{t.about.expertLabel}</Text>
            <Text style={styles.prefHint}>{t.about.expertHint}</Text>
          </View>
          <Switch
            value={state.expertMode}
            onValueChange={setExpertMode}
            trackColor={{ true: '#C4956A', false: '#DDD' }}
            thumbColor="#fff"
          />
        </View>
        <View style={styles.prefRow}>
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>{t.about.animationsLabel}</Text>
            <Text style={styles.prefHint}>{t.about.animationsHint}</Text>
          </View>
          <Switch
            value={state.animationsEnabled}
            onValueChange={setAnimationsEnabled}
            trackColor={{ true: '#C4956A', false: '#DDD' }}
            thumbColor="#fff"
          />
        </View>
        {Platform.OS === 'web' && (
          <Pressable
            style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.6 }]}
            onPress={() => router.push('/install')}
          >
            <View style={styles.prefText}>
              <Text style={styles.prefLabel}>{t.about.installLabel}</Text>
              <Text style={styles.prefHint}>{t.about.installHint}</Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#BBB" />
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.6 }]}
          onPress={() => router.push('/onboarding')}
        >
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>{t.about.replayIntroLabel}</Text>
            <Text style={styles.prefHint}>{t.about.replayIntroHint}</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#BBB" />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t.about.dataTitle}</Text>
        <Text style={styles.paragraph}>{t.about.dataBody}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            confirmingDelete && styles.deleteButtonConfirm,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            if (!confirmingDelete) { setConfirmingDelete(true); return; }
            setConfirmingDelete(false);
            resetAll();
          }}
        >
          <FontAwesome name="trash-o" size={16} color={confirmingDelete ? '#fff' : '#D9534F'} />
          <Text style={[styles.deleteButtonText, confirmingDelete && { color: '#fff' }]}>
            {confirmingDelete ? t.about.deleteConfirm : t.about.deleteData}
          </Text>
        </Pressable>
        {confirmingDelete && (
          <Pressable onPress={() => setConfirmingDelete(false)} hitSlop={8}>
            <Text style={styles.deleteCancel}>{t.common.cancel}</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.version}>Terrcatt v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFCFA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  banner: {
    marginBottom: 20,
  },
  bannerImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: '#E3ECFF',
  },
  bannerCaption: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  projectHeader: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE5DF',
  },
  projectName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  projectSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#555',
    marginBottom: 8,
  },
  projectInstitution: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C4956A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  memberRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EDE7',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EDE7',
  },
  linkTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  memberName: { fontSize: 16, fontWeight: '600', color: '#333' },
  memberRole: { fontSize: 13, lineHeight: 18, color: '#777', marginTop: 2 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAE5DF',
    marginBottom: 24,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  prefText: { flex: 1, marginRight: 16 },
  prefLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  prefHint: { fontSize: 13, color: '#888', marginTop: 2 },
  ctaBox: {
    borderWidth: 1.5,
    borderColor: '#C4956A',
    backgroundColor: '#FFF8F2',
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  ctaIcon: {
    marginBottom: 10,
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C4956A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  ctaButtonPressed: {
    opacity: 0.8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 13,
    color: '#aaa',
    marginTop: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D9534F',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  deleteButtonConfirm: {
    backgroundColor: '#D9534F',
  },
  deleteButtonText: {
    color: '#D9534F',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteCancel: {
    color: '#8A8580',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});
