import { useState } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination(options?: UsePaginationOptions) {
  const [page, setPage] = useState(options?.initialPage ?? 1);
  const [limit, setLimit] = useState(options?.initialLimit ?? 10);
  const [lastPage, setLastPage] = useState(1);

  const nextPage = () => {
    setPage((prev) => (prev < lastPage ? prev + 1 : prev));
  };

  const prevPage = () => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const goToPage = (p: number) => {
    if (p >= 1 && p <= lastPage) {
      setPage(p);
    }
  };

  const resetPage = () => {
    setPage(1);
  };

  return {
    page,
    limit,
    lastPage,
    setPage,
    setLimit,
    setLastPage,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
  };
}
