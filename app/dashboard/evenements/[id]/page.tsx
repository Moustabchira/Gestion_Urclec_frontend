// app/evenements/[id]/page.tsx
import React from "react";
import EvenementDetailPage from "@/components/evenements/getEvenementById";



interface PageProps {
  params: {
    id: string;
  };
}

export default function DetailEvenementPage({ params }: PageProps) {
  return <EvenementDetailPage />;
}
