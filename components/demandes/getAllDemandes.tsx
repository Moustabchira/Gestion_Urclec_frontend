"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import AuthService from "@/lib/services/AuthService";
import { getDemandes, createDemande, deleteDemande, generatePDF } from "@/lib/services/DemandeService";
import { Demande, Decision, User } from "@/types/index";
import { usePagination } from "@/hooks/use-pagination";

interface DemandeFront {
  id: number;
  type: string;
  dateDebut: string;
  dateFin: string;
  motif: string;
  status: string;
  createdAt: string;
  employee: string;
  nbJours?: number;
  duree?: string;
  justification?: string;
  decisions?: Decision[];
  user?: User;
}

export default function DemandeList() {
  const [demandes, setDemandes] = useState<DemandeFront[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [agenceFilter, setAgenceFilter] = useState("all");

  const [newDemande, setNewDemande] = useState({
    type: "",
    dateDebut: "",
    dateFin: "",
    motif: "",
    nbJours: "",
    duree: "",
    justification: "",
  });

  const {
  page,
  limit,
  lastPage,
  setLastPage,
  nextPage,
  prevPage,
} = usePagination({ initialPage: 1, initialLimit: 10 });

  // 🔹 Récupération utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const authService = new AuthService();
      try {
        const user = await authService.getCurrentUserFromAPI();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  const extractRoles = (user: User): string[] => {
    if (!user.roles) return [];
    return user.roles
      .map(r => (typeof r === "string" ? r : r?.role?.nom))
      .filter((r): r is string => !!r)
      .map(r => r.toUpperCase());
  };

  // 🔹 Filtrer les demandes selon rôle et workflow
  const filterByRoleAndWorkflow = (allDemandes: DemandeFront[], user: User) => {
    const roles = extractRoles(user);
    return allDemandes.filter(d => {
      const decisions = d.decisions ?? [];

      // EMPLOYE → ses propres demandes
      if (roles.includes("EMPLOYE") && d.user?.id === user.id) return true;

      // CHEF → demandes de ses subordonnés
      if (d.user?.chefId === user.id) return true;

      // DRH → demandes approuvées par CHEF et en attente
      if (roles.includes("DRH")) {
        const chefApproved = decisions.find(d => d.niveau === "CHEF" && d.status === "APPROUVE");
        const drhPending = decisions.find(d => d.niveau === "DRH" && d.status === "EN_ATTENTE");
        if (chefApproved && (!drhPending || drhPending.status === "EN_ATTENTE")) return true;
      }

      // DG → demandes approuvées par DRH et en attente
      if (roles.includes("DG")) {
        const drhApproved = decisions.find(d => d.niveau === "DRH" && d.status === "APPROUVE");
        const dgPending = decisions.find(d => d.niveau === "DG" && d.status === "EN_ATTENTE");
        if (drhApproved && (!dgPending || dgPending.status === "EN_ATTENTE")) return true;
      }

      return false;
    });
  };

  // 🔹 Construire workflow pour utilisateur
  const getWorkflowForUser = (demande: DemandeFront) => {
    const decisions = demande.decisions ?? [];

    const getStatus = (niveau: string) => {
      const related = decisions.filter(d => d.niveau === niveau);

      if (related.some(d => d.status === "REFUSE")) return "REFUSE";
      if (related.length > 0 && related.every(d => d.status === "APPROUVE")) return "APPROUVE";

      return "EN_ATTENTE";
    };

    return [
      { niveau: "CHEF", status: getStatus("CHEF") },
      { niveau: "DRH", status: getStatus("DRH") },
      { niveau: "DG", status: getStatus("DG") },
    ];
  };



  useEffect(() => {
  if (!currentUser) return;

  const fetchDemandes = async () => {
    try {
      const res = await getDemandes({
        page,
        limit,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      });

      // ✅ très important
      setLastPage(res.meta.lastPage);

      const transformed: DemandeFront[] = res.data.map(d => ({
        id: d.id,
        type: d.type,
        dateDebut: new Date(d.dateDebut).toISOString(),
        dateFin: new Date(d.dateFin).toISOString(),
        motif: d.motif,
        status: d.status,
        createdAt: new Date(d.createdAt).toISOString(),
        employee: d.user
          ? `${d.user.prenom} ${d.user.nom}`
          : "Utilisateur inconnu",
        nbJours: d.conge?.nbJours,
        duree: d.demandePermission?.duree,
        justification: d.absence?.justification,
        decisions: d.decisions,
        user: d.user,
      }));

      setDemandes(filterByRoleAndWorkflow(transformed, currentUser));

    } catch (error) {
      console.error(error);
    }
  };

  fetchDemandes();
}, [currentUser, page, statusFilter, typeFilter]);
  // 🔹 Calcul nbJours automatique
  useEffect(() => {
    if (newDemande.type === "CONGE" && newDemande.dateDebut && newDemande.dateFin) {
      const diff = (new Date(newDemande.dateFin).getTime() - new Date(newDemande.dateDebut).getTime()) / (1000*60*60*24) + 1;
      setNewDemande(prev => ({ ...prev, nbJours: diff.toString() }));
    } else setNewDemande(prev => ({ ...prev, nbJours: "" }));
  }, [newDemande.dateDebut, newDemande.dateFin, newDemande.type]);

  // 🔹 Création d'une demande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return alert("Utilisateur non connecté");
    if (!newDemande.type || !newDemande.dateDebut || !newDemande.dateFin || !newDemande.motif)
      return alert("Veuillez remplir tous les champs");

    try {
      const payload: any = {
        type: newDemande.type.toLowerCase(),
        dateDebut: newDemande.dateDebut,
        dateFin: newDemande.dateFin,
        motif: newDemande.motif,
        userId: currentUser.id,
        nbJours: newDemande.type === "CONGE" ? Number(newDemande.nbJours) : undefined,
        duree: newDemande.type === "PERMISSION" ? newDemande.duree : undefined,
        justification: newDemande.type === "ABSENCE" ? newDemande.justification : undefined,
      };

      const res = await createDemande(payload);
      const newEntry: DemandeFront = {
        ...res,
        employee: `${currentUser.prenom} ${currentUser.nom}`,
        dateDebut: new Date(res.dateDebut).toISOString(),
        dateFin: new Date(res.dateFin).toISOString(),
        createdAt: new Date(res.createdAt).toISOString(),
        nbJours: res.conge?.nbJours,
        duree: res.demandePermission?.duree,
        justification: res.absence?.justification,
        decisions: res.decisions,
        user: res.user,
      };
      setDemandes([...demandes, newEntry]);
      setNewDemande({ type: "", dateDebut: "", dateFin: "", motif: "", nbJours: "", duree: "", justification: "" });
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Erreur lors de la création");
    }
  };

  // 🔹 Suppression
  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette demande ?")) return;
    try {
      await deleteDemande(id);
      setDemandes(demandes.filter(d => d.id !== id));
      alert("Demande supprimée");
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "Impossible de supprimer");
    }
  };


  const agences = Array.from(
    new Set(
      demandes.filter(d => d.user?.agence).map(d => d.user!.agence!.nom_agence)
    )
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EN_ATTENTE": return <Clock className="w-4 h-4 text-yellow-600" />;
      case "APPROUVE": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REFUSE": return <XCircle className="w-4 h-4 text-red-600" />;
      case "EN_REVISION": return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "APPROUVE": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "REFUSE": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "EN_REVISION": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CONGE": return "Congé payé";
      case "PERMISSION": return "Permission";
      case "ABSENCE": return "Absence";
      default: return type;
    }
  };

    return (
    <div className="space-y-6">
      {/* Header et création */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des demandes</h1>
          <p className="text-muted-foreground mt-2">Gérez les demandes de congés, permissions et absences</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nouvelle demande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle demande</DialogTitle>
              <DialogDescription>Créez une nouvelle demande</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Label>Type</Label>
              <Select value={newDemande.type} onValueChange={value => setNewDemande({ ...newDemande, type: value })}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez un type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONGE">Congé payé</SelectItem>
                  <SelectItem value="PERMISSION">Permission</SelectItem>
                  <SelectItem value="ABSENCE">Absence</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date début</Label>
                  <Input type="date" value={newDemande.dateDebut} onChange={e => setNewDemande({ ...newDemande, dateDebut: e.target.value })} required />
                </div>
                <div>
                  <Label>Date fin</Label>
                  <Input type="date" value={newDemande.dateFin} onChange={e => setNewDemande({ ...newDemande, dateFin: e.target.value })} required />
                </div>
              </div>

              {newDemande.type === "CONGE" && <div><Label>Nombre de jours</Label><Input type="number" value={newDemande.nbJours} readOnly /></div>}
              {newDemande.type === "PERMISSION" && <Input placeholder="Durée" value={newDemande.duree} onChange={e => setNewDemande({ ...newDemande, duree: e.target.value })} required />}
              {newDemande.type === "ABSENCE" && <Textarea placeholder="Justification" value={newDemande.justification} onChange={e => setNewDemande({ ...newDemande, justification: e.target.value })} required />}

              <Textarea placeholder="Motif" value={newDemande.motif} onChange={e => setNewDemande({ ...newDemande, motif: e.target.value })} required />

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Créer</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <Card className="border-border/50">
        <CardContent className="pt-6 flex gap-4 flex-wrap">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="EN_ATTENTE">En attente</SelectItem>
              <SelectItem value="APPROUVE">Approuvé</SelectItem>
              <SelectItem value="REFUSE">Refusé</SelectItem>
              <SelectItem value="EN_REVISION">En révision</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="CONGE">Congé</SelectItem>
              <SelectItem value="PERMISSION">Permission</SelectItem>
              <SelectItem value="ABSENCE">Absence</SelectItem>
            </SelectContent>
          </Select>

          <Select value={agenceFilter} onValueChange={setAgenceFilter}>
            <SelectTrigger><SelectValue placeholder="Agence" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les agences</SelectItem>
              {agences.map(ag => <SelectItem key={ag} value={ag}>{ag}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes</CardTitle>
          <CardDescription>{demandes.length} demande(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demandes.map(d => (
                <TableRow key={d.id}>
                  <TableCell>{d.employee}</TableCell>
                  <TableCell>{getTypeLabel(d.type)}</TableCell>
                  <TableCell>{d.dateDebut.split("T")[0]} → {d.dateFin.split("T")[0]}</TableCell>
                  <TableCell>{d.motif}</TableCell>
                  <TableCell>
                    {getWorkflowForUser(d).map((w, i) => (
                      <Badge key={i} className={getStatusColor(w.status)}>
                        {w.niveau}: {w.status}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>{d.createdAt.split("T")[0]}</TableCell>
                  <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal className="w-4 h-4 cursor-pointer" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => window.location.href = `/dashboard/demandes/${d.id}`}>
                            <Eye className="w-4 h-4 mr-2" /> Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(d.id)}>
                            <Trash className="w-4 h-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <button onClick={() => generatePDF(d.id)} className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" /> Télécharger PDF
                            </button>
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

            <span>
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
    </div>
  );
}
