# PayOS UI — pure VueJS (sans build, composants créés à la volée)

## Documents de références

- [Architecture de ce front-end](./ARCHITECTURE.md): Décrit le fonctionnement interne de ce front-end
- [Guide du développeur](./DEVELOPER_GUIDE.md): Montre comment le développeur front end peut développer des pages et des composants réutilisables.


Portage de l'application `nuxt-app` (Nuxt 4) vers du **VueJS pur** : aucune étape de build, aucun bundler. `AppMenu`, `AppRoot` et `CustomLink` sont de véritables fichiers **`.vue`** (`<template>`/`<script>`/`<style>`), compilés **à la volée dans le navigateur** par `vue3-sfc-loader` — aucun Vite/webpack n'intervient jamais. Le reste (`runtime.js`, `config.js`, la directive) reste en `.js` car ce sont des modules utilitaires sans template, qui n'ont rien à gagner au format SFC.

C'est exactement le même principe que le mécanisme de chargement dynamique de pages/composants depuis le backend Java (`useRuntimeLoader`), qui existait déjà côté Nuxt — sauf qu'il s'applique désormais à *toute* l'application, y compris ce qui était auparavant précompilé par Nuxt/Vite.

## 1. Ce qui a changé par rapport à l'ancienne template nuxt, et ce qui n'a pas changé

**Inchangé — le contrat avec le backend Java PayOS reste identique** : mêmes routes appelées (`/me`, `/logout`, `/{appBase}/menu`, `/{appBase}/page/{name}`, `/{appBase}/component/{name}`), même format de réponse (`{ template, script, style, props, redirect }`), même mécanisme d'authentification par cookie de session + `credentials: 'include'`. Le backend Java (OIDC/Keycloak, `config/application.json`, etc.) n'a **rien à changer**. Ces ressources backend sont recopiées telles quelles à la racine du projet (`config/`, `menu/`, `page/*.vue`) à titre de documentation, mais ne font pas partie de l'application livrée ici (ce sont des fichiers serveur, pas frontend — voir §2 pour le détail de l'arborescence).

**Changé — la façon dont le frontend est construit et livré** :

| Nuxt (avant) | Pur Vue (maintenant) |
|---|---|
| `nuxt.config.ts`, build Vite/Nuxt | Aucun build — fichiers `.vue`/`.js` servis tels quels |
| SFC `.vue` précompilés par Vite (AppMenu, app.vue, page/index.vue) | Vrais SFC `.vue`, mais compilés **à la volée dans le navigateur** par `vue3-sfc-loader` (vendorisé, cf. §2) |
| `vue: { runtimeCompiler: true }` (nécessaire uniquement pour les pages/composants venant du backend) | Build complet de Vue (avec compilateur de templates) + `vue3-sfc-loader` (compilateur de SFC complet, avec babel/postcss intégrés) |
| `plugins/*.client.ts` (auto-enregistrés par Nuxt) | `main.js` enregistre explicitement tout au bootstrap, y compris le chargement des `.vue` non-backend via `loadModule()` |
| `useNuxtApp().$runtime` | `inject('runtime')` (fourni via `app.provide('runtime', …)`) — fonctionne aussi à travers les composants chargés par `vue3-sfc-loader` |
| `useRuntimeConfig().public` | `import { config } from "app-config"` (alias résolu via `moduleCache`, cf. §5) |
| `dir: { pages: 'page' }` + `vue-router` (auto-généré, jamais réellement utilisé — vérifié : aucun `useRouter`/`navigateTo` dans le code métier) | Pas de vue-router du tout : la "navigation" a toujours été gérée par `loadPage`/`setPage`/`goBack`, jamais par les routes du navigateur. Toute la navigation est gérée côté backend (routes.json) |
| `<NuxtRouteAnnouncer />` | Équivalent maison : région `aria-live` annonçant les changements de page |

## 2. Arborescence

