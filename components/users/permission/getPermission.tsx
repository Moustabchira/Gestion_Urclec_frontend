"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LockKeyhole, Trash2, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { getPermissions, deletePermission } from "@/lib/services/PermissionService";
import { Permission } from "@/types/index";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePagination } from "@/hooks/use-pagination";

export default function Permissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [sortAsc, setSortAsc] = useState(true);
  const {
  page,
  limit,
  lastPage,
  setLastPage,
  nextPage,
  prevPage,
} = usePagination({ initialLimit: 10 });


  const fetchPermissions = async () => {
    try {
      const res = await getPermissions();
      setPermissions(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des permissions:", error);
    }
  };

  useEffect(() => {
  const fetchData = async () => {
    const res = await getPermissions({ page, limit });
    setPermissions(res.data);
    setLastPage(res.meta?.lastPage || 1);
  };

  fetchData();
}, [page]);


  // Méthode pour supprimer une permission
  const handleDeletePermission = async (id: number) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette permission ?")) return;

    try {
      await deletePermission(id);
      setPermissions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Tri par date
  const handleSortByDate = () => {
    const sorted = [...permissions].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
    setPermissions(sorted);
    setSortAsc(!sortAsc);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Liste des permissions</h1>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>{permissions.length} permission(s) trouvée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead onClick={handleSortByDate} className="cursor-pointer">
                  <div className="flex items-center gap-1">
                    Créé le
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <LockKeyhole className="w-5 h-5 text-red-800" />
                      <span className="font-medium">{permission.nom}</span>
                    </div>
                  </TableCell>
                  <TableCell>{permission.slug}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {permission.createdAt
                      ? new Date(permission.createdAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="bg-transparent p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive flex items-center gap-2 cursor-pointer"
                          onClick={() => handleDeletePermission(permission.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">

            <button
              disabled={page === 1}
              onClick={prevPage}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Précédent
            </button>

            <span className="text-sm text-muted-foreground">
              Page {page} sur {lastPage}
            </span>
            
            <button
              disabled={page === lastPage}
              onClick={nextPage}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
