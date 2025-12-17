// lib/services/AffectationService.ts

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export interface Affectation {
  id: number;
  equipementId: number;
  equipement?: { nom: string };

  employeId: number;
  employe?: { prenom: string; nom: string; agence?: { nom_agence: string } };

  pointServiceOrigineId?: number;
  pointServiceOrigine?: { nom: string; agence?: { nom_agence: string } };

  pointServiceDestId?: number;
  pointServiceDest?: { nom: string; agence?: { nom_agence: string } };

  quantite: number;
  status?: "BON" | "ABIME" | "PERDU" | "RETIRE";

  dateAffectation: string;
  createdAt?: string;
  dateFin?: string;
}

export default class AffectationService {
  // 🔹 Récupérer les affectations actives
  public async getEnCours(): Promise<Affectation[]> {
    const res = await fetch(`${API_URL}/affectations/enCours`);
    if (!res.ok) throw new Error("Erreur lors de la récupération des affectations en cours");
    return res.json();
  }

  // 🔹 Récupérer tout l’historique
  public async getHistorique(): Promise<Affectation[]> {
    const res = await fetch(`${API_URL}/affectations/historique`);
    if (!res.ok) throw new Error("Erreur lors de la récupération de l'historique");
    return res.json();
  }

  // 🔹 Créer une affectation (corrigé avec Origine + Destination)
  public async affecter(data: {
    equipementId: number;
    employeId: number;
    quantite: number;
    status?: "BON" | "ABIME" | "PERDU";
    pointServiceOrigineId: number;   // 🟢 obligatoire maintenant
    pointServiceDestId: number;      // 🟢 obligatoire maintenant
  }): Promise<Affectation> {

    const res = await fetch(`${API_URL}/affectations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Erreur lors de l'affectation de l'équipement");

    return res.json();
  }

  // 🔹 Changer le statut
  public async changerStatus(id: number, status: "BON" | "ABIME" | "PERDU" | "RETIRE"): Promise<Affectation> {
    const res = await fetch(`${API_URL}/affectations/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour du statut");
    return res.json();
  }

  // 🔹 Retirer une affectation (marque la fin)
  public async retirer(id: number): Promise<Affectation> {
    const res = await fetch(`${API_URL}/affectations/${id}/retrait`, { method: "PUT" });
    if (!res.ok) throw new Error("Erreur lors du retour de l'équipement");
    return res.json();
  }

  // 🔹 Télécharger le PDF complet de l'historique
  public async downloadHistoriquePdf(): Promise<void> {
    const response = await fetch(`${API_URL}/affectations/historique/pdf`);

    if (!response.ok) throw new Error("Impossible de télécharger le PDF");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "historique_affectations.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }
}
