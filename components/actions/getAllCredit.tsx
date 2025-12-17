"use client";

import { useEffect, useState } from "react";
import CreditService, { CreditPayload } from "@/lib/services/CreditService";
import ActionCreditService, { ActionCreditPayload } from "@/lib/services/ActionCreditService";
import { Credit, User } from "@/types/index";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";


const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export function CreditsList({ onSelectCredit }: { onSelectCredit?: (c: Credit) => void }) {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [beneficiaireFilter, setBeneficiaireFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCredit, setNewCredit] = useState<CreditPayload>({
    beneficiaireId: 0,
    montant: 0,
    dateDebut: new Date().toISOString().split("T")[0],
    dateFin: new Date().toISOString().split("T")[0],
    tauxInteret: 10,
    status: "EN_COURS",
  });

  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [newAction, setNewAction] = useState<{
    type: string;
    commentaire?: string;
    latitude?: number;
    longitude?: number;
  }>({
    type: "",           // obligatoire
    commentaire: "",    // facultatif
    latitude: undefined,
    longitude: undefined,
  });

  const { user } = useAuth();


  // 🔹 Fetch crédits
  const fetchCredits = async () => {
    setLoading(true);
    try {
      const data = await CreditService.getCredits();
      setCredits(data);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Fetch utilisateurs
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/users`);
      const json = await res.json();
      console.log(json);
      setUsers(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchCredits();
    fetchUsers();
  }, []);

  const handleCreateCredit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // Préparer les données en convertissant les dates en ISO complètes
    const payload = {
      ...newCredit,
      dateDebut: new Date(newCredit.dateDebut).toISOString(),
      dateFin: new Date(newCredit.dateFin).toISOString(),
    };

    await CreditService.createCredit(payload);
    toast.success("Crédit créé");
    fetchCredits();
    setDialogOpen(false);
  } catch (err: any) {
    toast.error(err.message || "Erreur création crédit");
  }
};


  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment archiver ce crédit ?")) return;
    await CreditService.archiveCredit(id);
    fetchCredits();
    toast.success("Crédit archivé");
  };

   // Ouvrir le dialog depuis le menu
  const handleOpenActionDialog = (credit: Credit) => {
    setSelectedCredit(credit);
    setNewAction({
      type: "",
      commentaire: "",
      latitude: undefined,
      longitude: undefined,
    });
    setActionDialogOpen(true);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewAction((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        toast.success("Position enregistrée");
      },
      () => {
        toast.error("Impossible de récupérer la position");
      }
    );
  };


  // Créer une action
  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit) return;

    if (!user) {
      toast.error("Utilisateur non connecté");
      return;
    }

    try {
      const payload: ActionCreditPayload = {
        creditId: selectedCredit.id,
        agentId: user.id,
        type: newAction.type,
        commentaire: newAction.commentaire || undefined,
        ...(newAction.latitude !== undefined && { latitude: newAction.latitude }),
        ...(newAction.longitude !== undefined && { longitude: newAction.longitude }),
      };

      console.log("Payload action:", payload);

      await ActionCreditService.createAction(payload);

      toast.success("Action créée !");
      setActionDialogOpen(false);
      fetchCredits();
    } catch (err: any) {
      toast.error(err.message || "Erreur création action");
    }
  };



  const filteredCredits = credits.filter(c => {
    const searchMatch = c.beneficiaireId.toString().includes(searchTerm) || c.id.toString().includes(searchTerm);
    const statusMatch = statusFilter === "all" || c.status === statusFilter;
    const beneficiaireMatch = beneficiaireFilter === "all" || c.beneficiaireId.toString() === beneficiaireFilter;
    return searchMatch && statusMatch && beneficiaireMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des crédits</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nouveau crédit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Nouveau crédit</DialogTitle></DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateCredit}>
              <div>
                <Label>Bénéficiaire</Label>
                <Select
                  value={newCredit.beneficiaireId ? newCredit.beneficiaireId.toString() : ""}
                  onValueChange={v => setNewCredit({...newCredit, beneficiaireId: Number(v)})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner bénéficiaire" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <SelectItem value="" disabled>Chargement...</SelectItem>
                    ) : (
                      users.map(user => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.prenom} {user.nom}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Montant</Label>
                <Input type="number" value={newCredit.montant} onChange={e => setNewCredit({...newCredit, montant: Number(e.target.value)})} required />
              </div>

              <div>
                <Label>Date début</Label>
                <Input type="date" value={newCredit.dateDebut} onChange={e => setNewCredit({...newCredit, dateDebut: e.target.value})} required />
              </div>

              <div>
                <Label>Date fin</Label>
                <Input type="date" value={newCredit.dateFin} onChange={e => setNewCredit({...newCredit, dateFin: e.target.value})} required />
              </div>

              <div>
                <Label>Taux d'intérêt (%)</Label>
                <Input type="number" value={newCredit.tauxInteret} onChange={e => setNewCredit({...newCredit, tauxInteret: Number(e.target.value)})} />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={newCredit.status} onValueChange={v => setNewCredit({...newCredit, status: v})}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN_COURS">EN_COURS</SelectItem>
                    <SelectItem value="TERMINE">TERMINE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Créer</Button>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              </div>
            </form>

          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 relative">
            <Input placeholder="Rechercher par nom" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="EN_COURS">EN_COURS</SelectItem>
              <SelectItem value="TERMINE">TERMINE</SelectItem>
            </SelectContent>
          </Select>

          <Select value={beneficiaireFilter} onValueChange={setBeneficiaireFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Bénéficiaire" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {users.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.prenom} {u.nom}</SelectItem>)}
            </SelectContent>
          </Select>

        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des crédits</CardTitle>
          <CardDescription>{credits.length} crédit(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCredits.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>
                    {c.beneficiaire ? `${c.beneficiaire.prenom} ${c.beneficiaire.nom}` : "—"}
                  </TableCell>
                  <TableCell>{c.montant}</TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>                      
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => onSelectCredit && onSelectCredit(c)}>Voir actions</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(c.id)}>
                          <Trash className="w-4 h-4 mr-2" /> Archiver
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenActionDialog(c)}>
                          Ajouter une action
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

      {/* Dialog création action */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Nouvelle action – Crédit #{selectedCredit?.id}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleCreateAction}>
            {/* Type */}
            <div>
              <Label>Type d’action</Label>
              <Select
                value={newAction.type}
                onValueChange={(v) =>
                  setNewAction({ ...newAction, type: v })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VISITE">VISITE</SelectItem>
                  <SelectItem value="RELANCE">RELANCE</SelectItem>
                  <SelectItem value="VALIDATION">VALIDATION</SelectItem>
                  <SelectItem value="SUSPENSION">SUSPENSION</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Commentaire */}
            <div>
              <Label>Commentaire</Label>
              <Input
                value={newAction.commentaire}
                onChange={(e) =>
                  setNewAction({ ...newAction, commentaire: e.target.value })
                }
                placeholder="Observation, remarque..."
              />
            </div>

            {/* Géolocalisation */}
            <div>
              <Label>Localisation</Label>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={getLocation}
              >
                📍 Utiliser ma position actuelle
              </Button>

              {newAction.latitude && newAction.longitude && (
                <p className="text-sm text-muted-foreground mt-1">
                  Position enregistrée
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit">Enregistrer</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setActionDialogOpen(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
