"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  MessageSquare,
  FileText,
  Send,
} from "lucide-react";
import { getDemandeById, prendreDecision } from "@/lib/services/DemandeService";
import { useAuth } from "@/context/AuthContext";
import { Demande, Decision } from "@/types/index";

type StatusDecision = "APPROUVE" | "REFUSE";

export default function DemandeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const demandeId = Number.parseInt(params.id);
  const [demande, setDemande] = useState<Demande | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDecision, setNewDecision] = useState<{status: StatusDecision | "";}>({status: "",});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDemandeById(demandeId)
      .then(setDemande)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [demandeId]);

  if (loading) return <p>Chargement...</p>;
  if (!demande) return <p>Demande introuvable</p>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "APPROUVE":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REFUSE":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "EN_REVISION":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "APPROUVE":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "REFUSE":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "EN_REVISION":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CONGE":
        return "Congé payé";
      case "PERMISSION":
        return "Permission";
      case "ABSENCE":
        return "Absence";
      default:
        return type;
    }
  };

    const { user: currentUser } = useAuth();

    const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.status) return;

    if (!currentUser?.id) {
        setError("Vous devez être connecté pour prendre une décision.");
        return;
    }

    setSubmitting(true);
    setError(null);

    try {
        const updated = await prendreDecision(
        demande.id,
        currentUser.id, // ID de l'utilisateur connecté depuis le contexte
        newDecision.status as "APPROUVE" | "REFUSE",
        );

        setDemande(updated);
        setNewDecision({ status: "" }); // reset formulaire
    } catch (err: any) {
        setError(err.message || "Erreur lors de la prise de décision.");
    } finally {
        setSubmitting(false);
    }
    };


  const canMakeDecision = demande.status === "EN_ATTENTE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/demandes">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-balance">Demande #{demande.id}</h1>
          <p className="text-muted-foreground text-pretty">Détails et workflow de validation</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(demande.status)}
          <Badge variant="outline" className={getStatusColor(demande.status)}>
            {demande.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Demande Details */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Détails de la demande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Type</Label>
                  <p className="mt-1">{getTypeLabel(demande.type)}</p>
                </div>
                <div>
                  <Label>Employé</Label>
                  <p className="mt-1">
                    {demande.user ? `${demande.user.prenom} ${demande.user.nom}` : "—"}
                  </p>
                </div>
                <div>
                  <Label>Date de début</Label>
                  <p className="mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {new Date(demande.dateDebut).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <p className="mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    {new Date(demande.dateFin).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                {demande.conge && (
                  <div>
                    <Label>Nombre de jours</Label>
                    <p className="mt-1">{demande.conge.nbJours} jour(s)</p>
                  </div>
                )}
                {demande.demandePermission && (
                  <div>
                    <Label>Durée</Label>
                    <p className="mt-1">{demande.demandePermission.duree}</p>
                  </div>
                )}
                {demande.absence && (
                  <div>
                    <Label>Justification</Label>
                    <p className="mt-1 text-sm leading-relaxed">{demande.absence.justification}</p>
                  </div>
                )}
                <div>
                  <Label>Créée le</Label>
                  <p className="mt-1">{new Date(demande.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label>Motif</Label>
                <p className="mt-1 text-sm leading-relaxed">{demande.motif}</p>
              </div>
            </CardContent>
          </Card>

          {/* Decision Form */}
          {canMakeDecision && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Prendre une décision
                </CardTitle>
                <CardDescription>Approuvez, refusez ou demandez une révision</CardDescription>
              </CardHeader>
              <CardContent>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={handleDecision} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Décision</Label>
                    <Select
                      value={newDecision.status}
                      onValueChange={(value) =>
                        setNewDecision({ ...newDecision, status: value as StatusDecision})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une décision" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPROUVE">Approuver</SelectItem>
                        <SelectItem value="REFUSE">Refuser</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={!newDecision.status || submitting}
                    className="gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Envoi..." : "Envoyer la décision"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Workflow Timeline */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historique des décisions
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {demande.decisions?.map((decision, index) => (
                  <div key={decision.id} className="flex gap-3">
                    
                    {/* Ligne verticale et icône */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {getStatusIcon(decision.status)}
                      </div>
                      {index < (demande.decisions?.length ?? 0) - 1 && (
                        <div className="w-px h-8 bg-border mt-2" />
                      )}
                    </div>

                    {/* Détails de la décision */}
                    <div className="flex-1 pb-4">
                      
                      {/* Statut et date */}
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getStatusColor(decision.status)}>
                          {decision.status.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(decision.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>

                      {/* Niveau de décision */}
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="/placeholder.svg?height=24&width=24" />
                          <AvatarFallback className="text-xs">
                            {decision.niveau?.[0] || "—"} {/* Initiale du niveau */}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {decision.niveau || "—"} {/* Affiche toujours le niveau */}
                          </p>
                          {/* Ligne poste supprimée puisque inutile */}
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Employee Info */}
          <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informations employé
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Avatar et nom */}
                    <div className="flex items-center gap-4 mb-6">
                    <Avatar className="w-16 h-16">
                        <AvatarImage src="/placeholder.svg?height=64&width=64" />
                        <AvatarFallback className="text-xl">
                        {demande.user
                            ? `${demande.user.prenom[0]}${demande.user.nom[0]}`
                            : "—"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-xl font-semibold">
                        {demande.user ? `${demande.user.prenom} ${demande.user.nom}` : "—"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                        {demande.user?.poste?.nom ?? "Poste non défini"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                        Agence: {demande.user?.agence?.nom_agence ?? "Non défini"}
                        </p>
                    </div>
                    </div>

                    {/* Infos en grille */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Chef:</span>
                        <span>{demande.user?.chef ? `${demande.user.chef.prenom} ${demande.user.chef.nom}` : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Email:</span>
                        <span>{demande.user?.email ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Username:</span>
                        <span>{demande.user?.username ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground font-medium">Rôles:</span>
                        <span className="flex flex-wrap gap-1">
                        {demande.user?.roles?.map(r => (
                            <Badge key={r.roleId} variant="secondary">{r.role?.nom}</Badge>
                        )) ?? "Aucun"}
                        </span>
                    </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
