"use client";

import { useEffect, useState } from "react";
import MouvementService from "@/lib/services/MouvementService";
import EquipementService from "@/lib/services/EquipementService";
import { MouvementEquipement } from "@/types/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoreHorizontal, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

export default function HistoriqueMouvements() {
  const service = new MouvementService();
  const equipementService = new EquipementService();
  const { user } = useAuth();

  const [mouvements, setMouvements] = useState<MouvementEquipement[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [employeFilter, setEmployeFilter] = useState<string>("all");
  const [pointServiceFilter, setPointServiceFilter] = useState<string>("all");

  // Dialogs
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRetourOpen, setDialogRetourOpen] = useState(false);
  const [selectedMouvement, setSelectedMouvement] = useState<MouvementEquipement | null>(null);
  const [etatRetour, setEtatRetour] = useState<"FONCTIONNEL" | "EN_PANNE">("FONCTIONNEL");

  // Couleurs pour état
  const statusColors: Record<string, string> = {
    FONCTIONNEL: "#22c55e",
    EN_REPARATION: "#facc15",
    EN_PANNE: "#ef4444",
    HORS_SERVICE: "#9ca3af",
    EN_TRANSIT: "#3b82f6",
    RETIRE: "#6b7280",
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <span
      style={{
        backgroundColor: statusColors[status] || "#6b7280",
        color: "#fff",
        padding: "2px 8px",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );

  // 🔹 Fetch mouvements
  const fetchMouvements = async () => {
    setLoading(true);
    try {
      const data = await service.getAll();
      setMouvements(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur récupération mouvements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMouvements();
  }, []);

  if (!user || !user.id) return <div>Chargement...</div>;

  // 🔹 Filtrer les mouvements visibles selon le rôle/utilisateur
  const visibleMouvements = mouvements.filter((m) => {
    if (user.roles?.includes("gestionnaire_equipements")) return true; // gestionnaire voit tout
    if (m.type === "REPARATION") {
      return m.responsableDestination?.id === user.id || m.initiateur?.id === user.id;
    }
    return m.initiateur?.id === user.id || m.responsableDestination?.id === user.id;
  });

  // 🔹 Confirmer réception / retour réparation
  const handleConfirmer = async () => {
    if (!selectedMouvement) return toast.error("Aucun mouvement sélectionné");

    try {
      if (selectedMouvement.type === "REPARATION" && !selectedMouvement.confirme) {
        // Réparateur confirme réception
        await equipementService.confirmerReception({
          mouvementId: selectedMouvement.id,
          confirmeParId: user.id,
        });
        toast.success("Réception par le réparateur confirmée");
        setDialogOpen(false);
      } else if (selectedMouvement.type === "REPARATION" && selectedMouvement.confirme) {
        // Retour de réparation
        await equipementService.retourDeReparation({
          mouvementId: selectedMouvement.id,
          initiateurId: user.id,
          etatFinal: etatRetour,
        });
        toast.success("Retour de réparation confirmé");
        setDialogRetourOpen(false);
      } else {
        // Mouvements normaux
        await equipementService.confirmerReception({
          mouvementId: selectedMouvement.id,
          confirmeParId: user.id,
        });
        toast.success("Réception confirmée");
        setDialogOpen(false);
      }

      setSelectedMouvement(null);
      fetchMouvements();
    } catch (err: any) {
      console.error("Erreur confirmation :", err);
      toast.error(err.message || "Erreur confirmation");
    }
  };

  // 🔹 Filtres pour UI
  const employes = Array.from(
    new Set(visibleMouvements.map((m) => (m.initiateur ? `${m.initiateur.prenom} ${m.initiateur.nom}` : "-")))
  );
  const points = Array.from(
    new Set(
      visibleMouvements
        .flatMap((m) => [m.pointServiceSource?.nom, m.pointServiceDestination?.nom])
        .filter(Boolean)
    )
  );

  const filtered = visibleMouvements
    .filter((m) => searchTerm === "" || m.equipement?.nom.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((m) => employeFilter === "all" || (m.initiateur ? `${m.initiateur.prenom} ${m.initiateur.nom}` : "-") === employeFilter)
    .filter((m) => pointServiceFilter === "all" || m.pointServiceSource?.nom === pointServiceFilter || m.pointServiceDestination?.nom === pointServiceFilter);

  const total = filtered.length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Historique des mouvements</h1>
      <p>Total mouvements : <strong>{total}</strong></p>

      {/* Filtres */}
      <Card>
        <CardContent className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <Select value={employeFilter} onValueChange={setEmployeFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par employé" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {employes.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={pointServiceFilter} onValueChange={setPointServiceFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par point de service" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {points.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardHeader>
          <CardTitle>Mouvements</CardTitle>
          <CardDescription>{filtered.length} mouvement(s)</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type Mouvement</TableHead>
                <TableHead>Initiateur</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>État avant</TableHead>
                <TableHead>État après</TableHead>
                <TableHead>Date Confirmation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(m => (
                <TableRow key={m.id} className={m.confirme ? "bg-gray-50" : ""}>
                  <TableCell>{m.type}</TableCell>
                  <TableCell>{m.initiateur ? `${m.initiateur.prenom} ${m.initiateur.nom}` : "-"}</TableCell>
                  <TableCell>
                    {m.pointServiceDestination?.nom || "-"} <br />
                    {m.responsableDestination ? `${m.responsableDestination.prenom} ${m.responsableDestination.nom}` : "-"} <br />
                    {m.responsableDestination?.agence?.nom_agence || "-"}
                  </TableCell>
                  <TableCell><StatusBadge status={m.etatAvant} /></TableCell>
                  <TableCell><StatusBadge status={m.etatApres || m.etatAvant || "FONCTIONNEL"} /></TableCell>
                  <TableCell>{m.dateConfirmation ? new Date(m.dateConfirmation).toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-gray-100">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {/* 🔹 Actions selon utilisateur */}
                        {m.type === "REPARATION" && !m.confirme && user.id === m.responsableDestination?.id && (
                          <DropdownMenuItem onClick={() => { setSelectedMouvement(m); setDialogOpen(true); }}>
                            Confirmer réception (réparateur)
                          </DropdownMenuItem>
                        )}
                        {m.type === "REPARATION" &&
                          m.confirme &&
                          user.id === m.responsableDestination?.id &&
                          !mouvements.some(r => r.type === "RETOUR_REPARATION" && r.commentaire?.includes(`REPARATION_ID:${m.id}`)) && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedMouvement(m);
                                setEtatRetour("FONCTIONNEL");
                                setDialogRetourOpen(true);
                              }}
                            >
                              Initier le retour de réparation
                            </DropdownMenuItem>
                        )}

                        {m.type === "RETOUR_REPARATION" && !m.confirme && user.id === (m as any).reparationOriginal?.initiateur?.id && (
                          <DropdownMenuItem onClick={() => { setSelectedMouvement(m); setDialogOpen(true); }}>
                            Confirmer réception retour
                          </DropdownMenuItem>
                        )}
                        {m.type !== "REPARATION" &&
                          m.type !== "RETOUR_REPARATION" && // exclut RETOUR_REPARATION
                          !m.confirme &&
                          user.id === m.responsableDestination?.id && ( // SEUL l'utilisateur assigné peut confirmer
                              <DropdownMenuItem onClick={() => { setSelectedMouvement(m); setDialogOpen(true); }}>
                                Confirmer réception
                              </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le mouvement</DialogTitle>
            <DialogDescription>Voulez-vous confirmer la réception de cet équipement ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleConfirmer}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogRetourOpen} onOpenChange={setDialogRetourOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retour de réparation</DialogTitle>
            <DialogDescription>Confirmer le retour de l'équipement en réparation</DialogDescription>
          </DialogHeader>
          <Select value={etatRetour} onValueChange={v => setEtatRetour(v as "FONCTIONNEL" | "EN_PANNE")}>
            <SelectTrigger><SelectValue placeholder="État final" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FONCTIONNEL">FONCTIONNEL</SelectItem>
              <SelectItem value="EN_PANNE">EN_PANNE</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogRetourOpen(false)}>Annuler</Button>
            <Button onClick={handleConfirmer}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
