// app/dashboard/evenements/page.tsx
"use client";

import CalendrierEvenements from "@/components/evenements/getAllEvenements";



export default function EvenementsPage() {
  return (
    <div className="p-6">
      <CalendrierEvenements />
    </div>
  );
}
