/**
 * vue.js
 *
 * Point d'indirection unique vers le build de Vue effectivement utilisé.
 * Tous les fichiers de src/ importent Vue depuis ce fichier plutôt que
 * depuis vue.esm-browser.prod.js directement — pour passer en mode dev
 * (warnings détaillés, messages d'erreur non minifiés) il suffit de changer
 * la ligne ci-dessous, sans toucher au reste du code.
 */
export * from "./vue.esm-browser.prod.js";

// Pour le débogage local, commenter la ligne au-dessus et décommenter celle-ci :
// export * from "./vue.esm-browser.dev.js";
