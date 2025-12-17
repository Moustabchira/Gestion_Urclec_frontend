// app/equipements/page.tsx
import EquipementsPage from "@/components/equipements/getAllEquipements";


export const metadata = {
  title: "Gestion des équipements",
  description: "Page de gestion des équipements de l'inventaire",
};

export default function Page() {
  return (
    <div className="p-6">
      <EquipementsPage />
    </div>
  );
}
