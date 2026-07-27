# Tests de fumée

Ce script ne fait pas partie de l'application livrée : c'est un outil de
développement qui simule le backend Java (via un mock de `fetch`) et monte
réellement l'application dans un DOM simulé (`jsdom`) pour vérifier que le
rendu correspond au comportement attendu — sans dépendre d'un vrai serveur
PayOS.

Depuis la conversion d'AppMenu/AppRoot/CustomLink en véritables fichiers
`.vue`, ce test exécute la **vraie** bibliothèque `vue3-sfc-loader` (celle
vendorisée dans `../vendor/`) : `getFile()` lit les vrais fichiers du projet
directement sur le disque (au lieu de faire un vrai `fetch()` réseau), ce
qui simule fidèlement ce qu'un serveur statique renverrait, sans dépendre
d'un serveur HTTP réellement démarré.

## Installation

```bash
cd test
npm install
```

## Exécution

```bash
npm test
```

## Ce qui est vérifié

1. **Démarrage** : `main.js` charge `AppRoot.vue` via `loadModule()` ;
   `AppRoot.vue` importe lui-même `AppMenu.vue` (composant .vue → .vue) et
   `runtime.js`/`config.js` via `moduleCache` (contournement de la
   limitation de `vue3-sfc-loader` sur les `.js` externes, cf. commentaires
   dans `main.js`).
2. **Session** : `GET /me` et `GET /{appBase}/menu` sont appelés, le menu et
   la session (nom d'utilisateur, rôles, badge Admin) s'affichent.
3. **Page dynamique** : `GET /{appBase}/page/home` est chargée et compilée à
   la volée, avec un `<custom-link>` (lui-même un vrai `.vue`) à l'intérieur.
4. **Injection de style** : les trois blocs `<style>` (AppMenu.vue,
   CustomLink.vue, AppRoot.vue) sont bien présents dans le DOM après
   compilation.
5. **Navigation par clic** sur `CustomLink.vue` → `loadPage('dashboard')`.
6. **`goBack()`** via le bouton "← Précédent" du menu.
7. **Cache de version** : une seconde navigation vers une page déjà visitée
   ne déclenche qu'un appel `?version=true`, pas de re-fetch complet.
8. **Expiration de session** : une réponse `401` sur `/me` réinitialise le
   principal et masque la zone utilisateur du menu.
