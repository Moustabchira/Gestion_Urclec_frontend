"use client";
import { Credit } from "@/types/index";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface CreditPayload {
  beneficiaireId: number;
  montant: number;
  dateDebut: string;
  dateFin: string;
  tauxInteret?: number;
  status?: string;
  archive?: boolean;
}

export default class CreditService {
  static async getCredits(): Promise<Credit[]> {
    const res = await fetch(`${API_URL}/credits`);
    if (!res.ok) throw new Error("Erreur récupération crédits");
    return res.json();
  }

  static async getCreditById(id: number): Promise<Credit> {
    const res = await fetch(`${API_URL}/credits/${id}`);
    if (!res.ok) throw new Error("Crédit introuvable");
    return res.json();
  }

  static async createCredit(data: CreditPayload): Promise<Credit> {
    const res = await fetch(`${API_URL}/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur création crédit");
    return res.json();
  }

  static async updateCredit(id: number, data: Partial<CreditPayload>): Promise<Credit> {
    const res = await fetch(`${API_URL}/credits/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur mise à jour crédit");
    return res.json();
  }

  static async archiveCredit(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/credits/${id}/archive`, { method: "PUT" });
    if (!res.ok) throw new Error("Erreur archivage crédit");
  }
}
