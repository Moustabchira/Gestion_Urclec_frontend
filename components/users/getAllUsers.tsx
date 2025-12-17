"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Plus, Search, Edit, Trash2, UserPlus, MoreHorizontal, UserCog, Eye} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  getUsers, createUser, deleteUser, updateUser, assignRoleToUser, removeRoleFromUser, assignUserToChef 
} from "@/lib/services/UserService";
import { getRoles } from "@/lib/services/RoleService";
import { getAgences } from "@/lib/services/AgenceService";
import { getPostes } from "@/lib/services/PosteService";
import { User, Role, Agence, Poste } from "@/types/index";

interface NewUserPayload {
  nom: string;
  prenom: string;
  username: string;
  email: string;
  password: string;
  posteId: number;
  agenceId: number;
  roles: number[];
  chefId?: number | null;
  archive?: null;
}

export interface UpdateUserPayload {
  nom?: string;
  prenom?: string;
  username?: string;
  email?: string;
  posteId?: number;
  agenceId?: number;
  roles?: number[];
  chefId?: number | null;
}

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [postes, setPostes] = useState<Poste[]>([]);
  const [chefs, setChefs] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
 const [isAssignChefDialogOpen, setIsAssignChefDialogOpen] = useState(false);
  const [userToAssignChef, setUserToAssignChef] = useState<User | null>(null);
  const [selectedChefId, setSelectedChefId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUserPayload>({
    nom: "",
    prenom: "",
    username: "",
    email: "",
    password: "",
    posteId: 0,
    agenceId: 0,
    roles: [],
    chefId: null,
    archive: null,
  });
  const [selectedAgenceId, setSelectedAgenceId] = useState<number>(0);

  // 🔹 Fetch data
  const fetchUsers = async () => {
    try {
      const res = await getUsers({ page: 1, limit: 100 });
      setUsers(res.data);
      setChefs(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchRoles = async () => { try { const res = await getRoles(); setRoles(res.data); } catch (e) { console.error(e); } };
  const fetchAgences = async () => { try { const res = await getAgences(); setAgences(res.data); } catch (e) { console.error(e); } };
  const fetchPostes = async () => { try { const res = await getPostes(); setPostes(res.data); } catch (e) { console.error(e); } };

  useEffect(() => { fetchUsers(); fetchRoles(); fetchAgences(); fetchPostes(); }, []);

  // 🔹 Role colors
  const getRoleColor = (role: string) => {
    switch (role) {
      case "DG": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "DRH": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "Responsable Hiérarchique": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "Employé": return "bg-green-500/10 text-green-600 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

const handleCreateUser = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // 1️⃣ Préparer le payload
    const payload: NewUserPayload = {
      ...newUser,
      roles: newUser.roles.length > 0 ? newUser.roles : [], // tableau d'IDs
    };

    // 2️⃣ Créer l'utilisateur avec le rôle directement
    const createdUser = await createUser(payload);

    // 3️⃣ Assigner le chef si présent
    if (newUser.chefId) {
      const chefId = Number(newUser.chefId);
      if (!Number.isNaN(chefId) && chefId > 0) {
        await assignUserToChef(createdUser.id, chefId);
      } else {
        console.warn("Chef ID invalide :", newUser.chefId);
      }
    }

    // 4️⃣ Réinitialiser le formulaire
    setNewUser({
      nom: "",
      prenom: "",
      username: "",
      email: "",
      password: "",
      posteId: 0,
      agenceId: 0,
      roles: [],
      chefId: null,
      archive: null,
    });

    setIsDialogOpen(false);

    // 5️⃣ Rafraîchir la liste des utilisateurs
    fetchUsers();
  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur :", error.message || error);
  }
};



  // 🔹 Update User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const payload: UpdateUserPayload = {
        nom: selectedUser.nom,
        prenom: selectedUser.prenom,
        username: selectedUser.username,
        email: selectedUser.email,
        posteId: selectedUser.posteId,
        agenceId: selectedUser.agenceId,
        chefId: selectedUser.chefId || null,
      };
      await updateUser(selectedUser.id, payload);

      // Roles
      if (selectedUser.roles && selectedUser.roles.length > 0) {
        for (const r of selectedUser.roles) await removeRoleFromUser(selectedUser.id, r.roleId);
        await assignRoleToUser(selectedUser.id, selectedUser.roles[0].roleId);
      }

      await assignUserToChef(selectedUser.id, selectedUser.chefId || null);

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) { console.error(error); }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try { await deleteUser(id); fetchUsers(); } catch (error) { console.error(error); }
  };

  const handleAssignChef = async () => {
    if (!userToAssignChef || !selectedChefId) return;
    try {
      await assignUserToChef(userToAssignChef.id, selectedChefId);
      setIsAssignChefDialogOpen(false);
      setUserToAssignChef(null);
      setSelectedChefId(null);
      fetchUsers();
    } catch (error) { console.error(error); }
  };

  const filteredUsers = users.filter(
    user =>
      (user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
       user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedAgenceId === 0 || user.agenceId === selectedAgenceId)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-balance">Gestion des utilisateurs</h1>
      <Tabs defaultValue="users" className="space-y-6">
        <TabsContent value="users" className="space-y-6">

          {/* Recherche + Création */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="w-64">
              <Select
                value={selectedAgenceId.toString()}
                onValueChange={value => setSelectedAgenceId(parseInt(value))}
              >
                <SelectTrigger><SelectValue placeholder="Toutes les agences" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Toutes les agences</SelectItem>
                  {agences.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.nom_agence}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Dialog Création */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><UserPlus className="w-4 h-4"/> Nouvel utilisateur</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un utilisateur</DialogTitle>
                  <DialogDescription>Ajoutez un nouvel utilisateur au système</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">

                  {/* Champs texte */}
                  {["nom","prenom","username","email","password"].map(field=>(
                    <div className="space-y-2" key={field}>
                      <Label htmlFor={field}>{field.charAt(0).toUpperCase()+field.slice(1)}</Label>
                      <Input
                        id={field}
                        type={field==="email"?"email":field==="password"?"password":"text"}
                        value={(newUser as any)[field]}
                        onChange={e => setNewUser({...newUser, [field]: e.target.value})}
                        required
                      />
                    </div>
                  ))}

                  {/* Poste */}
                  <div className="space-y-2">
                    <Label>Poste</Label>
                    <Select
                      value={newUser.posteId.toString() || "0"}
                      onValueChange={v => setNewUser({...newUser, posteId: parseInt(v)})}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner un poste"/></SelectTrigger>
                      <SelectContent>
                        {postes.map(p=><SelectItem key={p.id} value={p.id.toString()}>{p.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Agence */}
                  <div className="space-y-2">
                    <Label>Agence</Label>
                    <Select
                      value={newUser.agenceId.toString() || "0"}
                      onValueChange={v => setNewUser({...newUser, agenceId: parseInt(v)})}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner une agence"/></SelectTrigger>
                      <SelectContent>
                        {agences.map(a=><SelectItem key={a.id} value={a.id.toString()}>{a.nom_agence}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rôle */}
                  <div className="space-y-2">
                    <Label>Rôle</Label>
                    <Select
                      value={newUser.roles[0]?.toString() || ""}
                      onValueChange={v => setNewUser({...newUser, roles:[parseInt(v)]})}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner un rôle"/></SelectTrigger>
                      <SelectContent>
                        {roles.map(r=><SelectItem key={r.id} value={r.id.toString()}>{r.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chef */}
                  <div className="space-y-2">
                    <Label>Chef</Label>
                    <Select
                      value={newUser.chefId?.toString() || "0"}
                      onValueChange={v => setNewUser({...newUser, chefId: v !== "0" ? parseInt(v) : null})}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner un chef"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Aucun</SelectItem>
                        {chefs.map(c=><SelectItem key={c.id} value={c.id.toString()}>{c.prenom} {c.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">Créer</Button>
                    <Button type="button" variant="outline" onClick={()=>setIsDialogOpen(false)}>Annuler</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>Liste des utilisateurs</CardTitle>
              <CardDescription>{filteredUsers.length} utilisateur(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Poste</TableHead>
                    <TableHead>Agence</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Chef</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.nom}</TableCell>
                      <TableCell>{user.prenom}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.poste?.nom || "—"}</TableCell>
                      <TableCell>{user.agence?.nom_agence || "—"}</TableCell>
                      <TableCell>
                        {user.roles?.map(r => (
                          <Badge key={r.roleId} className={getRoleColor(r.role?.nom || "")}>
                            {r.role?.nom}
                          </Badge>
                        )) || "—"}
                      </TableCell>
                      <TableCell>{user.chef ? `${user.chef.prenom} ${user.chef.nom}` : "—"}</TableCell>
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
                              onClick={() => router.push(`/dashboard/users/${user.id}`)}
                            >
                              <Eye className="w-4 h-4" /> Voir
                            </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => {
                                setUserToAssignChef(user);
                                setIsAssignChefDialogOpen(true);
                              }}
                            >
                              <UserCog className="w-4 h-4" /> Affecter à un chef
                            </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive flex items-center gap-2 cursor-pointer"
                            onClick={() => handleDeleteUser(user.id)}
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
              {filteredUsers.length === 0 && <p className="text-center py-4 text-muted-foreground">Aucun utilisateur trouvé</p>}
            </CardContent>
          </Card>

          {/* Dialog Modification */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              {selectedUser && (
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Modifier l’utilisateur</DialogTitle>
                    <DialogDescription>Modifiez les informations de l’utilisateur</DialogDescription>
                  </DialogHeader>

                  {["nom","prenom","username","email"].map(field=>(
                    <div className="space-y-2" key={field}>
                      <Label htmlFor={`edit-${field}`}>{field.charAt(0).toUpperCase()+field.slice(1)}</Label>
                      <Input
                        id={`edit-${field}`}
                        value={(selectedUser as any)[field]}
                        onChange={e=>setSelectedUser({...selectedUser,[field]:e.target.value})}
                        required
                      />
                    </div>
                  ))}

                  {/* Poste */}
                  <div className="space-y-2">
                    <Label>Poste</Label>
                    <Select
                      value={selectedUser.posteId.toString() || "0"}
                      onValueChange={v=>setSelectedUser({...selectedUser, posteId:parseInt(v)})}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner un poste"/></SelectTrigger>
                      <SelectContent>
                        {postes.map(p=><SelectItem key={p.id} value={p.id.toString()}>{p.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Agence */}
                  <div className="space-y-2">
                    <Label>Agence</Label>
                    <Select
                      value={selectedUser.agenceId.toString() || "0"}
                      onValueChange={v=>setSelectedUser({...selectedUser, agenceId:parseInt(v)})}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner une agence"/></SelectTrigger>
                      <SelectContent>
                        {agences.map(a=><SelectItem key={a.id} value={a.id.toString()}>{a.nom_agence}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rôle */}
                  <div className="space-y-2">
                    <Label>Rôle</Label>
                    <Select
                      value={selectedUser.roles?.[0]?.roleId.toString() || "0"}
                      onValueChange={v=>{
                        const rId = parseInt(v);
                        setSelectedUser({...selectedUser, roles:[{
                          userId: selectedUser.id,
                          roleId: rId,
                          role: roles.find(r=>r.id===rId),
                          assignedAt: new Date(),
                          archive: false,
                          archivedAt: null
                        }]});
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner un rôle"/></SelectTrigger>
                      <SelectContent>
                        {roles.map(r=><SelectItem key={r.id} value={r.id.toString()}>{r.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Chef */}
                  <div className="space-y-2">
                    <Label>Chef</Label>
                    <Select
                      value={selectedUser.chefId?.toString() || "0"}
                      onValueChange={v=>setSelectedUser({...selectedUser, chefId:v!=="0"?parseInt(v):null})}
                    >
                      <SelectTrigger><SelectValue placeholder="Sélectionner un chef"/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Aucun</SelectItem>
                        {chefs.map(c=><SelectItem key={c.id} value={c.id.toString()}>{c.prenom} {c.nom}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">Enregistrer</Button>
                    <Button type="button" variant="outline" onClick={()=>setIsEditDialogOpen(false)}>Annuler</Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isAssignChefDialogOpen} onOpenChange={setIsAssignChefDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Affecter un chef</DialogTitle>
                <DialogDescription>
                  Sélectionnez le chef à affecter à{" "}
                  <strong>{userToAssignChef?.prenom} {userToAssignChef?.nom}</strong>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <Label>Chef</Label>
                <Select
                  value={selectedChefId?.toString() || "0"}
                  onValueChange={v => setSelectedChefId(v !== "0" ? parseInt(v) : null)}
                >
                  <SelectTrigger><SelectValue placeholder="Sélectionner un chef" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Aucun</SelectItem>
                    {chefs.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.prenom} {c.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAssignChef} className="flex-1">Valider</Button>
                  <Button variant="outline" onClick={() => setIsAssignChefDialogOpen(false)}>Annuler</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}