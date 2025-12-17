// app/actions/page.tsx
"use client";

import { useEffect, useState } from "react";
import CreditService from "@/lib/services/CreditService";
import { Credit } from "@/types/index";
import { CreditActionsList } from "@/components/actions/getAllActions";
import { toast } from "sonner";

export default function ActionsPage() {
  const [firstCreditId, setFirstCreditId] = useState<number | null>(null);

  useEffect(() => {
    const fetchFirstCredit = async () => {
      try {
        const credits: Credit[] = await CreditService.getCredits();
        if (credits.length > 0) {
          setFirstCreditId(credits[0].id);
        } else {
          toast.error("Aucun crédit trouvé");
        }
      } catch (err: any) {
        toast.error(err.message || "Erreur récupération crédits");
      }
    };

    fetchFirstCredit();
  }, []);

  if (!firstCreditId) return <p>Chargement des crédits...</p>;

  return (
    <div className="p-6">
      <CreditActionsList creditId={firstCreditId} />
    </div>
  );
}
