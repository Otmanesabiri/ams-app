/**
 * i18n.js — Système de traduction vue-i18n pour ams-app
 * Copie fidèle de vue-app/src/locales/ (fr + en)
 */
import * as Vue from '../vendor/vue.js'

const fr = {
  admin: { manage: "Gérer", dashboard: "Tableau de bord", roleManagement: "Gestion des rôles", users: "Utilisateurs", manageAccount: "Gérer le compte", signOut: "Se déconnecter", authentication: "Authentification", login: "Connexion", register: "S'inscrire", forgotPassword: "Mot de passe oublié", parameters: "Paramètres du realm" },
  profile: { title: "Informations personnelles", subtitle: "Gérez vos informations de base", general: "Général", username: "Nom d'utilisateur", email: "Email", firstName: "Prénom", lastName: "Nom de famille", save: "Enregistrer", cancel: "Annuler", jumpToSection: "Aller à la section" },
  roleList: { title: "Rôles", subtitle: "Les rôles sont les rôles que vous définissez pour votre utilisation.", learnMore: "En savoir plus", searchPlaceholder: "Rechercher un rôle par nom", createRole: "Créer un rôle", refresh: "Actualiser", colRoleName: "Nom du rôle", colComposite: "Composite", colDescription: "Description", true: "Vrai", false: "Faux", actions: "Actions", update: "Modifier", delete: "Supprimer" },
  roleCreate: { breadcrumbRealmRoles: "Rôles", breadcrumbCreateRole: "Créer un rôle", title: "Créer un rôle", roleName: "Nom du rôle", description: "Description", save: "Enregistrer", cancel: "Annuler" },
  userList: { title: "Utilisateurs", subtitle: "Créer, rechercher et gérer les utilisateurs dans l'application AMS.", searchPlaceholder: "Rechercher par nom d'utilisateur, email ou nom", createUser: "Créer un utilisateur", allStatuses: "Tous les statuts", active: "Actif", inactive: "Inactif", colUsername: "Nom d'utilisateur", colEmail: "Email", colFirstName: "Prénom", colLastName: "Nom", colStatus: "Statut", colCreatedAt: "Créé le", viewUser: "Voir l'utilisateur", editUser: "Éditer l'utilisateur", deleteUser: "Supprimer l'utilisateur", noUsersFound: "Aucun utilisateur trouvé", noUsersMatching: "Aucun utilisateur ne correspond aux critères de recherche actuels.", showing: "Affichage de", of: "sur", users: "utilisateurs", confirmDeleteTitle: "Supprimer l'utilisateur", confirmDeleteMessage: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?" },
  userForm: { titleCreate: "Créer un utilisateur", titleDetails: "Détails de l'utilisateur", username: "Nom d'utilisateur", email: "Email", firstName: "Prénom", lastName: "Nom", userEnabled: "Utilisateur activé", userEnabledDesc: "Autoriser cet utilisateur à s'authentifier.", emailVerified: "Email vérifié", emailVerifiedDesc: "Marquer l'adresse email de l'utilisateur comme vérifiée.", generalInfo: "Informations générales", generalInfoSubtitle: "Configurez l'identité et le statut du compte de l'utilisateur.", enterUsername: "Saisir le nom d'utilisateur", enterEmail: "Saisir l'adresse email", enterFirstName: "Saisir le prénom", enterLastName: "Saisir le nom", save: "Enregistrer", cancel: "Annuler" },
  auth: { signInTitle: "Se connecter", username: "Nom d'utilisateur", password: "Mot de passe", forgotPassword: "Mot de passe oublié ?", signInButton: "Se connecter", forgotPasswordTitle: "Mot de passe oublié ?", forgotPasswordSubtitle: "Entrez votre nom d'utilisateur ou adresse email.", forgotPasswordDesc: "Veuillez entrer votre adresse e-mail pour recevoir un lien de réinitialisation du mot de passe.", emailAddress: "Adresse e-mail", sendResetLink: "Envoyer le lien de réinitialisation", usernameOrEmail: "Nom d'utilisateur ou email", submit: "Envoyer", backToLogin: "Retour à la connexion", checkEmailTitle: "Vérifiez vos emails", checkEmailDesc: "Si un compte existe, les instructions de réinitialisation ont été envoyées.", registerTitle: "Créer un compte", registerSubtitle: "Saisissez vos informations pour enregistrer un nouveau compte.", confirmPassword: "Confirmer le mot de passe", registerButton: "S'inscrire", dontHaveAccount: "Vous n'avez pas de compte ?", alreadyHaveAccount: "Vous avez déjà un compte ?", passwordsDoNotMatch: "Les mots de passe ne correspondent pas" },
  dashboard: { title: "Tableau de bord administrateur", activeRealms: "Realms actifs", availabilityRate: "Taux de disponibilité", activeSessions: "Sessions actives", realmActivity: "Activité du realm", connections: "Connexions", errors: "Erreurs", day: "Jour", week: "Semaine", month: "Mois", providerStatus: "Statut des providers", active: "Actifs", error: "En erreur", disabled: "Désactivés", recentEvents: "Événements récents", export: "Exporter CSV", viewAll: "Voir tout", enabled: "Activé", colRealm: "Realm", colEvent: "Événement", colUser: "Utilisateur", colDate: "Date", colStatus: "Statut" },
  parameters: { title: "Paramètres du Realm", subtitle: "Configuration du realm AMS", save: "Enregistrer", tabGeneral: "Général", tabLogin: "Connexion", tabEmail: "Email", tabThemes: "Thèmes", tabLocalization: "Localisation", realmId: "Realm ID", displayName: "Nom affiché", htmlDisplayName: "Nom affiché (HTML)", frontendUrl: "URL Frontend", requireSsl: "Exiger SSL", userManagedAccess: "Accès géré par l'utilisateur", realmEnabled: "Realm activé", userRegistration: "Inscription des utilisateurs", forgotPassword: "Mot de passe oublié", rememberMe: "Se souvenir de moi", emailAsUsername: "Email comme nom d'utilisateur", loginWithEmail: "Connexion par email", duplicateEmails: "Autoriser les emails en doublon", verifyEmail: "Vérification de l'email", verifyProfile: "Vérification du profil", editUsername: "Modification du nom d'utilisateur", fromEmail: "Email d'expédition", fromName: "Nom d'expédition", replyTo: "Adresse de réponse", replyToName: "Nom de réponse", envelopeFrom: "Enveloppe d'expédition", smtpHost: "Hôte SMTP", smtpPort: "Port SMTP", enableSsl: "Activer SSL", enableStartTls: "Activer StartTLS", smtpAuth: "Authentification SMTP", smtpUsername: "Nom d'utilisateur SMTP", smtpPassword: "Mot de passe SMTP", darkMode: "Mode sombre", enableI18n: "Activer l'internationalisation", supportedLocales: "Langues supportées", defaultLocale: "Langue par défaut" }
}

const en = {
  admin: { manage: "Manage", dashboard: "Dashboard", roleManagement: "Role management", users: "Users", manageAccount: "Manage account", signOut: "Sign out", authentication: "Authentication", login: "Login", register: "Register", forgotPassword: "Forgot Password", parameters: "Realm Settings" },
  profile: { title: "Personal Info", subtitle: "Manage your basic information", general: "General", username: "Username", email: "Email", firstName: "First Name", lastName: "Last Name", save: "Save", cancel: "Cancel", jumpToSection: "Jump to section" },
  roleList: { title: "Roles", subtitle: "Roles are the roles that you define for use.", learnMore: "Learn more", searchPlaceholder: "Search role by name", createRole: "Create role", refresh: "Refresh", colRoleName: "Role name", colComposite: "Composite", colDescription: "Description", true: "True", false: "False", actions: "Actions", update: "Update", delete: "Delete" },
  roleCreate: { breadcrumbRealmRoles: "Roles", breadcrumbCreateRole: "Create role", title: "Create role", roleName: "Role name", description: "Description", save: "Save", cancel: "Cancel" },
  userList: { title: "Users", subtitle: "Create, search and manage users in the AMS application.", searchPlaceholder: "Search by username, email or name", createUser: "Create user", allStatuses: "All statuses", active: "Active", inactive: "Inactive", colUsername: "Username", colEmail: "Email", colFirstName: "First Name", colLastName: "Last Name", colStatus: "Status", colCreatedAt: "Created At", viewUser: "View user", editUser: "Edit user", deleteUser: "Delete user", noUsersFound: "No users found", noUsersMatching: "No users match the current search criteria.", showing: "Showing", of: "of", users: "users", confirmDeleteTitle: "Delete user", confirmDeleteMessage: "Are you sure you want to delete this user?" },
  userForm: { titleCreate: "Create user", titleDetails: "User details", username: "Username", email: "Email", firstName: "First Name", lastName: "Last Name", userEnabled: "User enabled", userEnabledDesc: "Allow this user to authenticate.", emailVerified: "Email verified", emailVerifiedDesc: "Mark the user's email address as verified.", generalInfo: "General information", generalInfoSubtitle: "Configure the user's account identity and status.", enterUsername: "Enter username", enterEmail: "Enter email address", enterFirstName: "Enter first name", enterLastName: "Enter last name", save: "Save", cancel: "Cancel" },
  auth: { signInTitle: "Sign in", username: "Username", password: "Password", forgotPassword: "Forgot password?", signInButton: "Sign in", forgotPasswordTitle: "Forgot password?", forgotPasswordSubtitle: "Enter your username or email address. We will send you instructions to reset your password.", forgotPasswordDesc: "Please enter your email address to receive a password reset link.", emailAddress: "Email Address", sendResetLink: "Send reset link", usernameOrEmail: "Username or email", submit: "Submit", backToLogin: "Back to login", checkEmailTitle: "Check your email", checkEmailDesc: "If an account exists, reset instructions have been sent.", registerTitle: "Create account", registerSubtitle: "Enter your details to register a new account.", confirmPassword: "Confirm password", registerButton: "Register", dontHaveAccount: "Don't have an account?", alreadyHaveAccount: "Already have an account?", passwordsDoNotMatch: "Passwords do not match" },
  dashboard: { title: "Gateway Admin Dashboard", activeRealms: "Active Realms", availabilityRate: "Availability Rate", activeSessions: "Active Sessions", realmActivity: "Realm activity", connections: "Connections", errors: "Errors", day: "Day", week: "Week", month: "Month", providerStatus: "Provider status", active: "Active", error: "Error", disabled: "Disabled", recentEvents: "Recent events", export: "Export CSV", viewAll: "View all", enabled: "Enabled", colRealm: "Realm", colEvent: "Event", colUser: "User", colDate: "Date", colStatus: "Status" },
  parameters: { title: "Realm Settings", subtitle: "AMS realm configuration", save: "Save", tabGeneral: "General", tabLogin: "Login", tabEmail: "Email", tabThemes: "Themes", tabLocalization: "Localization", realmId: "Realm ID", displayName: "Display Name", htmlDisplayName: "HTML Display Name", frontendUrl: "Frontend URL", requireSsl: "Require SSL", userManagedAccess: "User-Managed Access", realmEnabled: "Realm Enabled", userRegistration: "User Registration", forgotPassword: "Forgot Password", rememberMe: "Remember Me", emailAsUsername: "Email as Username", loginWithEmail: "Login with Email", duplicateEmails: "Duplicate Emails Allowed", verifyEmail: "Verify Email", verifyProfile: "Verify Profile", editUsername: "Edit Username", fromEmail: "From Email", fromName: "From Display Name", replyTo: "Reply-To", replyToName: "Reply-To Display Name", envelopeFrom: "Envelope From", smtpHost: "SMTP Host", smtpPort: "SMTP Port", enableSsl: "Enable SSL", enableStartTls: "Enable StartTLS", smtpAuth: "SMTP Authentication", smtpUsername: "SMTP Username", smtpPassword: "SMTP Password", darkMode: "Dark Mode", enableI18n: "Enable Internationalization", supportedLocales: "Supported Locales", defaultLocale: "Default Locale" }
}

const { ref: vueRef, computed: vueComputed } = Vue

const locale = vueRef(localStorage.getItem('ams_locale') || 'fr')
const messages = { fr, en }

const currentMessages = vueComputed(() => messages[locale.value] || messages['fr'])

function t(key) {
  const parts = key.split('.')
  let obj = currentMessages.value
  for (const part of parts) {
    if (obj && typeof obj === 'object' && part in obj) {
      obj = obj[part]
    } else {
      return key
    }
  }
  return typeof obj === 'string' ? obj : key
}

function setLocale(newLocale) {
  if (messages[newLocale]) {
    locale.value = newLocale
    localStorage.setItem('ams_locale', newLocale)
  }
}

export const i18nPlugin = {
  install(app) {
    const i18n = { locale, t, setLocale, messages }
    app.config.globalProperties.$t = t
    app.config.globalProperties.$i18n = { locale, locale: locale }
    app.provide('i18n', i18n)
  }
}

export function useI18n() {
  return { t, locale, setLocale }
}

export default { install: i18nPlugin.install, useI18n, t, locale, setLocale }
