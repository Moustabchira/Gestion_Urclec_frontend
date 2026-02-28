"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { createAgence, deleteAgence, updateAgence } from "@/lib/services/AgenceService";
import { useAgences } from "@/hooks/use-agence";
import { usePagination } from "@/hooks/use-pagination";

export default function Agences() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newAgence, setNewAgence] = useState({ nom_agence: "", ville: "" });
  const [selectedAgence, setSelectedAgence] = useState<any | null>(null);

  const {
  agences,
  isLoading,
  page,
  lastPage,
  nextPage,
  prevPage,
  refresh,
} = useAgences();

  // 🔹 Création
  const handleCreateAgence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAgence({ ...newAgence, archive: false });
      setNewAgence({ nom_agence: "", ville: "" });
      setIsDialogOpen(false);
      refresh();
    } catch (error) {
      console.error("Erreur lors de la création de l'agence:", error);
    }
  };

  // 🔹 Suppression
  const handleDeleteAgence = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette agence ?")) return;
    try {
      await deleteAgence(id);
      refresh();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'agence:", error);
    }
  };

  // 🔹 Modification
  const handleUpdateAgence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgence) return;
    try {
      await updateAgence(selectedAgence.id, {
        nom_agence: selectedAgence.nom_agence,
        ville: selectedAgence.ville,
      });
      setIsEditDialogOpen(false);
      setSelectedAgence(null);
      refresh();
    } catch (error) {
      console.error("Erreur lors de la modification de l'agence:", error);
    }
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des agences</h1>

      {/* Recherche et création */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une agence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Dialog création */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nouvelle agence
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle agence</DialogTitle>
              <DialogDescription>Créez une nouvelle agence</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAgence} className="space-y-4">
              <div>
                <Label htmlFor="nom_agence">Nom de l'agence</Label>
                <Input
                  id="nom_agence"
                  value={newAgence.nom_agence}
                  onChange={(e) => setNewAgence({ ...newAgence, nom_agence: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ville">Ville</Label>
                <Input
                  id="ville"
                  value={newAgence.ville}
                  onChange={(e) => setNewAgence({ ...newAgence, ville: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Créer</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste agences */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des agences</CardTitle>
          <CardDescription>{agences.length} agence(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agences.map((agence) => (
                  <TableRow key={agence.id}>
                    <TableCell>{agence.nom_agence}</TableCell>
                    <TableCell>{agence.code_agence}</TableCell>
                    <TableCell>{agence.ville}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(agence.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setSelectedAgence(agence);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive flex items-center gap-2 cursor-pointer"
                            onClick={() => handleDeleteAgence(agence.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex justify-between items-center mt-4">
            <Button onClick={prevPage} disabled={page === 1}>
              Précédent
            </Button>

            <span>
              Page {page} / {lastPage}
            </span>

            <Button onClick={nextPage} disabled={page === lastPage}>
              Suivant
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier agence</DialogTitle>
            <DialogDescription>Mettre à jour les informations</DialogDescription>
          </DialogHeader>
          {selectedAgence && (
            <form onSubmit={handleUpdateAgence} className="space-y-4">
              <div>
                <Label htmlFor="edit_nom_agence">Nom</Label>
                <Input
                  id="edit_nom_agence"
                  value={selectedAgence.nom_agence}
                  onChange={(e) => setSelectedAgence({ ...selectedAgence, nom_agence: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit_ville">Ville</Label>
                <Input
                  id="edit_ville"
                  value={selectedAgence.ville}
                  onChange={(e) => setSelectedAgence({ ...selectedAgence, ville: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Modifier</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
