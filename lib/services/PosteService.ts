import { Poste } from "@/types";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

// 🔹 Récupérer tous les postes avec pagination et filtres
export async function getPostes(params?: { page?: number; limit?: number; nom?: string }): Promise<ApiResponse<Poste>> {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.append("page", params.page.toString());
  if (params?.limit !== undefined) query.append("limit", params.limit.toString());
  if (params?.nom) query.append("nom", params.nom);

  const url = `${API_URL}/postes${query.toString() ? `?${query.toString()}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error("Erreur lors de la récupération des postes");
  return response.json() as Promise<ApiResponse<Poste>>;
}

// 🔹 Récupérer un poste par ID
export async function getPosteById(id: number): Promise<Poste> {
  const response = await fetch(`${API_URL}/postes/${id}`);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Poste introuvable");
    throw new Error("Erreur lors de la récupération du poste");
  }
  return response.json();
}

// 🔹 Créer un poste
export async function createPoste(data: Omit<Poste, "id" | "createdAt" | "updatedAt" | "archive" | "archivedAt">): Promise<Poste> {
  const response = await fetch(`${API_URL}/postes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la création du poste: ${errorText}`);
  }

  return response.json();
}

// 🔹 Mettre à jour un poste
export async function updatePoste(
  id: number,
  data: Partial<Omit<Poste, "id" | "createdAt" | "updatedAt" | "archive" | "archivedAt">>
): Promise<Poste> {
  const response = await fetch(`${API_URL}/postes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la mise à jour du poste ${id}: ${errorText}`);
  }

  return response.json();
}

// 🔹 Supprimer un poste (soft delete)
export async function deletePoste(id: number): Promise<Poste> {
  const response = await fetch(`${API_URL}/postes/${id}`, { method: "DELETE" });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la suppression du poste ${id}: ${errorText}`);
  }

  return response.json();
}