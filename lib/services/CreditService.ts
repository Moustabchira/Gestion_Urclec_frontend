import { Credit } from "@/types/index";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface CreditFilters {
  beneficiaireId?: number;
  status?: string;
  archive?: boolean;
  page?: number;
  limit?: number;
}

export default class CreditService {
  // ------------------ Tous les crédits (paginated + filters) ------------------
  static async getCredits(filters?: CreditFilters) {
    const query = new URLSearchParams();

    if (filters?.beneficiaireId) query.append("beneficiaireId", filters.beneficiaireId.toString());
    if (filters?.status) query.append("status", filters.status);
    if (filters?.archive !== undefined) query.append("archive", filters.archive.toString());
    if (filters?.page) query.append("page", filters.page.toString());
    if (filters?.limit) query.append("limit", filters.limit.toString());

    const res = await fetch(`${API_URL}/credits?${query.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });

    if (!res.ok) throw new Error("Erreur récupération crédits");

    return res.json() as Promise<{
      data: Credit[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>;
  }

  // ------------------ Crédit par ID ------------------
  static async getCreditById(id: number) {
    const res = await fetch(`${API_URL}/credits/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      const errorText = await res.text();
      throw new Error(`Erreur récupération crédit ${id}: ${errorText}`);
    }

    return res.json() as Promise<Credit>;
  }

  // ------------------ Création d'un crédit ------------------
  static async createCredit(data: Partial<Credit>) {
    const res = await fetch(`${API_URL}/credits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erreur création crédit: ${errorText}`);
    }

    return res.json() as Promise<Credit>;
  }

  // ------------------ Mise à jour d'un crédit ------------------
  static async updateCredit(id: number, data: Partial<Credit>) {
    const res = await fetch(`${API_URL}/credits/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erreur mise à jour crédit ${id}: ${errorText}`);
    }

    return res.json() as Promise<Credit>;
  }

  // ------------------ Archiver un crédit ------------------
  static async archiveCredit(id: number) {
    const res = await fetch(`${API_URL}/credits/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Erreur archivage crédit ${id}: ${errorText}`);
    }

    return res.json();
  }

  // ------------------ Crédits impayés (paginated) ------------------
  static async getCreditsImpayes(page?: number, limit?: number) {
    const query = new URLSearchParams();
    if (page) query.append("page", page.toString());
    if (limit) query.append("limit", limit.toString());

    const res = await fetch(`${API_URL}/credits/impayes?${query.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });

    if (!res.ok) throw new Error("Erreur récupération crédits impayés");

    return res.json() as Promise<{
      data: Credit[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>;
  }

  // ------------------ Crédits impayés par agent (paginated) ------------------
  static async getCreditsImpayesByAgent(agentId: number, page?: number, limit?: number) {
    const query = new URLSearchParams();
    if (page) query.append("page", page.toString());
    if (limit) query.append("limit", limit.toString());

    const res = await fetch(`${API_URL}/credits/impayes/agent/${agentId}?${query.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });

    if (!res.ok) throw new Error("Erreur récupération crédits impayés par agent");

    return res.json() as Promise<{
      data: Credit[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>;
  }
}