import { Equipement } from "@/types/index";
import { init } from "next/dist/compiled/webpack/webpack";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default class EquipementService {
  // 🔹 Récupérer tous les équipements non archivés
  // 🔹 Récupérer équipements paginés
public async getAll(
  page: number = 1,
  limit: number = 10
): Promise<{
  data: Equipement[];
  total: number;
  page: number;
  totalPages: number;
}> {
  try {
    const res = await fetch(
      `${API_URL}/equipements?page=${page}&limit=${limit}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);

    return await res.json();
  } catch (err: any) {
    console.error("getAllEquipements error:", err);
    throw new Error(err.message || "Erreur récupération équipements");
  }
}


  // 🔹 Récupérer un équipement par ID
  public async getById(id: number): Promise<Equipement | null> {
    try {
       const res = await fetch(`${API_URL}/equipements/${id}`, {
        cache: "no-store",
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return (await res.json()) as Equipement;
    } catch (err: any) {
      console.error("getEquipementById error:", err);
      throw new Error(err.message || "Erreur récupération équipement");
    }
  }


  // 🔹 Créer un équipement
  public async create(data: any): Promise<Equipement> {
    try {
      const options: RequestInit =
        data instanceof FormData
          ? { method: "POST", body: data }
          : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };

      const res = await fetch(`${API_URL}/equipements`, options);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.error("createEquipement error:", err);
      throw new Error(err.message || "Erreur création équipement");
    }
  }

  // 🔹 Mettre à jour un équipement
  public async update(id: number, data: any): Promise<Equipement> {
    try {
      const options: RequestInit =
        data instanceof FormData
          ? { method: "PUT", body: data }
          : { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };

      const res = await fetch(`${API_URL}/equipements/${id}`, options);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.error("updateEquipement error:", err);
      throw new Error(err.message || "Erreur mise à jour équipement");
    }
  }

  // 🔹 Archiver un équipement
  public async archive(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/equipements/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${res.status}`);
      }
    } catch (err: any) {
      console.error("archiveEquipement error:", err);
      throw new Error(err.message || "Erreur archivage équipement");
    }
  }

  // 🔹 Déclarer le statut d’un équipement
  public async updateEtat(
    id: number,
    etat: "FONCTIONNEL" | "HORS_SERVICE" | "EN_PANNE" | "EN_TRANSIT" | "EN_REPARATION"
  ): Promise<Equipement> {
    try {
      const res = await fetch(`${API_URL}/equipements/${id}/declarerEtat`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ etat }),
      });
      console.log("Response from updateEtat:", res);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.error("updateStatus error:", err);
      throw new Error(err.message || "Erreur mise à jour statut");
    }
  }

  // 🔹 Affecter un équipement
  public async affecter(data: {
  equipementId: number;
  initiateurId: number;
  employeId: number;
  quantite: number;
  pointServiceDestId?: number;
}) {
  console.log("=== Envoi affectation ===", data); // 🔹 debug

  const res = await fetch(`${API_URL}/equipements/affecter`, { // <-- sans 's'
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Erreur fetch affectation:", err); // 🔹 debug
    throw new Error(err);
  }

  const result = await res.json();
  console.log("Réponse serveur affectation:", result); // 🔹 debug
  return result;
}

  // 🔹 Transférer un équipement
  public async transferer(data: {
    equipementId: number;
    quantite: number;
    agenceSourceId?: number;
    agenceDestinationId?: number;
    pointServiceSourceId?: number;
    pointServiceDestId?: number;
    responsableDestinationId?: number;
    initiateurId: number;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_URL}/equipements/transferer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.error("transfererEquipement error:", err);
      throw new Error(err.message || "Erreur transfert équipement");
    }
  }


  // 🔹 Envoyer un équipement en réparation
public async envoyerEnReparation(data: {
  equipementId: number;
  initiateurId: number;
  reparateurId: number;
  agenceSourceId: number;
  pointServiceSourceId: number;
  commentaire: string;
}): Promise<any> {
  try {
    const res = await fetch(`${API_URL}/equipements/envoyerReparation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || `Erreur HTTP: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("envoyerEnReparation error:", err);
    throw new Error(err.message || "Erreur envoi en réparation");
  }
}

// 🔹 Retour d’un équipement de réparation
public async retourDeReparation(data: {
  mouvementId: number;
  initiateurId: number;
  etatFinal: "FONCTIONNEL" | "EN_PANNE";
}): Promise<any> {
  try {
    const res = await fetch(`${API_URL}/equipements/retourReparation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || `Erreur HTTP: ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.error("retourDeReparation error:", err);
    throw new Error(err.message || "Erreur retour de réparation");
  }
}


// EquipementService.ts
public async confirmerReception(data: { mouvementId: number; confirmeParId: number }) {
  console.log("EquipementService.confirmerReception appelé avec :", data);

  try {
    const res = await fetch(`${API_URL}/equipements/confirmerReception`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("Réponse du serveur :", res);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("Erreur confirmation:", body);
      throw new Error(body?.message || `Erreur HTTP: ${res.status}`);
    }

    const result = await res.json();
    console.log("Confirmation réussie, résultat :", result);
    return result;
  } catch (err: any) {
    console.error("Erreur lors de confirmerReception :", err);
    throw new Error(err.message || "Erreur confirmation réception");
  }
}



  // 🔹 Récupérer les mouvements d’un équipement
  public async getMouvements(equipementId: number): Promise<any[]> {
    try {
      const res = await fetch(
          `${API_URL}/equipements/${equipementId}/mouvements`,
          { cache: "no-store" }
      );      
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error("getMouvementsEquipement error:", err);
      throw new Error(err.message || "Erreur récupération mouvements");
    }
  }
}

export const equipementService = new EquipementService();

