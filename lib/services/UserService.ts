import { User } from "@/types/index";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export interface NewUserPayload {
  nom: string;
  prenom: string;
  username: string;
  email: string;
  password: string;
  posteId: number;
  agenceId: number;
  roles?: number[]; // IDs
  chefId?: number | null;
}

export interface UpdateUserPayload {
  nom?: string;
  prenom?: string;
  username?: string;
  email?: string;
  poste?: string;
  agenceId?: number;
  roles?: number[];
  chefId?: number | null;
}

export interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    totalPages: number;
  };
}

// 🔹 Récupérer tous les utilisateurs
// 🔹 Récupérer tous les utilisateurs avec recherche globale
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  username?: string;
  roleId?: number;
  search?: string; // nouveau filtre global
}) {
  const query = new URLSearchParams();

  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.nom) query.append("nom", params.nom);
  if (params?.prenom) query.append("prenom", params.prenom);
  if (params?.email) query.append("email", params.email);
  if (params?.username) query.append("username", params.username);
  if (params?.roleId) query.append("roleId", params.roleId.toString());
  if (params?.search) query.append("search", params.search); // 🔹 ajout de la recherche globale

  const res = await fetch(`${API_URL}/users?${query.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des utilisateurs");
  }

  return res.json() as Promise<ApiResponse<User>>;
}



// 🔹 Récupérer un utilisateur par ID
export async function getUserById(id: string | number): Promise<User | null> {
  const res = await fetch(`${API_URL}/users/${id}`, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Erreur lors de la récupération de l'utilisateur ${id}`);
  }
  return res.json();
}

export async function createUser(data: NewUserPayload): Promise<User> {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur lors de la création de l'utilisateur: ${errorText}`);
  }

  const result = await res.json();

  // 🔥 IMPORTANT
  if (!result.user?.id) {
    throw new Error("Utilisateur créé mais ID manquant");
  }

  return result.user; // ✅ SEULEMENT L'UTILISATEUR
}


// 🔹 Mettre à jour un utilisateur
export async function updateUser(id: string | number, data: UpdateUserPayload) {
  const { roles, ...userData } = data;

  // Mise à jour des informations de base
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur lors de la mise à jour de l'utilisateur ${id}: ${errorText}`);
  }

  // Gestion des rôles séparément
  if (roles) {
    const user = await getUserById(id);
    const currentRoleIds =
      user?.roles?.map(r => r.roleId).filter((id): id is number => id !== undefined) || [];

    // Supprimer les rôles retirés
    for (const roleId of currentRoleIds) {
      if (!roles.includes(roleId)) await removeRoleFromUser(id, roleId);
    }

    // Ajouter les nouveaux rôles
    for (const roleId of roles) {
      if (!currentRoleIds.includes(roleId)) await assignRoleToUser(id, roleId);
    }
  }

  return getUserById(id);
}

// 🔹 Supprimer un utilisateur
export async function deleteUser(id: string | number) {
  const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur lors de la suppression de l'utilisateur ${id}: ${errorText}`);
  }
  return { message: "Utilisateur supprimé avec succès" };
}

// 🔹 Assigner un rôle à un utilisateur
export async function assignRoleToUser(userId: string | number, roleId: string | number) {
  const res = await fetch(`${API_URL}/users/${userId}/roles/${roleId}`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ message: string }>;
}

// 🔹 Retirer un rôle d'un utilisateur
export async function removeRoleFromUser(userId: string | number, roleId: string | number) {
  const res = await fetch(`${API_URL}/users/${userId}/roles/${roleId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ message: string }>;
}

export async function assignUserToChef(
  userId: string | number,
  chefId: string | number | null
) {
  if (chefId === null || chefId === undefined) {
    throw new Error("Chef ID invalide");
  }

  const res = await fetch(
    `${API_URL}/users/${userId}/chef/${chefId}`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error(await res.text());

  return res.json() as Promise<User>;
}

