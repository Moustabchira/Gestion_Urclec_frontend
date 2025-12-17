"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search } from "lucide-react";

import AuthService from "@/lib/services/AuthService";
import { getDemandes } from "@/lib/services/DemandeService";
import { Demande, User, Decision } from "@/types/index";

interface DemandeFront {
  id: number;
  type: string;
  dateDebut: string;
  dateFin: string;
  motif: string;
  status: string;
  createdAt: string;
  nbJours?: number;
  duree?: string;
  justification?: string;
  decisions?: Decision[];
}

export default function MesDemandes() {
  const [demandes, setDemandes] = useState<DemandeFront[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const authService = new AuthService();
      try {
        const user = await authService.getCurrentUserFromAPI();
        setCurrentUser(user);
      } catch (error) {
        console.error("Impossible de récupérer l'utilisateur :", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleDownload = async (demandeId: number) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/demandes/${demandeId}/pdf`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du PDF");
      }

      // Récupérer le blob (fichier binaire)
      const blob = await response.blob();

      // Créer un lien temporaire pour le téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `demande_${demandeId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur de téléchargement :", error);
      alert("Impossible de télécharger le fichier pour le moment.");
    }
  };


  useEffect(() => {
    if (!currentUser) return;

    const fetchMesDemandes = async () => {
      try {
        const res = await getDemandes();
        // On ne garde que les demandes de l'utilisateur connecté
        const filtered = res.data
          .filter((d: Demande) => d.user?.id === currentUser.id)
          .map((d: Demande) => ({
            id: d.id,
            type: d.type,
            dateDebut: new Date(d.dateDebut).toISOString(),
            dateFin: new Date(d.dateFin).toISOString(),
            motif: d.motif,
            status: d.status,
            createdAt: new Date(d.createdAt).toISOString(),
            nbJours: d.conge?.nbJours,
            duree: d.demandePermission?.duree,
            justification: d.absence?.justification,
            decisions: d.decisions,
          }));
        setDemandes(filtered);
      } catch (error) {
        console.error("Erreur lors du chargement des demandes:", error);
      }
    };
    fetchMesDemandes();
  }, [currentUser]);

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

   const filteredDemandes = demandes.filter((d) => {
    const matchesSearch =
      d.motif.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    const matchesType = typeFilter === "all" || d.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType ;
  });


  return (
    <div className="space-y-6">
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
      <Card>
        <CardHeader>
          <CardTitle>Mes demandes</CardTitle>
          <CardDescription>{demandes.length} demande(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead> {/* ✅ nouvelle colonne */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {demandes.map((d) => (
                <TableRow key={d.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(d.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {new Date(d.dateDebut).toLocaleDateString("fr-FR")} -{" "}
                      {new Date(d.dateFin).toLocaleDateString("fr-FR")}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={d.motif}>
                    {d.motif}
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    {getStatusIcon(d.status)}
                    <Badge variant="outline" className={getStatusColor(d.status)}>
                      {d.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(d.createdAt).toLocaleDateString("fr-FR")}</TableCell>

                  {/* ✅ Toujours visible */}
                  <TableCell>
                    <button
                      onClick={() => handleDownload(d.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Télécharger
                    </button>
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
