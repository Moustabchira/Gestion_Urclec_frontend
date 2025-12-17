"use client";
import { ActionCredit } from "@/types/index";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ActionCreditPayload {
  creditId: number;
  type: string;
  commentaire?: string;
  latitude?: number;
  longitude?: number;
  archive?: boolean;
  agentId: number;
}

export default class ActionCreditService {
  static async getActionsByCredit(creditId: number): Promise<ActionCredit[]> {
    const res = await fetch(`${API_URL}/credit/${creditId}/actions`);
    if (!res.ok) throw new Error("Erreur récupération actions");
    return res.json();
  }

  static async createAction(data: ActionCreditPayload): Promise<ActionCredit> {
    const res = await fetch(`${API_URL}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur création action");
    return res.json();
  }

  static async updateAction(id: number, data: Partial<ActionCreditPayload>): Promise<ActionCredit> {
    const res = await fetch(`${API_URL}/actions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erreur mise à jour action");
    return res.json();
  }

  static async archiveAction(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/actions/${id}/archive`, { method: "PUT" });
    if (!res.ok) throw new Error("Erreur archivage action");
  }
}
