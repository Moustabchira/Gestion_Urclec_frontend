"use client";

import { useState } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import { Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { createPoste, updatePoste, deletePoste } from "@/lib/services/PosteService";
import { usePostes } from "@/hooks/use-poste";

export default function Postes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState<any | null>(null);
  const [newPoste, setNewPoste] = useState({ nom: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const {
    postes,
    isLoading,
    page,
    lastPage,
    nextPage,
    prevPage,
    setSearchTerm: setHookSearchTerm,
    refresh,
  } = usePostes();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHookSearchTerm(e.target.value); // met à jour le hook
  };

  // Création
  const handleCreatePoste = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPoste(newPoste);
      setNewPoste({ nom: "" });
      setIsDialogOpen(false);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  // Modification
  const handleUpdatePoste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoste) return;
    try {
      await updatePoste(selectedPoste.id, { nom: selectedPoste.nom });
      setSelectedPoste(null);
      setIsEditDialogOpen(false);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  // Suppression
  const handleDeletePoste = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce poste ?")) return;
    try {
      await deletePoste(id);
      refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestion des postes</h1>

      {/* Recherche et création */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un poste..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        {/* Dialog création */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nouveau poste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau poste</DialogTitle>
              <DialogDescription>Ajoutez un nouveau poste</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePoste} className="space-y-4">
              <div>
                <Label htmlFor="nom">Nom du poste</Label>
                <Input
                  id="nom"
                  value={newPoste.nom}
                  onChange={(e) => setNewPoste({ ...newPoste, nom: e.target.value })}
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

      {/* Liste des postes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des postes</CardTitle>
          <CardDescription>{postes.length} poste(s)</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {postes.map((poste) => (
                    <TableRow key={poste.id}>
                      <TableCell>{poste.nom}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {poste.createdAt.toLocaleDateString()}
                      </TableCell>
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
                                setSelectedPoste(poste);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" /> Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive flex items-center gap-2 cursor-pointer"
                              onClick={() => handleDeletePoste(poste.id)}
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

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <Button onClick={prevPage} disabled={page === 1}>Précédent</Button>
                <span>Page {page} / {lastPage}</span>
                <Button onClick={nextPage} disabled={page === lastPage}>Suivant</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le poste</DialogTitle>
            <DialogDescription>Mettre à jour les informations du poste</DialogDescription>
          </DialogHeader>
          {selectedPoste && (
            <form onSubmit={handleUpdatePoste} className="space-y-4">
              <div>
                <Label htmlFor="edit_nom">Nom</Label>
                <Input
                  id="edit_nom"
                  value={selectedPoste.nom}
                  onChange={(e) =>
                    setSelectedPoste({ ...selectedPoste, nom: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Modifier</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}