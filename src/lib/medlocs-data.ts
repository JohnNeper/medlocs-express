export type Pharmacy = {
  id: string;
  name: string;
  distance: string;
  distanceM: number;
  open: boolean;
  onDuty?: boolean;
  address: string;
  price: number;
  phone: string;
  hours: string;
  closesAt: string;
  landmark: string;
};

export const PHARMACIES: Pharmacy[] = [
  { id: "mifi", name: "Pharmacie de la Mifi", distance: "À 400m", distanceM: 400, open: true, onDuty: true, address: "Av. de la République, Bafoussam", price: 2500, phone: "+237 233 44 12 34", hours: "08:00 - 22:00", closesAt: "22:00", landmark: "À 50m du Carrefour BIAO" },
  { id: "binam", name: "Pharmacie Binam", distance: "À 750m", distanceM: 750, open: true, address: "Carrefour Total, Bafoussam", price: 2650, phone: "+237 233 44 18 02", hours: "08:00 - 20:00", closesAt: "20:00", landmark: "En face de la station Total" },
  { id: "centrale", name: "Pharmacie Centrale", distance: "À 1.2km", distanceM: 1200, open: false, address: "Marché A, Bafoussam", price: 2400, phone: "+237 233 44 25 17", hours: "08:00 - 19:00", closesAt: "19:00", landmark: "Entrée principale du Marché A" },
  { id: "moderne", name: "Pharmacie Moderne", distance: "À 1.8km", distanceM: 1800, open: true, onDuty: true, address: "Quartier Tamdja, Bafoussam", price: 2700, phone: "+237 233 44 31 88", hours: "24h/24 (de garde)", closesAt: "—", landmark: "À 100m du Lycée Classique" },
  { id: "kamkop", name: "Pharmacie Kamkop", distance: "À 2.3km", distanceM: 2300, open: true, address: "Route de Bamenda", price: 2550, phone: "+237 233 44 09 56", hours: "07:30 - 21:00", closesAt: "21:00", landmark: "À 200m du rond-point Kamkop" },
];

export type Medication = {
  id: string;
  name: string;
  category: string;
  emoji: string;
  prescription: boolean;
};

export const POPULAR: Medication[] = [
  { id: "para", name: "Paracétamol 500mg", category: "Antidouleur", emoji: "💊", prescription: false },
  { id: "ibu", name: "Ibuprofène 400mg", category: "Anti-inflammatoire", emoji: "🧪", prescription: false },
  { id: "vitc", name: "Vitamine C 1000", category: "Vitamines", emoji: "🍊", prescription: false },
  { id: "amox", name: "Amoxicilline 1g", category: "Antibiotique", emoji: "💉", prescription: true },
  { id: "augm", name: "Augmentin 1g", category: "Antibiotique", emoji: "🧫", prescription: true },
  { id: "vent", name: "Ventoline 100µg", category: "Respiratoire", emoji: "🫁", prescription: true },
];

export function findMedication(query: string): Medication {
  const q = query.toLowerCase();
  const hit = POPULAR.find((m) => m.name.toLowerCase().includes(q));
  if (hit) return hit;
  return { id: "custom", name: query, category: "Médicament", emoji: "💊", prescription: false };
}

export function getPharmacy(id: string): Pharmacy | undefined {
  return PHARMACIES.find((p) => p.id === id);
}

export const PROMOS = [
  { id: 1, title: "Gamme Bébé & Cosmétiques", subtitle: "Disponible à la Pharmacie de la Mifi", tag: "Parapharmacie" },
  { id: 2, title: "Soins du visage Bioderma", subtitle: "Nouvelle collection — Pharmacie Binam", tag: "Cosmétique" },
  { id: 3, title: "Compléments alimentaires", subtitle: "Sélection vitalité — Pharmacie Moderne", tag: "Bien-être" },
];
