"use client";

import { useEffect, useState } from "react";
import EquipementService from "@/lib/services/EquipementService";
import AffectationService from "@/lib/services/MouvementService";
import { getPointsDeService } from "@/lib/services/PointService";
import { Equipement } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Edit, Trash, MoreHorizontal, Repeat, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { usePagination } from "@/hooks/use-pagination";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  const [equipements, setEquipements] = useState<Equipement[]>([]);
  const [employes, setEmployes] = useState<Employe[]>([]);
  const [pointServices, setPointServices] = useState<PointDeService[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Création
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEquip, setNewEquip] = useState<Partial<Equipement>>({ nom: "", modele: ""});
  const [newImages, setNewImages] = useState<File[]>([]);

  // Edition
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Equipement> | null>(null);
  const [editImages, setEditImages] = useState<File[]>([]);

  // Affectation
  const [isAffectDialogOpen, setIsAffectDialogOpen] = useState(false);
  const [selectedEquipement, setSelectedEquipement] = useState<number | null>(null);
  const [selectedEmploye, setSelectedEmploye] = useState<number | null>(null);
  const [quantite, setQuantite] = useState<number>(1);
  const [selectedPointServiceOrigine, setSelectedPointServiceOrigine] = useState<number | null>(null);
  const [selectedPointServiceDest, setSelectedPointServiceDest] = useState<number | null>(null);

  // Transfert
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferQuantite, setTransferQuantite] = useState<number>(1);
  const [transferSource, setTransferSource] = useState<number | null>(null);
  const [transferDest, setTransferDest] = useState<number | null>(null);
  const [transferResponsable, setTransferResponsable] = useState<number | null>(null);

  // Réparation
  const [isReparationDialogOpen, setIsReparationDialogOpen] = useState(false);
  const [reparationReparateur, setReparationReparateur] = useState<number | null>(null);
  const [descriptionPanne, setDescriptionPanne] = useState("");
  const [selectedAgenceSource, setSelectedAgenceSource] = useState<number | null>(null);
  const [selectedPointServiceSource, setSelectedPointServiceSource] = useState<number | null>(null);



  // Status
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  type EtatType = "FONCTIONNEL" | "EN_PANNE" | "HORS_SERVICE" | "EN_TRANSIT" | "EN_REPARATION";
  const [etatSelected, setEtatSelected] = useState<EtatType>("FONCTIONNEL");
  const [etatEquip, setEtatEquip] = useState<Equipement | null>(null);


  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeFilter, setEmployeFilter] = useState<string>("all");
  const [agenceFilter, setAgenceFilter] = useState<string>("all");
  const [etatFilter, setEtatFilter] = useState<string>("all");

  
  const {
  page,
  limit,
  lastPage,
  setLastPage,
  nextPage,
  prevPage
} = usePagination({ initialPage: 1, initialLimit: 10 });

  const { user } = useAuth();

  // 🔹 Fetch Equipements
  const fetchEquipements = async () => {
  setLoading(true);
  try {
    const result = await equipementService.getAll(page, limit);

    setEquipements(result.data);
    setLastPage(result.totalPages);
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
    } catch (err) {
      console.error(err);
      setPointServices([]);
    }
  };

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
  fetchPointServices();
  fetchEmployes();
}, [page]);


  useEffect(() => {
      const refresh = () => fetchEquipements();
      window.addEventListener("equipement-updated", refresh);
      return () => window.removeEventListener("equipement-updated", refresh);
    }, []);

  // 🔹 CRUD
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquip.nom) return toast.error("Nom requis");
    try {
      const formData = new FormData();
      formData.append("nom", newEquip.nom!);
      if (newEquip.modele) formData.append("modele", newEquip.modele);
      newImages.forEach(file => formData.append("images", file));
      const rst = await equipementService.create(formData);
      console.log("Création équipement résultat :", rst);
      toast.success("Équipement créé");
      setIsCreateOpen(false);
      setNewEquip({ nom: "", modele: ""});
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
      editImages.forEach(file => formData.append("images", file));
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
    if (!confirm("Archiver cet équipement ?")) return;
    try {
      await equipementService.archive(id);
      toast.success("Équipement archivé");
      setEquipements(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Erreur suppression");
    }
  };

  // 🔹 Affectation
  const handleAffecter = async (e: React.FormEvent) => {
  e.preventDefault();

  console.log("=== Affectation ===");
  console.log("Equipement sélectionné:", selectedEquipement);
  console.log("Employé sélectionné:", selectedEmploye);
  console.log("Quantité:", quantite);
  console.log("Point service origine:", selectedPointServiceOrigine);
  console.log("Point service destination:", selectedPointServiceDest);
  console.log("Utilisateur connecté (initiateurId):", user?.id);


  if (!selectedEquipement || !selectedEmploye || !quantite || !selectedPointServiceDest) {
    return toast.error("Tous les champs sont requis");
  }

  try {
    const result = await equipementService.affecter({
      equipementId: selectedEquipement,
      initiateurId: user?.id!,
      employeId: selectedEmploye,
      quantite,
      pointServiceDestId: selectedPointServiceDest,
    });

    console.log("Résultat affectation:", result);

    toast.success("Équipement affecté");
    setIsAffectDialogOpen(false);
    setSelectedEquipement(null);
    setSelectedEmploye(null);
    setQuantite(1);
    fetchEquipements();
  } catch (err: any) {
    console.error("Erreur affectation:", err);
    toast.error(err.message || "Erreur affectation");
  }
};

  // 🔹 Transfert
const handleTransfer = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedEquipement || !transferQuantite || !transferSource || !transferDest) {
    return toast.error("Tous les champs requis");
  }

  console.log("🔹 handleTransfer - données avant envoi :", {
    equipementId: selectedEquipement,
    quantite: transferQuantite,
    pointServiceSourceId: transferSource,
    pointServiceDestId: transferDest,
    responsableDestinationId: transferResponsable || undefined,
  });

  try {
    await equipementService.transferer({
      equipementId: Number(selectedEquipement),
      quantite: Number(transferQuantite),
      pointServiceSourceId: Number(transferSource),
      pointServiceDestId: Number(transferDest),
      responsableDestinationId: transferResponsable ? Number(transferResponsable) : undefined,
      initiateurId: user?.id!,
    });
    toast.success("Transfert effectué");
    setIsTransferDialogOpen(false);
    fetchEquipements();
  } catch (err: any) {
    console.error("handleTransfer error:", err);
    toast.error(err.message || "Erreur transfert");
  }
};

  // 🔹 Envoyer en réparation
