/**
 * French texts: the reference. `en.ts` and `it.ts` must have exactly the same
 * shape (enforced by the `Strings` type). `**…**` marks key words rendered in
 * bold by `<Rich>`. No em dashes in user-facing text.
 */
const fr = {
  tabs: {
    game: 'Jeu',
    results: 'Résultats',
    about: 'En savoir plus',
  },

  common: {
    back: '← Retour',
    next: 'Suivant',
    validate: 'Valider',
    start: 'Commencer',
    discover: 'Découvrir',
    cancel: 'Annuler',
  },

  language: {
    label: 'Langue',
    hint: 'Langue du jeu et des cartes',
  },

  onboarding: {
    tagline: 'Un **jeu** de partage des connaissances pour aider à la décision de **réhabiliter les terrasses**.',
    valley:
      "Dans la **vallée de la Roya**, entre Mercantour et Méditerranée, **23 000 terrasses en pierre sèche**, un savoir-faire **reconnu par l'UNESCO**.",
    roleTitle: 'Qui êtes-vous ?',
    roleSubtitle: 'Votre profil nous aide à comparer les regards sur le paysage.',
    roleHint: 'Plusieurs réponses possibles',
    territoryTitle: 'Quel est votre lien avec le territoire ?',
    sourceTitle: 'Comment avez-vous découvert Terrcatt ?',
    roles: {
      owner: 'Propriétaire de terrasses ou de terrain',
      'public-actor': 'Élu·e ou acteur public',
      researcher: 'Chercheur·se ou étudiant·e',
      'agri-professional': "Professionnel·le de l'agriculture ou du paysage",
      resident: 'Habitant·e de la vallée',
      curious: 'Curieux·se',
    },
    territory: {
      roya: "J'habite ou je connais bien la vallée de la Roya",
      'similar-territory': 'Mon territoire fait face à des défis similaires',
      'no-link': 'Aucun lien particulier, je découvre',
    },
    sources: {
      university: "L'université ou l'équipe de recherche",
      'word-of-mouth': 'Bouche à oreille',
      event: 'Un atelier ou événement du projet',
      'social-media': 'Réseaux sociaux',
      press: 'Presse ou média',
      'online-search': 'Recherche en ligne',
      other: 'Autre',
    },
    cardsTitle: 'Une carte, une situation',
    cardsBody:
      'Vous allez découvrir **18 cartes**. Chacune montre une terrasse dans **une situation particulière** : une pente très forte, des pluies abondantes, des ruches…',
    voteTitle: 'Donnez votre avis',
    voteBody:
      'Pour chaque carte, dites si cette situation est **favorable ou défavorable** à la **réhabilitation des terrasses**, de **-2 à +2**, selon votre ressenti.',
    compareTitle: "Il n'y a pas de mauvaise réponse",
    compareYou: 'Votre regard',
    compareStudy: "L'étude",
    compareBody1: "Ce n'est **pas un test** : nous voulons simplement connaître **votre point de vue**.",
    compareBody2: "À la fin, découvrez comment votre regard se compare aux **résultats de l'étude scientifique**.",
  },

  scale: {
    '-2': 'Très défavorable',
    '-1': 'Défavorable',
    '0': 'Neutre',
    '1': 'Favorable',
    '2': 'Très favorable',
    notRated: 'Non noté',
  },

  rate: {
    done: 'Terminé !',
    expertBadge: 'Mode expert',
    allRated: 'Toutes les cartes sont notées !',
    allRatedSub: 'Découvrez votre classement et comparez votre regard à celui des scientifiques.',
    seeResults: 'Voir mes résultats',
    replay: 'Recommencer une partie',
    titlePlaceholder: 'Quel titre donneriez-vous à cette carte ?',
  },

  results: {
    noneRated: 'Aucune carte notée',
    ratedCount: (rated: number, total: number) =>
      `${rated} carte${rated > 1 ? 's' : ''} sur ${total} notée${rated > 1 ? 's' : ''}`,
    lockedText: (total: number) =>
      `Terminez de noter les ${total} cartes pour comparer votre regard avec celui de l'étude.`,
    continue: 'Continuer à noter',
    /** "Vous partagez le regard de l'étude\nsur **11 cartes sur 18**" */
    headline: (shared: number, total: number) =>
      `Vous partagez le regard de l'étude\nsur **${shared} cartes sur ${total}**`,
    tapHint: 'Cliquez sur une carte pour en savoir plus',
    you: 'Vous',
    study: "L'étude",
    agreement: {
      desaccord: {
        label: 'Regard différent',
        plural: 'Regards différents',
        description: "Vous voyez cette carte autrement que l'étude",
      },
      nuance: {
        label: 'Regard proche',
        plural: 'Regards proches',
        description: 'Même tendance, intensité différente',
      },
      accord: {
        label: 'Même regard',
        plural: 'Mêmes regards',
        description: "Vous voyez cette carte comme l'étude",
      },
    },
  },

  detail: {
    back: 'Résultats',
    notComplete: 'Terminez de noter les cartes pour voir le détail.',
    notFound: 'Carte introuvable.',
    yourTitle: (title: string) => `Votre titre : « ${title} »`,
    yourView: 'Votre regard',
    studyView: "Regard de l'étude",
    observedTitle: "Ce que l'étude a observé",
    noExplanation: 'Aucune explication disponible.',
    furtherTitle: 'Pour aller plus loin',
    furtherBody:
      "Chaque carte s'appuie sur les observations menées dans la vallée de la Roya après la tempête Alex. L'équipe Terrcatt compare le regard des habitants avec les données recueillies sur le terrain pour guider la réhabilitation des terrasses.",
    furtherCaption: 'Terrasses de culture et murs en pierre sèche, vallée de la Roya (avril 2025).',
  },

  about: {
    bannerCaption: 'Oliveraie en terrasses, vallée de la Roya',
    projectName: 'Projet Terrcatt',
    projectSubtitle: "Terrasses de culture et reconstruction d'un territoire post-catastrophe",
    researchTitle: 'Un jeu issu de la recherche',
    researchBody1:
      "Ce jeu est la version numérique d'une méthode participative de tri de cartes, conçue par des chercheurs de Sorbonne Université dans le cadre du projet Terrcatt. Vos réponses alimentent directement leurs travaux.",
    researchBody2:
      'Le projet étudie les quelque 23 000 terrasses agricoles de la vallée de la Roya (Alpes françaises), largement abandonnées mais jouant un rôle clé dans la résilience face aux événements climatiques extrêmes comme la tempête Alex (octobre 2020).',
    researchBody3:
      "Terrcatt est soutenu par l'Alliance Sorbonne Université et prolonge le programme STORY (Risques et sociétés dans le bassin de la Roya), mené en lien avec les associations locales.",
    teamTitle: "L'équipe",
    teamRoles: {
      cohen: 'Professeure de biogéographie, laboratoire Médiations, Faculté des Lettres',
      gorini: 'Professeur de géosciences, ISTeP, Faculté des Sciences et Ingénierie',
      levot: 'Géographe et géomaticien',
    },
    ctaTitle: 'Un projet similaire pour votre territoire ?',
    ctaBody:
      "Vous êtes confronté à des enjeux de réhabilitation paysagère, de gestion participative du territoire ou de résilience post-catastrophe ? Contactez-nous pour explorer comment cette méthodologie peut s'adapter à votre contexte.",
    ctaButton: 'Nous contacter',
    contactSubject: 'Projet Terrcatt : prise de contact',
    publicationsTitle: 'Les travaux de recherche',
    publicationsBody:
      "Le « regard de l'étude » affiché dans vos résultats provient des observations de terrain publiées par l'équipe.",
    publicationDetails: {
      resilience: 'Le Vot, Cohen, Nowak, Passy, Sumera. Land, 2024. Accès libre.',
      erosion: 'Cohen, Kerverdo, Nowak, Gorini, Rabaute, Le Vot. Prépublication SSRN, 2026.',
      story: 'Risques et sociétés dans le bassin de la Roya : le programme dont Terrcatt est issu.',
    },
    creditsTitle: 'Crédits des illustrations',
    creditsCards:
      "Les illustrations des cartes sont réalisées d'après des photographies prises sur le terrain dans la Roya par Marianne Cohen. Elles sont mises à disposition sous licence Creative Commons.",
    creditsCardsLicence: 'Licence Creative Commons, dépôt HAL (MediHAL).',
    creditsPhotos:
      "Les photographies de terrasses (cette page et les fiches des cartes) ont été prises dans la vallée de la Roya en avril 2025 par l'équipe du projet. La vue de la vallée en page d'accueil est publiée sous licence libre :",
    creditsEntryPhotoLicence: 'Licence CC BY-SA 4.0, Wikimedia Commons (contraste retouché).',
    preferencesTitle: 'Préférences',
    expertLabel: 'Mode expert',
    expertHint: "Cartes sans titre : devinez ce qu'elles illustrent et proposez votre propre titre. Option en test.",
    animationsLabel: 'Animations',
    animationsHint: 'Apparition animée des résultats',
    installLabel: "Installer l'application",
    installHint: "Ajouter Terrcatt à votre écran d'accueil",
    replayIntroLabel: "Revoir l'introduction",
    replayIntroHint: 'Rejouer le tutoriel de démarrage',
    dataTitle: 'Mes données',
    dataBody:
      "Vos réponses sont enregistrées anonymement. Supprimer vos données efface tout, ici et sur nos serveurs, et redémarre l'application de zéro.",
    deleteData: 'Supprimer mes données',
    deleteConfirm: 'Confirmer la suppression définitive',
  },

  install: {
    title: 'Installer Terrcatt',
    back: 'En savoir plus',
    lead: "Terrcatt fonctionne sans téléchargement. Ajoutez-le à votre écran d'accueil pour le retrouver comme une application, en plein écran.",
    button: 'Installer Terrcatt',
    orManually: 'Ou manuellement :',
    installedTitle: 'Terrcatt est déjà installé',
    installedText: "Vous utilisez l'application depuis votre écran d'accueil.",
    ios: {
      intro: "Sur iPhone et iPad, l'installation se fait depuis Safari.",
      steps: [
        "Touchez le bouton Partager, en bas de l'écran (le carré avec une flèche).",
        "Faites défiler le menu et touchez « Sur l'écran d'accueil ».",
        'Touchez « Ajouter » en haut à droite. Terrcatt apparaît parmi vos applications.',
      ],
    },
    android: {
      intro: "Sur Android, l'installation se fait depuis Chrome.",
      steps: [
        'Touchez le menu à trois points, en haut à droite de Chrome.',
        "Touchez « Installer l'application » ou « Ajouter à l'écran d'accueil ».",
        'Confirmez. Terrcatt apparaît parmi vos applications.',
      ],
    },
    desktop: {
      intro: 'Sur ordinateur, Chrome et Edge peuvent installer Terrcatt comme une application.',
      steps: [
        "Cliquez sur l'icône d'installation à droite de la barre d'adresse.",
        "Confirmez. Terrcatt s'ouvre dans sa propre fenêtre, sans onglets.",
      ],
    },
  },

  notFound: {
    title: 'Oups !',
    text: "Cet écran n'existe pas.",
    home: "Retour à l'accueil",
  },

  /** Card titles and the study's one-line explanation, by card id. */
  cards: {
    1: {
      name: 'Abandon agricole',
      explanation: "L'abandon agricole favorise la dégradation des terrasses et la perte de biodiversité.",
    },
    2: {
      name: "Accumulation d'eau au-dessus de la murette",
      explanation:
        "L'accumulation d'eau en amont de la murette est observée dans certaines terrasses ayant connu des glissements de terrain.",
    },
    3: {
      name: 'Apiculture',
      explanation: "L'apiculture est favorable dans les terrasses où les plantes sont pollinisées par les insectes.",
    },
    4: {
      name: "Drainage de l'eau",
      explanation:
        "Le drainage des sols, avec la présence d'une sous-couche drainante en arrière de la couche de grosses pierres, est favorable à la stabilité des terrasses.",
    },
    5: {
      name: 'Moyenne montagne',
      explanation: "La moyenne montagne connaît une pluviosité modérée, mais une tendance à l'assèchement des sols.",
    },
    6: {
      name: 'Murs non entretenus',
      explanation: 'Des murs mal entretenus jouent un rôle probable dans la fragilisation des terrasses.',
    },
    7: {
      name: 'Oliveraie fleurie',
      explanation:
        "L'oliveraie fleurie abrite une biodiversité et des interactions avec les pollinisateurs observées dans les oliveraies entretenues avec des pratiques peu intensives.",
    },
    8: {
      name: "Olivier planté au bord d'une murette",
      explanation:
        'Un olivier planté au bord des murettes peut contribuer à dégrader les murs, mais il est favorable aux cultures associées.',
    },
    9: {
      name: 'Passé agricole',
      explanation:
        'Le passé agricole est favorable à la conservation des sols, et donc à une moindre vulnérabilité aux glissements.',
    },
    10: {
      name: 'Patrimoine paysager',
      explanation: "Le patrimoine paysager est reconnu par l'Unesco, avec une dimension esthétique.",
    },
    11: {
      name: 'Pente très forte',
      explanation: 'Une pente très forte peut favoriser la survenue de glissements sur les terrasses.',
    },
    12: {
      name: 'Pluies très abondantes',
      explanation: 'Une pluie très forte favorise les glissements de terrain sur les terrasses.',
    },
    13: {
      name: "Proximité d'une route",
      explanation: "La proximité de la route modifie l'écoulement de l'eau.",
    },
    14: {
      name: "Rôle de la faune sauvage et de l'abandon agricole",
      explanation:
        "La faune sauvage combinée à l'abandon agricole joue un rôle probable dans la dégradation des terrasses.",
    },
    15: {
      name: 'Rôle de la faune sauvage',
      explanation: 'Le rôle de la faune sauvage est ambigu.',
    },
    16: {
      name: "Stockage de l'eau",
      explanation:
        'Les terrasses contiennent un peu plus d\'eau que les versants non aménagés pendant les évènements extrêmes (crue, sécheresse).',
    },
    17: {
      name: 'Substrat géologique fragile (éboulis)',
      explanation: 'Une roche peu cohésive (éboulis) est un facteur de fragilité aux glissements.',
    },
    18: {
      name: 'Terrasse fleurie',
      explanation: 'Une terrasse fleurie apporte un agrément esthétique et de la biodiversité.',
    },
  } as Record<number, { name: string; explanation: string }>,
};

export type Strings = typeof fr;
export default fr;
