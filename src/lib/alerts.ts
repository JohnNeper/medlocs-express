export type Alert = {
  id: string;
  severity: "info" | "warning" | "danger";
  title: string;
  body: string;
  tag: string;
};

export const ALERTS: Alert[] = [
  {
    id: "a1",
    severity: "danger",
    title: "Faux Amoxicilline en circulation",
    body: "Des blisters contrefaits sans hologramme sont signalés à Douala et Bafoussam. Vérifiez le lot et refusez les emballages abîmés.",
    tag: "Contrefaçon",
  },
  {
    id: "a2",
    severity: "warning",
    title: "Arnaques ordonnances WhatsApp",
    body: "Ne payez jamais un « médecin » qui envoie une ordonnance par WhatsApp sans consultation. Faites vérifier par MedLocs.",
    tag: "Cybersécurité",
  },
  {
    id: "a3",
    severity: "info",
    title: "IA & santé : restez prudent",
    body: "Les conseils générés par ChatGPT ou TikTok ne remplacent JAMAIS un médecin. Utilisez notre Sentinelle pour être orienté sûrement.",
    tag: "Éducation",
  },
];
