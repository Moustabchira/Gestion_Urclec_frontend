// app/demandes/[id]/page.tsx
import React from "react";
import DemandeDetailPage from "@/components/demandes/getDemandeById";

interface PageProps {
  params: {
    id: string;
  };
}

export default function DetailDemandePage({ params }: PageProps) {
  return <DemandeDetailPage params={{ id: params.id }} />;
}