const handleEnvoyerReparation = async (e: React.FormEvent) => {
  e.preventDefault();

  // ✅ Vérifications complètes
  if (
    !selectedEquipement ||
    !reparationReparateur ||
    !selectedAgenceSource ||
    !selectedPointServiceSource ||
    !descriptionPanne.trim() ||
    !user?.id
  ) {
    return toast.error("Tous les champs sont requis");
  }

  try {
    const payload = {
      equipementId: Number(selectedEquipement),
      initiateurId: Number(user.id),
      reparateurId: Number(reparationReparateur),
      agenceSourceId: Number(selectedAgenceSource),
      pointServiceSourceId: Number(selectedPointServiceSource),
      commentaire: descriptionPanne.trim(),
    };

    console.log("Payload envoyé en réparation:", payload);

    await equipementService.envoyerEnReparation(payload);

    toast.success("Équipement envoyé en réparation");

    // ✅ Reset propre du dialogue
    setIsReparationDialogOpen(false);
    setSelectedEquipement(null);
    setReparationReparateur(null);
    setDescriptionPanne(""); // ✅ IMPORTANT
    fetchEquipements();

  } catch (err: any) {
    toast.error(err?.message || "Erreur envoi en réparation");
  }
};


  const handleChangeEtat = async () => {
    if (!etatEquip) return;
    try {
      await equipementService.updateEtat(etatEquip.id, etatSelected); // envoyer 'etat'
      toast.success("État mis à jour");
      setIsStatusDialogOpen(false);
      setEtatEquip(null);
      fetchEquipements();
    } catch (err: any) {
      toast.error(err.message || "Erreur mise à jour état");
    }
  };


  // 🔹 Filtrage
  const filteredEquipements = equipements.filter(eq => {
  const searchMatch = eq.nom.toLowerCase().includes(searchTerm.toLowerCase());

  const etatMatch =
    etatFilter === "all" ||
    eq.etat === etatFilter;

  const statusMatch = statusFilter === "all" || eq.status === statusFilter;

  const agenceMatch =
    agenceFilter === "all" ||
    eq.agenceActuelle?.nom_agence === agenceFilter ||
    eq.mouvements?.some(m =>
      m.initiateur?.agence?.nom_agence === agenceFilter ||
      m.responsableDestination?.agence?.nom_agence === agenceFilter
    );

  const employeMatch =
    employeFilter === "all" ||
    eq.responsableActuel?.id === Number(employeFilter) ||
    eq.mouvements?.some(m =>
      m.initiateur?.id === Number(employeFilter) ||
      m.responsableDestination?.id === Number(employeFilter)
    );

  return searchMatch && etatMatch && statusMatch && agenceMatch && employeMatch;
});



   // Vérifier que l'utilisateur est connecté
  if (!user?.id) {
    return <div className="text-red-500">Utilisateur non connecté</div>;
  }

  console.log("Utilisateur connecté :", user);

  // 🔹 Bloquer l'accès si ce n'est pas un gestionnaire
  if (!user.roles?.includes("gestionnaire_equipements")) {
    return (
      <div className="text-red-500 p-4 text-center font-bold text-lg">
        Accès refusé : vous n'êtes pas autorisé à accéder à cette page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des équipements</h1>
          <p className="text-muted-foreground mt-2">Créer, affecter, transférer, modifier état</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4"/> Nouvel équipement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Créer équipement</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><Label>Nom</Label><Input value={newEquip.nom || ""} onChange={e => setNewEquip({...newEquip, nom: e.target.value})} required /></div>
              <div><Label>Modèle</Label><Input value={newEquip.modele || ""} onChange={e => setNewEquip({...newEquip, modele: e.target.value})} /></div>
              <div><Label>Images</Label><Input type="file" multiple onChange={e => setNewImages(Array.from(e.target.files || []))} />
                <div className="flex gap-2 mt-2 flex-wrap">{newImages.map((file, idx) => <img key={idx} src={URL.createObjectURL(file)} className="w-20 h-20 object-cover rounded" alt="preview" />)}</div>
              </div>
              <Button type="submit" className="w-full">Créer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtrage */}
      <Card className="border-border/50">
        <CardContent className="flex flex-wrap gap-4 items-end">
          <Input placeholder="Rechercher par nom" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1"/>

          {/* Filtre État */}
          <Select value={etatFilter} onValueChange={(v) => setEtatFilter(v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="État" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="FONCTIONNEL">FONCTIONNEL</SelectItem>
              <SelectItem value="EN_PANNE">EN_PANNE</SelectItem>
              <SelectItem value="HORS_SERVICE">HORS_SERVICE</SelectItem>
              <SelectItem value="EN_TRANSIT">EN_TRANSIT</SelectItem>
              <SelectItem value="EN_REPARATION">EN_REPARATION</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre Status */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="DISPONIBLE">DISPONIBLE</SelectItem>
              <SelectItem value="ASSIGNE">ASSIGNE</SelectItem>
              <SelectItem value="INDISPONIBLE">INDISPONIBLE</SelectItem>
            </SelectContent>
          </Select>

          {/* Filtre Agence */}
          <Select value={agenceFilter} onValueChange={(v) => setAgenceFilter(v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Agence" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {pointServices
                .map(ps => ps.agence)
                .filter((value, index, self) => value && self.findIndex(v => v?.id === value.id) === index)
                .map(ag => (
                  <SelectItem key={ag!.id} value={ag!.nom_agence}>{ag!.nom_agence}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtre Responsable */}
          <Select value={employeFilter} onValueChange={(v) => setEmployeFilter(v)}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Responsable" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {employes.map(emp => (
                <SelectItem key={emp.id} value={emp.id.toString()}>
                  {emp.prenom} {emp.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader><CardTitle>Équipements</CardTitle><CardDescription>{loading ? "Chargement..." : `${equipements.length} équipements`}</CardDescription></CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Modèle</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>État</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Date d'acquisition</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipements.map(eq => (
                <TableRow key={eq.id}>
                  <TableCell>{eq.nom}</TableCell>
                  <TableCell>{eq.modele || "-"}</TableCell>
                  <TableCell>
                    {eq.images?.[0] ? (
                      <img src={`${API_URL}/uploads/${eq.images[0]}`} alt="equipement" className="w-16 h-16 object-cover rounded" />
                    ) : "-"}
                  </TableCell>   
                  <TableCell>
                    <Badge
                      variant={
                        eq.etat === "FONCTIONNEL" ? "default" :
                        eq.etat === "EN_PANNE" ? "destructive" :
                        "secondary"
                      }
                    >
                      {eq.etat}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={eq.status === "ASSIGNE" ? "default" : "outline"}>
                      {eq.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      {eq.responsableActuel
                        ? `${eq.responsableActuel.prenom} ${eq.responsableActuel.nom}`
                        : <span className="text-muted-foreground">Non affecté</span>
                      }
                  </TableCell>
                  <TableCell>
                    {eq.pointServiceActuel?.nom
                      ?? eq.agenceActuelle?.nom_agence
                      ?? <span className="text-muted-foreground">Non définie</span>
                    }
                  </TableCell>
                  <TableCell>{new Date(eq.dateAcquisition).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100"><MoreHorizontal className="w-4 h-4"/></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                            setEditing({
                              ...eq,
                              images: Array.isArray(eq.images)
                                ? eq.images
                                : typeof eq.images === "string"
                                  ? JSON.parse(eq.images)
                                  : [],
                            });
                            setEditImages([]);
                            setIsEditOpen(true);
                          }}>
                          <Edit className="w-4 h-4 mr-2"/>Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(eq.id)}><Trash className="w-4 h-4 mr-2"/>Supprimer</DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={eq.etat !== "FONCTIONNEL"}
                          onClick={() => { setSelectedEquipement(eq.id); setIsAffectDialogOpen(true); }}
                        >
                          <Plus className="w-4 h-4 mr-2"/>Affecter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={eq.etat !== "FONCTIONNEL"}
                          onClick={() => { setSelectedEquipement(eq.id); setIsTransferDialogOpen(true); }}
                        >
                          <Repeat className="w-4 h-4 mr-2"/>Transférer
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setEtatEquip(eq);
                            setEtatSelected(eq.etat as EtatType); // Initialiser avec l'état actuel
                            setIsStatusDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" /> {/* icône à gauche */}
                          Modifier état
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                          <a href={`/dashboard/equipements/${eq.id}`} className="flex items-center">
                            <span className="mr-2">🔍</span> Voir détail
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={eq.etat !== "EN_PANNE"}
                          onClick={() => { setSelectedEquipement(eq.id); setIsReparationDialogOpen(true); }}
                        >
                          <Repeat className="w-4 h-4 mr-2"/>Envoyer en réparation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={prevPage}
              disabled={page === 1}
            >
              Précédent
            </Button>

            <span className="text-sm">
              Page {page} sur {lastPage}
            </span>

            <Button
              variant="outline"
              onClick={nextPage}
              disabled={page === lastPage}
            >
              Suivant
            </Button>
          </div>
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
                <Label>Images existantes</Label>

                <div className="flex gap-2 flex-wrap mt-2">
                  {editing.images && editing.images.length > 0 ? (
                    editing.images.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={`${API_URL}/uploads/${img}`}
                        alt="equipement"
                        className="w-20 h-20 object-cover rounded border"
                      />
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Aucune image</span>
                  )}
                </div>
              </div>
              <div>
                <Label>Ajouter de nouvelles images</Label>

                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setEditImages(Array.from(e.target.files || []))
                  }
                />

                <div className="flex gap-2 mt-2 flex-wrap">
                  {editImages.map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog affectation */}
      <Dialog open={isAffectDialogOpen} onOpenChange={setIsAffectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Affecter équipement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAffecter} className="space-y-4">

            {/* Employé destinataire */}
            <div>
              <Label>Employé (responsable)</Label>
              <Select
                value={selectedEmploye?.toString() || ""}
                onValueChange={(v) => setSelectedEmploye(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employes.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.prenom} {emp.nom} {emp.agence ? `(${emp.agence.nom_agence})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Point de service (Destination) */}
            <div>
              <Label>Point de service / Agence (Destination)</Label>
              <Select
                value={selectedPointServiceDest?.toString() || ""}
                onValueChange={(v) => setSelectedPointServiceDest(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un point de service ou agence" />
                </SelectTrigger>
                <SelectContent>
                  {pointServices.map((ps) => (
                    <SelectItem key={ps.id} value={ps.id.toString()}>
                      {ps.nom} ({ps.agence.nom_agence})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantité */}
            <div>
              <Label>Quantité</Label>
              <Input
                type="number"
                value={quantite}
                min={1}
                onChange={(e) => setQuantite(Number(e.target.value))}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Si l’équipement est unique, laissez 1.
              </p>
            </div>
            {/* Bouton soumission */}
            <Button type="submit" className="w-full">
              Affecter
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Modifier état</DialogTitle></DialogHeader>
          <Select
            value={etatSelected}
            onValueChange={(v) => setEtatSelected(v as EtatType)}
          >
            <SelectTrigger><SelectValue placeholder="État" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FONCTIONNEL">FONCTIONNEL</SelectItem>
              <SelectItem value="EN_PANNE">EN_PANNE</SelectItem>
              <SelectItem value="HORS_SERVICE">HORS_SERVICE</SelectItem>
            </SelectContent>
          </Select>
          <Button className="mt-4 w-full" onClick={handleChangeEtat}>Enregistrer</Button>
        </DialogContent>
      </Dialog>


      {/* Dialog transfert */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transférer équipement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <Label>Point de service (Source)</Label>
              <Select value={transferSource?.toString() || ""} onValueChange={(v) => setTransferSource(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choisir un point de service source" /></SelectTrigger>
                <SelectContent>
                  {pointServices.map(ps => (
                    <SelectItem key={ps.id} value={ps.id.toString()}>{ps.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Point de service (Destination)</Label>
              <Select value={transferDest?.toString() || ""} onValueChange={(v) => setTransferDest(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choisir un point de service destination" /></SelectTrigger>
                <SelectContent>
                  {pointServices.map(ps => (
                    <SelectItem key={ps.id} value={ps.id.toString()}>{ps.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Responsable destination (facultatif)</Label>
              <Select value={transferResponsable?.toString() || ""} onValueChange={(v) => setTransferResponsable(Number(v))}>
                <SelectTrigger><SelectValue placeholder="Choisir un responsable" /></SelectTrigger>
                <SelectContent>
                  {employes.map(emp => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>{emp.prenom} {emp.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantité</Label>
              <Input type="number" value={transferQuantite} min={1} onChange={(e) => setTransferQuantite(Number(e.target.value))} />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full">Transférer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Envoi en réparation */}
      <Dialog open={isReparationDialogOpen} onOpenChange={setIsReparationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer en réparation</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEnvoyerReparation} className="space-y-4">
            
            {/* Agence source */}
            <div>
              <Label>Agence source</Label>
              <Select
                value={selectedAgenceSource?.toString() || ""}
                onValueChange={(v) => {
                  setSelectedAgenceSource(Number(v));
                  setSelectedPointServiceSource(null); // reset du point de service
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une agence" />
                </SelectTrigger>
                <SelectContent>
                  {pointServices
                    .map(ps => ps.agence)              // récupérer toutes les agences uniques
                    .filter((value, index, self) => value && self.findIndex(v => v?.id === value.id) === index)
                    .map(ag => (
                      <SelectItem key={ag!.id} value={ag!.id.toString()}>
                        {ag!.nom_agence}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Point de service source */}
            <div>
              <Label>Point de service (source)</Label>
              <Select
                value={selectedPointServiceSource?.toString() || ""}
                onValueChange={(v) => setSelectedPointServiceSource(Number(v))}
                disabled={!selectedAgenceSource}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un point de service" />
                </SelectTrigger>
                <SelectContent>
                  {pointServices
                    .filter(ps => ps.agence.id === selectedAgenceSource) // filtrage par agence
                    .map(ps => (
                      <SelectItem key={ps.id} value={ps.id.toString()}>
                        {ps.nom}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Réparateur */}
            <div>
              <Label>Réparateur</Label>
              <Select
                value={reparationReparateur?.toString() || ""}
                onValueChange={v => setReparationReparateur(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un réparateur" />
                </SelectTrigger>
                <SelectContent>
                  {employes.map(emp => (
                    <SelectItem key={emp.id} value={emp.id.toString()}>
                      {emp.prenom} {emp.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description de la panne ✅ AJOUT */}
            <div>
              <Label>Description de la panne</Label>
              <Textarea
                placeholder="Décrire la panne constatée"
                value={descriptionPanne}
                onChange={(e) => setDescriptionPanne(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Envoyer
            </Button>
          </form>
        </DialogContent>
      </Dialog>


    </div>
  );
}
