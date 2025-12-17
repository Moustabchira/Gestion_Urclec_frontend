"use client"
import Link from "next/link"
import { Eye, Users, Clock, CheckCircle } from "lucide-react"
import { Search, Calendar, XCircle, AlertCircle } from "lucide-react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Demande {
  id: number
  type: string
  dateDebut: string
  dateFin: string
  motif: string
  status: string
  createdAt: string
  employee: string
  nbJours?: number
  duree?: string
  justification?: string
}

export default function DemandesEquipePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Mock data - demandes de l'équipe du responsable connecté
  const [demandes] = useState<Demande[]>([
    {
      id: 1,
      type: "CONGE",
      dateDebut: "2025-01-15",
      dateFin: "2025-01-19",
      motif: "Vacances familiales",
      status: "EN_ATTENTE",
      createdAt: "2025-01-10",
      employee: "Marie Martin",
      nbJours: 5,
    },
    {
      id: 2,
      type: "PERMISSION",
      dateDebut: "2025-01-22",
      dateFin: "2025-01-22",
      motif: "Rendez-vous médical",
      status: "APPROUVE",
      createdAt: "2025-01-08",
      employee: "Thomas Bernard",
      duree: "2 heures",
    },
    {
      id: 3,
      type: "ABSENCE",
      dateDebut: "2025-01-20",
      dateFin: "2025-01-21",
      motif: "Maladie",
      status: "EN_ATTENTE",
      createdAt: "2025-01-19",
      employee: "Julie Moreau",
      justification: "Certificat médical fourni",
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "APPROUVE":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "REFUSE":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "EN_REVISION":
        return <AlertCircle className="w-4 h-4 text-blue-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "APPROUVE":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "REFUSE":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      case "EN_REVISION":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "CONGE":
        return "Congé payé"
      case "PERMISSION":
        return "Permission"
      case "ABSENCE":
        return "Absence"
      default:
        return type
    }
  }

  const filteredDemandes = demandes.filter((demande) => {
    const matchesSearch =
      demande.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demande.motif.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || demande.status === statusFilter
    const matchesType = typeFilter === "all" || demande.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  // Statistiques pour le responsable
  const stats = [
    {
      title: "Équipe",
      value: "8",
      description: "membres",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "En attente",
      value: demandes.filter((d) => d.status === "EN_ATTENTE").length.toString(),
      description: "à traiter",
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Approuvées",
      value: demandes.filter((d) => d.status === "APPROUVE").length.toString(),
      description: "ce mois",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Demandes de mon équipe</h1>
        <p className="text-muted-foreground mt-2 text-pretty">Gérez les demandes de vos collaborateurs directs</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par employé ou motif..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="APPROUVE">Approuvé</SelectItem>
                <SelectItem value="REFUSE">Refusé</SelectItem>
                <SelectItem value="EN_REVISION">En révision</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="CONGE">Congé payé</SelectItem>
                <SelectItem value="PERMISSION">Permission</SelectItem>
                <SelectItem value="ABSENCE">Absence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Demandes Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Demandes de l'équipe</CardTitle>
          <CardDescription>{filteredDemandes.length} demande(s) trouvée(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Motif</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDemandes.map((demande) => (
                <TableRow key={demande.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{demande.employee}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-muted/50">
                      {getTypeLabel(demande.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      {new Date(demande.dateDebut).toLocaleDateString("fr-FR")} -{" "}
                      {new Date(demande.dateFin).toLocaleDateString("fr-FR")}
                    </div>
                    {demande.nbJours && <div className="text-xs text-muted-foreground">{demande.nbJours} jour(s)</div>}
                    {demande.duree && <div className="text-xs text-muted-foreground">{demande.duree}</div>}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={demande.motif}>
                      {demande.motif}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(demande.status)}
                      <Badge variant="outline" className={getStatusColor(demande.status)}>
                        {demande.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(demande.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/demandes/${demande.id}`}>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Traiter
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
