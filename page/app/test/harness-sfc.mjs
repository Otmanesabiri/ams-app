import { JSDOM } from "jsdom";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="app"></div></body></html>`, {
  url: "http://localhost:5500/page/index.html",
  runScripts: "outside-only",
  pretendToBeVisual: true,
});

global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
global.location = dom.window.location;
global.CustomEvent = dom.window.CustomEvent;
global.MouseEvent = dom.window.MouseEvent;
global.HTMLElement = dom.window.HTMLElement;
global.SVGElement = dom.window.SVGElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.MutationObserver = dom.window.MutationObserver;
global.Text = dom.window.Text;
global.Comment = dom.window.Comment;
global.DocumentFragment = dom.window.DocumentFragment;
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.URLSearchParams = dom.window.URLSearchParams;

const BACKEND = "http://127.0.0.1:8081";
const APP_BASE = "nuxt-app";

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (n) => (n.toLowerCase() === "content-type" ? "application/json" : null) },
    text: async () => JSON.stringify(data),
    json: async () => data,
  };
}
function textResponse(text, status = 200, contentType = "text/plain") {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (n) => (n.toLowerCase() === "content-type" ? contentType : null) },
    text: async () => text,
  };
}

// Sert les vrais fichiers du projet (.vue, .js) pour simuler ce qu'un vrai
// serveur statique renverrait à getFile() de vue3-sfc-loader.
async function fileResponse(fileUrl) {
  // La résolution de chemin par défaut de vue3-sfc-loader produit parfois
  // "file:/chemin" (une seule barre oblique) au lieu de "file:///chemin" —
  // on normalise avant de convertir en chemin disque.
  const normalized = fileUrl.replace(/^file:\/+/, "file:///");
  const filePath = fileURLToPath(normalized);
  try {
    const buf = await readFile(filePath);
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: { get: () => "text/plain" },
      text: async () => buf.toString("utf-8"),
      arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    };
  } catch (err) {
    console.error("[fileResponse] échec lecture:", fileUrl, "->", filePath, "::", err.message);
    return {
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: { get: () => null },
      text: async () => "",
    };
  }
}

let backendCallLog = [];
let authenticated = true;
let meCallCount = 0;

global.fetch = async (input) => {
  const url = typeof input === "string" ? input : input.url;

  if (url.startsWith("file:")) {
    return fileResponse(url);
  }

  backendCallLog.push(url);
  const u = new URL(url, BACKEND);

  if (u.pathname === "/me") {
    meCallCount++;
    if (!authenticated) return jsonResponse({ message: "not authenticated" }, 401);
    return jsonResponse({ preferred_username: "jdoe", realm_access: { roles: ["user", "admin"] } });
  }
  if (u.pathname === `/${APP_BASE}/menu`) {
    return jsonResponse([{ id: "home", label: "Accueil", page: "home" }]);
  }
  if (u.pathname === `/${APP_BASE}/page/home`) {
    if (u.searchParams.get("version") === "true") return textResponse("v1");
    return jsonResponse({
      template: `<div class="welcome-page"><h1>{{ title }}</h1><custom-link to="dashboard">Voir le dashboard</custom-link></div>`,
      script: `export default { data() { return { title: "Bienvenue" }; } }`,
      style: ".welcome-page { color: red; }",
      props: {},
    });
  }
  if (u.pathname === `/${APP_BASE}/page/dashboard`) {
    if (u.searchParams.get("version") === "true") return textResponse("v1");
    return jsonResponse({
      template: `<div class="dashboard-page"><h2>Tableau de bord</h2></div>`,
      script: `export default {}`,
      style: "",
      props: {},
    });
  }
  return textResponse("not found", 404);
};

console.log("Chargement de main.js (vraie exécution : vue3-sfc-loader compile AppRoot.vue, AppMenu.vue, CustomLink.vue depuis le disque)...");

await import("../src/main.js");

// Laisse le temps à : vue3-sfc-loader (fetch + babel + compile-sfc) + les
// onMounted async (refreshPrincipal, loadPage) de se résoudre.
await new Promise((resolve) => setTimeout(resolve, 800));

const html = document.getElementById("app").innerHTML;

console.log("\n--- Appels fetch backend effectués ---");
console.log(backendCallLog);

console.log("\n--- HTML rendu (#app) ---");
console.log(html);

console.log("\n--- Vérifications ---");
console.log(html.includes("app-menu") ? "OK: AppMenu.vue compilé et rendu" : "FAIL: AppMenu absent");
console.log(html.includes("Accueil") ? "OK: item de menu affiché" : "FAIL: item de menu absent");
console.log(html.includes("jdoe") ? "OK: session (principal) affichée dans le menu" : "FAIL: principal absent");
console.log(html.includes("Bienvenue") ? "OK: page home (backend) rendue dans <component :is>" : "FAIL: page home absente");
console.log(html.includes("custom-link") ? "OK: CustomLink.vue compilé et rendu (classe appliquée)" : "FAIL: CustomLink absent");
console.log(/href="dashboard"/.test(html) ? "OK: CustomLink href correct" : "FAIL: CustomLink href incorrect");
console.log(document.getElementById("app-menu-styles") === null && [...document.querySelectorAll("style")].some(s => s.textContent.includes(".app-menu {")) ? "OK: <style> de AppMenu.vue injecté par addStyle()" : "FAIL: style AppMenu absent");
console.log([...document.querySelectorAll("style")].some(s => s.textContent.includes(".custom-link {")) ? "OK: <style> de CustomLink.vue injecté" : "FAIL: style CustomLink absent");
console.log([...document.querySelectorAll("style")].some(s => s.textContent.includes(".page {")) ? "OK: <style> de AppRoot.vue injecté" : "FAIL: style AppRoot absent");

// --- Scénario : clic sur CustomLink (navigation loadPage('dashboard')) ---
console.log("\n### Clic sur CustomLink (\"Voir le dashboard\") ###");
const link = [...document.querySelectorAll("a.custom-link")][0];
link.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 300));
let html2 = document.getElementById("app").innerHTML;
console.log(html2.includes("Tableau de bord") ? "OK: navigation vers dashboard via CustomLink.vue" : "FAIL: dashboard non affiché");

// --- Scénario : goBack ---
console.log("\n### Clic sur \"← Précédent\" (goBack) ###");
const backBtn = [...document.querySelectorAll(".app-menu__nav-item--secondary")][0];
backBtn.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 200));
html2 = document.getElementById("app").innerHTML;
console.log(html2.includes("Bienvenue") ? "OK: retour sur home via goBack" : "FAIL: goBack ne fonctionne pas");

// --- Scénario : cache de version ---
console.log("\n### Cache de version (re-navigation vers dashboard) ###");
backendCallLog = [];
link.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 200));
const fullFetchCount = backendCallLog.filter((u) => u.includes("/page/dashboard") && !u.includes("version")).length;
console.log(fullFetchCount === 0 ? "OK: dashboard servi depuis le cache (pas de re-fetch complet)" : "FAIL: re-fetch complet malgré cache valide");

// --- Scénario : session expirée ---
console.log("\n### Session expirée (401 sur /me) ###");
authenticated = false;
const refreshBtn = document.querySelector(".app-menu__btn-ghost");
refreshBtn.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
await new Promise((r) => setTimeout(r, 200));
const htmlAfterLogout = document.getElementById("app").innerHTML;
console.log(!htmlAfterLogout.includes("app-menu__user") ? "OK: zone utilisateur masquée après 401" : "FAIL: zone utilisateur toujours visible");

console.log("\n--- Terminé ---");
