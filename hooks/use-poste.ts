"use client";

import { useEffect, useState } from "react";
import { getPostes } from "@/lib/services/PosteService";
import { Poste } from "@/types";
import { usePagination } from "@/hooks/use-pagination";

export function usePostes(initialSearch = "") {
  const [postes, setPostes] = useState<Poste[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const pagination = usePagination({ initialPage: 1, initialLimit: 10 });

  const fetchPostes = async () => {
    setIsLoading(true);
    try {
      const res = await getPostes({
        page: pagination.page,
        limit: pagination.limit,
        nom: searchTerm || undefined,
      });

      setPostes(
        res.data.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(p.createdAt),
        }))
      );

      pagination.setLastPage(res.meta.lastPage);
    } catch (error) {
      console.error("Erreur postes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostes();
  }, [pagination.page, pagination.limit, searchTerm]);

  return {
    postes,
    isLoading,
    searchTerm,
    setSearchTerm,
    refresh: fetchPostes,
    ...pagination,
  };
}