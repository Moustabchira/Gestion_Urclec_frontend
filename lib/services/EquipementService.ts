// lib/services/EquipementService.ts
import { Equipement } from "@/types/index";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default class EquipementService {
  // 🔹 Récupérer tous les équipements (non archivés)
  public async getAll(): Promise<Equipement[]> {
    try {
      const response = await fetch(`${API_URL}/equipements`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      return (await response.json()) as Equipement[];
    } catch (error: any) {
      console.error("Erreur getAllEquipements:", error);
      throw new Error(error.message || "Erreur lors de la récupération des équipements");
    }
  }

  // 🔹 Récupérer un équipement par ID
  public async getById(id: number): Promise<Equipement | null> {
    try {
      const response = await fetch(`${API_URL}/equipements/${id}`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      return (await response.json()) as Equipement;
    } catch (error: any) {
      console.error("Erreur getEquipementById:", error);
      throw new Error(error.message || "Erreur lors de la récupération de l'équipement");
    }
  }

  // 🔹 Créer un équipement
  public async create(data: any): Promise<Equipement> {
    try {
      const options: RequestInit =
        data instanceof FormData
          ? { method: "POST", body: data }
          : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };

      const response = await fetch(`${API_URL}/equipements`, options);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error("Erreur createEquipement:", error);
      throw new Error(error.message || "Erreur lors de la création de l'équipement");
    }
  }

  // 🔹 Mettre à jour un équipement
  public async update(id: number, data: any): Promise<Equipement> {
    try {
      const options: RequestInit =
        data instanceof FormData
          ? { method: "PUT", body: data }
          : { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };

      const response = await fetch(`${API_URL}/equipements/${id}`, options);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error("Erreur updateEquipement:", error);
      throw new Error(error.message || "Erreur lors de la mise à jour de l'équipement");
    }
  }

  // 🔹 Supprimer / archiver un équipement
  public async archive(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/equipements/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Erreur deleteEquipement:", error);
      throw new Error(error.message || "Erreur lors de la suppression/archivage de l'équipement");
    }
  }

  // 🔹 Déclarer le statut d’un équipement
  public async updateStatus(id: number, status: "ACTIF" | "HORS_SERVICE"): Promise<Equipement> {
    try {
      const response = await fetch(`${API_URL}/equipements/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || `Erreur HTTP: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error("Erreur updateStatus:", error);
      throw new Error(error.message || "Erreur lors de la mise à jour du statut");
    }
  }

}
