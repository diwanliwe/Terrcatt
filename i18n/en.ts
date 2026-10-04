import type { Strings } from './fr';

/** English translation of `fr.ts` (draft, to be reviewed by the research team). */
const en: Strings = {
  tabs: {
    game: 'Game',
    results: 'Results',
    about: 'About',
  },

  common: {
    back: '← Back',
    next: 'Next',
    validate: 'Confirm',
    start: 'Start',
    discover: 'Discover',
    cancel: 'Cancel',
  },

  language: {
    label: 'Language',
    hint: 'Language of the game and the cards',
  },

  onboarding: {
    tagline: 'A knowledge-sharing **game** to help decide how to **restore the terraces**.',
    valley:
      'In the **Roya valley**, between the Mercantour and the Mediterranean, **23,000 dry-stone terraces**, a know-how **recognised by UNESCO**.',
    roleTitle: 'Who are you?',
    roleSubtitle: 'Your profile helps us compare how people see the landscape.',
    roleHint: 'Several answers possible',
    territoryTitle: 'What is your connection to the area?',
    sourceTitle: 'How did you hear about Terrcatt?',
    roles: {
      owner: 'Owner of terraces or land',
      'public-actor': 'Elected official or public body',
      researcher: 'Researcher or student',
      'agri-professional': 'Farming or landscape professional',
      resident: 'Resident of the valley',
      curious: 'Just curious',
    },
    territory: {
      roya: 'I live in or know the Roya valley well',
      'similar-territory': 'My area faces similar challenges',
      'no-link': 'No particular connection, I am discovering it',
    },
    sources: {
      university: 'The university or the research team',
      'word-of-mouth': 'Word of mouth',
      event: 'A project workshop or event',
      'social-media': 'Social media',
      press: 'Press or media',
      'online-search': 'Online search',
      other: 'Other',
    },
    cardsTitle: 'One card, one situation',
    cardsBody:
      'You are about to discover **18 cards**. Each one shows a terrace in **a particular situation**: a very steep slope, heavy rain, beehives…',
    voteTitle: 'Give your opinion',
    voteBody:
      'For each card, say whether this situation is **favourable or unfavourable** to **restoring the terraces**, from **-2 to +2**, as you see it.',
    compareTitle: 'There is no wrong answer',
    compareYou: 'Your view',
    compareStudy: 'The study',
    compareBody1: 'This is **not a test**: we simply want to know **your point of view**.',
    compareBody2: 'At the end, see how your view compares with the **results of the scientific study**.',
  },

  scale: {
    '-2': 'Very unfavourable',
    '-1': 'Unfavourable',
    '0': 'Neutral',
    '1': 'Favourable',
    '2': 'Very favourable',
    notRated: 'Not rated',
  },

  rate: {
    done: 'Done!',
    expertBadge: 'Expert mode',
    allRated: 'All cards are rated!',
    allRatedSub: 'See your ranking and compare your view with the scientists’ view.',
    seeResults: 'See my results',
    replay: 'Play again',
    titlePlaceholder: 'What title would you give this card?',
  },

  results: {
    noneRated: 'No cards rated yet',
    ratedCount: (rated: number, total: number) => `${rated} of ${total} card${total > 1 ? 's' : ''} rated`,
    lockedText: (total: number) => `Rate all ${total} cards to compare your view with the study’s.`,
    continue: 'Keep rating',
    headline: (shared: number, total: number) => `You share the study’s view\non **${shared} cards out of ${total}**`,
    tapHint: 'Tap a card to learn more',
    you: 'You',
    study: 'The study',
    agreement: {
      desaccord: {
        label: 'Different view',
        plural: 'Different views',
        description: 'You see this card differently from the study',
      },
      nuance: {
        label: 'Close view',
        plural: 'Close views',
        description: 'Same direction, different intensity',
      },
      accord: {
        label: 'Same view',
        plural: 'Same views',
        description: 'You see this card the way the study does',
      },
    },
  },

  detail: {
    back: 'Results',
    notComplete: 'Finish rating the cards to see the details.',
    notFound: 'Card not found.',
    yourTitle: (title: string) => `Your title: “${title}”`,
    yourView: 'Your view',
    studyView: 'The study’s view',
    observedTitle: 'What the study observed',
    noExplanation: 'No explanation available.',
    furtherTitle: 'Learn more',
    furtherBody:
      'Each card is based on fieldwork carried out in the Roya valley after Storm Alex. The Terrcatt team compares how residents see the terraces with the data collected in the field, to guide their restoration.',
    furtherCaption: 'Cultivation terraces and dry-stone walls, Roya valley (April 2025).',
  },

  about: {
    bannerCaption: 'Terraced olive grove, Roya valley',
    projectName: 'The Terrcatt project',
    projectSubtitle: 'Cultivation terraces and the rebuilding of a post-disaster territory',
    researchTitle: 'A game born from research',
    researchBody1:
      'This game is the digital version of a participatory card-sorting method designed by researchers at Sorbonne University as part of the Terrcatt project. Your answers feed directly into their work.',
    researchBody2:
      'The project studies the 23,000 or so farming terraces of the Roya valley (French Alps), largely abandoned but playing a key role in resilience to extreme weather events such as Storm Alex (October 2020).',
    researchBody3:
      'Terrcatt is supported by the Sorbonne University Alliance and builds on the STORY programme (Risks and societies in the Roya basin), run together with local associations.',
    teamTitle: 'The team',
    teamRoles: {
      cohen: 'Professor of biogeography, Médiations laboratory, Faculty of Arts and Humanities',
      gorini: 'Professor of geosciences, ISTeP, Faculty of Science and Engineering',
      levot: 'Geographer and GIS specialist',
    },
    ctaTitle: 'A similar project for your area?',
    ctaBody:
      'Are you dealing with landscape restoration, participatory land management or post-disaster resilience? Get in touch to explore how this method could be adapted to your context.',
    ctaButton: 'Contact us',
    contactSubject: 'Terrcatt project: getting in touch',
    publicationsTitle: 'The research',
    publicationsBody: 'The “study’s view” shown in your results comes from the field observations published by the team.',
    publicationDetails: {
      resilience: 'Le Vot, Cohen, Nowak, Passy, Sumera. Land, 2024. Open access.',
      erosion: 'Cohen, Kerverdo, Nowak, Gorini, Rabaute, Le Vot. SSRN preprint, 2026.',
      story: 'Risks and societies in the Roya basin: the programme Terrcatt comes from.',
    },
    creditsTitle: 'Illustration credits',
    creditsCards:
      'The card illustrations are based on photographs taken in the field in the Roya by Marianne Cohen. They are available under a Creative Commons licence.',
    creditsCardsLicence: 'Creative Commons licence, HAL repository (MediHAL).',
    creditsPhotos:
      'The terrace photographs (this page and the card pages) were taken in the Roya valley in April 2025 by the project team. The valley view on the welcome screen is published under a free licence:',
    creditsEntryPhotoLicence: 'CC BY-SA 4.0 licence, Wikimedia Commons (contrast adjusted).',
    preferencesTitle: 'Preferences',
    expertLabel: 'Expert mode',
    expertHint: 'Cards without titles: guess what they show and suggest your own title. Test feature.',
    animationsLabel: 'Animations',
    animationsHint: 'Animated reveal of the results',
    installLabel: 'Install the app',
    installHint: 'Add Terrcatt to your home screen',
    replayIntroLabel: 'See the introduction again',
    replayIntroHint: 'Replay the welcome tutorial',
    dataTitle: 'My data',
    dataBody:
      'Your answers are recorded anonymously. Deleting your data erases everything, here and on our servers, and restarts the app from scratch.',
    deleteData: 'Delete my data',
    deleteConfirm: 'Confirm permanent deletion',
  },

  install: {
    title: 'Install Terrcatt',
    back: 'About',
    lead: 'Terrcatt works without a download. Add it to your home screen to open it like an app, full screen.',
    button: 'Install Terrcatt',
    orManually: 'Or manually:',
    installedTitle: 'Terrcatt is already installed',
    installedText: 'You are using the app from your home screen.',
    ios: {
      intro: 'On iPhone and iPad, install it from Safari.',
      steps: [
        'Tap the Share button at the bottom of the screen (the square with an arrow).',
        'Scroll down the menu and tap “Add to Home Screen”.',
        'Tap “Add” at the top right. Terrcatt appears among your apps.',
      ],
    },
    android: {
      intro: 'On Android, install it from Chrome.',
      steps: [
        'Tap the three-dot menu at the top right of Chrome.',
        'Tap “Install app” or “Add to Home screen”.',
        'Confirm. Terrcatt appears among your apps.',
      ],
    },
    desktop: {
      intro: 'On a computer, Chrome and Edge can install Terrcatt as an app.',
      steps: [
        'Click the install icon on the right of the address bar.',
        'Confirm. Terrcatt opens in its own window, without tabs.',
      ],
    },
  },

  notFound: {
    title: 'Oops!',
    text: 'This screen does not exist.',
    home: 'Back to the start',
  },

  cards: {
    1: {
      name: 'Agricultural abandonment',
      explanation: 'Agricultural abandonment leads to the degradation of the terraces and a loss of biodiversity.',
    },
    2: {
      name: 'Water build-up above the wall',
      explanation: 'Water building up upslope of the wall has been observed in some terraces that have had landslides.',
    },
    3: {
      name: 'Beekeeping',
      explanation: 'Beekeeping is favourable in terraces where the plants are pollinated by insects.',
    },
    4: {
      name: 'Water drainage',
      explanation:
        'Soil drainage, with a draining sub-layer behind the layer of large stones, is favourable to the stability of the terraces.',
    },
    5: {
      name: 'Mid-mountain',
      explanation: 'The mid-mountain zone has moderate rainfall, but a tendency for soils to dry out.',
    },
    6: {
      name: 'Unmaintained walls',
      explanation: 'Poorly maintained walls probably play a role in weakening the terraces.',
    },
    7: {
      name: 'Olive grove in bloom',
      explanation:
        'The olive grove in bloom hosts biodiversity and interactions with pollinators, observed in olive groves managed with low-intensity practices.',
    },
    8: {
      name: 'Olive tree at the edge of a wall',
      explanation:
        'An olive tree planted at the edge of the walls can help degrade them, but it is favourable to the crops grown alongside.',
    },
    9: {
      name: 'Agricultural past',
      explanation: 'An agricultural past is favourable to soil conservation, and so to a lower vulnerability to landslides.',
    },
    10: {
      name: 'Landscape heritage',
      explanation: 'The landscape heritage is recognised by UNESCO, with an aesthetic dimension.',
    },
    11: {
      name: 'Very steep slope',
      explanation: 'A very steep slope can make landslides on the terraces more likely.',
    },
    12: {
      name: 'Very heavy rainfall',
      explanation: 'Very heavy rain makes landslides on the terraces more likely.',
    },
    13: {
      name: 'Close to a road',
      explanation: 'Being close to the road changes how water flows.',
    },
    14: {
      name: 'Role of wildlife and agricultural abandonment',
      explanation: 'Wildlife combined with agricultural abandonment probably plays a role in the degradation of the terraces.',
    },
    15: {
      name: 'Role of wildlife',
      explanation: 'The role of wildlife is ambiguous.',
    },
    16: {
      name: 'Water storage',
      explanation:
        'Terraces hold slightly more water than unterraced slopes during extreme events (floods, droughts).',
    },
    17: {
      name: 'Fragile geological substrate (scree)',
      explanation: 'Poorly cohesive rock (scree) makes the ground more prone to landslides.',
    },
    18: {
      name: 'Terrace in bloom',
      explanation: 'A terrace in bloom brings aesthetic pleasure and biodiversity.',
    },
  },
};

export default en;
