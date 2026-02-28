import { Agence } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

// ✅ Récupérer toutes les agences avec pagination
export async function getAgences(params?: {
  page?: number;
  limit?: number;
  nom_agence?: string;
  ville?: string;
}): Promise<ApiResponse<Agence>> {

  const query = new URLSearchParams();

  if (params?.page !== undefined)
    query.append("page", params.page.toString());

  if (params?.limit !== undefined)
    query.append("limit", params.limit.toString());

  if (params?.nom_agence)
    query.append("nom_agence", params.nom_agence);

  if (params?.ville)
    query.append("ville", params.ville);

  const url = `${API_URL}/agences${query.toString() ? `?${query.toString()}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des agences");
  }

  const result = await response.json();

  return result;
}

// ✅ Récupérer une agence par ID
export async function getAgenceById(id: number): Promise<Agence> {
  const response = await fetch(`${API_URL}/agences/${id}`);

  if (!response.ok) {
    throw new Error("Agence introuvable");
  }

  return response.json();
}

// ✅ Créer une agence
export async function createAgence(
  data: Omit<Agence, "id" | "code_agence" | "createdAt" | "updatedAt" | "auteur">
): Promise<Agence> {

  const response = await fetch(`${API_URL}/agences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

// ✅ Mettre à jour une agence
export async function updateAgence(
  id: number,
  data: Partial<Omit<Agence, "id" | "code_agence" | "createdAt" | "updatedAt" | "auteur">>
): Promise<Agence> {

  const response = await fetch(`${API_URL}/agences/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

// ✅ Supprimer (soft delete)
export async function deleteAgence(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/agences/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
}