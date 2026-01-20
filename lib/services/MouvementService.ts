import { MouvementEquipement } from "@/types/index";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";


export default class MouvementService {
  // 🔹 Créer un mouvement
  public async create(data: any): Promise<MouvementEquipement> {
    try {
      const res = await fetch(`${API_URL}/mouvements`, {
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
      console.error("createMouvement error:", err);
      throw new Error(err.message || "Erreur création mouvement");
    }
  }

  // 🔹 Mettre à jour un mouvement
  public async update(id: number, data: any): Promise<MouvementEquipement> {
    try {
      const res = await fetch(`${API_URL}/mouvements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      console.error("updateMouvement error:", err);
      throw new Error(err.message || "Erreur mise à jour mouvement");
    }
  }

  public async confirmer(id: number, confirmeParId: number): Promise<MouvementEquipement> {
  console.log("CONFIRMER FETCH:", { id, confirmeParId });

  try {
    const res = await fetch(`${API_URL}/mouvements/${id}/confirmer`, {
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmeParId }),
    });

    console.log("CONFIRMER RESPONSE STATUS:", res.status);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("CONFIRMER RESPONSE ERROR BODY:", body);
      throw new Error(body?.error || `Erreur HTTP: ${res.status}`);
    }

    const data = await res.json();
    console.log("CONFIRMER RESPONSE DATA:", data);
    return data;
  } catch (err: any) {
    console.error("confirmerMouvement error:", err);
    throw new Error(err.message || "Erreur confirmation mouvement");
  }
}


  // 🔹 Rejeter un mouvement
  public async rejeter(id: number, confirmeParId: number): Promise<MouvementEquipement> {
    try {
      const res = await fetch(`${API_URL}/mouvements/${id}/rejeter`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmeParId }),
      });
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error("rejeterMouvement error:", err);
      throw new Error(err.message || "Erreur rejet mouvement");
    }
  }

  // 🔹 Récupérer un mouvement par ID
  public async getById(id: number): Promise<MouvementEquipement | null> {
    try {
      const res = await fetch(`${API_URL}/mouvements/${id}`);
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error("getMouvementById error:", err);
      throw new Error(err.message || "Erreur récupération mouvement");
    }
  }

  // 🔹 Récupérer tous les mouvements (optionnel filtre)
  public async getAll(filter?: any): Promise<MouvementEquipement[]> {
    try {
      const query = filter ? `?${new URLSearchParams(filter).toString()}` : "";
      const res = await fetch(`${API_URL}/mouvements${query}`);
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error("getAllMouvements error:", err);
      throw new Error(err.message || "Erreur récupération mouvements");
    }
  }
}
