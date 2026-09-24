import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable, Linking, Switch, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import { useCards } from '@/context/CardContext';

const CONTACT_EMAIL = 'marianne.cohen@sorbonne-universite.fr';

// Research team shown in « L'équipe ». Edit this list once the client validates
// names and roles (meeting of 25 Sept 2026).
// Published work behind the game. The study scores players compare themselves
// with come from these studies.
const PUBLICATIONS: { title: string; detail: string; url: string }[] = [
  {
    title: 'Resilience of Terraced Landscapes to Human and Natural Impacts',
    detail: 'Le Vot, Cohen, Nowak, Passy, Sumera. Land, 2024. Accès libre.',
    url: 'https://doi.org/10.3390/land13050592',
  },
  {
    title: 'Do Terraced Landscapes Reduce Erosion?',
    detail: 'Cohen, Kerverdo, Nowak, Gorini, Rabaute, Le Vot. Prépublication SSRN, 2026.',
    url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7029382',
  },
  {
    title: 'Projet STORY',
    detail: 'Risques et sociétés dans le bassin de la Roya : le programme dont Terrcatt est issu.',
    url: 'https://projetstory.wordpress.com/',
  },
];

// Card illustrations are deposited on HAL (MediHAL) under a Creative Commons
// licence. TODO: confirm the exact variant (e.g. CC BY 4.0) with the client.
const ILLUSTRATIONS_CREDIT = {
  citation: 'Marianne Cohen, Maciej Nowak, Christian Gorini, Titouan Le Vot, Raphaël Kerverdo et al. '
    + '« Comment préserver et adapter les terrasses de culture au changement climatique ? », 2026.',
  licence: 'Licence Creative Commons, dépôt HAL (MediHAL).',
  url: 'https://media.hal.science/view/index/docid/5750828',
};

const TEAM: { name: string; role: string }[] = [
  { name: 'Marianne Cohen', role: 'Professeure de biogéographie, laboratoire Médiations, Faculté des Lettres' },
  { name: 'Christian Gorini', role: 'Professeur de géosciences, ISTeP, Faculté des Sciences et Ingénierie' },
  { name: 'Titouan Le Vot', role: 'Géographe et géomaticien' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { state, setAnimationsEnabled, resetAll } = useCards();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleContact = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=Projet Terrcatt : prise de contact`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.projectHeader}>
        <Text style={styles.projectName}>Projet Terrcatt</Text>
        <Text style={styles.projectSubtitle}>
          Terrasses de culture et reconstruction d'un territoire post-catastrophe
        </Text>
        <Text style={styles.projectInstitution}>Sorbonne Université</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Un jeu issu de la recherche</Text>
        <Text style={styles.paragraph}>
          Ce jeu est la version numérique d'une méthode participative de tri de cartes, conçue
          par des chercheurs de Sorbonne Université dans le cadre du projet Terrcatt. Vos réponses
          alimentent directement leurs travaux.
        </Text>
        <Text style={styles.paragraph}>
          Le projet étudie les quelque 23 000 terrasses agricoles de la vallée de la Roya (Alpes
          françaises), largement abandonnées mais jouant un rôle clé dans la résilience face aux
          événements climatiques extrêmes comme la tempête Alex (octobre 2020).
        </Text>
        <Text style={styles.paragraph}>
          Terrcatt est soutenu par l'Alliance Sorbonne Université et prolonge le programme STORY
          (Risques et sociétés dans le bassin de la Roya), mené en lien avec les associations
          locales.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>L'équipe</Text>
        {TEAM.map((member) => (
          <View key={member.name} style={styles.memberRow}>
            <Text style={styles.memberName}>{member.name}</Text>
            <Text style={styles.memberRole}>{member.role}</Text>
          </View>
        ))}
      </View>

      <View style={styles.ctaBox}>
        <FontAwesome name="map-marker" size={24} color="#C4956A" style={styles.ctaIcon} />
        <Text style={styles.ctaTitle}>Un projet similaire pour votre territoire ?</Text>
        <Text style={styles.ctaDescription}>
          Vous êtes confronté à des enjeux de réhabilitation paysagère, de gestion participative
          du territoire ou de résilience post-catastrophe ? Contactez-nous pour explorer comment
          cette méthodologie peut s'adapter à votre contexte.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
          onPress={handleContact}
        >
          <FontAwesome name="envelope" size={16} color="#fff" />
          <Text style={styles.ctaButtonText}>Nous contacter</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Les travaux de recherche</Text>
        <Text style={styles.paragraph}>
          Le « regard de l'étude » affiché dans vos résultats provient des observations de terrain
          publiées par l'équipe.
        </Text>
        {PUBLICATIONS.map((pub) => (
          <Pressable
            key={pub.url}
            style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.6 }]}
            onPress={() => Linking.openURL(pub.url)}
          >
            <View style={styles.prefText}>
              <Text style={styles.linkTitle}>{pub.title}</Text>
              <Text style={styles.memberRole}>{pub.detail}</Text>
            </View>
            <FontAwesome name="external-link" size={14} color="#C4956A" />
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Crédits des illustrations</Text>
        <Text style={styles.paragraph}>
          Les illustrations des cartes sont réalisées d'après des photographies prises sur le
          terrain dans la Roya par Marianne Cohen. Elles sont mises à disposition sous licence
          Creative Commons.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.6 }]}
          onPress={() => Linking.openURL(ILLUSTRATIONS_CREDIT.url)}
        >
          <View style={styles.prefText}>
            <Text style={styles.memberRole}>{ILLUSTRATIONS_CREDIT.citation}</Text>
            <Text style={styles.memberRole}>{ILLUSTRATIONS_CREDIT.licence}</Text>
          </View>
          <FontAwesome name="external-link" size={14} color="#C4956A" />
        </Pressable>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.prefRow}>
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>Animations</Text>
            <Text style={styles.prefHint}>Apparition animée des résultats</Text>
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
              <Text style={styles.prefLabel}>Installer l'application</Text>
              <Text style={styles.prefHint}>Ajouter Terrcatt à votre écran d'accueil</Text>
            </View>
            <FontAwesome name="chevron-right" size={14} color="#BBB" />
          </Pressable>
        )}
        <Pressable
          style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.6 }]}
          onPress={() => router.push('/onboarding')}
        >
          <View style={styles.prefText}>
            <Text style={styles.prefLabel}>Revoir l'introduction</Text>
            <Text style={styles.prefHint}>Rejouer le tutoriel de démarrage</Text>
          </View>
          <FontAwesome name="chevron-right" size={14} color="#BBB" />
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mes données</Text>
        <Text style={styles.paragraph}>
          Vos réponses sont enregistrées anonymement. Supprimer vos données efface tout,
          ici et sur nos serveurs, et redémarre l'application de zéro.
        </Text>
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
            {confirmingDelete ? 'Confirmer la suppression définitive' : 'Supprimer mes données'}
          </Text>
        </Pressable>
        {confirmingDelete && (
          <Pressable onPress={() => setConfirmingDelete(false)} hitSlop={8}>
            <Text style={styles.deleteCancel}>Annuler</Text>
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
