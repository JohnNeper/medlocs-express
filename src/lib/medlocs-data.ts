export type Pharmacy = {
  id: string;
  name: string;
  distance: string;
  distanceM: number;
  open: boolean;
  onDuty?: boolean;
  address: string;
  price: number;
};

export const PHARMACIES: Pharmacy[] = [
  { id: "mifi", name: "Pharmacie de la Mifi", distance: "À 400m", distanceM: 400, open: true, onDuty: true, address: "Av. de la République, Bafoussam", price: 2500 },
  { id: "binam", name: "Pharmacie Binam", distance: "À 750m", distanceM: 750, open: true, address: "Carrefour Total, Bafoussam", price: 2650 },
  { id: "centrale", name: "Pharmacie Centrale", distance: "À 1.2km", distanceM: 1200, open: false, address: "Marché A, Bafoussam", price: 2400 },
  { id: "moderne", name: "Pharmacie Moderne", distance: "À 1.8km", distanceM: 1800, open: true, onDuty: true, address: "Quartier Tamdja, Bafoussam", price: 2700 },
  { id: "kamkop", name: "Pharmacie Kamkop", distance: "À 2.3km", distanceM: 2300, open: true, address: "Route de Bamenda", price: 2550 },
];

export const POPULAR = [
  { id: "para", name: "Paracétamol 500mg", category: "Antidouleur", emoji: "💊" },
  { id: "ibu", name: "Ibuprofène 400mg", category: "Anti-inflammatoire", emoji: "🧪" },
  { id: "vitc", name: "Vitamine C 1000", category: "Vitamines", emoji: "🍊" },
  { id: "amox", name: "Amoxicilline", category: "Antibiotique", emoji: "💉" },
];

export const PROMOS = [
  { id: 1, title: "Gamme Bébé & Cosmétiques", subtitle: "Disponible à la Pharmacie de la Mifi", tag: "Parapharmacie" },
  { id: 2, title: "Soins du visage Bioderma", subtitle: "Nouvelle collection — Pharmacie Binam", tag: "Cosmétique" },
  { id: 3, title: "Compléments alimentaires", subtitle: "Sélection vitalité — Pharmacie Moderne", tag: "Bien-être" },
];
