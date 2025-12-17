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
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  Send,
} from "lucide-react";
import { getDemandeById, prendreDecision } from "@/lib/services/DemandeService";
import { useAuth } from "@/context/AuthContext";
import { Demande, User } from "@/types/index";

// 🔹 Helper pour extraire les rôles utilisateur
const extractRoles = (user: User) => {
  return (user.roles ?? [])
    .map(r => (typeof r === "string" ? r : r?.role?.nom))
    .filter((r): r is string => !!r)
    .map(r => r.toUpperCase());
};

// 🔹 Retourne la dernière décision pour un niveau donné
const getLastDecisionForLevel = (decisions: any[], niveau: string) => {
  const filtered = decisions.filter(d => d.niveau === niveau);
  if (filtered.length === 0) return null;
  return filtered[filtered.length - 1];
};

type StatusDecision = "APPROUVE" | "REFUSE";

export default function DemandeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const demandeId = Number(params.id);

  const [demande, setDemande] = useState<Demande | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDecision, setNewDecision] = useState<{ status: StatusDecision | "" }>({ status: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user: currentUser } = useAuth();

  // 🔹 Chargement de la demande
  useEffect(() => {
    console.log("🔹 Chargement de la demande", demandeId);
    setLoading(true);
    getDemandeById(demandeId)
      .then(d => {
        console.log("✅ Demande récupérée :", d);
        setDemande(d);
      })
      .catch((err) => {
        console.error("❌ Erreur lors du fetch :", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [demandeId]);

  if (loading) return <p>Chargement...</p>;
  if (!demande) return <p>Demande introuvable</p>;

  // 🔹 Vérifier si l'utilisateur peut prendre une décision
  const canMakeDecision = () => {
    if (!currentUser || !demande) return false;

    console.log("🔹 Vérification droits décision pour :", currentUser);
    const decisions = demande.decisions ?? [];
    const niveaux = ["CHEF", "DRH", "DG"];

    for (const niveau of niveaux) {
      const last = getLastDecisionForLevel(decisions, niveau);
      console.log(`Niveau ${niveau} - dernière décision :`, last);

      if (!last) {
        const idx = niveaux.indexOf(niveau);
        const prevApproved = idx === 0 || decisions.filter(d => d.niveau === niveaux[idx - 1]).some(d => d.status === "APPROUVE");
        if (prevApproved) {
          if ((niveau === "CHEF" && demande.user?.chefId === currentUser.id) ||
              (niveau !== "CHEF" && extractRoles(currentUser).includes(niveau))) {
            console.log("➡ Peut prendre décision pour niveau", niveau);
            return true;
          }
        }
      } else if (last.status === "EN_ATTENTE") {
        if ((niveau === "CHEF" && demande.user?.chefId === currentUser.id) ||
            (niveau !== "CHEF" && extractRoles(currentUser).includes(niveau))) {
          console.log("➡ Peut prendre décision pour niveau", niveau);
          return true;
        }
      }
    }

    console.log("❌ Ne peut pas prendre de décision");
    return false;
  };

  // 🔹 Construire le workflow visible par utilisateur
  const getWorkflowForUser = (demande: Demande, user: User | null) => {
    if (!demande || !user) return [];

    const decisions = demande.decisions ?? [];
    const niveaux = ["CHEF", "DRH", "DG"];
    const visible: { niveau: string; status: string }[] = [];

    niveaux.forEach((niveau, i) => {
      const levelDecisions = decisions.filter(d => d.niveau === niveau);
      let status = "EN_ATTENTE";

      if (levelDecisions.length > 0) {
        if (levelDecisions.some(d => d.status === "REFUSE")) status = "REFUSE";
        else if (levelDecisions.every(d => d.status === "APPROUVE")) status = "APPROUVE";
        visible.push({ niveau, status });
      } else if (i === 0 || visible[i - 1]?.status === "APPROUVE") {
        visible.push({ niveau, status });
      }
    });

    console.log("🔹 Workflow pour l'utilisateur :", visible);
    return visible;
  };

  // 🔹 Prendre une décision
  const handleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.status) return;
    if (!currentUser?.id) {
      setError("Vous devez être connecté pour prendre une décision.");
      return;
    }

    console.log("🔹 Tentative de prise de décision :", newDecision.status);
    setSubmitting(true);
    setError(null);

    try {
      const updated = await prendreDecision(demande.id, currentUser.id, newDecision.status);
      console.log("✅ Décision prise avec succès :", updated);
      setDemande(updated);
      setNewDecision({ status: "" });
    } catch (err: any) {
      console.error("❌ Erreur lors de la décision :", err);
      if (err?.message?.includes("déjà pris")) {
        setError("Vous avez déjà pris votre décision pour ce niveau.");
      } else {
        setError(err.message || "Erreur lors de la prise de décision.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EN_ATTENTE": return <Clock className="w-4 h-4 text-yellow-600" />;
      case "APPROUVE": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "REFUSE": return <XCircle className="w-4 h-4 text-red-600" />;
      case "EN_REVISION": return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "APPROUVE": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "REFUSE": return "bg-red-500/10 text-red-600 border-red-500/20";
      case "EN_REVISION": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CONGE": return "Congé payé";
      case "PERMISSION": return "Permission";
      case "ABSENCE": return "Absence";
      default: return type;
    }
  };

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
          {/* Détails de la demande */}
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
                  <p className="mt-1">{demande.user ? `${demande.user.prenom} ${demande.user.nom}` : "—"}</p>
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
              </div>
              <Separator />
              <div>
                <Label>Motif</Label>
                <p className="mt-1 text-sm leading-relaxed">{demande.motif}</p>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire décision */}
          {canMakeDecision() && (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Prendre une décision
                </CardTitle>
                <CardDescription>Approuvez ou refusez la demande</CardDescription>
              </CardHeader>
              <CardContent>
                {error && <p className="text-red-500 mb-2">{error}</p>}
                <form onSubmit={handleDecision} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Décision</Label>
                    <Select
                      value={newDecision.status}
                      onValueChange={(value) => setNewDecision({ status: value as StatusDecision })}
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
                  <Button type="submit" disabled={!newDecision.status || submitting} className="gap-2">
                    <Send className="w-4 h-4" />
                    {submitting ? "Envoi..." : "Envoyer la décision"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Workflow & infos employé */}
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Historique des décisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getWorkflowForUser(demande, currentUser).map((d, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                        {getStatusIcon(d.status)}
                      </div>
                      {index < getWorkflowForUser(demande, currentUser).length - 1 && (
                        <div className="w-px h-8 bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getStatusColor(d.status)}>
                          {d.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium">{d.niveau}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
