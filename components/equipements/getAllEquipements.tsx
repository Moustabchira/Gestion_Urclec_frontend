"use client";

import { useEffect, useState } from "react";
import EquipementService from "@/lib/services/EquipementService";
import AffectationService, { Affectation } from "@/lib/services/AffectationService";
import { getPointsDeService } from "@/lib/services/PointService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Equipement {
  id: number;
  nom: string;
  modele?: string;
  categorie?: string;
  status: "ACTIF" | "HORS_SERVICE";
  affectations?: Affectation[];
  images?: string[];
}

interface Employe {
  id: number;
  prenom: string;
  nom: string;
  agence?: { nom_agence: string };
}

interface PointDeService {
  id: number;
  nom: string;
}

export default function EquipementsPage() {
  const equipementService = new EquipementService();
  const affectationService = new AffectationService();

  // 🔹 Etats principaux
  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Dialogs création / édition
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEquip, setNewEquip] = useState<Partial<Equipement>>({ nom: "", modele: "", categorie: "" });
  const [newImages, setNewImages] = useState<File[]>([]);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Equipement> | null>(null);
  const [editImages, setEditImages] = useState<File[]>([]);

  // 🔹 Dialog affectation
  const [isAffectDialogOpen, setIsAffectDialogOpen] = useState(false);
  const [selectedEquipement, setSelectedEquipement] = useState<number | null>(null);
  const [selectedEmploye, setSelectedEmploye] = useState<number | null>(null);
  const [quantite, setQuantite] = useState<number>(1);

  // 🔹 Dialog status
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusEquip, setStatusEquip] = useState<Equipement | null>(null);
  const [statusSelected, setStatusSelected] = useState<"ACTIF" | "HORS_SERVICE">("ACTIF");

  // 🔹 Filtres
  const [statusFilter, setStatusFilter] = useState<string>("all"); 
  const [employeFilter, setEmployeFilter] = useState<string>("all"); 
  const [affecteFilter, setAffecteFilter] = useState<string>("all");
  const [agenceFilter, setAgenceFilter] = useState("all");

  const [pointServices, setPointServices] = useState<PointDeService[]>([]);
  const [selectedPointServiceOrigine, setSelectedPointServiceOrigine] = useState<number | null>(null);
  const [selectedPointServiceDest, setSelectedPointServiceDest] = useState<number | null>(null);

  // 🔹 Fetch Equipements
  const fetchEquipements = async () => {
    setLoading(true);
    try {
      const data = await equipementService.getAll();
      setEquipements(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur chargement équipements");
    } finally {
      setLoading(false);
    }
  };

  const fetchPointServices = async () => {
    try {
      const res = await getPointsDeService();
      setPointServices(res);
      console.log("Point Services:", res);
    } catch (err) {
      console.error(err);
      setPointServices([]);
    }
  };


  // 🔹 Fetch Employés
  const fetchEmployes = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const data = await res.json();
      setEmployes(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error(err);
      setEmployes([]);
    }
  };

  useEffect(() => {
    fetchEquipements();
    fetchEmployes();
    fetchPointServices();
  }, []);

  // 🔹 Fonctions CRUD et actions
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquip.nom) return toast.error("Remplissez le nom de l'équipement");

    try {
      const formData = new FormData();
      formData.append("nom", newEquip.nom!);
      if (newEquip.modele) formData.append("modele", newEquip.modele);
      if (newEquip.categorie) formData.append("categorie", newEquip.categorie);
      newImages.forEach((file) => formData.append("images", file));

      await equipementService.create(formData);
      toast.success("Équipement créé");
      setIsCreateOpen(false);
      setNewEquip({ nom: "", modele: "", categorie: "" });
      setNewImages([]);
      fetchEquipements();
    } catch (err: any) {
      toast.error(err.message || "Erreur création");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.id) return;
    try {
      const formData = new FormData();
      if (editing.nom) formData.append("nom", editing.nom);
      if (editing.modele) formData.append("modele", editing.modele);
      if (editing.categorie) formData.append("categorie", editing.categorie);
      editImages.forEach((file) => formData.append("images", file));
      await equipementService.update(editing.id, formData);
      toast.success("Équipement mis à jour");
      setIsEditOpen(false);
      setEditing(null);
      setEditImages([]);
      fetchEquipements();
    } catch (err: any) {
      toast.error(err.message || "Erreur mise à jour");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment archiver cet équipement ?")) return;
    try {
      await equipementService.archive(id);
      toast.success("Équipement archivé");
      setEquipements((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Erreur suppression");
    }
  };

  const handleAffecter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipement || !selectedEmploye || !quantite || !selectedPointServiceOrigine || !selectedPointServiceDest) {
      return toast.error("Remplissez tous les champs");
    }

    try {
      const data = {
        equipementId: selectedEquipement,
        employeId: selectedEmploye,
        quantite,
        status: "BON" as "BON",
        pointServiceOrigineId: selectedPointServiceOrigine,
        pointServiceDestId: selectedPointServiceDest,
      };

      await affectationService.affecter(data);
      toast.success("Équipement affecté");
      setIsAffectDialogOpen(false);
      setSelectedEquipement(null);
      setSelectedEmploye(null);
      setQuantite(1);
      fetchEquipements();
    } catch (err: any) {
      toast.error(err.message || "Erreur affectation");
    }
  };



  const handleChangeStatus = async () => {
    if (!statusEquip) return;
    try {
      await equipementService.updateStatus(statusEquip.id, statusSelected);
      toast.success("Status mis à jour");
      setIsStatusDialogOpen(false);
      setStatusEquip(null);
      fetchEquipements();
    } catch (err: any) {
      toast.error(err.message || "Erreur mise à jour status");
    }
  };

  // 🔹 Filtrage
  const filteredEquipements = equipements.filter((eq) => {
    const statusMatch = statusFilter === "all" || eq.status === statusFilter;
    const employeMatch = employeFilter === "all" || eq.affectations?.some(a => a.employeId === Number(employeFilter));
    const affecteMatch = affecteFilter === "all" || (affecteFilter === "affectes" && eq.affectations?.length > 0);
    const nameMatch = eq.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const agenceMatch = agenceFilter === "all" || eq.affectations?.some(a => {
      const emp = employes.find(e => e.id === a.employeId);
      return emp?.agence?.nom_agence === agenceFilter;
    });
    return statusMatch && employeMatch && affecteMatch && nameMatch && agenceMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des équipements</h1>
          <p className="text-muted-foreground mt-2">Créez, affectez et téléchargez</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Dialog création */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Nouvel équipement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Nouvel équipement</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Nom</Label>
                  <Input value={newEquip.nom || ""} onChange={(e) => setNewEquip({ ...newEquip, nom: e.target.value })} required />
                </div>
                <div>
                  <Label>Modèle</Label>
                  <Input value={newEquip.modele || ""} onChange={(e) => setNewEquip({ ...newEquip, modele: e.target.value })} />
                </div>
                <div>
                  <Label>Catégorie</Label>
                  <Input value={newEquip.categorie || ""} onChange={(e) => setNewEquip({ ...newEquip, categorie: e.target.value })} />
                </div>
                <div>
                  <Label>Images</Label>
                  <Input type="file" multiple accept="image/*" onChange={(e) => setNewImages(Array.from(e.target.files || []))} />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {newImages.map((file, idx) => (
                      <img key={idx} src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded" alt="preview" />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full">Créer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtres */}
      <Card className="border-border/50">
        <CardContent className="pt-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 relative">
            <Input placeholder="Rechercher par nom" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="ACTIF">ACTIF</SelectItem>
              <SelectItem value="HORS_SERVICE">HORS_SERVICE</SelectItem>
            </SelectContent>
          </Select>

          <Select value={employeFilter} onValueChange={setEmployeFilter}>
            <SelectTrigger className="w-60"><SelectValue placeholder="Filtrer par employé" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {employes.map((emp) => (
                <SelectItem key={emp.id} value={emp.id.toString()}>{emp.prenom} {emp.nom}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={affecteFilter} onValueChange={setAffecteFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Affectation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="affectes">Affectés uniquement</SelectItem>
            </SelectContent>
          </Select>

          <Select value={agenceFilter} onValueChange={setAgenceFilter}>
            <SelectTrigger><SelectValue placeholder="Filtrer par agence" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les agences</SelectItem>
              {Array.from(new Set(equipements.flatMap(eq => eq.affectations?.map(a => {
                const emp = employes.find(e => e.id === a.employeId);
                return emp?.agence?.nom_agence;
              }).filter(Boolean) || []))).map(ag => (
                <SelectItem key={ag} value={ag}>{ag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Equipements</CardTitle>
          <CardDescription>{loading ? "Chargement..." : `${equipements.length} équipement(s)`}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-visible">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Modèle</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipements.map((eq) => (
                <TableRow key={eq.id}>
                  <TableCell>{eq.nom}</TableCell>
                  <TableCell>{eq.modele || "-"}</TableCell>
                  <TableCell>
                    {eq.images?.[0] ? (
                      <img src={`${API_URL}/uploads/${eq.images[0]}`} alt="equipement" className="w-16 h-16 object-cover rounded" />
                    ) : "-"}
                  </TableCell>
                  <TableCell>{eq.categorie || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={eq.status === "ACTIF" ? "success" : "destructive"}>{eq.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => { setEditing(eq); setIsEditOpen(true); }}>
                          <Edit className="w-4 h-4 mr-2" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(eq.id)}>
                          <Trash className="w-4 h-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedEquipement(eq.id); setIsAffectDialogOpen(true); }}>
                          <Plus className="w-4 h-4 mr-2" /> Affecter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setStatusEquip(eq); setStatusSelected(eq.status); setIsStatusDialogOpen(true); }}>
                          <MoreHorizontal className="w-4 h-4 mr-2" /> Déclarer status
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href={`/dashboard/equipements/${eq.id}`} className="flex items-center">
                            <span className="mr-2">🔍</span> Voir détail
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog édition */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Modifier équipement</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input value={editing.nom || ""} onChange={(e) => setEditing({ ...editing, nom: e.target.value })} />
              </div>
              <div>
                <Label>Modèle</Label>
                <Input value={editing.modele || ""} onChange={(e) => setEditing({ ...editing, modele: e.target.value })} />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Input value={editing.categorie || ""} onChange={(e) => setEditing({ ...editing, categorie: e.target.value })} />
              </div>
              <div>
                <Label>Images</Label>
                <Input type="file" multiple accept="image/*" onChange={(e) => setEditImages(Array.from(e.target.files || []))} />
              </div>
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog affectation */}
      <Dialog open={isAffectDialogOpen} onOpenChange={setIsAffectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Affecter équipement</DialogTitle></DialogHeader>
          <form onSubmit={handleAffecter} className="space-y-4">
            <div>
              <Label>Employé</Label>
              <Select value={selectedEmploye?.toString() || ""} onValueChange={(v) => setSelectedEmploye(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choisir employé" /></SelectTrigger>
                <SelectContent>
                  {employes.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.prenom} {emp.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Point de service (Origine)</Label>
              <Select value={selectedPointServiceOrigine?.toString() || ""} onValueChange={(v) => setSelectedPointServiceOrigine(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choisir un point de service origine" /></SelectTrigger>
                <SelectContent>
                  {pointServices.map(ps => <SelectItem key={ps.id} value={ps.id.toString()}>{ps.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Point de service (Destination)</Label>
              <Select value={selectedPointServiceDest?.toString() || ""} onValueChange={(v) => setSelectedPointServiceDest(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choisir un point de service destination" /></SelectTrigger>
                <SelectContent>
                  {pointServices.map(ps => <SelectItem key={ps.id} value={ps.id.toString()}>{ps.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>


            <div>
              <Label>Quantité</Label>
              <Input type="number" value={quantite} min={1} onChange={(e) => setQuantite(Number(e.target.value))} />
            </div>
            <Button type="submit" className="w-full">Affecter</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog status */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Modifier status</DialogTitle></DialogHeader>
          <Select value={statusSelected} onValueChange={(v) => setStatusSelected(v as "ACTIF" | "HORS_SERVICE")}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIF">ACTIF</SelectItem>
              <SelectItem value="HORS_SERVICE">HORS_SERVICE</SelectItem>
            </SelectContent>
          </Select>
          <Button className="mt-4 w-full" onClick={handleChangeStatus}>Enregistrer</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
