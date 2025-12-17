"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";
import ActionCreditService from "@/lib/services/ActionCreditService";

// 🔹 Types
export interface User {
  id: number;
  prenom: string;
  nom: string;
}

export interface ActionCredit {
  id: number;
  type: string;
  commentaire?: string;
  agent?: User;
  date: string;
  archive?: boolean;
}

interface CreditActionsPageProps {
  creditId: number;
}

export function CreditActionsList({ creditId }: CreditActionsPageProps) {
  const [actions, setActions] = useState<ActionCredit[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"archive" | "delete" | null>(null);
  const [selectedAction, setSelectedAction] = useState<ActionCredit | null>(null);

  // 🔹 Fetch actions par crédit
  const fetchActions = async () => {
    setLoading(true);
    try {
      const data = await ActionCreditService.getActionsByCredit(creditId);
      setActions(data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchActions(); }, [creditId]);

  // 🔹 Archiver / Supprimer
  const handleConfirmArchive = async () => {
    if (!selectedAction) return;
    await ActionCreditService.archiveAction(selectedAction.id);
    fetchActions();
    setDialogOpen(false);
    toast.success("Action archivée");
  };


  // 🔹 Filtrage
  const filteredActions = actions.filter(a => {
    const typeMatch = typeFilter === "all" || a.type === typeFilter;
    const agentMatch = agentFilter === "all" || a.agent?.id.toString() === agentFilter;
    return typeMatch && agentMatch;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mt-4">Actions du crédit #{creditId}</h2>

      {/* Filtres */}
      <div className="flex gap-4 flex-wrap">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {Array.from(new Set(actions.map(a => a.type))).map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger><SelectValue placeholder="Agent" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {Array.from(new Set(actions.map(a => a.agent?.id))).map(id => {
              const agent = actions.find(a => a.agent?.id === id)?.agent;
              return agent ? <SelectItem key={id} value={id.toString()}>{agent.prenom} {agent.nom}</SelectItem> : null;
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des actions</CardTitle>
          <CardDescription>{actions.length} action(s)</CardDescription>
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
                <TableHead>Actions</TableHead>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-1"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {!a.archive && <DropdownMenuItem onClick={() => { setSelectedAction(a); setDialogAction("archive"); setDialogOpen(true); }}>Archiver</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog confirmation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAction === "archive" ? "Confirmer archivage" : "Confirmer suppression"}</DialogTitle>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
