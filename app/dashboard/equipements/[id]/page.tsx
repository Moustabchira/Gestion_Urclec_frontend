import React from "react";
import EquipementDetailPage from "@/components/equipements/getEquipementById";

interface PageProps {
  params: {
    id: string;
  };
}

export default function DetailEquipementPage({ params }: PageProps) {
  return <EquipementDetailPage />;
}
