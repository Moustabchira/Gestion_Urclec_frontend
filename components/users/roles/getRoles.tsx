"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, ShieldCheck, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command";

import { getRoles, createRole, deleteRole, updateRole } from "@/lib/services/RoleService";
import { getPermissions } from "@/lib/services/PermissionService";
import { Role, Permission } from "@/types/index";

interface NewRolePayload {
  nom: string;
  permissionIds: number[];
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<NewRolePayload>({
    nom: "",
    permissionIds: [],
  });
  const [editingRole, setEditingRole] = useState<NewRolePayload & { id: number } | null>(null);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [limit] = useState(10);


  // Charger les rôles
  const fetchRolesData = async () => {
  try {
    const res = await getRoles({
      page,
      limit,
      nom: searchTerm || undefined,
    });

    setRoles(res.data);
    setLastPage(res.meta?.lastPage || 1);
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error);
  }
};


  // Charger les permissions
  const fetchPermissions = async () => {
    try {
      const res = await getPermissions();
      setPermissions(res.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des permissions:", error);
    }
  };

  useEffect(() => {
  fetchRolesData();
}, [page, searchTerm]);

useEffect(() => {
  fetchPermissions();
}, []);


  // Création d’un rôle
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRole({ ...newRole, permissionIds: newRole.permissionIds || [] });
      setNewRole({ nom: "", permissionIds: [] });
      setIsDialogOpen(false);
      fetchRolesData();
    } catch (error) {
      console.error("Erreur lors de la création du rôle:", error);
    }
  };

  // Suppression d’un rôle
  const handleDeleteRole = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer ce rôle ?")) return;
    try {
      await deleteRole(id);
      fetchRolesData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Ouverture modal édition
  const handleEditRole = (role: Role) => {
    setEditingRole({
      id: role.id,
      nom: role.nom,
      permissionIds: role.permissions?.map((p) => p.id) || [],
    });
    setIsEditDialogOpen(true);
  };

  // Sauvegarde édition
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    try {
      await updateRole(editingRole.id, {
        nom: editingRole.nom,
        permissionIds: editingRole.permissionIds || [],
      });
      setIsEditDialogOpen(false);
      setEditingRole(null);
      fetchRolesData();
    } catch (error) {
      console.error("Erreur lors de la modification du rôle:", error);
    }
  };

  const filteredRoles = roles.filter((role) =>
    role.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-balance">Gestion des rôles</h1>

      {/* Recherche + Création */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Bouton ouverture Dialog création */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nouveau rôle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un rôle</DialogTitle>
              <DialogDescription>Ajoutez un nouveau rôle et assignez les permissions</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom du rôle</Label>
                <Input
                  id="nom"
                  value={newRole.nom}
                  onChange={(e) => setNewRole({ ...newRole, nom: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <Command>
                  <CommandInput placeholder="Sélectionner des permissions..." />
                  <CommandList>
                    {/* Case "Tout sélectionner" */}
                    <CommandItem
                      onSelect={() => {
                        const allSelected = newRole.permissionIds.length === permissions.length;
                        setNewRole({
                          ...newRole,
                          permissionIds: allSelected ? [] : permissions.map(p => p.id),
                        });
                      }}
                      className="flex items-center gap-2 font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={newRole.permissionIds.length === permissions.length && permissions.length > 0}
                        readOnly
                      />
                      <span>Toutes les permissions</span>
                    </CommandItem>

                    {/* Liste normale des permissions */}
                    {permissions.map((perm) => {
                      const alreadySelected = newRole.permissionIds.includes(perm.id);
                      return (
                        <CommandItem
                          key={perm.id}
                          onSelect={() => {
                            setNewRole({
                              ...newRole,
                              permissionIds: alreadySelected
                                ? newRole.permissionIds.filter((id) => id !== perm.id)
                                : [...newRole.permissionIds, perm.id],
                            });
                          }}
                          className="flex items-center gap-2"
                        >
                          <input type="checkbox" checked={alreadySelected} readOnly />
                          <span>{perm.nom} ({perm.slug})</span>
                        </CommandItem>
                      );
                    })}
                  </CommandList>
                </Command>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Créer</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table des rôles */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Liste des rôles</CardTitle>
          <CardDescription>{filteredRoles.length} rôle(s) trouvé(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Créer le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-red-800" />
                      <span className="font-medium">{role.nom}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="text-muted-foreground">{role.slug}</span></TableCell>
                  <TableCell>
                    {role.permissions?.length ? (
                      <span className="flex items-center gap-2 bg-yellow-50 text-yellow-600 rounded-full px-3 py-1 text-sm font-medium">
                        {role.permissions.length} permission{role.permissions.length > 1 ? "s" : ""}
                      </span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.createdAt ? new Date(role.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric", month: "long", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    }) : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="bg-transparent p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="flex items-center gap-2 text-blue-600" onClick={() => handleEditRole(role)}>
                          <Edit className="w-4 h-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 text-destructive" onClick={() => handleDeleteRole(role.id)}>
                          <Trash2 className="w-4 h-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
             <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {page} sur {lastPage}
              </span>

              <Button
                  variant="outline"
                  disabled={page === lastPage}
                  onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Édition */}
      {editingRole && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier le rôle</DialogTitle>
              <DialogDescription>Modifiez le nom et les permissions de ce rôle</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nom">Nom du rôle</Label>
                <Input
                  id="edit-nom"
                  value={editingRole.nom}
                  onChange={(e) => setEditingRole({ ...editingRole, nom: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <Command>
                  <CommandInput placeholder="Sélectionner des permissions..." />
                  <CommandList>
                    {/* Case "Tout sélectionner" */}
                    <CommandItem
                      onSelect={() => {
                        const allSelected = editingRole.permissionIds.length === permissions.length;
                        setEditingRole({
                          ...editingRole,
                          permissionIds: allSelected ? [] : permissions.map(p => p.id),
                        });
                      }}
                      className="flex items-center gap-2 font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={editingRole.permissionIds.length === permissions.length && permissions.length > 0}
                        readOnly
                      />
                      <span>Toutes les permissions</span>
                    </CommandItem>

                    {/* Liste normale des permissions */}
                    {permissions.map((perm) => {
                      const alreadySelected = editingRole.permissionIds.includes(perm.id);
                      return (
                        <CommandItem
                          key={perm.id}
                          onSelect={() => {
                            const updatedIds = alreadySelected
                              ? editingRole.permissionIds.filter((id) => id !== perm.id)
                              : [...editingRole.permissionIds, perm.id];
                            setEditingRole({ ...editingRole, permissionIds: updatedIds });
                          }}
                          className="flex items-center gap-2"
                        >
                          <input type="checkbox" checked={alreadySelected} readOnly />
                          <span>{perm.nom} ({perm.slug})</span>
                        </CommandItem>
                      );
                    })}
                  </CommandList>
                </Command>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Enregistrer</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