La racine du projet ne contient que **`config/`** et **`menu/`** (ressources backend). Le dossier **`page/`** (anciennement `page-components/`) regroupe désormais tout ce qui concerne l'affichage d'une page : les gabarits `.vue` de référence pour le backend, **et** l'application frontend elle-même (`index.html` + `app/`), pour ne pas mélanger ces deux familles avec les autres ressources backend (`config/`, `menu/`).

```
vue-app/
├── config/                     # [BACKEND — référence uniquement, non lu par le frontend]
│   ├── application.json        #   OIDC / Keycloak
│   ├── mappings.json
│   └── routes.json             #   mapping nom de page → composant + props
│
├── menu/
│   └── entries.json            # [BACKEND] source par défaut de GET /{appBase}/menu
│
└── page/                        # gabarits backend + application frontend
    ├── Home.vue                 # [BACKEND] gabarits .vue servis via /page/* et /component/*
    ├── Dashboard.vue
    ├── Mlo.vue
    ├── live/AC.vue
    │
    ├── index.html                # [FRONTEND] point d'entrée, charge ./app/src/main.js
    └── app/                       # [FRONTEND] implémentation (code, Vue vendorisé, tests, docs)
        ├── README.md              # ce fichier
        ├── ARCHITECTURE.md        # détail du fonctionnement interne
        ├── vendor/
        │   ├── vue.js                    # point d'indirection (dev/prod), importé depuis src/
        │   ├── vue.esm-browser.prod.js   # build complet de Vue 3.5.28 (avec compilateur runtime)
        │   ├── vue.esm-browser.dev.js    # idem, non minifié (warnings détaillés) — usage debug
        │   ├── vue3-sfc-loader.esm.js    # compilateur de SFC (.vue → composant), embarque babel + postcss
        │   ├── VUE_LICENSE.txt
        │   └── VUE3_SFC_LOADER_LICENSE.txt
        ├── src/
        │   ├── main.js                # bootstrap : createApp, provide, ET chargement des .vue via loadModule()
        │   ├── config.js              # équivalent de runtimeConfig.public (reste en .js, pas de template)
        │   ├── runtime.js             # portage de useRuntimeLoader.ts (reste en .js, pas de template)
        │   ├── AppRoot.vue            # fusion de app.vue + page/index.vue — vrai SFC .vue
        │   ├── components/
        │   │   ├── AppMenu.vue        # portage de components/AppMenu.vue — vrai SFC .vue
        │   │   └── CustomLink.vue     # portage de plugins/custom-link.client.ts — vrai SFC .vue
        │   ├── directives/
        │   │   └── click-outside.js   # portage de plugins/directives.client.ts (pas de template)
        │   └── utils/
        │       └── inject-style.js    # utilitaire d'injection de <style> — utilisé uniquement pour
        │                              #   les pages/composants venant du backend (voir §7 ARCHITECTURE.md) ;
        │                              #   AppMenu/AppRoot/CustomLink utilisent désormais addStyle() de
        │                              #   vue3-sfc-loader à la place, cf. main.js
        └── test/                     # test de fumée (backend Java simulé + jsdom), voir app/test/README.md
```

> ⚠️ **Point d'attention** : `page/` contient maintenant à la fois des gabarits **backend** (`Home.vue`, `Dashboard.vue`, …) et l'application **frontend** (`index.html`, `app/`). Contrairement à `config/` et `menu/` (100% backend), ce dossier est donc mixte — gardez cette distinction à l'esprit lors du déploiement (seuls `index.html` et `app/` doivent être exposés par le serveur statique ; les `.vue` de `page/` restent des ressources serveur, cf. §7 de `ARCHITECTURE.md`).
>
> Les chemins relatifs entre fichiers de `app/` (imports JS entre `src/`, `vendor/`, `test/`) n'ont pas changé, et `index.html` continue de charger `./app/src/main.js` sans modification (seul son dossier parent a changé, pas sa position relative par rapport à `app/`).

