import { Permission } from "@/types/index";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApiResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    lastPage: number;
  };
}

/**
 * Récupère les permissions avec pagination et filtres optionnels
 */
export async function getPermissions(params?: { page?: number; limit?: number; nom?: string; slug?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.nom) query.append("nom", params.nom);
  if (params?.slug) query.append("slug", params.slug);

  const res = await fetch(`${API_URL}/permissions?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Erreur lors de la récupération des permissions");

  return res.json() as Promise<ApiResponse<Permission>>;
}

/**
 * Récupère une permission par son ID
 */
export async function getPermissionById(id: number) {
  const res = await fetch(`${API_URL}/permissions/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur lors de la récupération de la permission ${id}`);
  return res.json() as Promise<Permission>;
}

/**
 * Supprime une permission par son ID
 */
export async function deletePermission(id: number) {
  const res = await fetch(`${API_URL}/permissions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erreur lors de la suppression de la permission ${id}`);
  return res.json() as Promise<Permission>;
}


