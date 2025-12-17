"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EquipementService from "@/lib/services/EquipementService";
import { Equipement } from "@/types/index";

const getStatusColor = (status?: string) => {
  switch (status) {
    case "ACTIF": return "bg-green-100 text-green-800 border-green-200";
    case "INACTIF": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function EquipementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [equipement, setEquipement] = useState<Equipement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoverIndex, setHoverIndex] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    const fetchEquipement = async () => {
      try {
        setLoading(true);
        const data = await EquipementService.prototype.getById(Number(params.id));
        setEquipement(data);
        setTimeout(() => setFadeIn(true), 100);
      } catch (err: any) {
        setError(err.message || "Impossible de récupérer l'équipement");
      } finally {
        setLoading(false);
      }
    };
    fetchEquipement();
  }, [params?.id]);

  const handleMouseEnter = () => {
    if (!equipement?.images || equipement.images.length <= 1) return;
    const id = window.setInterval(() => {
      setHoverIndex((prev) => (equipement.images ? (prev + 1) % equipement.images.length : 0));
    }, 1500);
    setIntervalId(id);
  };

  const handleMouseLeave = () => {
    if (intervalId !== null) clearInterval(intervalId);
    setIntervalId(null);
    setHoverIndex(0);
  };

  if (loading) return <p className="text-center py-10 text-lg text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center py-10 text-lg text-red-600">{error}</p>;
  if (!equipement) return <p className="text-center py-10 text-lg text-gray-500">Équipement introuvable</p>;

  return (
    <div className="px-4 py-8 space-y-6 max-w-5xl mx-auto">
      {/* Bouton retour */}
      <div className="flex justify-center mb-6">
        <Button
          variant="outline"
          className="transition-transform hover:scale-105 hover:bg-gray-100"
          onClick={() => router.push("/dashboard/equipements")}
        >
          ← Retour à la liste
        </Button>
      </div>

      {/* Carte principale */}
      <Card className={`shadow-lg border border-gray-200 transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <CardHeader className="pb-4 text-center space-y-2">
          <h2 className="text-lg md:text-xl font-semibold text-gray-600">Détail de l'équipement</h2>
          <CardTitle className="text-2xl md:text-3xl">{equipement.nom}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Statut */}
          <div className={`flex justify-center items-center gap-2 transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
            <strong>Status :</strong>
            <Badge className={getStatusColor(equipement.status)}>{equipement.status}</Badge>
          </div>

          {/* Quantités */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-700">
            <div className="bg-gray-50 p-4 rounded shadow-sm text-center">
              <h3 className="font-semibold mb-1 text-gray-700">Quantité totale</h3>
              <p>{equipement.quantiteTotale}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded shadow-sm text-center">
              <h3 className="font-semibold mb-1 text-gray-700">Quantité disponible</h3>
              <p>{equipement.quantiteDisponible}</p>
            </div>
          </div>

          {/* Modèle et catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-700">
            <div className="bg-gray-50 p-4 rounded shadow-sm text-center">
              <h3 className="font-semibold mb-1 text-gray-700">Modèle</h3>
              <p>{equipement.modele || "-"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded shadow-sm text-center">
              <h3 className="font-semibold mb-1 text-gray-700">Catégorie</h3>
              <p>{equipement.categorie || "-"}</p>
            </div>
          </div>

          {/* Images avec mini-indicateurs */}
          {equipement.images && equipement.images.length > 0 && (
            <div
              className="w-full h-80 md:h-96 overflow-hidden rounded-lg relative cursor-pointer shadow-md transition-opacity duration-700"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${equipement.images[hoverIndex]}`}
                alt={`Image ${hoverIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {equipement.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {equipement.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-3 h-3 rounded-full border border-white ${idx === hoverIndex ? "bg-white" : "bg-gray-400"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section Affectations */}
        {equipement.affectations && equipement.affectations.length > 0 && (
        <div className="mt-6 space-y-6">
            <h3 className="font-semibold mb-4 text-gray-700 text-center text-xl">Affectations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {equipement.affectations
                .filter((aff) => aff.employe)
                .map((aff) => (
                <Card key={aff.id} className="shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    
                    {/* Icône ou avatar */}
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                        {aff.employe!.prenom.charAt(0)}{aff.employe!.nom.charAt(0)}
                    </div>

                    {/* Infos détaillées */}
                    <div className="flex-1 space-y-1">
                        <p><strong>Nom :</strong> {aff.employe!.nom} {aff.employe!.prenom}</p>
                        <p><strong>Email :</strong> {aff.employe!.email}</p>
                        <p>
                        <strong>Poste :</strong>{" "}
                        <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm">
                            {aff.employe!.poste?.nom || "-"}
                        </span>
                        </p>
                        <p>
                        <strong>Agence :</strong>{" "}
                        <span className="inline-block bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-sm">
                            {aff.employe!.agence?.nom_agence || "-"}
                        </span>
                        </p>
                        <p>
                        <strong>Rôle :</strong>{" "}
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm">
                            {aff.employe!.roles?.[0]?.role?.nom || "-"}
                        </span>
                        </p>
                        <p><strong>Chef :</strong> {aff.employe!.chef?.nom || "-"}</p>
                        <p><strong>Quantité :</strong> {aff.quantite}</p>
                        <p>
                        <strong>Date d'affectation :</strong>{" "}
                        {new Date(aff.dateAffectation).toLocaleDateString("fr-FR")}
                        </p>
                    </div>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>
        )}

        </CardContent>
      </Card>
    </div>
  );
}


// "use client";

// import React, { useEffect, useState } from "react";
// import EquipementService from "@/lib/services/EquipementService";
// import AffectationService, { Affectation } from "@/lib/services/AffectationService";
// import { Equipement } from "@/types/index";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Badge } from "@/components/ui/badge";
// import { Plus, Edit, Trash, MoreHorizontal } from "lucide-react";
// import { toast } from "sonner";
// import * as ExportUtils from "@/lib/utils/exportEquipements";

// const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// interface Props {
//   agenceId?: number;
//   posteId?: number;
// }

// export default function InventaireTable({ agenceId, posteId }: Props) {
//   const equipementService = new EquipementService();
//   const affectationService = new AffectationService();

//   const [equipements, setEquipements] = useState<Equipement[]>([]);
//   const [employes, setEmployes] = useState<{ id: number; nom: string; prenom: string }[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Dialogs
//   const [isCreateOpen, setIsCreateOpen] = useState(false);
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [isAffectDialogOpen, setIsAffectDialogOpen] = useState(false);
//   const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

//   // Édition / création
//   const [newEquip, setNewEquip] = useState<Partial<Equipement>>({ nom: "", modele: "", categorie: "", quantiteTotale: 0 });
//   const [newImages, setNewImages] = useState<File[]>([]);
//   const [editing, setEditing] = useState<Partial<Equipement> | null>(null);
//   const [editImages, setEditImages] = useState<File[]>([]);

//   // Affectation
//   const [selectedEquipement, setSelectedEquipement] = useState<number | null>(null);
//   const [selectedEmploye, setSelectedEmploye] = useState<number | null>(null);
//   const [quantite, setQuantite] = useState<number>(1);

//   // Status
//   const [statusEquip, setStatusEquip] = useState<Equipement | null>(null);
//   const [statusSelected, setStatusSelected] = useState<"ACTIF" | "INACTIF">("ACTIF");

//   // Filtres
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [employeFilter, setEmployeFilter] = useState<string>("all");
//   const [affecteFilter, setAffecteFilter] = useState<string>("all");

//   // 🔹 Fetch équipements
//   const fetchEquipements = async () => {
//     setLoading(true);
//     try {
//       let data: Equipement[] = [];
//       if (agenceId) {
//         // Récupération filtrée par agence
//         data = await equipementService.getFiltered(agenceId, posteId);
//       } else {
//         data = await equipementService.getAll();
//       }
//       setEquipements(data);
//     } catch (err: any) {
//       toast.error(err?.message || "Erreur chargement équipements");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEmployes = async () => {
//     try {
//       const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`);
//       const data = await res.json();
//       setEmployes(Array.isArray(data.data) ? data.data : []);
//     } catch (err) {
//       console.error(err);
//       setEmployes([]);
//     }
//   };

//   useEffect(() => {
//     fetchEquipements();
//     fetchEmployes();
//   }, [agenceId, posteId]);

//   // 🔹 Création équipement
//   const handleCreate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newEquip.nom || newEquip.quantiteTotale === undefined) return toast.error("Remplissez les champs obligatoires");
//     try {
//       const formData = new FormData();
//       formData.append("nom", newEquip.nom!);
//       if (newEquip.modele) formData.append("modele", newEquip.modele);
//       if (newEquip.categorie) formData.append("categorie", newEquip.categorie);
//       formData.append("quantiteTotale", String(newEquip.quantiteTotale));
//       newImages.forEach((file) => formData.append("images", file));

//       await equipementService.create(formData);
//       toast.success("Équipement créé");
//       setIsCreateOpen(false);
//       setNewEquip({ nom: "", modele: "", categorie: "", quantiteTotale: 0 });
//       setNewImages([]);
//       fetchEquipements();
//     } catch (err: any) {
//       toast.error(err?.message || "Erreur création");
//     }
//   };

//   // 🔹 Édition équipement
//   const handleEdit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editing?.id) return;

//     try {
//       const formData = new FormData();
//       if (editing.nom) formData.append("nom", editing.nom);
//       if (editing.modele) formData.append("modele", editing.modele);
//       if (editing.categorie) formData.append("categorie", editing.categorie);
//       formData.append("quantiteTotale", String(editing.quantiteTotale ?? 0));
//       editImages.forEach((file) => formData.append("images", file));
//       if (editing.proprietaire?.id != null) formData.append("proprietaireId", String(editing.proprietaire.id));

//       await equipementService.update(editing.id, formData);
//       toast.success("Équipement mis à jour");
//       setIsEditOpen(false);
//       setEditing(null);
//       setEditImages([]);
//       fetchEquipements();
//     } catch (err: any) {
//       toast.error(err?.message || "Erreur mise à jour");
//     }
//   };

//   // 🔹 Suppression équipement
//   const handleDelete = async (id: number) => {
//     if (!confirm("Voulez-vous vraiment archiver cet équipement ?")) return;
//     try {
//       await equipementService.delete(id);
//       toast.success("Équipement archivé");
//       setEquipements((prev) => prev.filter((e) => e.id !== id));
//     } catch (err: any) {
//       toast.error(err?.message || "Erreur suppression");
//     }
//   };

//   // 🔹 Affectation
//   const handleAffecter = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedEquipement || !selectedEmploye || !quantite) return toast.error("Remplir tous les champs");

//     const eq = equipements.find((e) => e.id === selectedEquipement);
//     if (!eq) return toast.error("Équipement introuvable");
//     if (quantite > eq.quantiteDisponible) return toast.error("Quantité disponible insuffisante");

//     try {
//       await affectationService.affecter(selectedEquipement, selectedEmploye, quantite);
//       toast.success("Équipement affecté");
//       setIsAffectDialogOpen(false);
//       setSelectedEquipement(null);
//       setSelectedEmploye(null);
//       setQuantite(1);
//       fetchEquipements();
//     } catch (err: any) {
//       toast.error(err?.message || "Erreur affectation");
//     }
//   };

//   // 🔹 Changer status
//   const handleChangeStatus = async () => {
//     if (!statusEquip) return;
//     try {
//       await equipementService.updateStatus(statusEquip.id, statusSelected);
//       toast.success("Status mis à jour");
//       setIsStatusDialogOpen(false);
//       setStatusEquip(null);
//       fetchEquipements();
//     } catch (err: any) {
//       toast.error(err?.message || "Erreur mise à jour status");
//     }
//   };

//   // 🔹 Filtrage
//   const filteredEquipements = equipements.filter((eq) => {
//     const statusMatch = statusFilter === "all" || eq.status === statusFilter;
//     const employeMatch = employeFilter === "all" || eq.affectations?.some((a) => a.employeId === Number(employeFilter));
//     const affecteMatch = affecteFilter === "all" || (affecteFilter === "affectes" && eq.affectations && eq.affectations.length > 0);
//     const nameMatch = eq.nom.toLowerCase().includes(searchTerm.toLowerCase());
//     return statusMatch && employeMatch && affecteMatch && nameMatch;
//   });

//   return (
//     <div className="space-y-6">
//       {/* Header + actions */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Gestion des équipements</h1>
//           <p className="text-muted-foreground mt-2">Créez, affectez, retournez et téléchargez</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
//             <DialogTrigger asChild>
//               <Button className="gap-2"><Plus className="w-4 h-4" /> Nouvel équipement</Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-md">
//               <DialogHeader><DialogTitle>Nouvel équipement</DialogTitle></DialogHeader>
//               <form onSubmit={handleCreate} className="space-y-4">
//                 <div>
//                   <Label>Nom</Label>
//                   <Input value={newEquip.nom || ""} onChange={(e) => setNewEquip({ ...newEquip, nom: e.target.value })} required />
//                 </div>
//                 <div>
//                   <Label>Modèle</Label>
//                   <Input value={newEquip.modele || ""} onChange={(e) => setNewEquip({ ...newEquip, modele: e.target.value })} />
//                 </div>
//                 <div>
//                   <Label>Catégorie</Label>
//                   <Input value={newEquip.categorie || ""} onChange={(e) => setNewEquip({ ...newEquip, categorie: e.target.value })} />
//                 </div>
//                 <div>
//                   <Label>Quantité totale</Label>
//                   <Input type="number" value={newEquip.quantiteTotale ?? 0} onChange={(e) => setNewEquip({ ...newEquip, quantiteTotale: Number(e.target.value) })} required />
//                 </div>
//                 <div>
//                   <Label>Images</Label>
//                   <Input type="file" multiple accept="image/*" onChange={(e) => setNewImages(Array.from(e.target.files || []))} />
//                   <div className="flex gap-2 mt-2 flex-wrap">
//                     {newImages.map((file, idx) => (
//                       <img key={idx} src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded" alt="preview" />
//                     ))}
//                   </div>
//                 </div>
//                 <Button type="submit" className="w-full">Créer</Button>
//               </form>
//             </DialogContent>
//           </Dialog>

//           {/* Export buttons */}
//           <Button onClick={() => ExportUtils.exportPDF(filteredEquipements)}>PDF</Button>
//           <Button onClick={() => ExportUtils.exportCSV(filteredEquipements)}>CSV</Button>
//           <Button onClick={() => ExportUtils.exportExcel(filteredEquipements)}>Excel</Button>
//         </div>
//       </div>

//       {/* Filtres */}
//       <Card className="border-border/50">
//         <CardContent className="pt-6 flex flex-wrap gap-4 items-end">
//           <div className="flex-1 relative">
//             <Input placeholder="Rechercher par nom" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
//           </div>
//           <Select value={statusFilter} onValueChange={setStatusFilter}>
//             <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par status" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Tous</SelectItem>
//               <SelectItem value="ACTIF">ACTIF</SelectItem>
//               <SelectItem value="INACTIF">INACTIF</SelectItem>
//             </SelectContent>
//           </Select>

//           <Select value={employeFilter} onValueChange={setEmployeFilter}>
//             <SelectTrigger className="w-60"><SelectValue placeholder="Filtrer par employé" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Tous</SelectItem>
//               {employes.map((emp) => (
//                 <SelectItem key={emp.id} value={emp.id.toString()}>{emp.prenom} {emp.nom}</SelectItem>
//               ))}
//             </SelectContent>
//           </Select>

//           <Select value={affecteFilter} onValueChange={setAffecteFilter}>
//             <SelectTrigger className="w-48"><SelectValue placeholder="Affectation" /></SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Tous</SelectItem>
//               <SelectItem value="affectes">Affectés uniquement</SelectItem>
//             </SelectContent>
//           </Select>
//         </CardContent>
//       </Card>

//       {/* Tableau */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Equipements</CardTitle>
//           <CardDescription>{loading ? "Chargement..." : `${equipements.length} équipement(s)`}</CardDescription>
//         </CardHeader>
//         <CardContent className="overflow-visible">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Nom</TableHead>
//                 <TableHead>Modèle</TableHead>
//                 <TableHead>Images</TableHead>
//                 <TableHead>Catégorie</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Qté Totale</TableHead>
//                 <TableHead>Qté Dispo</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredEquipements.map((eq) => (
//                 <TableRow key={eq.id}>
//                   <TableCell>{eq.nom}</TableCell>
//                   <TableCell>{eq.modele || "-"}</TableCell>
//                   <TableCell>
//                     {eq.images && eq.images.length > 0 ? (
//                       <img src={`${API_URL}/uploads/${eq.images[0]}`} alt={eq.nom} className="w-16 h-16 object-cover rounded" />
//                     ) : "-"}
//                   </TableCell>
//                   <TableCell>{eq.categorie || "-"}</TableCell>
//                   <TableCell>
//                     <Badge variant={eq.status === "ACTIF" ? "success" : "destructive"}>{eq.status}</Badge>
//                   </TableCell>
//                   <TableCell>{eq.quantiteTotale}</TableCell>
//                   <TableCell>{eq.quantiteDisponible}</TableCell>
//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <button className="p-1 rounded hover:bg-gray-100">
//                           <MoreHorizontal className="w-4 h-4" />
//                         </button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent>
//                         <DropdownMenuItem onClick={() => { setEditing(eq); setIsEditOpen(true); }}>
//                           <Edit className="w-4 h-4 mr-2" /> Modifier
//                         </DropdownMenuItem>
//                         <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(eq.id)}>
//                           <Trash className="w-4 h-4 mr-2" /> Archiver
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => { setSelectedEquipement(eq.id); setIsAffectDialogOpen(true); }}>
//                           <Plus className="w-4 h-4 mr-2" /> Affecter
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => { setStatusEquip(eq); setStatusSelected(eq.status); setIsStatusDialogOpen(true); }}>
//                           <MoreHorizontal className="w-4 h-4 mr-2" /> Déclarer status
//                         </DropdownMenuItem>
//                         <DropdownMenuItem asChild>
//                           <a href={`/dashboard/equipements/${eq.id}`} className="flex items-center">
//                             <span className="mr-2">🔍</span> Voir détail
//                           </a>
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>

//       {/* Dialog édition */}
//       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader><DialogTitle>Modifier équipement</DialogTitle></DialogHeader>
//           {editing && (
//             <form onSubmit={handleEdit} className="space-y-4">
//               <div>
//                 <Label>Nom</Label>
//                 <Input value={editing.nom || ""} onChange={(e) => setEditing({ ...editing, nom: e.target.value })} />
//               </div>
//               <div>
//                 <Label>Modèle</Label>
//                 <Input value={editing.modele || ""} onChange={(e) => setEditing({ ...editing, modele: e.target.value })} />
//               </div>
//               <div>
//                 <Label>Catégorie</Label>
//                 <Input value={editing.categorie || ""} onChange={(e) => setEditing({ ...editing, categorie: e.target.value })} />
//               </div>
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <Label>Quantité totale</Label>
//                   <Input type="number" value={editing.quantiteTotale ?? 0} onChange={(e) => setEditing({ ...editing, quantiteTotale: Number(e.target.value) })} />
//                 </div>
//               </div>
//               <div>
//                 <Label>Ajouter images</Label>
//                 <Input type="file" multiple accept="image/*" onChange={(e) => setEditImages(Array.from(e.target.files || []))} />
//               </div>
//               <Button type="submit" className="w-full">Modifier</Button>
//             </form>
//           )}
//         </DialogContent>
//       </Dialog>

//       {/* Dialog Affectation */}
//       <Dialog open={isAffectDialogOpen} onOpenChange={setIsAffectDialogOpen}>
//         <DialogContent className="max-w-md">
//           <DialogHeader><DialogTitle>Affecter équipement</DialogTitle></DialogHeader>
//           <form onSubmit={handleAffecter} className="space-y-4">
//             <div>
//               <Label>Employé</Label>
//               <Select value={selectedEmploye?.toString() || ""} onValueChange={(val) => setSelectedEmploye(Number(val))}>
//                 <SelectTrigger><SelectValue placeholder="Choisir un employé" /></SelectTrigger>
//                 <SelectContent>
//                   {employes.map((emp) => (
//                     <SelectItem key={emp.id} value={emp.id.toString()}>{emp.prenom} {emp.nom}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label>Quantité</Label>
//               <Input type="number" value={quantite} min={1} onChange={(e) => setQuantite(Number(e.target.value))} />
//             </div>
//             <Button type="submit" className="w-full">Affecter</Button>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* Dialog Status */}
//       <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
//         <DialogContent className="max-w-sm">
//           <DialogHeader><DialogTitle>Déclarer status</DialogTitle></DialogHeader>
//           <div className="space-y-4">
//             <Select value={statusSelected} onValueChange={(val: any) => setStatusSelected(val)}>
//               <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="ACTIF">ACTIF</SelectItem>
//                 <SelectItem value="INACTIF">INACTIF</SelectItem>
//               </SelectContent>
//             </Select>
//             <Button onClick={handleChangeStatus} className="w-full">Valider</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
