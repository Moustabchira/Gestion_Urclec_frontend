import { Demande } from "@/types/index";

const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export interface ApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };
}

export interface DemandeFilters {
  page?: number;
  limit?: number;
  type?: string;
  userId?: number;
  status?: string;
}

// ------------------ Récupération des demandes ------------------
export async function getDemandes(params?: DemandeFilters) {
  const query = new URLSearchParams();

  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());
  if (params?.type) query.append("type", params.type);
  if (params?.userId) query.append("userId", params.userId.toString());
  if (params?.status) query.append("status", params.status);

  const response = await fetch(`${API_URL}/demandes?${query.toString()}`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des demandes");

  const result = await response.json();
  return {
    data: result.data as Demande[],
    meta: {
      total: result.total,
      page: params?.page || 1,
      lastPage: Math.ceil(result.total / (params?.limit || 10)),
    },
  } as ApiResponse<Demande>;
}

// ------------------ Récupération d'une demande par ID ------------------
export async function getDemandeById(id: string | number): Promise<Demande | null> {
  const response = await fetch(`${API_URL}/demandes/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    const errorText = await response.text();
    throw new Error(`Erreur lors de la récupération de la demande ${id}: ${errorText}`);
  }
  return response.json();
}

// ------------------ Création d'une demande ------------------
export async function createDemande(data: Omit<Demande, "id" | "createdAt" | "updatedAt" | "decisions">) {
  const payload = {
    ...data,
    dateDebut: new Date(data.dateDebut),
    dateFin: new Date(data.dateFin),
  };

  const response = await fetch(`${API_URL}/demandes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la création de la demande: ${errorText}`);
  }

  return response.json() as Promise<Demande>;
}

// ------------------ Mise à jour d'une demande ------------------
export async function updateDemande(
  id: string | number,
  data: Partial<Omit<Demande, "id" | "createdAt" | "updatedAt" | "decisions">>
) {
  const payload = {
    ...data,
    ...(data.dateDebut && { dateDebut: new Date(data.dateDebut) }),
    ...(data.dateFin && { dateFin: new Date(data.dateFin) }),
  };

  const response = await fetch(`${API_URL}/demandes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la mise à jour de la demande ${id}: ${errorText}`);
  }

  return response.json() as Promise<Demande>;
}

// ------------------ Suppression d'une demande ------------------
export async function deleteDemande(id: string | number) {
  const response = await fetch(`${API_URL}/demandes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la suppression de la demande ${id}: ${errorText}`);
  }

  if (response.status === 204) {
    return { message: "Demande supprimée avec succès." };
  }

  return response.json();
}

// ------------------ Prendre une décision ------------------
export async function prendreDecision(
  demandeId: string | number,
  userId: number,
  status: "APPROUVE" | "REFUSE"
) {
  const response = await fetch(`${API_URL}/demandes/${demandeId}/decisions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, status }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur lors de la prise de décision: ${errorText}`);
  }

  return response.json() as Promise<Demande>;
}

// utils/pdf.ts
export async function  generatePDF(demandeId: number) {
  const response = await fetch(`${API_URL}/demandes/${demandeId}/pdf`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `demande_${demandeId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};
