"use client";

import { useEffect, useState } from "react";
import { getPointsDeService } from "@/lib/services/PointService";
import { PointDeService } from "@/types";
import { usePagination } from "@/hooks/use-pagination";

export function usePoints() {
  const [points, setPoints] = useState<PointDeService[]>([]);
  const [isLoading, setLoading] = useState(true);

  const pagination = usePagination({ initialPage: 1, initialLimit: 10 });

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await getPointsDeService({
        page: pagination.page,
        limit: pagination.limit,
      });

      setPoints(result.data);
      pagination.setLastPage(result.lastPage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [pagination.page, pagination.limit]);

  return {
    points,
    isLoading,
    refresh,
    ...pagination, 
  };
}