"use client";

import { useEffect, useState } from "react";
import AffectationService, { Affectation } from "@/lib/services/AffectationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoreHorizontal, Search } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function AffectationsPage() {
  const service = new AffectationService();

  const [historique, setHistorique] = useState<Affectation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employeFilter, setEmployeFilter] = useState<string>("all");
  const [pointServiceFilter, setPointServiceFilter] = useState<string>("all");

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"retirer" | "status" | null>(null);
  const [selectedAffectation, setSelectedAffectation] = useState<Affectation | null>(null);
  const [newStatus, setNewStatus] = useState<"BON" | "ABIME" | "PERDU" | "RETIRE">("BON");

  // Couleurs pour chaque status
  const statusColors: Record<"BON" | "ABIME" | "PERDU" | "RETIRE", string> = {
    BON: "#22c55e",     // vert
    ABIME: "#eab308",   // jaune
    PERDU: "#ef4444",   // rouge
    RETIRE: "#9ca3af",  // gris
  };

  // Badge inline
  const StatusBadge = ({ status }: { status: "BON" | "ABIME" | "PERDU" | "RETIRE" }) => (
    <span
      style={{
        backgroundColor: statusColors[status],
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

  // Fetch historique
  const fetchHistorique = async () => {
    setLoading(true);
    try {
      const data = await service.getHistorique();
      setHistorique(data);
    } catch (err: any) {
      toast.error(err.message || "Erreur récupération historique");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorique();
  }, []);

  // Actions
  const handleConfirmRetirer = async () => {
    if (!selectedAffectation) return;
    try {
      await service.retirer(selectedAffectation.id);
      toast.success("Affectation terminée");
      fetchHistorique();
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur retour équipement");
    }
  };

  const handleConfirmStatus = async () => {
    if (!selectedAffectation) return;
    try {
      await service.changerStatus(selectedAffectation.id, newStatus);
      toast.success("Status mis à jour");
      fetchHistorique();
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erreur changement status");
    }
  };

   const handleDownloadPdf = async () => {
    try {
      await service.downloadHistoriquePdf();
      toast.success("PDF téléchargé !");
    } catch (err: any) {
      toast.error("Erreur lors du téléchargement du PDF");
    }
  };

  // Liste employés / points
  const employes = Array.from(new Set(historique.map(a => a.employe ? `${a.employe.prenom} ${a.employe.nom}` : "-")));
  const points = Array.from(new Set(historique.flatMap(a => [a.pointServiceOrigine?.nom, a.pointServiceDest?.nom]).filter(Boolean)));
  console.log("Points de service disponibles pour filtrage :", points);
  
  // Filtrage
  const filtered = historique
    .filter(a => (statusFilter === "all" || a.status === statusFilter))
    .filter(a => (employeFilter === "all" || (a.employe ? `${a.employe.prenom} ${a.employe.nom}` : "-") === employeFilter))
    .filter(a => 
      pointServiceFilter === "all" || 
      a.pointServiceOrigine?.nom === pointServiceFilter || 
      a.pointServiceDest?.nom === pointServiceFilter
    )

  // Stats barre
  const total = filtered.length;
  const countByStatus = {
    BON: filtered.filter(a => a.status === "BON").length,
    ABIME: filtered.filter(a => a.status === "ABIME").length,
    PERDU: filtered.filter(a => a.status === "PERDU").length,
    RETIRE: filtered.filter(a => a.status === "RETIRE").length,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Suivi des équipements</h1>
      <p className="text-muted-foreground">Total affectations : <strong>{total}</strong></p>

      {/* Stats Cards pour répartition par status */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {(["BON","ABIME","PERDU","RETIRE"] as const).map((status, index) => {
          const count = countByStatus[status];
          const percent = total > 0 ? (count / total) * 100 : 0;
          return (
            <Card key={index} className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{status}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {percent.toFixed(0)}%
                </div>
                <div className="mt-2 h-2 w-full bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${percent}%`, backgroundColor: statusColors[status] }}
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>


        {/* Filtres */}
      <Card className="border-border/50">
        <CardContent className="pt-6 flex gap-4 flex-wrap">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="BON">BON</SelectItem>
              <SelectItem value="ABIME">ABIME</SelectItem>
              <SelectItem value="PERDU">PERDU</SelectItem>
              <SelectItem value="RETIRE">RETIRE</SelectItem>
            </SelectContent>
          </Select>

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
              {points
                .filter((p): p is string => typeof p === "string")
                .map(p => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>  
        </CardContent>
      </Card>


      {/* Tableau historique */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des affectations</CardTitle>
          <CardDescription>{filtered.length} affectation(s)</CardDescription>
          <Button className="ml-auto" onClick={handleDownloadPdf}>Télécharger PDF</Button>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Équipement</TableHead>
                <TableHead>Employé</TableHead>
                <TableHead>Point de service</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Affectation</TableHead>
                <TableHead>Date Fin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(a => (
                <TableRow key={a.id} className={a.status !== "RETIRE" ? "bg-gray-50" : ""}>
                  <TableCell>{a.equipement?.nom}</TableCell>
                  <TableCell>{a.employe ? `${a.employe.prenom} ${a.employe.nom}` : "-"}</TableCell>
                  <TableCell>
                    Origine: {a.pointServiceOrigine?.nom || "-"} <br />
                    Destination: {a.pointServiceDest?.nom || "-"}
                  </TableCell>
                  <TableCell>{a.quantite}</TableCell>
                  <TableCell><StatusBadge status={a.status as any} /></TableCell>
                  <TableCell>{new Date(a.dateAffectation!).toLocaleDateString()}</TableCell>
                  <TableCell>{a.dateFin ? new Date(a.dateFin).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>
                    {a.status !== "RETIRE" && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded hover:bg-gray-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => { setSelectedAffectation(a); setDialogAction("retirer"); setDialogOpen(true); }}>Retirer</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedAffectation(a); setDialogAction("status"); setDialogOpen(true); }}>Changer status</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogAction === "retirer" ? "Confirmer le retour" : "Changer le status"}</DialogTitle>
            <DialogDescription>
              {dialogAction === "retirer"
                ? "Voulez-vous vraiment marquer cette affectation comme terminée ?"
                : "Sélectionnez le nouveau status de l'affectation."}
            </DialogDescription>
          </DialogHeader>

          {dialogAction === "status" && (
            <div className="flex flex-col gap-2 mt-4">
              {(["BON","ABIME","PERDU","RETIRE"] as const).map(s => (
                <Button
                  key={s}
                  style={{
                    backgroundColor: newStatus === s ? statusColors[s] : "transparent",
                    color: newStatus === s ? "#fff" : "#000",
                    border: `1px solid ${statusColors[s]}`
                  }}
                  onClick={() => setNewStatus(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          )}

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={dialogAction === "retirer" ? handleConfirmRetirer : handleConfirmStatus}>
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
