import { Agence } from "@/types/index";
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

// Récupérer toutes les agences avec pagination et filtres
export async function getAgences(params?: { page?: number; limit?: number; nom_agence?: string; ville?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.nom_agence) query.append("nom_agence", params.nom_agence);
  if (params?.ville) query.append("ville", params.ville);

  const response = await fetch(`${API_URL}/agences?${query.toString()}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des agences");
  return response.json() as Promise<ApiResponse<Agence>>;
}

// Récupérer une agence par ID
export async function getAgenceById(id: string | number): Promise<Agence | null> {
  const response = await fetch(`${API_URL}/agences/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Erreur lors de la récupération de l'agence ${id}`);
  }
  return response.json();
}

// Créer une agence (le code_agence est généré côté backend)
export async function createAgence(data: Omit<Agence, "id" | "code_agence" | "createdAt" | "updatedAt" | "auteur">) {
  const response = await fetch(`${API_URL}/agences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la création de l'agence: ${errorText}`);
  }
  return response.json() as Promise<Agence>;
}

// Mettre à jour une agence
export async function updateAgence(id: string | number, data: Partial<Omit<Agence, "id" | "code_agence" | "createdAt" | "updatedAt" | "auteur">>) {
  const response = await fetch(`${API_URL}/agences/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la mise à jour de l'agence ${id}: ${errorText}`);
  }
  return response.json() as Promise<Agence>;
}

// Supprimer une agence (soft delete)
export async function deleteAgence(id: string | number) {
  const response = await fetch(`${API_URL}/agences/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la suppression de l'agence ${id}: ${errorText}`);
  }
  if (response.status === 204) return { message: "Agence supprimée avec succès." };
  return response.json();
}
