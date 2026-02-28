import { ActionCredit } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ActionCreditPayload {
  creditId: number;
  agentId: number;
  type: string;
  commentaire?: string;
}

export default class ActionCreditService {

  // 🔹 Historique global des actions (paginated)
  static async getAllPaginated(page = 1, limit = 10): Promise<{ data: ActionCredit[]; meta: any }> {
    const res = await fetch(`${API_URL}/actions?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Erreur récupération historique actions");
    return res.json();
  }

  // 🔹 Actions d’un crédit (paginated)
  static async getActionsByCreditPaginated(
    creditId: number,
    page = 1,
    limit = 10
  ): Promise<{ data: ActionCredit[]; meta: any }> {
    const res = await fetch(`${API_URL}/credits/${creditId}/actions?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Erreur récupération actions");
    return res.json();
  }

  // 🔹 CRÉATION ACTION
  static async createAction(data: ActionCreditPayload): Promise<ActionCredit> {
    const res = await fetch(`${API_URL}/credits/${data.creditId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur création action");
    return res.json();
  }

  // 🔹 MISE À JOUR ACTION
  static async updateAction(id: number, data: Partial<ActionCreditPayload>): Promise<ActionCredit> {
    const res = await fetch(`${API_URL}/actions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur mise à jour action");
    return res.json();
  }

  // 🔹 ARCHIVER ACTION (soft-delete)
  static async archiveAction(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/actions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur archivage action");
  }

  // 🔹 SUPPRESSION DÉFINITIVE (hard-delete)
  static async deleteAction(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/actions/${id}/delete`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erreur suppression action");
  }
}