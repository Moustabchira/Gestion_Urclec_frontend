// hooks/use-points.ts
"use client";

import { useEffect, useState } from "react";
import { getPointsDeService } from "@/lib/services/PointService";
import { PointDeService } from "@/types";

export function usePoints() {
  const [points, setPoints] = useState<PointDeService[]>([]);
  const [isLoading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getPointsDeService();
      setPoints(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { points, isLoading, refresh };
}
