// lib/services/PointService.ts
import { PointDeService } from "@/types";
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

// 🔹 Récupérer tous les points de service
export async function getPointsDeService(params?: { nom?: string; agenceId?: number }) {
  const query = new URLSearchParams();
  if (params?.nom) query.append("nom", params.nom);
  if (params?.agenceId) query.append("agenceId", params.agenceId.toString());

  const response = await fetch(`${API_URL}/points-de-service?${query.toString()}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des points de service");
  return response.json() as Promise<PointDeService[]>;
}

// 🔹 Récupérer un point par ID
export async function getPointServiceById(id: string | number): Promise<PointDeService | null> {
  const response = await fetch(`${API_URL}/points-de-service/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Erreur lors de la récupération du point ${id}`);
  }
  return response.json();
}

// 🔹 Créer un point
export async function createPointService(data: { nom: string; agenceId: number }) {
  const response = await fetch(`${API_URL}/points-de-service`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// 🔹 Mettre à jour un point
export async function updatePointService(
  id: string | number,
  data: Partial<{ nom: string; agenceId: number }>
) {
  const response = await fetch(`${API_URL}/points-de-service/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// 🔹 Supprimer un point
export async function deletePointService(id: string | number) {
  const response = await fetch(`${API_URL}/points-de-service/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
