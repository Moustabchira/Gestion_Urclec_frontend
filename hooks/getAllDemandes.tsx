"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import AuthService from "@/lib/services/AuthService";
import { getDemandes, createDemande, deleteDemande, generatePDF } from "@/lib/services/DemandeService";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Demande, Conge, Absence, DemandePermission, Decision, User } from "@/types/index";


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

  const [newDemande, setNewDemande] = useState({
    type: "",
    dateDebut: "",
    dateFin: "",
    motif: "",
    nbJours: "",
    duree: "",
    justification: "",
  });

  //  Récupération de l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const authService = new AuthService();
      try {
        const user = await authService.getCurrentUserFromAPI();
        setCurrentUser(user);
      } catch (error) {
        console.error("Impossible de récupérer l'utilisateur :", error);
        setCurrentUser(null);
      }
    };
    fetchCurrentUser();
  }, []);

  //  Récupération des demandes
  useEffect(() => {
    if (!currentUser) return;

    const fetchDemandes = async () => {
      try {
        const res = await getDemandes();
        const transformed: DemandeFront[] = res.data.map((d: Demande) => ({
          id: d.id,
          type: d.type,
          dateDebut: new Date(d.dateDebut).toISOString(),
          dateFin: new Date(d.dateFin).toISOString(),
          motif: d.motif,
          status: d.status,
          createdAt: new Date(d.createdAt).toISOString(),
          employee: d.user ? `${d.user.prenom} ${d.user.nom}` : "Utilisateur inconnu",
          nbJours: d.conge?.nbJours,
          duree: d.demandePermission?.duree,
          justification: d.absence?.justification,
          decisions: d.decisions,
          user: d.user,
        }));
        setDemandes(transformed);
      } catch (error) {
        console.error("Erreur lors du chargement des demandes:", error);
      }
    };
    fetchDemandes();
  }, [currentUser]);

  //  Création d'une demande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Impossible de créer la demande : utilisateur non connecté");
      return;
    }

    if (!newDemande.type || !newDemande.dateDebut || !newDemande.dateFin || !newDemande.motif) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (newDemande.type === "CONGE" && (!newDemande.nbJours || Number(newDemande.nbJours) <= 0)) {
      alert("Veuillez saisir un nombre de jours valide pour le congé");
      return;
    }

    if (newDemande.type === "PERMISSION" && !newDemande.duree) {
      alert("Veuillez saisir la durée pour la permission");
      return;
    }

    if (newDemande.type === "ABSENCE" && !newDemande.justification) {
      alert("Veuillez saisir une justification pour l'absence");
      return;
    }

    try {
      const payload: any = {
        type: newDemande.type.toLowerCase(), // <-- ici
        dateDebut: newDemande.dateDebut,
        dateFin: newDemande.dateFin,
        motif: newDemande.motif,
        status: "EN_ATTENTE",
        userId: currentUser.id,
        ...(newDemande.type === "CONGE" && { conge: { nbJours: Number(newDemande.nbJours) } }),
        ...(newDemande.type === "PERMISSION" && { demandePermission: { duree: newDemande.duree } }),
        ...(newDemande.type === "ABSENCE" && { absence: { justification: newDemande.justification } }),
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
      console.error("Erreur création demande :", error);
      alert(error?.message || "Erreur lors de la création de la demande");
    }
  };

  const handleDelete = async (demandeId: number) => {
    const confirmDelete = window.confirm("Voulez-vous vraiment supprimer cette demande ?");
    if (!confirmDelete) return;

    try {
      await deleteDemande(demandeId);
      setDemandes(prev => prev.filter(d => d.id !== demandeId));
      alert("Demande supprimée avec succès");
    } catch (error: any) {
      console.error("Erreur suppression demande :", error);
      alert(error?.message || "Impossible de supprimer la demande");
    }
  };


  // Fonctions utilitaires
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "APPROUVE":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REFUSE":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "EN_REVISION":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "APPROUVE":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "REFUSE":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "EN_REVISION":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CONGE":
        return "Congé payé";
      case "PERMISSION":
        return "Permission";
      case "ABSENCE":
        return "Absence";
      default:
        return type;
    }
  };

  // 🔍 Filtrage
  const filteredDemandes = demandes.filter((d) => {
    const matchesSearch =
      d.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.motif.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesType = typeFilter === "all" || d.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <Select value={newDemande.type} onValueChange={(value) => setNewDemande({ ...newDemande, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONGE">Congé payé</SelectItem>
                  <SelectItem value="PERMISSION">Permission</SelectItem>
                  <SelectItem value="ABSENCE">Absence</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date début</Label>
                  <Input type="date" value={newDemande.dateDebut} onChange={(e) => setNewDemande({ ...newDemande, dateDebut: e.target.value })} required />
                </div>
                <div>
                  <Label>Date fin</Label>
                  <Input type="date" value={newDemande.dateFin} onChange={(e) => setNewDemande({ ...newDemande, dateFin: e.target.value })} required />
                </div>
              </div>

              {newDemande.type === "CONGE" && <Input type="number" placeholder="Nombre de jours" value={newDemande.nbJours} onChange={(e) => setNewDemande({ ...newDemande, nbJours: e.target.value })} required />}
              {newDemande.type === "PERMISSION" && <Input placeholder="Durée" value={newDemande.duree} onChange={(e) => setNewDemande({ ...newDemande, duree: e.target.value })} required />}
              {newDemande.type === "ABSENCE" && <Textarea placeholder="Justification" value={newDemande.justification} onChange={(e) => setNewDemande({ ...newDemande, justification: e.target.value })} required />}

              <Textarea placeholder="Motif" value={newDemande.motif} onChange={(e) => setNewDemande({ ...newDemande, motif: e.target.value })} required />

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
            <Input placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="EN_ATTENTE">En attente</SelectItem>
              <SelectItem value="APPROUVE">Approuvé</SelectItem>
              <SelectItem value="REFUSE">Refusé</SelectItem>
              <SelectItem value="EN_REVISION">En révision</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="CONGE">Congé</SelectItem>
              <SelectItem value="PERMISSION">Permission</SelectItem>
              <SelectItem value="ABSENCE">Absence</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes</CardTitle>
          <CardDescription>{filteredDemandes.length} demande(s)</CardDescription>
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
              {filteredDemandes.map((d) => (
                <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>{d.employee}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-muted/50">{getTypeLabel(d.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />{" "}
                      {new Date(d.dateDebut).toLocaleDateString("fr-FR")} - {new Date(d.dateFin).toLocaleDateString("fr-FR")}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={d.motif}>{d.motif}</TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getStatusIcon(d.status)}
                    <Badge variant="outline" className={getStatusColor(d.status)}>
                      {d.status.replace("_", " ")}
                    </Badge>

                    {/* Bouton PDF seulement si approuvé */}
                    {d.status === "APPROUVE" && (
                      <Button onClick={() => generatePDF(d.id)}>Télécharger la demande</Button>
                    )}
                  </TableCell>

                  <TableCell className="text-muted-foreground">{new Date(d.createdAt).toLocaleDateString("fr-FR")}</TableCell>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
