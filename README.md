# Terrcatt — Aide participative à la décision territoriale

Application mobile interactive de tri de cartes, développée en collaboration avec **Prof. Marianne Cohen** (Sorbonne Université) dans le cadre du **projet Terrcatt** (Terrasses de culture et reconstruction d'un territoire post-catastrophe).

---

## Contexte

La vallée de la Roya (Alpes-Maritimes) a été dévastée par la tempête Alex en octobre 2020. La région compte environ 23 000 terrasses agricoles, en grande partie abandonnées, qui jouent un rôle clé dans la résilience face aux événements climatiques extrêmes. Le projet Terrcatt vise à accompagner la prise de décision pour la réhabilitation de ces terrasses grâce à des méthodes participatives.

## Qu'est-ce que cette application ?

Cette application est la **version numérique** d'un jeu de cartes physique conçu par Prof. Cohen. Les participants classent 15 caractéristiques paysagères (pente, drainage, accès routier, etc.) de « Très favorable » à « Très défavorable » pour la réhabilitation des terrasses.

L'objectif est triple :

1. **Collecter des données à grande échelle** — Recueillir les perceptions de davantage de participants que ne le permettent les ateliers physiques
2. **Comparer les perspectives** — Analyser comment différents groupes (propriétaires, acteurs publics, chercheurs) perçoivent les mêmes caractéristiques
3. **Confronter au terrain** — Comparer les classements participatifs aux données scientifiques de terrain

## Comment ça marche ?

L'application propose trois modes de classement :

| Mode | Principe | Comment l'utiliser |
|------|----------|--------------------|
| **Glisser** | Réaction intuitive rapide | Glisser les cartes à droite (favorable), à gauche (défavorable) ou vers le haut (neutre), puis affiner le degré |
| **Comparer** | Comparaison par paires | Deux cartes affichées côte à côte — toucher celle qui compte le plus |
| **Noter** | Jugement absolu sur une échelle | Noter chaque carte de -2 (très défavorable) à +2 (très favorable) |

Un onglet **Résultats** permet de visualiser les classements obtenus avec chaque méthode et de les comparer à la « vérité terrain » scientifique.

## Les 15 cartes

Olivier Murette, Pente, Route, TWI, Abandon, Apiculture, Drainage, Faune Sauvage, Hyper-pluviosité, Irrégularité Topographique, Pâture, Stockage Eau, Substrat Géologique, Terrasses, Utilisation Agricole.

## À qui s'adresse cette application ?

- **Propriétaires de terrasses** — Partager vos connaissances locales sur les critères importants pour la réhabilitation
- **Acteurs publics** — Comprendre les priorités des communautés pour orienter les politiques publiques
- **Chercheurs** — Collecter des données structurées sur les perceptions des parties prenantes
- **Toute personne intéressée** — Découvrir la méthodologie et nous contacter pour une collaboration sur des projets similaires

## Fondements méthodologiques

Cette approche s'appuie sur des méthodes éprouvées de la littérature scientifique en aide à la décision participative :

- **Analyse multicritère (MCDA)** — Pondération des critères pour les décisions d'aménagement du territoire
- **SIG participatif (PGIS)** — Croisement des savoirs locaux avec les données spatiales
- **Q-Méthodologie** — Identification des archétypes de points de vue des parties prenantes
- **CrowdBT** — Agrégation de comparaisons par paires à grande échelle

## Contact

Vous êtes confronté à des enjeux de réhabilitation paysagère, de gestion participative du territoire ou de résilience post-catastrophe ? Ce projet montre comment les outils numériques peuvent amplifier l'impact de l'analyse participative.

**Prof. Marianne Cohen** — marianne.cohen@sorbonne-universite.fr

---

## Development

### Getting Started

```bash
npm install           # Install dependencies
npm start             # Start Expo dev server (i=iOS, a=Android, w=web)
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web browser
```

### Tech Stack

- Expo SDK 54 with Expo Router (file-based navigation)
- React Native Gesture Handler + Reanimated (swipe gestures and animations)
- React Context + useReducer (state management)
- TypeScript strict mode

### Project Structure

```
/app
  _layout.tsx           # Root layout with providers
  (tabs)/
    _layout.tsx         # Tab navigator configuration
    index.tsx           # Game tab (swipe / compare / rate modes)
    results.tsx         # Results tab with rankings
    settings.tsx        # Settings / about tab
/assets
  /cards                # Card images (15 Terrcatt cards)
/components
  Card.tsx              # Base card component (small/medium/large)
  SwipeableCard.tsx     # Animated swipeable card with color overlays
  SwipeMode.tsx         # Two-step swipe sorting mode
  CompareMode.tsx       # Pairwise comparison mode
  RateMode.tsx          # 5-point rating mode
  GameModeModal.tsx     # Mode selector modal
/context
  CardContext.tsx        # State management (scores, game mode, reducer)
```

### Key Architecture Notes

- Three independent scoring systems: swipe (two-pass), compare (pairwise), rating (5-point scale)
- All state is in-memory only (resets on app restart)
- Provider hierarchy: GestureHandlerRootView → ThemeProvider → CardProvider
- 15 cards defined in `CardContext.tsx` with images loaded via `require()`
- SwipeableCard supports customizable overlay colors via `colors` prop
- All user-facing text is in French; code comments and variable names in English

### Future Development

- **CrowdBT aggregation** — Combine pairwise comparisons across users for global ranking
- **User profiling** — Capture persona (terrace owner, public actor, researcher) to segment analysis
- **Confidence indicators** — Optional "how sure are you?" after ratings
- **Qualitative capture** — "Why?" prompts for extreme ratings (+2/-2)
- **Terrain truth comparison** — Show divergence from Prof. Cohen's scientific reference data
- **A/B testing** — Compare engagement and data quality across methods

---

*Terrcatt v1.0 — Sorbonne Université*
