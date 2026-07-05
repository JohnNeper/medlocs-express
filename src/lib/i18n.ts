import { useSyncExternalStore } from "react";

export type Lang = "fr" | "en";

const KEY = "medlocs-lang";
let lang: Lang = "fr";
const listeners = new Set<() => void>();
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  const saved = window.localStorage.getItem(KEY);
  if (saved === "fr" || saved === "en") lang = saved;
  hydrated = true;
}

export const i18n = {
  get(): Lang {
    hydrate();
    return lang;
  },
  set(l: Lang) {
    lang = l;
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, l);
    listeners.forEach((cb) => cb());
  },
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
};

const DICT = {
  // Nav
  nav_home: { fr: "Accueil", en: "Home" },
  nav_reservations: { fr: "Réservations", en: "Bookings" },
  nav_help: { fr: "Aide", en: "Help" },
  nav_profile: { fr: "Profil", en: "Profile" },

  // Home
  search_placeholder: { fr: "Rechercher un médicament...", en: "Search for a medication..." },
  filter_open: { fr: "🟢 Ouvert", en: "🟢 Open" },
  filter_duty: { fr: "⏰ De garde", en: "⏰ On duty" },
  filter_near: { fr: "📍 Les plus proches", en: "📍 Nearest" },
  have_prescription: { fr: "J'ai une ordonnance", en: "I have a prescription" },
  have_prescription_sub: { fr: "Photo ou PDF — on trouve l'officine pour vous", en: "Photo or PDF — we find the pharmacy for you" },
  pharmacies_open: { fr: "Pharmacies ouvertes", en: "Open pharmacies" },
  pharmacies_duty: { fr: "Pharmacies de garde", en: "On-duty pharmacies" },
  pharmacies_near: { fr: "Pharmacies proches", en: "Nearby pharmacies" },
  pharmacies_around: { fr: "Pharmacies à proximité", en: "Pharmacies nearby" },
  found: { fr: "trouvées", en: "found" },
  none_match: { fr: "Aucune pharmacie pour ces filtres.", en: "No pharmacy for these filters." },
  open: { fr: "Ouvert", en: "Open" },
  closed: { fr: "Fermé", en: "Closed" },
  on_duty: { fr: "De garde", en: "On duty" },
  promos: { fr: "Promotions parapharmacie", en: "Parapharmacy deals" },
  no_prescription: { fr: "Sans ordonnance", en: "No prescription" },
  discover: { fr: "Découvrir", en: "Discover" },
  popular_products: { fr: "Produits populaires", en: "Popular products" },
  available_nearby: { fr: "Disponible à proximité", en: "Available nearby" },

  // Filters drawer
  advanced_filters: { fr: "Filtres avancés", en: "Advanced filters" },
  city: { fr: "Ville", en: "City" },
  category: { fr: "Catégorie de médicament", en: "Medication category" },
  all: { fr: "Toutes", en: "All" },
  max_distance: { fr: "Distance maximale", en: "Maximum distance" },
  see: { fr: "Voir", en: "View" },
  pharmacy: { fr: "pharmacie", en: "pharmacy" },
  pharmacies: { fr: "pharmacies", en: "pharmacies" },

  // Results
  results_for: { fr: "Résultats pour", en: "Results for" },
  prescription_badge: { fr: "Ordonnance", en: "Prescription" },
  rx_required: { fr: "Médicament sur ordonnance", en: "Prescription required" },
  rx_upload: { fr: "Téléversez votre ordonnance pour réserver", en: "Upload your prescription to book" },
  attach: { fr: "Joindre", en: "Attach" },
  synchronized: { fr: "officines synchronisées", en: "pharmacies synchronized" },
  sorted_by_dist: { fr: "Triées par distance — données temps réel", en: "Sorted by distance — real-time data" },
  see_price_book: { fr: "Voir le prix & Réserver", en: "View price & Book" },
  infos: { fr: "Infos", en: "Info" },

  // Auth
  back: { fr: "Retour", en: "Back" },
  create_account: { fr: "Créer mon compte", en: "Create my account" },
  log_in: { fr: "Se connecter", en: "Log in" },
  welcome_medlocs: { fr: "Bienvenue sur MedLocs", en: "Welcome to MedLocs" },
  welcome_back: { fr: "Bon retour 👋", en: "Welcome back 👋" },
  verification: { fr: "Vérification", en: "Verification" },
  signup_sub: { fr: "Inscrivez-vous en 30 secondes pour réserver vos médicaments en toute confidentialité.", en: "Sign up in 30 seconds to book your medications confidentially." },
  login_sub: { fr: "Entrez votre numéro pour vous reconnecter à votre compte.", en: "Enter your phone to sign back into your account." },
  otp_sent: { fr: "Entrez le code SMS envoyé au", en: "Enter the SMS code sent to" },
  full_name: { fr: "Nom complet", en: "Full name" },
  your_name: { fr: "Votre nom", en: "Your name" },
  phone_number: { fr: "Numéro de téléphone", en: "Phone number" },
  receive_sms: { fr: "Recevoir le code par SMS", en: "Receive SMS code" },
  encrypted: { fr: "Vos données sont chiffrées de bout en bout", en: "Your data is end-to-end encrypted" },
  confirm: { fr: "Confirmer", en: "Confirm" },
  edit_info: { fr: "Modifier mes informations", en: "Edit my information" },
  no_account_yet: { fr: "Pas encore de compte ? S'inscrire", en: "No account yet? Sign up" },
  already_account: { fr: "Déjà un compte ? Se connecter", en: "Already have an account? Log in" },
  account_recognized: { fr: "Compte reconnu", en: "Account recognized" },

  // Reservation
  confirmation: { fr: "Confirmation", en: "Confirmation" },
  selected_pharmacy: { fr: "Officine sélectionnée", en: "Selected pharmacy" },
  medication: { fr: "Médicament", en: "Medication" },
  order_amount: { fr: "Montant de votre ordonnance", en: "Order amount" },
  confidential_price: { fr: "Tarif confidentiel négocié avec", en: "Confidential price negotiated with" },
  stock_held: { fr: ". Stock réservé pendant 2h.", en: ". Stock held for 2h." },
  prescription_attached: { fr: "Ordonnance jointe", en: "Prescription attached" },
  change: { fr: "Changer", en: "Change" },
  rx_required_short: { fr: "Ordonnance requise", en: "Prescription required" },
  upload_yours: { fr: "Téléversez votre prescription", en: "Upload your prescription" },
  confirm_block: { fr: "Confirmer et Bloquer mon Ordonnance", en: "Confirm and Hold my Order" },
  service_fee_note: { fr: "Frais de service d'ordonnance :", en: "Order service fee:" },
  payable_via: { fr: "payables via", en: "payable via" },
  on_validation: { fr: "lors de la validation.", en: "on validation." },

  // Profile
  profile: { fr: "Profil", en: "Profile" },
  log_in_signup: { fr: "Créer un compte / Se connecter", en: "Sign up / Log in" },
  profile_cta_sub: { fr: "Accédez à vos réservations, ordonnances et au suivi santé.", en: "Access your bookings, prescriptions and health tracking." },
  log_in_short: { fr: "Connectez-vous", en: "Log in" },
  bookings: { fr: "Réservations", en: "Bookings" },
  active_rx: { fr: "Ordonnance active", en: "Active prescription" },
  health_soon: { fr: "Suivi santé (bientôt)", en: "Health tracking (soon)" },
  health_soon_sub: { fr: "Rappels traitements, suivi des maladies chroniques et notifications pour vos proches âgés.", en: "Treatment reminders, chronic disease tracking and notifications for elderly loved ones." },
  my_active_rx: { fr: "Mon ordonnance active", en: "My active prescription" },
  none: { fr: "Aucune", en: "None" },
  notifications: { fr: "Notifications", en: "Notifications" },
  enabled: { fr: "Activées", en: "Enabled" },
  privacy: { fr: "Confidentialité", en: "Privacy" },
  data_encrypted: { fr: "Données chiffrées", en: "Encrypted data" },
  sign_out: { fr: "Se déconnecter", en: "Sign out" },
  language: { fr: "Langue", en: "Language" },

  // PWA
  install_app: { fr: "Installer l'application", en: "Install the app" },
  install_sub: { fr: "Accès rapide depuis votre écran d'accueil", en: "Quick access from your home screen" },
  install_now: { fr: "Installer", en: "Install" },
  later: { fr: "Plus tard", en: "Later" },
  install_ios_hint: { fr: "Sur iPhone : appuyez sur Partager puis « Sur l'écran d'accueil ».", en: "On iPhone: tap Share then 'Add to Home Screen'." },

  // Misc
  continue: { fr: "Continuer", en: "Continue" },

  // Protection page
  cyber_health: { fr: "Cybersécurité sanitaire", en: "Health cybersecurity" },
  citizen_protection: { fr: "Protection citoyenne", en: "Citizen protection" },
  ai_for_citizen: { fr: "IA au service du citoyen", en: "AI at the citizen's service" },
  protection_intro: {
    fr: "Détectez les faux médicaments, vérifiez une ordonnance et évitez l'automédication grâce à l'intelligence artificielle souveraine.",
    en: "Detect fake medications, verify a prescription and avoid self-medication with sovereign artificial intelligence.",
  },
  tab_scanner: { fr: "Scanner", en: "Scanner" },
  tab_prescription: { fr: "Ordonnance", en: "Prescription" },
  tab_sentinel: { fr: "Sentinelle", en: "Sentinel" },
  scan_intro: {
    fr: "Prenez en photo l'emballage, le blister ou la notice d'un médicament pour détecter d'éventuelles contrefaçons.",
    en: "Take a photo of the packaging, blister or leaflet to detect potential counterfeits.",
  },
  photograph_med: { fr: "Photographier le médicament", en: "Photograph the medication" },
  photograph_hint: { fr: "Cadrez l'emballage et les mentions légales", en: "Frame the packaging and legal notices" },
  retake: { fr: "Reprendre", en: "Retake" },
  analyze_ai: { fr: "Analyser avec l'IA", en: "Analyze with AI" },
  analyzing: { fr: "Analyse IA...", en: "AI analysis..." },
  verdict_ai: { fr: "Verdict IA", en: "AI verdict" },
  med_identified: { fr: "Médicament identifié", en: "Medication identified" },
  signals_detected: { fr: "Signaux détectés", en: "Detected signals" },
  rx_intro: {
    fr: "L'IA vérifie l'authenticité et la cohérence de votre ordonnance avant toute réservation.",
    en: "AI verifies the authenticity and coherence of your prescription before any booking.",
  },
  rx_upload_btn: { fr: "Téléverser l'ordonnance", en: "Upload the prescription" },
  rx_upload_hint: { fr: "Photo lisible du document original", en: "Readable photo of the original document" },
  verify_ai: { fr: "Vérifier avec l'IA", en: "Verify with AI" },
  verifying: { fr: "Vérification...", en: "Verifying..." },
  rx_status: { fr: "Statut ordonnance", en: "Prescription status" },
  meds_detected: { fr: "Médicaments détectés", en: "Detected medications" },
  points_to_check: { fr: "Points à vérifier", en: "Points to check" },
  sentinel_greeting: {
    fr: "Bonjour 👋 Je suis Sentinelle, votre garde-fou santé. Décrivez vos symptômes ou posez une question — je vous oriente sans jamais prescrire.\n\n⚠️ Ceci n'est pas un avis médical. Consultez un professionnel de santé.",
    en: "Hello 👋 I am Sentinel, your health safeguard. Describe your symptoms or ask a question — I guide you without ever prescribing.\n\n⚠️ This is not medical advice. Consult a healthcare professional.",
  },
  sentinel_error: {
    fr: "Désolé, je n'ai pas pu répondre. Réessayez ou rendez-vous en pharmacie agréée.\n\n⚠️ Ceci n'est pas un avis médical.",
    en: "Sorry, I couldn't reply. Try again or visit an approved pharmacy.\n\n⚠️ This is not medical advice.",
  },
  sentinel_thinking: { fr: "Sentinelle réfléchit...", en: "Sentinel is thinking..." },
  chat_placeholder: { fr: "Décrire un symptôme, une question...", en: "Describe a symptom, a question..." },
  send: { fr: "Envoyer", en: "Send" },
  emergency_footer: {
    fr: "L'IA ne remplace pas un médecin. Urgence : 117 (police) · 118 (pompiers)",
    en: "AI does not replace a doctor. Emergency: 117 (police) · 118 (fire)",
  },
  protection_footer: {
    fr: "Données hébergées au Cameroun · IA locale · Pharmacies agréées",
    en: "Data hosted in Cameroon · Local AI · Approved pharmacies",
  },
  analysis_error: { fr: "Erreur d'analyse", en: "Analysis error" },
  verdict_authentique: { fr: "authentique", en: "authentic" },
  verdict_suspect: { fr: "suspect", en: "suspicious" },
  verdict_indetermine: { fr: "indéterminé", en: "undetermined" },
  status_coherente: { fr: "cohérente", en: "coherent" },
  status_incoherente: { fr: "incohérente", en: "inconsistent" },
  status_suspecte: { fr: "suspecte", en: "suspicious" },
  status_illisible: { fr: "illisible", en: "unreadable" },
} as const;


export type TKey = keyof typeof DICT;

export function t(key: TKey, l?: Lang): string {
  const cur = l ?? i18n.get();
  const entry = DICT[key];
  return entry ? entry[cur] : key;
}

export function useLang(): Lang {
  return useSyncExternalStore(i18n.subscribe, () => i18n.get(), () => "fr");
}

export function useT(): (key: TKey) => string {
  const l = useLang();
  return (k: TKey) => t(k, l);
}
