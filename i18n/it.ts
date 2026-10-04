import type { Strings } from './fr';

/** Italian translation of `fr.ts` (draft, to be reviewed by the research team). */
const it: Strings = {
  tabs: {
    game: 'Gioco',
    results: 'Risultati',
    about: 'Scopri di più',
  },

  common: {
    back: '← Indietro',
    next: 'Avanti',
    validate: 'Conferma',
    start: 'Inizia',
    discover: 'Scopri',
    cancel: 'Annulla',
  },

  language: {
    label: 'Lingua',
    hint: 'Lingua del gioco e delle carte',
  },

  onboarding: {
    tagline: 'Un **gioco** di condivisione delle conoscenze per aiutare a decidere come **recuperare i terrazzamenti**.',
    valley:
      "Nella **valle Roia**, tra il Mercantour e il Mediterraneo, **23.000 terrazzamenti in pietra a secco**, un saper fare **riconosciuto dall'UNESCO**.",
    roleTitle: 'Chi sei?',
    roleSubtitle: 'Il tuo profilo ci aiuta a confrontare i diversi sguardi sul paesaggio.',
    roleHint: 'Più risposte possibili',
    territoryTitle: 'Qual è il tuo legame con il territorio?',
    sourceTitle: 'Come hai conosciuto Terrcatt?',
    roles: {
      owner: 'Proprietario/a di terrazzamenti o di terreni',
      'public-actor': 'Amministratore/trice o ente pubblico',
      researcher: 'Ricercatore/trice o studente/ssa',
      'agri-professional': "Professionista dell'agricoltura o del paesaggio",
      resident: 'Abitante della valle',
      curious: 'Curioso/a',
    },
    territory: {
      roya: 'Abito o conosco bene la valle Roia',
      'similar-territory': 'Il mio territorio affronta sfide simili',
      'no-link': 'Nessun legame particolare, lo sto scoprendo',
    },
    sources: {
      university: "L'università o il gruppo di ricerca",
      'word-of-mouth': 'Passaparola',
      event: 'Un laboratorio o un evento del progetto',
      'social-media': 'Social network',
      press: 'Stampa o media',
      'online-search': 'Ricerca online',
      other: 'Altro',
    },
    cardsTitle: 'Una carta, una situazione',
    cardsBody:
      'Stai per scoprire **18 carte**. Ognuna mostra un terrazzamento in **una situazione particolare**: un pendio molto ripido, piogge abbondanti, delle arnie…',
    voteTitle: 'Dai il tuo parere',
    voteBody:
      'Per ogni carta, indica se questa situazione è **favorevole o sfavorevole** al **recupero dei terrazzamenti**, da **-2 a +2**, secondo la tua percezione.',
    compareTitle: 'Non esistono risposte sbagliate',
    compareYou: 'Il tuo sguardo',
    compareStudy: 'Lo studio',
    compareBody1: 'Non è **un test**: vogliamo semplicemente conoscere **il tuo punto di vista**.',
    compareBody2: 'Alla fine, scopri come il tuo sguardo si confronta con i **risultati dello studio scientifico**.',
  },

  scale: {
    '-2': 'Molto sfavorevole',
    '-1': 'Sfavorevole',
    '0': 'Neutro',
    '1': 'Favorevole',
    '2': 'Molto favorevole',
    notRated: 'Non valutata',
  },

  rate: {
    done: 'Finito!',
    expertBadge: 'Modalità esperto',
    allRated: 'Hai valutato tutte le carte!',
    allRatedSub: 'Scopri la tua classifica e confronta il tuo sguardo con quello degli scienziati.',
    seeResults: 'Vedi i miei risultati',
    replay: 'Ricomincia una partita',
    titlePlaceholder: 'Che titolo daresti a questa carta?',
  },

  results: {
    noneRated: 'Nessuna carta valutata',
    ratedCount: (rated: number, total: number) =>
      `${rated} cart${rated > 1 ? 'e' : 'a'} su ${total} valutat${rated > 1 ? 'e' : 'a'}`,
    lockedText: (total: number) =>
      `Valuta tutte le ${total} carte per confrontare il tuo sguardo con quello dello studio.`,
    continue: 'Continua a valutare',
    headline: (shared: number, total: number) =>
      `Condividi lo sguardo dello studio\nsu **${shared} carte su ${total}**`,
    tapHint: 'Tocca una carta per saperne di più',
    you: 'Tu',
    study: 'Lo studio',
    agreement: {
      desaccord: {
        label: 'Sguardo diverso',
        plural: 'Sguardi diversi',
        description: 'Vedi questa carta in modo diverso dallo studio',
      },
      nuance: {
        label: 'Sguardo vicino',
        plural: 'Sguardi vicini',
        description: 'Stessa tendenza, intensità diversa',
      },
      accord: {
        label: 'Stesso sguardo',
        plural: 'Stessi sguardi',
        description: 'Vedi questa carta come lo studio',
      },
    },
  },

  detail: {
    back: 'Risultati',
    notComplete: 'Finisci di valutare le carte per vedere i dettagli.',
    notFound: 'Carta non trovata.',
    yourTitle: (title: string) => `Il tuo titolo: «${title}»`,
    yourView: 'Il tuo sguardo',
    studyView: 'Lo sguardo dello studio',
    observedTitle: 'Cosa ha osservato lo studio',
    noExplanation: 'Nessuna spiegazione disponibile.',
    furtherTitle: 'Per saperne di più',
    furtherBody:
      "Ogni carta si basa sulle osservazioni svolte nella valle Roia dopo la tempesta Alex. Il gruppo Terrcatt confronta lo sguardo degli abitanti con i dati raccolti sul campo per orientare il recupero dei terrazzamenti.",
    furtherCaption: 'Terrazzamenti agricoli e muri in pietra a secco, valle Roia (aprile 2025).',
  },

  about: {
    bannerCaption: 'Oliveto terrazzato, valle Roia',
    projectName: 'Progetto Terrcatt',
    projectSubtitle: 'Terrazzamenti agricoli e ricostruzione di un territorio dopo una catastrofe',
    researchTitle: 'Un gioco nato dalla ricerca',
    researchBody1:
      "Questo gioco è la versione digitale di un metodo partecipativo di classificazione di carte, ideato da ricercatori della Sorbonne Université nell'ambito del progetto Terrcatt. Le tue risposte alimentano direttamente il loro lavoro.",
    researchBody2:
      'Il progetto studia i circa 23.000 terrazzamenti agricoli della valle Roia (Alpi francesi), in gran parte abbandonati ma con un ruolo chiave nella resilienza agli eventi climatici estremi come la tempesta Alex (ottobre 2020).',
    researchBody3:
      "Terrcatt è sostenuto dall'Alliance Sorbonne Université e prosegue il programma STORY (Rischi e società nel bacino della Roia), condotto insieme alle associazioni locali.",
    teamTitle: 'Il gruppo',
    teamRoles: {
      cohen: 'Professoressa di biogeografia, laboratorio Médiations, Facoltà di Lettere',
      gorini: 'Professore di geoscienze, ISTeP, Facoltà di Scienze e Ingegneria',
      levot: 'Geografo e geomatico',
    },
    ctaTitle: 'Un progetto simile per il tuo territorio?',
    ctaBody:
      'Ti occupi di recupero del paesaggio, di gestione partecipativa del territorio o di resilienza dopo una catastrofe? Contattaci per capire come questo metodo può adattarsi al tuo contesto.',
    ctaButton: 'Contattaci',
    contactSubject: 'Progetto Terrcatt: presa di contatto',
    publicationsTitle: 'Le ricerche',
    publicationsBody:
      'Lo «sguardo dello studio» mostrato nei tuoi risultati proviene dalle osservazioni sul campo pubblicate dal gruppo.',
    publicationDetails: {
      resilience: 'Le Vot, Cohen, Nowak, Passy, Sumera. Land, 2024. Accesso libero.',
      erosion: 'Cohen, Kerverdo, Nowak, Gorini, Rabaute, Le Vot. Preprint SSRN, 2026.',
      story: 'Rischi e società nel bacino della Roia: il programma da cui nasce Terrcatt.',
    },
    creditsTitle: 'Crediti delle illustrazioni',
    creditsCards:
      'Le illustrazioni delle carte sono realizzate a partire da fotografie scattate sul campo nella Roia da Marianne Cohen. Sono disponibili con licenza Creative Commons.',
    creditsCardsLicence: 'Licenza Creative Commons, archivio HAL (MediHAL).',
    creditsPhotos:
      "Le fotografie dei terrazzamenti (questa pagina e le schede delle carte) sono state scattate nella valle Roia nell'aprile 2025 dal gruppo del progetto. La vista della valle nella schermata iniziale è pubblicata con licenza libera:",
    creditsEntryPhotoLicence: 'Licenza CC BY-SA 4.0, Wikimedia Commons (contrasto ritoccato).',
    preferencesTitle: 'Preferenze',
    expertLabel: 'Modalità esperto',
    expertHint: 'Carte senza titolo: indovina cosa rappresentano e proponi il tuo titolo. Opzione in prova.',
    animationsLabel: 'Animazioni',
    animationsHint: 'Comparsa animata dei risultati',
    installLabel: "Installa l'app",
    installHint: 'Aggiungi Terrcatt alla schermata Home',
    replayIntroLabel: "Rivedi l'introduzione",
    replayIntroHint: 'Ripeti il tutorial iniziale',
    dataTitle: 'I miei dati',
    dataBody:
      "Le tue risposte sono registrate in forma anonima. Eliminare i tuoi dati cancella tutto, qui e sui nostri server, e riavvia l'app da zero.",
    deleteData: 'Elimina i miei dati',
    deleteConfirm: "Conferma l'eliminazione definitiva",
  },

  install: {
    title: 'Installa Terrcatt',
    back: 'Scopri di più',
    lead: "Terrcatt funziona senza download. Aggiungilo alla schermata Home per aprirlo come un'app, a schermo intero.",
    button: 'Installa Terrcatt',
    orManually: 'Oppure manualmente:',
    installedTitle: 'Terrcatt è già installato',
    installedText: "Stai usando l'app dalla schermata Home.",
    ios: {
      intro: "Su iPhone e iPad, l'installazione si fa da Safari.",
      steps: [
        'Tocca il pulsante Condividi, in basso nello schermo (il quadrato con una freccia).',
        'Scorri il menu e tocca «Aggiungi alla schermata Home».',
        'Tocca «Aggiungi» in alto a destra. Terrcatt compare tra le tue app.',
      ],
    },
    android: {
      intro: "Su Android, l'installazione si fa da Chrome.",
      steps: [
        'Tocca il menu con i tre puntini, in alto a destra in Chrome.',
        'Tocca «Installa app» o «Aggiungi a schermata Home».',
        'Conferma. Terrcatt compare tra le tue app.',
      ],
    },
    desktop: {
      intro: "Sul computer, Chrome ed Edge possono installare Terrcatt come un'app.",
      steps: [
        "Clicca sull'icona di installazione a destra della barra degli indirizzi.",
        'Conferma. Terrcatt si apre in una finestra propria, senza schede.',
      ],
    },
  },

  notFound: {
    title: 'Ops!',
    text: 'Questa schermata non esiste.',
    home: "Torna all'inizio",
  },

  cards: {
    1: {
      name: 'Abbandono agricolo',
      explanation: "L'abbandono agricolo favorisce il degrado dei terrazzamenti e la perdita di biodiversità.",
    },
    2: {
      name: "Accumulo d'acqua sopra il muretto",
      explanation:
        "L'accumulo d'acqua a monte del muretto è stato osservato in alcuni terrazzamenti che hanno subito frane.",
    },
    3: {
      name: 'Apicoltura',
      explanation: "L'apicoltura è favorevole nei terrazzamenti in cui le piante sono impollinate dagli insetti.",
    },
    4: {
      name: "Drenaggio dell'acqua",
      explanation:
        'Il drenaggio del suolo, con uno strato drenante dietro lo strato di grandi pietre, è favorevole alla stabilità dei terrazzamenti.',
    },
    5: {
      name: 'Media montagna',
      explanation: 'La media montagna ha una piovosità moderata, ma una tendenza al disseccamento dei suoli.',
    },
    6: {
      name: 'Muri non mantenuti',
      explanation: "Muri poco curati hanno un ruolo probabile nell'indebolimento dei terrazzamenti.",
    },
    7: {
      name: 'Oliveto fiorito',
      explanation:
        "L'oliveto fiorito ospita una biodiversità e interazioni con gli impollinatori osservate negli oliveti coltivati con pratiche poco intensive.",
    },
    8: {
      name: 'Olivo piantato sul bordo di un muretto',
      explanation:
        'Un olivo piantato sul bordo dei muretti può contribuire a degradarli, ma è favorevole alle colture associate.',
    },
    9: {
      name: 'Passato agricolo',
      explanation:
        'Il passato agricolo è favorevole alla conservazione dei suoli, e quindi a una minore vulnerabilità alle frane.',
    },
    10: {
      name: 'Patrimonio paesaggistico',
      explanation: "Il patrimonio paesaggistico è riconosciuto dall'UNESCO, con una dimensione estetica.",
    },
    11: {
      name: 'Pendio molto ripido',
      explanation: 'Un pendio molto ripido può favorire le frane sui terrazzamenti.',
    },
    12: {
      name: 'Piogge molto abbondanti',
      explanation: 'Una pioggia molto forte favorisce le frane sui terrazzamenti.',
    },
    13: {
      name: 'Vicinanza a una strada',
      explanation: "La vicinanza della strada modifica lo scorrimento dell'acqua.",
    },
    14: {
      name: "Ruolo della fauna selvatica e dell'abbandono agricolo",
      explanation:
        "La fauna selvatica, insieme all'abbandono agricolo, ha un ruolo probabile nel degrado dei terrazzamenti.",
    },
    15: {
      name: 'Ruolo della fauna selvatica',
      explanation: 'Il ruolo della fauna selvatica è ambiguo.',
    },
    16: {
      name: "Stoccaggio dell'acqua",
      explanation:
        "I terrazzamenti trattengono un po' più d'acqua dei versanti non terrazzati durante gli eventi estremi (piene, siccità).",
    },
    17: {
      name: 'Substrato geologico fragile (detriti di falda)',
      explanation: 'Una roccia poco coesa (detriti di falda) è un fattore di fragilità rispetto alle frane.',
    },
    18: {
      name: 'Terrazzamento fiorito',
      explanation: 'Un terrazzamento fiorito porta un piacere estetico e biodiversità.',
    },
  },
};

export default it;
