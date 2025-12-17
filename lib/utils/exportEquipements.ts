// exportEquipements.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface Equipement {
  id: number;
  nom: string;
  modele?: string;
  categorie?: string;
  quantiteTotale: number;
  quantiteDisponible: number;
  status: "ACTIF" | "INACTIF";
  proprietaire?: { prenom: string; nom: string };
}

// ---------------- PDF ----------------
export const exportPDF = (equipements: Equipement[]) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Liste des équipements", 14, 22);

  const tableData = equipements.map(eq => [
    eq.nom,
    eq.modele || "-",
    eq.categorie || "-",
    eq.status,
    eq.quantiteTotale,
    eq.quantiteDisponible,
    eq.proprietaire ? `${eq.proprietaire.prenom} ${eq.proprietaire.nom}` : "-",
  ]);

  autoTable(doc, {
    head: [["Nom", "Modèle", "Catégorie", "Status", "Qté Totale", "Qté Dispo", "Employé"]],
    body: tableData,
    startY: 30,
    theme: "grid",
  });

  doc.save("equipements.pdf");
};

// ---------------- CSV ----------------
export const exportCSV = (equipements: Equipement[]) => {
  let csv = "Nom;Modèle;Catégorie;Status;Qté Totale;Qté Dispo;Employé\n";
  csv += equipements
    .map(eq =>
      [
        eq.nom,
        eq.modele || "-",
        eq.categorie || "-",
        eq.status,
        eq.quantiteTotale,
        eq.quantiteDisponible,
        eq.proprietaire ? `${eq.proprietaire.prenom} ${eq.proprietaire.nom}` : "-",
      ].join(";")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "equipements.csv";
  a.click();
};

// ---------------- Excel ----------------
export const exportExcel = (equipements: Equipement[]) => {
  const data = equipements.map(eq => ({
    Nom: eq.nom,
    Modèle: eq.modele || "-",
    Catégorie: eq.categorie || "-",
    Status: eq.status,
    "Qté Totale": eq.quantiteTotale,
    "Qté Dispo": eq.quantiteDisponible,
    Employé: eq.proprietaire ? `${eq.proprietaire.prenom} ${eq.proprietaire.nom}` : "-",
  }));

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Equipements");
  XLSX.writeFile(workbook, "equipements.xlsx");
};
