"use client";

import { useState, useEffect, useCallback } from "react";
import { getAgences } from "@/lib/services/AgenceService";

interface Agence {
  id: number;
  nom_agence: string;
  code_agence: string;
  ville: string;
  createdAt: string;
  updatedAt?: string;
  archive?: boolean;
}

interface Meta {
  total: number;
  page: number;
  lastPage: number;
}

export function useAgences(initialPage = 1, limit = 10) {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, lastPage: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgences = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {

      const result = await getAgences({ page, limit });
      const formatted = result.data.map(a => ({
        ...a,
        createdAt: new Date(a.createdAt).toISOString().split("T")[0],
        updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString().split("T")[0] : undefined,
      }));
      setAgences(formatted);
      setMeta({ total: result.meta.total, page: result.meta.page, lastPage: result.meta.lastPage });
    } catch (error) {
      console.error("Erreur lors de la récupération des agences:", error);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchAgences(initialPage);
  }, [fetchAgences, initialPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > meta.lastPage) return;
    fetchAgences(page);
  };

  return { agences, meta, isLoading, refresh: fetchAgences, goToPage };
}
