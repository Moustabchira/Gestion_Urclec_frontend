"use client";

import { useEffect, useState } from "react";
import ActionCreditService from "@/lib/services/ActionCreditService";
import { ActionCredit } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { usePagination } from "@/hooks/use-pagination";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export default function HistoriqueActionsCredits() {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionCredit[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Pagination
  const { page, limit, lastPage, setLastPage, nextPage, prevPage, goToPage } = usePagination({ initialPage: 1, initialLimit: 10 });

  // 🔍 Filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");

  // 🪟 Dialog édition
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionCredit | null>(null);
  const [editType, setEditType] = useState("");
  const [editCommentaire, setEditCommentaire] = useState("");

  // 🔹 Fetch actions paginated
  const fetchActions = async () => {
    setLoading(true);
    try {
      const result = await ActionCreditService.getAllPaginated(page, limit);
      setActions(result.data);
      setLastPage(result.meta.totalPages);
    } catch (err: any) {
      toast.error(err.message || "Erreur récupération historique");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [page, limit]);

  if (!user) return <div>Chargement...</div>;

  // 🔹 Données filtres
  const agents = Array.from(
    new Set(
      actions.filter(a => a.agent).map(a => `${a.agent!.prenom} ${a.agent!.nom}`)
    )
  );
  const types = Array.from(new Set(actions.map(a => a.type)));

  // 🔹 Filtrage côté front
  const filtered = actions
    .filter(a =>
      searchTerm === "" ||
      `${a.credit?.beneficiaire?.prenom ?? ""} ${a.credit?.beneficiaire?.nom ?? ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter(a => typeFilter === "all" || a.type === typeFilter)
    .filter(
      a =>
        agentFilter === "all" ||
        (a.agent ? `${a.agent.prenom} ${a.agent.nom}` : "-") === agentFilter
    );

  // ✏️ Ouvrir dialog édition
  const openEditDialog = (action: ActionCredit) => {
    setSelectedAction(action);
    setEditType(action.type);
    setEditCommentaire(action.commentaire ?? "");
    setEditOpen(true);
  };

  // 💾 Sauvegarder modification
  const handleUpdate = async () => {
    if (!selectedAction) return;
    try {
      await ActionCreditService.updateAction(selectedAction.id, { type: editType, commentaire: editCommentaire });
      toast.success("Action mise à jour");
      setEditOpen(false);
      setSelectedAction(null);
      fetchActions();
    } catch (err: any) {
      toast.error(err.message || "Erreur mise à jour");
    }
  };

  // 🗑️ Supprimer (archiver)
  const handleDelete = async (id: number) => {
    if (!confirm("Voulez-vous vraiment supprimer cette action ?")) return;
    try {
      await ActionCreditService.archiveAction(id);
      toast.success("Action supprimée");
      fetchActions();
    } catch (err: any) {
      toast.error(err.message || "Erreur suppression");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Historique des actions crédits</h1>

      {/* 🔍 Filtres */}
      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher par bénéficiaire..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Type d’action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-56"><SelectValue placeholder="Agent" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {agents.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 📋 Tableau */}
      <Card>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Crédit</TableHead>
                <TableHead>Bénéficiaire</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.type}</TableCell>
                  <TableCell>#{a.creditId}</TableCell>
                  <TableCell>{a.credit?.beneficiaire ? `${a.credit.beneficiaire.prenom} ${a.credit.beneficiaire.nom}` : "-"}</TableCell>
                  <TableCell>{a.agent ? `${a.agent.prenom} ${a.agent.nom}` : "-"}</TableCell>
                  <TableCell>{new Date(a.date).toLocaleString()}</TableCell>
                  <TableCell>{a.commentaire || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(user.roles?.includes("admin") || user.id === a.agent?.id) && (
                          <DropdownMenuItem onClick={() => openEditDialog(a)}>
                            <Pencil className="mr-2 h-4 w-4" />Modifier
                          </DropdownMenuItem>
                        )}
                        {user.roles?.includes("admin") && (
                          <DropdownMenuItem onClick={() => handleDelete(a.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <Button onClick={prevPage} disabled={page <= 1}>Précédent</Button>
            <span>Page {page} sur {lastPage}</span>
            <Button onClick={nextPage} disabled={page >= lastPage}>Suivant</Button>
          </div>
        </CardContent>
      </Card>

      {/* 🪟 Dialog modification */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier l’action</DialogTitle></DialogHeader>
          <Select value={editType} onValueChange={setEditType}>
            <SelectTrigger><SelectValue placeholder="Type d’action" /></SelectTrigger>
            <SelectContent>{types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          <Input placeholder="Commentaire" value={editCommentaire} onChange={e => setEditCommentaire(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}