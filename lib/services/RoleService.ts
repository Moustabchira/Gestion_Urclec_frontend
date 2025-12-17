// services/roleService.ts
import { Role } from "@/types/index";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ApiResponse<T> {
  data: T[];
  meta?: {
    total: number;
    page: number;
    lastPage: number;
  };
}

// Fonction utilitaire pour transformer rolePermissions en permissions
function mapRolePermissions(role: any): Role {
  return {
    ...role,
    permissions: role.rolePermissions?.map((rp: any) => rp.permission) || [],
  };
}

export async function getRoles(params?: { page?: number; limit?: number; nom?: string }) {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.nom) query.append("nom", params.nom);

  const res = await fetch(`${API_URL}/roles?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Erreur lors de la récupération des rôles");

  const json = (await res.json()) as ApiResponse<any>;

  return {
    ...json,
    data: json.data.map(mapRolePermissions),
  } as ApiResponse<Role>;
}

export async function getRoleById(id: number) {
  const res = await fetch(`${API_URL}/roles/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur lors de la récupération du rôle ${id}`);
  const role = await res.json();
  return mapRolePermissions(role);
}

export async function createRole(data: { nom: string; permissionIds?: number[] }) {
  const res = await fetch(`${API_URL}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur lors de la création du rôle");
  const role = await res.json();
  return mapRolePermissions(role);
}

export async function updateRole(id: number, data: { nom?: string; permissionIds?: number[] }) {
  const res = await fetch(`${API_URL}/roles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Erreur lors de la mise à jour du rôle ${id}`);
  const role = await res.json();
  return mapRolePermissions(role);
}

export async function deleteRole(id: number) {
  const res = await fetch(`${API_URL}/roles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erreur lors de la suppression du rôle ${id}`);
  return res.json() as Promise<{ message: string }>;
}
