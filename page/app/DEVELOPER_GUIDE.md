# Guide développeur — UI Vue.js pure (sans Nuxt)

> Documentation pratique : comment créer des pages, des composants réutilisables, et comment configurer une application qui utilise `vue-app` comme template. Pour comprendre le fonctionnement interne (pipeline de chargement, diagrammes de séquence), voir [`ARCHITECTURE.md`](ARCHITECTURE.md). Pour le détail des fichiers du dossier `app/`, voir [`README.md`](README.md).

## Sommaire

1. [Deux mondes de composants — à ne pas confondre](#1-deux-mondes-de-composants--à-ne-pas-confondre)
2. [Créer une nouvelle page](#2-créer-une-nouvelle-page)
3. [Créer un composant réutilisable (frontend, `.vue` normal)](#3-créer-un-composant-réutilisable-frontend-vue-normal)
4. [Créer un composant réutilisable "dynamique" (backend)](#4-créer-un-composant-réutilisable-dynamique-backend)
5. [Alternative : composant `.js` synchrone (sans `vue3-sfc-loader`)](#5-alternative--composant-js-synchrone-sans-vue3-sfc-loader)
6. [Configurer l'application qui utilise `vue-app` comme template](#6-configurer-lapplication-qui-utilise-vue-app-comme-template)
7. [Pièges connus / FAQ](#7-pièges-connus--faq)

---

## 1. Deux mondes de composants — à ne pas confondre

Ce projet n'a **aucune étape de build** : tout est interprété tel quel par le navigateur ou reconstruit à la volée par le backend Java. Ça donne lieu à **deux mécanismes de rendu bien distincts**, avec des dossiers au nom proche mais un rôle très différent :

| | `page/components/*.vue` | `page/app/src/components/*.vue` |
|---|---|---|
| **Rôle** | **Pages** (routes complètes, ex. Home, Dashboard) | **Composants réutilisables** globaux (ex. AppMenu, CustomLink) |
| **Qui les compile** | Le **backend Java** (regex : découpe `<template>`/`<script>`/`<style>`, renvoie du JSON) | Le **navigateur**, via `vue3-sfc-loader` (vrai parsing SFC) |
| **Script** | Pas d'`import` — variables injectées (`useRuntimeLoader`, `onMounted`, `loadPage`, ...), style Options API | `<script>` normal avec vrais `import` ES (Composition API ou Options API) |
| **Déclarées dans** | `config/routes.json` | `main.js` (`app.component(...)`) |
| **Chargées via** | `GET /{appBase}/page/{name}` (JSON `{template, script, style, props}`) | `fetch()` du fichier `.vue` brut, compilé en mémoire |

Il existe un **troisième** mécanisme, pour des composants réutilisables gérés côté backend plutôt que packagés dans le frontend statique : voir [§4](#4-créer-un-composant-réutilisable-dynamique-backend) (`component/*.vue`, un dossier à la racine de l'app, à ne pas confondre avec `page/components/`).

---

## 2. Créer une nouvelle page

Une page = un fichier dans `page/components/` + une entrée dans `config/routes.json`.

### 2.1. Créer le fichier

`page/components/MaPage.vue` :

```html
<template>
  <div class="ma-page">
    <h1>{{ title }}</h1>
    <button @click="goHome">Retour à l'accueil</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Valeurs par défaut — surchargées par les "props" de routes.json
      title: "Ma nouvelle page",
    };
  },
  methods: {
    goHome() {
      // `loadPage` est injecté automatiquement dans le scope du script —
      // pas d'import, pas de `this.$root.loadPage`.
      loadPage("home");
    },
  },
};
</script>

<style>
/* Pas de <style scoped> ici (le compilateur ne le supporte pas dans ce
   pipeline) — préfixez toujours vos classes pour éviter les collisions
   avec les autres pages/composants (ex. .ma-page plutôt que .container). */
.ma-page {
  padding: 20px;
}
</style>
```

**Contraintes importantes du `<script>`** (car il est évalué côté navigateur
via `new Function(...)`, pas importé comme un vrai module ES) :

- **Pas d'`import`** — utilisez uniquement les identifiants déjà injectés dans le scope d'évaluation : `useRuntimeLoader`, `useRuntimeConfig`, `onMounted`, `loadPage`, `goBack`, `createDynamicComponent`.
- Style **Options API** (`data()`, `methods`, `mounted()`, `setup()` si besoin) — pas de `<script setup>`.
- Pour utiliser un composant réutilisable dans le `<template>` : soit un composant **global** (§3, aucune déclaration nécessaire), soit un composant **dynamique backend** (§4, à déclarer dans `components: {}` via `createDynamicComponent(...)`).

### 2.2. Déclarer la route

Dans `config/routes.json` :

```json
{
  "path": "/ma-page",
  "component": "components/MaPage",
  "extension": ".vue",
  "props": {
    "title": "Titre personnalisé pour cette instance"
  }
}
```

- `path` : chemin logique (utilisé en interne, pas dans l'URL du navigateur — il n'y a pas de vue-router, toute navigation passe par `loadPage()`).
- `component` : chemin du fichier **relatif à `page/`**, **sans extension**.
- `extension` : `.vue` pour une page normale, `.html` uniquement pour le shell racine (`index`, déjà configuré, ne pas dupliquer). 
- `props` *(optionnel)* : objet fusionné dans le résultat de `data()` de la
  page — **les clés de `props` gagnent** sur les valeurs par défaut du script. C'est le mécanisme normal pour injecter des données spécifiques à l'environnement sans toucher au fichier `.vue`.
- `roles` *(optionnel, tableau de strings)* : si présent, la page nécessite une authentification et l'un des rôles listés — sinon 403.

### 2.3. (Optionnel) Ajouter une entrée de menu

Dans `menu/entries.json` :

```json
{ "id": "ma-page", "label": "Ma page", "page": "ma-page" }
```

`page` doit correspondre au `path` de `routes.json` **sans le `/`** initial.
`AppMenu.vue` appelle alors `loadPage("ma-page")` au clic.

### 2.4. Naviguer vers la page

- Depuis le menu : automatique via l'entrée ci-dessus.
- Depuis un lien dans un template : `<custom-link to="ma-page">Texte</custom-link>` (composant global, voir §3 — pas de déclaration nécessaire).
- Depuis du code (méthode, `mounted()`, ...) : `loadPage("ma-page")` (déjà injecté dans le scope, pas d'import).

---

## 3. Créer un composant réutilisable (frontend, `.vue` normal)

C'est le mécanisme à privilégier pour un composant réutilisable "classique" : vrai fichier `.vue`, vrais imports ES, Composition API. Utilisez ce mécanisme (plutôt que §4) sauf besoin spécifique de gérer le composant côté backend ou besoin de donner la possibilité aux clients de surcharger le component.

### 3.1. Créer le fichier

`page/app/src/components/MonComposant.vue` — regardez `CustomLink.vue` ou `PlayfulCheckbox.vue` comme modèles. Convention de ce projet : `<script>` classique (`export default { setup(props, { emit }) {...} }`), **pas** `<script setup>` (choix délibéré pour rester proche d'un JS testable directement, mais `vue3-sfc-loader` supporte aussi `<script setup>` si vous préférez).

```html
<template>
  <span class="mon-composant">{{ label }}</span>
</template>

<script>
export default {
  name: "MonComposant",
  props: {
    label: { type: String, required: true },
  },
};
</script>

<style>
.mon-composant { font-weight: bold; }
</style>
```

### 3.2. L'enregistrer globalement dans `main.js`

Trois lignes à ajouter, sur le modèle de `CustomLink`/`PlayfulCheckbox` déjà
présents :

```js
// Près des autres *Url :
const monComposantUrl = new URL("./components/MonComposant.vue", import.meta.url).href;

// Près des autres *Async :
const MonComposantAsync = Vue.defineAsyncComponent(() => loadModule(monComposantUrl, sfcOptions));

// Près des autres app.component(...) :
app.component("MonComposant", MonComposantAsync);
```

### 3.3. L'utiliser

Une fois enregistré globalement, le composant est utilisable **dans n'importe quel template** — pages backend (`page/components/*.vue`, §2) ou composants frontend (`page/app/src/components/*.vue`) — **sans aucune déclaration locale**, exactement comme `<custom-link>` l'est déjà :

```html
<mon-composant label="Bonjour" />
```

Vue résout automatiquement `<mon-composant>` → `MonComposant` (kebab-case vers PascalCase) via le registre global de l'app.

### 3.4. Chargement asynchrone : `<Suspense>` obligatoire ?

Non. `defineAsyncComponent()` gère seul son propre état de chargement (rien n'est affiché tant que la Promise n'est pas résolue, puis le composant apparaît). `<Suspense>` n'est utile que pour **coordonner plusieurs** composants asynchrones avec un fallback commun (voir `AutoComplete` dans `Dashboard.vue`, §4). Pour un composant global enregistré via `app.component(...)` comme ci-dessus, ce n'est pas nécessaire.

Si vous voulez éviter complètement le côté asynchrone (composant toujours disponible dès le démarrage, sans `Suspense` ni délai d'apparition), voir [§5](#5-alternative--composant-js-synchrone-sans-vue3-sfc-loader) ou la variante "top-level await" :

```js
// Résout le composant UNE FOIS au démarrage (avant app.mount), au lieu de
// paresseusement à chaque utilisation. Retarde le premier rendu du temps de
// ce fetch+compilation, mais le composant se comporte ensuite comme un
// composant normal, sans wrapper async.
const MonComposant = await loadModule(monComposantUrl, sfcOptions);
app.component("MonComposant", MonComposant);
```

---

## 4. Créer un composant réutilisable "dynamique" (backend)

À utiliser quand le composant doit être **géré/versionné côté backend** (comme une page), pas embarqué dans les assets statiques du frontend. Exemple existant (non implémenté, juste illustratif du pattern) : `AutoComplete` dans `Dashboard.vue`.

### 4.1. Créer le fichier

**Attention à l'emplacement** — un dossier `component/` (singulier) **à la racine de l'application**, **pas** `page/components/` :

```
<base.path>/
├── page/            ← pages (§2) et composants frontend (§3)
├── component/        ← composants "dynamiques" backend (ICI, § actuel)
│   └── MonWidget.vue
├── config/
└── menu/
```

Le fichier suit les **mêmes contraintes que les pages** (§2.1) : pas d'`import`, style Options API, évalué via `new Function()` côté navigateur après découpage `template`/`script`/`style` côté backend.

### 4.2. L'utiliser dans une page

Dans le `<script>` d'une page (`page/components/*.vue`) :

```js
export default {
  components: {
    MonWidget: createDynamicComponent('MonWidget'),
  },
  // ...
};
```

Dans le `<template>`, entourez-le de `<Suspense>` pour un fallback de chargement propre (recommandé mais pas obligatoire, voir §3.4) :

```html
<Suspense>
  <template #default>
    <MonWidget />
  </template>
  <template #fallback>
    <div>Chargement...</div>
  </template>
</Suspense>
```

`createDynamicComponent` va chercher `GET /{appBase}/component/MonWidget` (avec un contrôle de version via `?version=true` pour la mise en cache côté client) et assemble le composant à partir du JSON `{template, script, style, props}` renvoyé par le backend — même mécanisme
que le chargement de page, mais monté comme sous-composant plutôt que page entière.

---

## 5. Alternative : composant `.js` synchrone (sans `vue3-sfc-loader`)

Si vous n'avez pas besoin de la syntaxe SFC (`<template>`/`<style>` séparés) et voulez un `import` normal, **synchrone**, sans passer par
`vue3-sfc-loader` : écrivez le composant comme un **fichier `.js` normal** (pas `.vue`), avec un `template` en chaîne de caractères.

```js
// page/app/src/components/MonComposant.js
export default {
  name: "MonComposant",
  props: {
    label: { type: String, required: true },
  },
  template: `<span class="mon-composant">{{ label }}</span>`,
};
```

```js
// Dans main.js, ou dans n'importe quel .js important normalement :
import MonComposant from "./components/MonComposant.js";
app.component("MonComposant", MonComposant); // pas de defineAsyncComponent
```

Ça fonctionne car `vendor/vue.esm-browser.prod.js` embarque le compilateur de template runtime (pas juste le runtime-only) — une chaîne `template: "..."` est donc compilée normalement par Vue lui-même, sans passer par `vue3-sfc-loader`.

**Compromis** : pas de bloc `<style>` séparé (injectez le CSS à la main via `utils/inject-style.js`, comme le fait déjà `runtime.js` pour les pages), et le template est une chaîne plutôt qu'un vrai bloc HTML dans l'éditeur.

> Pour un vrai `import Foo from "./Foo.vue"` avec compilation SFC classique, il faudrait une étape de build (Vite) — ce que ce projet évite délibérément. Voir la discussion dans l'historique du projet si cette option doit un jour être reconsidérée.

---

## 6. Configurer l'application qui utilise `vue-app` comme template

Cette section couvre la configuration côté **bundle de déploiement** (en dehors du dépôt `vue-app` lui-même) — les fichiers que l'équipe
d'exploitation doit renseigner pour faire tourner une instance. 

### 6.1. Enregistrement de l'application — `bootstrap.json`

```json
{
  "applications": [
    {
      "name": "Mon application Vue",
      "id": "mon-app",
      "extends": ["default"],
      "version": "1.0.0-RELEASE",
      "base.path": "/chemin/vers/mon-app"
    }
  ],
  "servers": [
    { "host": "127.0.0.1", "port": 8081, "protocol": "http" }
  ]
}
```

- `id` : segment d'URL sous lequel l'app est servie (`/{id}/page/...`) — **doit correspondre** à `appBase` dans `page/app/src/config.js` (§6.4).
- `base.path` : dossier racine contenant `page/`, `component/`, `config/`, `menu/` de cette instance (une **copie** du contenu du dépôt `vue-app`, pas forcément le même chemin que le dépôt source — voir [§7](#7-pièges-connus--faq) sur la synchronisation).
- `extends` : hérite de la config d'une autre application déjà déclarée (ex. `"default"`, pour du contenu API/mappings partagé).

### 6.2. Sécurité OIDC — `default.security.json` (ou section `security` du fichier de config principal)

```json
{
  "security": {
    "provider": "nimbus",
    "oidcProviderBaseUrl": "http://<host-keycloak>:8080",
    "realm": "<realm-keycloak>",
    "discoveryUri": "http://<host-keycloak>:8080/realms/<realm>/.well-known/openid-configuration",
    "clientId": "<client-id-keycloak>",
    "clientSecret": "<client-secret>",
    "scope": "openid profile email",
    "callBackUri": "http://<host-app>:8081/callback",
    "preferredJwsAlgorithm": "RS256",
    "logoutUrl": "",
    "postLogoutRedirectUri": "http://<host-app>:8081/{id}/page",
    "allowedOrigins": ["http://<host-app>:8081"]
  }
}
```

**Côté Keycloak**, pour le client `clientId` :
- **Valid Redirect URIs** → doit inclure `callBackUri`.
- **Valid post logout redirect URIs** → doit inclure `postLogoutRedirectUri` — **champ séparé** de "Valid Redirect URIs", facile à oublier ; sans ça, Keycloak affiche *"Invalid redirect uri"* au moment du logout alors que le login fonctionne normalement.

Voir aussi [§7](#7-pièges-connus--faq) pour la contrainte de cohérence d'hôte entre `callBackUri`/`postLogoutRedirectUri` et l'URL réellement utilisée par les utilisateurs.

### 6.3. Multi-tenant — `multitenancy.json` (optionnel)

```json
{
  "multitenancy": {
    "requireTenantId": true,
    "tenantSimulator": { "enabled": true, "tenantId": "default" },
    "tenants": {
      "default": { "isolationMode": "shared-schema" },
      "un-autre-tenant": {
        "isolationMode": "dedicated-schema",
        "security": {
          "clientId": "client-specifique-a-ce-tenant",
          "realm": "autre-realm"
        }
      }
    }
  }
}
```

Un bloc `security` par tenant **surcharge** la config globale (§6.2) pour ce tenant précis — pratique pour un IdP différent par client, mais source de confusion si un tenant hérite involontairement d'un `clientId` qui n'est pas celui attendu (voir §7).

### 6.4. Configuration frontend — `page/app/src/config.js`

```js
const DEFAULTS = {
  appBase: "mon-app",       // DOIT correspondre à l'id dans bootstrap.json
  basePath: "",              // vide = même origine que la page (recommandé)
  componentDirectory: "component",
  tenantId: "default",
  defaultPage: "home",
};
```

Surchargeable par environnement sans toucher au code, via `page/index.html` :
```html
<script>
  window.__APP_CONFIG__ = { basePath: "https://api.mondomaine.example.com" };
</script>
<script type="module" src="./app/src/main.js"></script>
```
(le premier `<script>`, classique, doit précéder le `<script type="module">`).

### 6.5. Page de démarrage après login — `config/application.json`

```json
{ "defaultUrl": "/home" }
```

Utilisé comme page de repli après un login réussi quand il n'y a pas de "page demandée" à restaurer (ex. connexion directe sans avoir tenté d'accéder à une ressource protégée au préalable).

---

## 7. Pièges connus / FAQ

**Le login fonctionne mais le logout affiche "Invalid redirect uri" côté Keycloak** → le `post_logout_redirect_uri` n'est pas enregistré dans la liste **"Valid post logout redirect URIs"** du client Keycloak (distincte de "Valid Redirect URIs", voir §6.2).

**Erreur "Invalid authentication state" après connexion** → incohérence d'hôte entre l'URL utilisée pour naviguer dans l'app et `callBackUri` / `postLogoutRedirectUri` configurés (ex. app parcourue via `localhost:8081` mais config avec `127.0.0.1:8081`). Le cookie de session est scopé à l'hôte exact qui l'a posé — `localhost` et `127.0.0.1` ne partagent **jamais** leurs cookies, même si les deux pointent vers le même serveur.
**Solution** : parcourir l'app systématiquement avec le même hôte que celui configuré dans `callBackUri`/`postLogoutRedirectUri` (ou aligner la config sur l'hôte utilisé).

**Une prop de `routes.json` ne semble pas s'appliquer** → vérifiez que vous éditez bien la copie **effectivement servie** (`base.path` du
`bootstrap.json` de l'instance qui tourne), pas seulement le dépôt source — ce ne sont pas nécessairement le même dossier (voir §6.1). Un simple `curl http://<host>:<port>/{appBase}/page/{page}` permet de vérifier ce qui est réellement renvoyé.

**Un composant `<mon-composant>` ne s'affiche pas dans une page backend**
→ vérifiez qu'il est bien enregistré **globalement** dans `main.js` (`app.component(...)`, §3.2) — une déclaration dans le `components: {}` local d'un autre `.vue` ne suffit pas, puisque les pages backend (`page/components/*.vue`) n'ont pas de mécanisme d'`import` pour référencer un composant frontend directement.

**`document.title` (l'onglet du navigateur) ne change pas selon la page**
→ c'est automatique dès qu'une route a une prop `title` dans `routes.json` (`runtime.js` le fait pour vous) ; si la page n'a pas de prop
`title`, l'onglet garde le dernier titre défini.
