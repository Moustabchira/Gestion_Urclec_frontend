"use client";

import { useState } from "react";
import { usePoints } from "@/hooks/use-pointService";
import {
  createPointService,
  updatePointService,
  deletePointService,
} from "@/lib/services/PointService";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Plus, Search, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { PointDeService as PointService } from "@/types";
import { useAgences } from "@/hooks/use-agence";

export default function PointsDeService() {
  const { points, isLoading, refresh } = usePoints();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogEdit, setIsDialogEdit] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [newPoint, setNewPoint] = useState({ nom: "", agenceId: 0 });
  const [selectedPoint, setSelectedPoint] = useState<PointService | null>(null);

  const { agences, isLoading: loadingAgences } = useAgences(1, 9999);


  // CREATE
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPointService(newPoint);
      setIsDialogOpen(false);
      setNewPoint({ nom: "", agenceId: 0 });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // UPDATE
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoint) return;

    try {
      await updatePointService(selectedPoint.id, {
        nom: selectedPoint.nom,
        agenceId: selectedPoint.agenceId,
      });
      setIsDialogEdit(false);
      setSelectedPoint(null);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // DELETE
  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous supprimer ce point de service ?")) return;

    try {
      await deletePointService(id);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };


  const getAgenceName = (id: number) => {
    const agence = agences.find(a => a.id === id);
    return agence ? agence.nom_agence : "—";
    };

  // Filtering local
  const filtered = points.filter((p) =>
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Points de Service</h1>

      {/* Search + Add */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un point..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Nouveau Point
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau Point de Service</DialogTitle>
              <DialogDescription>Créer un nouveau point</DialogDescription>
            </DialogHeader>

            <form className="space-y-4" onSubmit={handleCreate}>
              <div>
                <Label>Nom</Label>
                <Input
                  value={newPoint.nom}
                  onChange={(e) => setNewPoint({ ...newPoint, nom: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Agence</Label>

                {loadingAgences ? (
                    <p>Chargement des agences...</p>
                ) : (
                    <select
                    className="w-full border p-2 rounded"
                    value={newPoint.agenceId}
                    onChange={(e) =>
                        setNewPoint({ ...newPoint, agenceId: Number(e.target.value) })
                    }
                    required
                    >
                    <option value="">-- Sélectionner une agence --</option>

                    {agences.map((agence) => (
                        <option key={agence.id} value={agence.id}>
                        {agence.nom_agence}
                        </option>
                    ))}
                    </select>
                )}
                </div>


              <div className="flex gap-2 pt-4">
                <Button className="flex-1" type="submit">Créer</Button>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des points</CardTitle>
          <CardDescription>{filtered.length} point(s)</CardDescription>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Agence</TableHead>
                  <TableHead>Date de création</TableHead> 
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.nom}</TableCell>
                    <TableCell>
                    {loadingAgences ? "Chargement..." : getAgenceName(p.agenceId)}
                    </TableCell>
                    <TableCell>
                      {new Date(p.createdAt).toLocaleDateString()} 
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={() => {
                              setSelectedPoint(p);
                              setIsDialogEdit(true);
                            }}
                          >
                            <Edit className="w-4 h-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive cursor-pointer gap-2"
                            onClick={() => handleDelete(p.id)}
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
        </CardContent>
      </Card>

      {/* EDIT DIALOG */}
      <Dialog open={isDialogEdit} onOpenChange={setIsDialogEdit}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le point</DialogTitle>
          </DialogHeader>

          {selectedPoint && (
            <form className="space-y-4" onSubmit={handleUpdate}>
              <div>
                <Label>Nom</Label>
                <Input
                  value={selectedPoint.nom}
                  onChange={(e) =>
                    setSelectedPoint({ ...selectedPoint, nom: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Agence</Label>

                {loadingAgences ? (
                    <p>Chargement...</p>
                ) : (
                    <select
                    className="w-full border p-2 rounded"
                    value={selectedPoint.agenceId}
                    onChange={(e) =>
                        setSelectedPoint({
                        ...selectedPoint,
                        agenceId: Number(e.target.value),
                        })
                    }
                    >
                    {agences.map((agence) => (
                        <option key={agence.id} value={agence.id}>
                        {agence.nom_agence}
                        </option>
                    ))}
                    </select>
                )}
                </div>


              <div className="flex gap-2">
                <Button className="flex-1" type="submit">Modifier</Button>
                <Button variant="outline" onClick={() => setIsDialogEdit(false)}>Annuler</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
