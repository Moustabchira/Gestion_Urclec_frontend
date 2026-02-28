import { Evenement } from "@/types/index";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface EvenementFilters {
  titre?: string;
  description?: string;
  userId?: number;
  archive?: boolean;
  userRole?: string;
  page?: number;
  limit?: number;
}

// ------------------ Récupération des événements ------------------
export async function getEvenements(filters?: EvenementFilters) {
  const query = new URLSearchParams();

  if (filters?.titre) query.append("titre", filters.titre);
  if (filters?.description) query.append("description", filters.description);
  if (filters?.userId) query.append("userId", filters.userId.toString());
  if (filters?.archive !== undefined) query.append("archive", filters.archive.toString());
  if (filters?.userRole) query.append("userRole", filters.userRole);
  if (filters?.page) query.append("page", filters.page.toString());
  if (filters?.limit) query.append("limit", filters.limit.toString());

  const response = await fetch(`${API_URL}/evenements?${query.toString()}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });

  if (!response.ok) throw new Error("Erreur lors de la récupération des événements");

  // 🔹 On récupère { data, meta } comme le backend
  return response.json() as Promise<{
    data: Evenement[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>;
}

// ------------------ Récupération d'un événement par ID ------------------
export async function getEvenementById(id: string | number): Promise<Evenement | null> {
  const response = await fetch(`${API_URL}/evenements/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    const errorText = await response.text();
    throw new Error(`Erreur lors de la récupération de l'événement ${id}: ${errorText}`);
  }

  return response.json();
}

// ------------------ Création d'un événement ------------------
export async function createEvenement(data: FormData) {
  const response = await fetch(`${API_URL}/evenements`, {
    method: "POST",
    body: data,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la création de l'événement: ${errorText}`);
  }

  return response.json() as Promise<Evenement>;
}

// ------------------ Mise à jour d'un événement ------------------
export async function updateEvenement(id: string | number, data: FormData) {
  const response = await fetch(`${API_URL}/evenements/${id}`, {
    method: "PUT",
    body: data,
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la mise à jour de l'événement ${id}: ${errorText}`);
  }

  return response.json() as Promise<Evenement>;
}

// ------------------ Suppression d'un événement ------------------
export async function deleteEvenement(id: string | number, userRole: string) {
  const response = await fetch(`${API_URL}/evenements/${id}?userRole=${userRole}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la suppression de l'événement ${id}: ${errorText}`);
  }

  return response.json();
}

// ------------------ Changer le statut d'un événement ------------------
export async function changeStatut(
  evenementId: string | number,
  userId: number,
  statut: "EN_ATTENTE" | "PUBLIE",
  userRole: string
) {
  const response = await fetch(`${API_URL}/evenements/${evenementId}/statut`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
    body: JSON.stringify({ userId, statut, userRole }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors du changement de statut: ${errorText}`);
  }

  return response.json() as Promise<Evenement>;
}