"use client";

import { useEffect, useState } from "react";
import { Plus, Trash, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

import CreditService, { CreditPayload } from "@/lib/services/CreditService";
import ActionCreditService from "@/lib/services/ActionCreditService";
import { Credit, User } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { usePagination } from "@/hooks/use-pagination";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function CreditsList({ onSelectCredit }: { onSelectCredit?: (c: Credit) => void }) {
  const { user } = useAuth();
  const router = useRouter();

  const [credits, setCredits] = useState<Credit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "EN_COURS" | "TERMINE">("all");
  const [beneficiaireFilter, setBeneficiaireFilter] = useState("all");

  // Pagination
  const { page, limit, lastPage, setLastPage, nextPage, prevPage } = usePagination({
    initialPage: 1,
    initialLimit: 5,
  });

  // Dialogs
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<Credit | null>(null);

  // Formulaires
  const [newCredit, setNewCredit] = useState<CreditPayload>({
    beneficiaireId: 0,
    montant: 0,
    dateDebut: "",
    dateFin: "",
    tauxInteret: 10,
    status: "EN_COURS",
  });

  const [newAction, setNewAction] = useState({ type: "", commentaire: "" });

  // ---------------- FETCH ----------------
  const fetchCredits = async () => {
  try {
    setLoading(true);

    const filters = {
      page,
      limit,
      status: statusFilter !== "all" ? statusFilter : undefined,
      beneficiaireId: beneficiaireFilter !== "all" ? Number(beneficiaireFilter) : undefined,
    };

    const data = await CreditService.getCredits(filters);
    setCredits(data.data || []);
    setLastPage(data.meta.totalPages);
  } finally {
    setLoading(false);
  }
};

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/users`);
    const json = await res.json();
    setUsers(json.data || []);
  };

 useEffect(() => {
  fetchCredits();
  fetchUsers();
}, [page, limit, statusFilter, beneficiaireFilter, searchTerm]);

  // ---------------- CRUD ----------------
  const handleCreateCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredit.beneficiaireId || !newCredit.montant || !newCredit.dateDebut || !newCredit.dateFin) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const payload = {
        ...newCredit,
        dateDebut: new Date(newCredit.dateDebut).toISOString(),
        dateFin: new Date(newCredit.dateFin).toISOString(),
      };

      await CreditService.createCredit(payload);
      toast.success("Crédit créé");
      setCreditDialogOpen(false);
      fetchCredits();
      setNewCredit({ beneficiaireId: 0, montant: 0, dateDebut: "", dateFin: "", tauxInteret: 10, status: "EN_COURS" });
    } catch (err: any) {
      toast.error(err.message || "Erreur création crédit");
    }
  };

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit || !user) return;
    await ActionCreditService.createAction({
      creditId: selectedCredit.id,
      agentId: user.id,
      type: newAction.type,
      commentaire: newAction.commentaire || undefined,
    });
    toast.success("Action ajoutée");
    setActionDialogOpen(false);
    setNewAction({ type: "", commentaire: "" });
  };

  const handleArchiveCredit = async (id: number) => {
    if (!confirm("Archiver ce crédit ?")) return;
    await CreditService.archiveCredit(id);
    toast.success("Crédit archivé");
    fetchCredits();
  };


  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des crédits</h1>
          <p className="text-muted-foreground mt-2">Suivi des crédits et actions associées</p>
        </div>

        <Button onClick={() => setCreditDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Nouveau crédit
        </Button>
      </div>

      {/* FILTRES */}
      <Card className="border-border/50">
        <CardContent className="pt-6 flex gap-4 flex-wrap">
          <div className="flex-1 relative">
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="EN_COURS">EN_COURS</SelectItem>
              <SelectItem value="TERMINE">TERMINE</SelectItem>
            </SelectContent>
          </Select>

          <Select value={beneficiaireFilter} onValueChange={setBeneficiaireFilter}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Bénéficiaire" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>
                  {u.prenom} {u.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* TABLEAU */}
      <Card>
        <CardHeader>
          <CardTitle>Crédits</CardTitle>
          <CardDescription>{credits.length} crédit(s)</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {credits.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.beneficiaire ? `${c.beneficiaire.prenom} ${c.beneficiaire.nom}` : "-"}</TableCell>
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
                        <DropdownMenuItem
                          onClick={() => router.push(`/dashboard/credits/${c.id}/actions`)}
                        >
                          Voir actions
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedCredit(c);
                            setActionDialogOpen(true);
                          }}
                        >
                          Ajouter action
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleArchiveCredit(c.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" /> Archiver
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {credits.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Aucun crédit trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button onClick={prevPage} disabled={page <= 1}>Précédent</Button>
            <span>Page {page} sur {lastPage}</span>
            <Button onClick={nextPage} disabled={page >= lastPage}>Suivant</Button>
          </div>
        </CardContent>
      </Card>

      {/* DIALOG CRÉATION CRÉDIT */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau crédit</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateCredit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label>Bénéficiaire</Label>
              <Select
                value={newCredit.beneficiaireId.toString()}
                onValueChange={(v) => setNewCredit({ ...newCredit, beneficiaireId: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un bénéficiaire" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      {u.prenom} {u.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Montant</Label>
              <Input
                type="number"
                value={newCredit.montant}
                onChange={(e) => setNewCredit({ ...newCredit, montant: Number(e.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Date début</Label>
              <Input
                type="date"
                value={newCredit.dateDebut}
                onChange={(e) => setNewCredit({ ...newCredit, dateDebut: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Date fin</Label>
              <Input
                type="date"
                value={newCredit.dateFin}
                onChange={(e) => setNewCredit({ ...newCredit, dateFin: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Taux d'intérêt (%)</Label>
              <Input
                type="number"
                value={newCredit.tauxInteret}
                onChange={(e) => setNewCredit({ ...newCredit, tauxInteret: Number(e.target.value) })}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>Annuler</Button>
              <Button type="submit">Créer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG AJOUT ACTION */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle action</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateAction} className="space-y-4">
            <Select onValueChange={(v) => setNewAction({ ...newAction, type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Type d'action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VISITE">VISITE</SelectItem>
                <SelectItem value="RELANCE">RELANCE</SelectItem>
                <SelectItem value="VALIDATION">VALIDATION</SelectItem>
                <SelectItem value="SUSPENSION">SUSPENSION</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Commentaire"
              value={newAction.commentaire}
              onChange={(e) => setNewAction({ ...newAction, commentaire: e.target.value })}
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}