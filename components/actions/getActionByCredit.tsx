"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell
} from "@/components/ui/table";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import ActionCreditService from "@/lib/services/ActionCreditService";
import { ActionCredit } from "@/types";

interface CreditActionsPageProps {
  creditId: number;
}

export function CreditActionsList({ creditId }: CreditActionsPageProps) {
  const [actions, setActions] = useState<ActionCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionCredit | null>(null);

 const fetchActions = async () => {
  if (!creditId) return;

  setLoading(true);
  try {
    const data = await ActionCreditService.getActionsByCredit(creditId);
    console.log("ACTIONS API =>", data); // 🔥 DEBUG
    setActions(data);
  } catch (e) {
    console.error(e);
    toast.error("Erreur chargement actions");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (!creditId || creditId <= 0) return;
    fetchActions();
  }, [creditId]);


  // 🔹 Archiver action
  const handleArchive = async () => {
    if (!selectedAction) return;
    try {
      await ActionCreditService.archiveAction(selectedAction.id);
      toast.success("Action archivée");
      fetchActions();
    } catch {
      toast.error("Erreur archivage");
    } finally {
      setDialogOpen(false);
      setSelectedAction(null);
    }
  };

  // 🔹 Filtrage
  const filteredActions = actions.filter(a => {
    const typeMatch = typeFilter === "all" || a.type === typeFilter;
    const agentMatch = agentFilter === "all" || a.agent?.id.toString() === agentFilter;
    return typeMatch && agentMatch;
  });

  // 🔹 Agents uniques pour filtre
  const uniqueAgents = Array.from(
    new Set(actions.map(a => a.agent?.id))
  )
    .map(id => actions.find(a => a.agent?.id === id)?.agent)
    .filter(Boolean) as NonNullable<ActionCredit["agent"]>[];

  // 🔹 Types uniques pour filtre
  const uniqueTypes = Array.from(new Set(actions.map(a => a.type)));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Actions du crédit #{creditId}</h2>

      {/* Filtres */}
      <div className="flex gap-4 flex-wrap">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {uniqueTypes.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {uniqueAgents.map(agent => (
              <SelectItem key={agent.id} value={agent.id.toString()}>
                {agent.prenom} {agent.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des actions</CardTitle>
          <CardDescription>{filteredActions.length} action(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Commentaire</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActions.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.type}</TableCell>
                  <TableCell>{a.commentaire || "-"}</TableCell>
                  <TableCell>{a.agent ? `${a.agent.prenom} ${a.agent.nom}` : "-"}</TableCell>
                  <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {!a.archive && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAction(a);
                              setDialogOpen(true);
                            }}
                          >
                            Archiver
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredActions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Aucun résultat
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {loading && <p className="text-sm text-muted-foreground mt-4">Chargement…</p>}
        </CardContent>
      </Card>

      {/* Dialog confirmation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer l’archivage</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleArchive}>Archiver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
