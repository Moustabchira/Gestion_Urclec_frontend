"use client";

import { useState } from "react";
import UserDetail from "@/components/users/getUserById";
import UsersList from "@/components/users/getAllUsers";

interface PageProps {
  params: { id: string };
}

export default function UserPage({ params }: PageProps) {
  const { id } = params;
  const [showList, setShowList] = useState(false);

  if (showList) {
    return <UsersList />; // Affiche la liste des utilisateurs
  }

  return (
    <div className="p-6">
      <UserDetail 
        userId={id} 
        onBack={() => setShowList(true)} // Retour à la liste
      />
    </div>
  );
}


 