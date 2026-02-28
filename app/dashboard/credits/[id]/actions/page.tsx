"use client";

import { useParams } from "next/navigation";
import { CreditActionsList } from "@/components/actions/getActionByCredit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreditActionsPage() {
  const params = useParams();

  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const creditId = Number(idParam);

  console.log("params:", params);
  console.log("creditId:", creditId);


  if (!creditId || isNaN(creditId)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crédit invalide</CardTitle>
        </CardHeader>
        <CardContent>
          Impossible de récupérer les actions pour ce crédit.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Détails du Crédit #{creditId}</h1>

      {/* 🔹 Liste des actions */}
      <CreditActionsList creditId={creditId} />
    </div>
  );
}
