"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash,
  MoreHorizontal,
  Megaphone,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import AuthService from "@/lib/services/AuthService";
import { Evenement, User, RoleName } from "@/types/index";
import * as EvenementService from "@/lib/services/EvenementService";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Assure-toi que l'interface User est correcte
const userHasRole = (user: User | null, roleSlug: RoleName) =>
  user?.roles?.some(r => r.toLowerCase() === roleSlug.toLowerCase());



const ROLE_DRH: RoleName = "DRH";

export default function EvenementList() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvenement, setSelectedEvenement] = useState<Evenement | null>(null);
  const [formData, setFormData] = useState<Partial<Evenement> & { images?: File[] }>({
    titre: "",
    description: "",
    archive: false,
    dateDebut: "",
    dateFin: "",
    images: [],
  });
  const [dateError, setDateError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "EN_ATTENTE" | "PUBLIE">("all");
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Pour le changement de statut
  const [isStatutDialogOpen, setIsStatutDialogOpen] = useState(false);
  const [statutSelected, setStatutSelected] = useState<"EN_ATTENTE" | "PUBLIE">("EN_ATTENTE");
  const [evenementForStatut, setEvenementForStatut] = useState<Evenement | null>(null);

  // States pour les filtres par période
  const [periodeDebut, setPeriodeDebut] = useState<string>("");
  const [periodeFin, setPeriodeFin] = useState<string>("");

  // Ouvrir le dialog de changement de statut
 const openStatutDialog = (ev: Evenement) => {
  setEvenementForStatut(ev);
  setStatutSelected("PUBLIE"); // Toujours PUBLIE, plus EN_ATTENTE
  setIsStatutDialogOpen(true);
};


  console.log("Roles de l'utilisateur:", currentUser?.roles);
  console.log("DRH ?", userHasRole(currentUser, ROLE_DRH));


  // Charger l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const authService = new AuthService();
        const user = await authService.getCurrentUserFromAPI();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  // Charger les événements
const fetchEvenements = async () => {
  if (!currentUser) return;

  try {
    setLoading(true);

    const filters = {
      titre: searchTerm || undefined,
      description: undefined,
      archive: undefined,
      userRole: currentUser.roles[0], // 🔹 Très important
    };

    console.log("Filtres envoyés au backend :", filters);

    const res = await EvenementService.getEvenements(filters);
    console.log("Événements reçus :", res);
    setEvenements(res);

  } catch (error) {
    console.error("Erreur fetchEvenements:", error);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchEvenements();
  }, [currentUser, searchTerm, statusFilter]);

  // Créer / Modifier un événement
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!currentUser) return alert("Vous devez être connecté");

  if (dateError) return alert(dateError);

  try {
    const fd = new FormData();
    fd.append("titre", formData.titre!);
    fd.append("description", formData.description!);
    fd.append("userId", currentUser.id.toString());
    fd.append("archive", String(formData.archive || false));
    fd.append("userRole", currentUser.roles[0]); // 🔥 Très important !

    if (formData.dateDebut) fd.append("dateDebut", formData.dateDebut);
    if (formData.dateFin) fd.append("dateFin", formData.dateFin);

    if (formData.images && formData.images.length > 0) {
      formData.images.forEach(file => fd.append("images", file));
    }

    let response: Evenement;
    if (selectedEvenement) {
      response = await EvenementService.updateEvenement(selectedEvenement.id, fd);
    } else {
      response = await EvenementService.createEvenement(fd);
    }

    setIsDialogOpen(false);
    setSelectedEvenement(null);
    setFormData({
      titre: "",
      description: "",
      archive: false,
      dateDebut: "",
      dateFin: "",
      images: []
    });
    setPreviewImages([]);
    fetchEvenements();

  } catch (err: any) {
    alert(err.message || "Erreur lors de la création/mise à jour");
  }
};


  // Modifier
  const handleEdit = (ev: Evenement) => {
    setSelectedEvenement(ev);
    setFormData({
      titre: ev.titre,
      description: ev.description,
      archive: ev.archive,
      dateDebut: ev.dateDebut ? new Date(ev.dateDebut).toISOString().slice(0, 16) : "",
      dateFin: ev.dateFin ? new Date(ev.dateFin).toISOString().slice(0, 16) : "",
      images: [],
    });

    if (ev.images && ev.images.length > 0) {
      const allImageUrls = ev.images.map((img) => `${API_URL}/uploads/${img}`);
      setPreviewImages(allImageUrls);
    } else {
      setPreviewImages([]);
    }
    setDateError("");
    setIsDialogOpen(true);
  };

 const handleDelete = async (id: number | string) => {
  if (!currentUser) return;

  const confirm = window.confirm("Voulez-vous vraiment supprimer cet événement ?");
  if (!confirm) return;

  try {
    await EvenementService.deleteEvenement(id, currentUser.roles[0]); // 🔹 rôle envoyé
    setEvenements((prev) => prev.filter((ev) => ev.id !== id));
  } catch (error) {
    alert("Impossible de supprimer l'événement");
  }
};



  // Changer statut
  const handleChangeStatut = async () => {
  if (!evenementForStatut || !currentUser) return;
  try {
    const updated = await EvenementService.changeStatut(
      evenementForStatut.id,
      currentUser.id,
      statutSelected,
      currentUser.roles[0] // ← envoyer le role ici
    );
    setEvenements((prev) =>
      prev.map((ev) => (ev.id === updated.id ? updated : ev))
    );
    setIsStatutDialogOpen(false);
    setEvenementForStatut(null);
  } catch (error) {
    console.error(error);
    alert("Impossible de changer le statut");
  }
};



  // Filtrer événements
  const filteredEvents = evenements.filter((ev) => {
  if (!currentUser) return false;

  // Non DRH → seulement PUBLIE
  if (!userHasRole(currentUser, ROLE_DRH) && ev.statut !== "PUBLIE") return false;

  // Filtre DRH selon statusFilter
  const matchesStatus = userHasRole(currentUser, ROLE_DRH)
    ? (statusFilter === "all" ? true : ev.statut === statusFilter)
    : true;

  // Filtre par titre
  const matchesSearch = ev.titre.toLowerCase().includes(searchTerm.toLowerCase());

  // Filtre par période
  let matchesPeriode = true;
  const evDebut = ev.dateDebut ? new Date(ev.dateDebut) : null;
  const evFin = ev.dateFin ? new Date(ev.dateFin) : null;
  const startFilter = periodeDebut ? new Date(periodeDebut) : null;
  const endFilter = periodeFin ? new Date(periodeFin) : null;

  if (startFilter && evFin) matchesPeriode = matchesPeriode && evFin >= startFilter;
  if (endFilter && evDebut) matchesPeriode = matchesPeriode && evDebut <= endFilter;

  return matchesSearch && matchesStatus && matchesPeriode;
});




  // Couleurs statuts
  const getStatusColor = (statut?: string) => {
    switch (statut) {
      case "EN_ATTENTE": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PUBLIE": return "bg-blue-100 text-blue-800 border-blue-200";
      case "ARCHIVE": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des événements</h1>
          <p className="text-muted-foreground mt-2">Créez, modifiez et supprimez vos événements</p>
        </div>
        {userHasRole(currentUser, ROLE_DRH) && (
          <Button
            onClick={() => {
              setIsDialogOpen(true);
              setSelectedEvenement(null);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" /> Nouvel événement
          </Button>
        )}

      </div>

      {/* Dialog Form */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvenement ? "Modifier l'événement" : "Créer un événement"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Titre</Label><Input value={formData.titre || ""} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} required /></div>
            <div><Label>Description</Label><Textarea value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required /></div>
            <div><Label>Date de début</Label><Input type="datetime-local" value={formData.dateDebut || ""} onChange={(e) => { const newStart = e.target.value; setFormData({ ...formData, dateDebut: newStart }); if (formData.dateFin && new Date(newStart) >= new Date(formData.dateFin)) setDateError("La date de début doit être avant la date de fin"); else setDateError(""); }} required /></div>
            <div><Label>Date de fin</Label><Input type="datetime-local" value={formData.dateFin || ""} onChange={(e) => { const newEnd = e.target.value; setFormData({ ...formData, dateFin: newEnd }); if (formData.dateDebut && new Date(formData.dateDebut) >= new Date(newEnd)) setDateError("La date de fin doit être après la date de début"); else setDateError(""); }} required /></div>
            {dateError && <p className="text-red-600 text-sm">{dateError}</p>}
            <div>
              <Label>Images</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  setFormData({ ...formData, images: files });
                  const previews = files.map((file) => URL.createObjectURL(file));
                  setPreviewImages(previews);
                }}
              />
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {previewImages.map((src, i) => (
                    <img key={i} src={src} alt={`preview-${i}`} className="w-full h-24 object-cover rounded border" />
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">{selectedEvenement ? "Mettre à jour" : "Créer"}</Button>
              <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setSelectedEvenement(null); setDateError(""); setPreviewImages([]); }}>Annuler</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Changement de statut */}
      <Dialog open={isStatutDialogOpen} onOpenChange={setIsStatutDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={statutSelected}
              onValueChange={(v) => setStatutSelected(v as "PUBLIE")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIE">PUBLIE</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 pt-4 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsStatutDialogOpen(false);
                  setEvenementForStatut(null);
                }}
              >
                Annuler
              </Button>
              <Button onClick={handleChangeStatut}>Valider</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      {/* Filtres */}
      <Card className="border-border/50">
        <CardContent className="pt-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label className="sr-only">Rechercher par titre</Label>
            <Input placeholder="Rechercher par titre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="min-w-[300px] flex flex-col gap-1">
            <Label>Période</Label>
            <div className="flex gap-2">
              <Input type="date" value={periodeDebut} onChange={(e) => setPeriodeDebut(e.target.value)} placeholder="Début" />
              <Input type="date" value={periodeFin} onChange={(e) => setPeriodeFin(e.target.value)} placeholder="Fin" />
            </div>
          </div>

          <div className="min-w-[150px]">
            <Label className="sr-only">Statut</Label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "EN_ATTENTE" | "PUBLIE")}>
              <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="EN_ATTENTE">EN_ATTENTE</SelectItem>
                <SelectItem value="PUBLIE">PUBLIE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Événements</CardTitle>
          <CardDescription>{filteredEvents.length} événement(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.titre}</TableCell>
                  <TableCell>
                    {ev.images && ev.images.length > 0 ? (
                      <img src={`${API_URL}/uploads/${ev.images[0]}`} alt="event" className="w-16 h-16 object-cover rounded" />
                    ) : "-"}
                  </TableCell>
                  <TableCell>{ev.description.length > 50 ? `${ev.description.slice(0, 50)}...` : ev.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(ev.statut)}>{ev.statut || "EN_ATTENTE"}</Badge>
                  </TableCell>
                  <TableCell>
                    {ev.dateDebut && ev.dateFin
                      ? `${new Date(ev.dateDebut).toLocaleString("fr-FR")} → ${new Date(ev.dateFin).toLocaleString("fr-FR")}`
                      : "-"}
                  </TableCell>
                  <TableCell>{new Date(ev.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {userHasRole(currentUser, ROLE_DRH) && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(ev)}>
                              <Edit className="w-4 h-4 mr-2" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(ev.id)}>
                              <Trash className="w-4 h-4 mr-2" /> Supprimer
                            </DropdownMenuItem>
                            {ev.statut === "EN_ATTENTE" && (
                              <DropdownMenuItem onClick={() => openStatutDialog(ev)}>
                                <Megaphone className="w-4 h-4 mr-2" /> Publier
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        {/* Le bouton "Voir détail" est toujours visible */}
                        <DropdownMenuItem asChild>
                            <a href={`/dashboard/evenements/${ev.id}`} className="flex items-center">
                              <span className="mr-2">🔍</span> Voir détail
                            </a>
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEvents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Aucun événement trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