## 3. Chargement des `.vue` à la volée (`vue3-sfc-loader`)

`main.js` est désormais aussi responsable du chargement des trois `.vue` statiques, via `loadModule()` + `Vue.defineAsyncComponent()` :

```js
const AppRootAsync = Vue.defineAsyncComponent(() => loadModule(appRootUrl, sfcOptions));
const CustomLinkAsync = Vue.defineAsyncComponent(() => loadModule(customLinkUrl, sfcOptions));
```

`AppMenu.vue` n'a pas besoin de son propre `loadModule()` : il est résolu automatiquement par la bibliothèque via l'import relatif fait dans le `<script>` d'`AppRoot.vue` (`import AppMenu from "./components/AppMenu.vue"`).

Points importants à connaître si vous modifiez ces fichiers :

- **`moduleCache: { vue: Vue, "app-runtime": ..., "app-config": ... }`** —  `vue3-sfc-loader` ne sait pas parser un fichier `.js` externe qui utilise `import`/`export` (limitation connue de la bibliothèque, voir [issue #14](https://github.com/FranckFreiburger/vue3-sfc-loader/issues/14)). `runtime.js` et `config.js` sont donc importés normalement (ES module natif, comme avant) dans `main.js`, puis exposés aux `.vue` sous un nom stable via `moduleCache` — le même principe que pour `'vue'` lui-même. Concrètement, dans `AppMenu.vue` : `import { createRuntime } from "app-runtime"` (pas de chemin relatif vers `runtime.js`).

- **Chemin d'entrée absolu** — `loadModule()` a besoin d'un chemin fiable ; `main.js` construit une URL absolue via `new URL("./AppRoot.vue", import.meta.url).href` plutôt que de laisser un chemin relatif se faire résoudre par `fetch()` contre l'URL de `page/index.html` (qui vivrait alors dans le mauvais dossier — `index.html` et `app/src/` ne sont pas au même niveau).
- **`addStyle(textContent)`** remplace `injectStyleOnce()` pour ces trois composants : chaque bloc `<style>` compilé est automatiquement ajouté au `<head>` par la bibliothèque elle-même. `utils/inject-style.js` reste utilisé, mais uniquement pour les pages/composants qui continuent d'arriver du backend sous forme de texte brut (voir `ARCHITECTURE.md`).
- **Poids supplémentaire** : `vue3-sfc-loader.esm.js` embarque son propre babel + postcss + compilateur SFC, ce qui en fait le plus gros fichier du projet (~1.8 Mo non compressé, contre ~170 Ko pour Vue seul). C'est le prix du "vrai `.vue` sans build" — à peser si la taille du bundle initial est une contrainte forte (un serveur qui sert ces fichiers avec compression gzip/brotli réduit fortement ce chiffre en transfert réseau réel).

## 4. Lancer l'application

Il n'y a **aucune étape de build**. Il faut néanmoins un serveur HTTP statique (pas un simple `file://`) car :

- les requêtes vers le backend Java utilisent `credentials: 'include'` (cookies de session), ce qui exige une vraie origine HTTP ;
- les ES modules (`import`) et les `fetch()` de `vue3-sfc-loader` vers les `.vue` ne se chargent pas de manière fiable en `file://` dans certains navigateurs.

N'importe quel serveur statique fait l'affaire, par exemple :

```bash
npx serve .
# ou
python3 -m http.server 5500
```

Puis ouvrir `http://localhost:5500` (ou le port choisi). Le backend Java doit tourner sur l'URL définie dans `src/config.js` (`basePath`, par défaut `http://127.0.0.1:8081`) et autoriser du CORS avec `credentials` pour l'origine du serveur statique.

## 5. Configuration par environnement

Voir `src/config.js`. Deux façons de surcharger `appBase`, `basePath`, `componentDirectory`, `tenantId` sans toucher au code :

1. Éditer directement les valeurs par défaut dans `config.js`.
2. Définir `window.__APP_CONFIG__` dans `index.html` (bloc `<script>` classique, avant le `<script type="module">`) — pratique pour une image Docker unique déployée sur plusieurs environnements.

> ⚠️ **À vérifier avec l'équipe backend** : la valeur `appBase` (`"nuxt-app"` par défaut, recopiée telle quelle depuis `nuxt.config.ts`) sert de segment d'URL pour identifier l'application côté serveur Java. Si le  associe ce nom à une configuration spécifique, confirmez qu'il reste valide pour cette nouvelle application pure Vue, ou mettez-le à jour des deux côtés en même temps.

## 6. Points d'attention conservés du portage (fidélité au comportement original)

- **`this.$root.loadPage` / `this.$root.goBack`** : les scripts de *page* envoyés par le backend (ex. `Home.vue`) peuvent utiliser `this.$root.loadPage('dashboard')`. Ceci est remplacé par une **substitution textuelle** (regex) avant évaluation du script — comme dans l'original. Cette substitution ne s'applique **qu'aux pages**, pas aux composants chargés via `createDynamicComponent` (asymétrie déjà présente dans la version Nuxt, conservée à l'identique).
- **`setPage(item.component)`** dans `AppMenu` : si un item de menu a un champ `component`, le code appelle `setPage(item.component)` en passant directement la valeur du champ JSON — qui est généralement une chaîne (nom de composant), pas un objet composant Vue déjà résolu. C'est déjà le comportement de l'original ; à surveiller si vous utilisez ce champ (le champ `page` avec `loadPage(page)` est le chemin le mieux couvert actuellement côté backend de démonstration).
- **Évaluation de scripts via `new Function()`** (`evaluateComponentScript` dans `runtime.js`) : le backend envoie du code JavaScript sous forme de texte, qui est évalué dynamiquement côté client. C'est le mécanisme qui permet des composants "non précompilés", mais cela suppose une **confiance totale dans le backend** (un backend compromis pourrait injecter du code arbitraire dans le navigateur de l'utilisateur). C'était déjà le cas avec `vue: { runtimeCompiler: true }` sous Nuxt ; ce n'est pas une régression, mais cela mérite d'être mentionné explicitement dans un contexte OIDC/bancaire. `vue3-sfc-loader` étend le même principe de confiance aux trois `.vue` statiques (compilés côté client depuis leur contenu texte).
- **Cache de version** : chaque page/composant est mis en cache en mémoire (`Map`) et un appel léger `?version=true` permet de savoir si le contenu a changé côté serveur avant de refaire un fetch complet — comportement identique à l'original, vérifié par les tests (`test/harness-sfc.mjs`).

## 7. Ce qui n'a pas été repris

- **`scripts/patch-swagger-initializer.cjs`** et la dépendance `swagger-ui-dist` : ce n'était qu'un outillage `npm postinstall` pour patcher un fichier de `swagger-ui-dist` (build time), sans lien avec le code Vue de l'application (aucune référence dans les fichiers `.vue`). Sans étape de build/`npm install`, ce mécanisme n'a plus de sens ici. Si une UI Swagger est nécessaire, elle est probablement mieux servie directement par le backend Java (ex. `/swagger-ui`) plutôt que par cette application.
- **`vue-router`** : présent dans les dépendances Nuxt mais jamais utilisé dans le code métier (vérifié — seules des références générées automatiquement dans `.nuxt/`). La navigation réelle passe entièrement par `loadPage`/`setPage`/`goBack`.

## 8. Tests

Voir `test/README.md`. Un backend Java simulé + `jsdom` permettent de valider le rendu réel de l'application — y compris la compilation effective des `.vue` par la vraie bibliothèque `vue3-sfc-loader` (menu, page dynamique, navigation, cache de version, expiration de session) — sans dépendre d'un vrai serveur.

