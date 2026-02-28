"use client";

import { useEffect, useState } from "react";
import { getAgences } from "@/lib/services/AgenceService";
import { usePagination } from "@/hooks/use-pagination";
import { Agence } from "@/types";

export function useAgences() {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const pagination = usePagination({ initialPage: 1, initialLimit: 10 });

  const fetchAgences = async () => {
    setIsLoading(true);
    try {
      const result = await getAgences({
        page: pagination.page,
        limit: pagination.limit,
      });

      setAgences(result.data);
      pagination.setLastPage(result.meta.lastPage);

    } catch (error) {
      console.error("Erreur agences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgences();
  }, [pagination.page, pagination.limit]);

  return {
    agences,
    isLoading,
    refresh: fetchAgences,
    ...pagination,
  };
}