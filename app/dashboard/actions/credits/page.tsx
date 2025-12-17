// app/credits/page.tsx
import React from "react";
import { CreditsList } from "@/components/actions/getAllCredit";

export default function CreditsPage() {
  return (
    <main className="p-6">
      <CreditsList />
    </main>
  );
}
