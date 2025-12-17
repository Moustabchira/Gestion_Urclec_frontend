import { Poste } from "@/types/index";
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

// 🔹 Récupérer tous les postes avec pagination et filtres
export async function getPostes(params?: { page?: number; limit?: number; nom?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.nom) query.append("nom", params.nom);

  const response = await fetch(`${API_URL}/postes?${query.toString()}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des postes");
  return response.json() as Promise<ApiResponse<Poste>>;
}

// 🔹 Récupérer un poste par ID
export async function getPosteById(id: string | number): Promise<Poste | null> {
  const response = await fetch(`${API_URL}/postes/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Erreur lors de la récupération du poste ${id}`);
  }
  return response.json();
}

// 🔹 Créer un poste
export async function createPoste(data: Omit<Poste, "id" | "createdAt" | "updatedAt" | "archive" | "archivedAt">) {
  const response = await fetch(`${API_URL}/postes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la création du poste: ${errorText}`);
  }
  return response.json() as Promise<Poste>;
}

// 🔹 Mettre à jour un poste
export async function updatePoste(id: string | number, data: Partial<Omit<Poste, "id" | "createdAt" | "updatedAt" | "archive" | "archivedAt">>) {
  const response = await fetch(`${API_URL}/postes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la mise à jour du poste ${id}: ${errorText}`);
  }
  return response.json() as Promise<Poste>;
}

// 🔹 Supprimer un poste (soft delete)
export async function deletePoste(id: string | number) {
  const response = await fetch(`${API_URL}/postes/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la suppression du poste ${id}: ${errorText}`);
  }
  if (response.status === 204) return { message: "Poste supprimé avec succès." };
  return response.json();
}
