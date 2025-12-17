"use client";

import { useState, useEffect, useCallback } from "react";

interface Meta {
  total: number;
  page: number;
  lastPage: number;
}

interface PaginatedResult<T> {
  data: T[];
  meta: Meta;
}

export function usePaginatedData<T>(
  fetchFunction: (params: { page: number; limit: number }) => Promise<PaginatedResult<T>>,
  initialPage = 1,
  limit = 10
) {
  const [items, setItems] = useState<T[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, lastPage: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const result = await fetchFunction({ page, limit });
        setItems(result.data);
        setMeta(result.meta);
      } catch (error) {
        console.error("Erreur lors du fetch :", error);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchFunction, limit]
  );

  useEffect(() => {
    fetchData(initialPage);
  }, [fetchData, initialPage]);

  const goToPage = (page: number) => {
    if (page < 1 || page > meta.lastPage) return;
    fetchData(page);
  };

  return { items, meta, isLoading, refresh: fetchData, goToPage };
}
