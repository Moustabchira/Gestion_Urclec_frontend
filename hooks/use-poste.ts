"use client";

import { useState, useEffect, useCallback } from "react";
import { getPostes } from "@/lib/services/PosteService";
import { Poste } from "@/types";

export function usePostes() {
  const [postes, setPostes] = useState<Poste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPostes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPostes();
      setPostes(res.data);
    } catch (err: any) {
      console.error("Erreur lors du chargement des postes:", err);
      setError("Impossible de charger les postes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPostes();
  }, [fetchPostes]);

  return { postes, isLoading, error, refresh: fetchPostes };
}
