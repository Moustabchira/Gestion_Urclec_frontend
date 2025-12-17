"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, FileText, Clock, CheckCircle, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { useState } from "react";

export default function DashboardPage() {

  type Role = "Employé" | "Responsable Hiérarchique" | "DRH" | "DG";

  const [currentUserRole, setCurrentUserRole] = useState<Role>("DRH");

  const monthlyRequestsData = [
    { month: "Jan", demandes: 12, approuvees: 10, refusees: 2 },
    { month: "Fév", demandes: 15, approuvees: 13, refusees: 2 },
    { month: "Mar", demandes: 18, approuvees: 16, refusees: 2 },
    { month: "Avr", demandes: 22, approuvees: 20, refusees: 2 },
    { month: "Mai", demandes: 28, approuvees: 25, refusees: 3 },
    { month: "Jun", demandes: 35, approuvees: 32, refusees: 3 },
  ]

  const requestTypeData = [
    { type: "Congé payé", count: 45, color: "hsl(var(--chart-rose))" },
    { type: "Permission", count: 28, color: "hsl(var(--chart-rose))" },
    { type: "Absence maladie", count: 15, color: "hsl(var(--chart-rose))" },
    { type: "Congé sans solde", count: 8, color: "hsl(var(--chart-rose))" },
  ]

  const departmentData = [
    { department: "IT", demandes: 25 },
    { department: "RH", demandes: 18 },
    { department: "Finance", demandes: 22 },
    { department: "Marketing", demandes: 15 },
    { department: "Ventes", demandes: 30 },
  ]

  const chartConfig = {
    demandes: {
      label: "Demandes",
      color: "hsl(var(--chart-1))",
    },
    approuvees: {
      label: "Approuvées",
      color: "hsl(var(--chart-2))",
    },
    refusees: {
      label: "Refusées",
      color: "hsl(var(--chart-3))",
    },
  }

  const getStatsForRole = (role: Role) => {

    if (role === "Employé") {
      return [
        {
          title: "Mes demandes",
          value: "3",
          description: "cette année",
          icon: FileText,
          trend: "up",
        },
        {
          title: "Jours de congés",
          value: "25",
          description: "restants",
          icon: Calendar,
          trend: "neutral",
        },
        {
          title: "En attente",
          value: "1",
          description: "demande",
          icon: Clock,
          trend: "neutral",
        },
        {
          title: "Approuvées",
          value: "2",
          description: "ce mois",
          icon: CheckCircle,
          trend: "up",
        },
      ]
    }

    if (role === "Responsable Hiérarchique") {
      return [
        {
          title: "Mon équipe",
          value: "8",
          description: "collaborateurs",
          icon: Users,
          trend: "neutral",
        },
        {
          title: "À traiter",
          value: "3",
          description: "demandes",
          icon: Clock,
          trend: "up",
        },
        {
          title: "Approuvées",
          value: "12",
          description: "ce mois",
          icon: CheckCircle,
          trend: "up",
        },
        {
          title: "Congés équipe",
          value: "5",
          description: "cette semaine",
          icon: Calendar,
          trend: "neutral",
        },
      ]
    }

    // DRH/DG stats
    return [
      {
        title: "Demandes en attente",
        value: "12",
        description: "+2 depuis hier",
        icon: Clock,
        trend: "up",
      },
      {
        title: "Demandes approuvées",
        value: "48",
        description: "+8 cette semaine",
        icon: CheckCircle,
        trend: "up",
      },
      {
        title: "Employés actifs",
        value: "156",
        description: "2 nouveaux ce mois",
        icon: Users,
        trend: "up",
      },
      {
        title: "Congés ce mois",
        value: "23",
        description: "Pic en juillet",
        icon: Calendar,
        trend: "neutral",
      },
    ]
  }

  const getRecentRequestsForRole = (role: Role) => {
    if (role === "Employé") {
      return [
        {
          id: 1,
          employee: "Mes demandes",
          type: "Congé payé",
          dates: "15-19 Jan 2025",
          status: "En attente",
          priority: "normal",
        },
        {
          id: 2,
          employee: "Mes demandes",
          type: "Permission",
          dates: "22 Jan 2025",
          status: "Approuvé",
          priority: "low",
        },
      ]
    }

    if (role === "Responsable Hiérarchique") {
      return [
        {
          id: 1,
          employee: "Marie Martin",
          type: "Congé payé",
          dates: "15-19 Jan 2025",
          status: "En attente",
          priority: "normal",
        },
        {
          id: 2,
          employee: "Thomas Bernard",
          type: "Permission",
          dates: "22 Jan 2025",
          status: "À traiter",
          priority: "high",
        },
        {
          id: 3,
          employee: "Julie Moreau",
          type: "Absence maladie",
          dates: "20-21 Jan 2025",
          status: "En attente",
          priority: "high",
        },
      ]
    }

    // DRH/DG requests
    return [
      {
        id: 1,
        employee: "Marie Martin",
        type: "Congé payé",
        dates: "15-19 Jan 2025",
        status: "En attente",
        priority: "normal",
      },
      {
        id: 2,
        employee: "Pierre Durand",
        type: "Permission",
        dates: "22 Jan 2025",
        status: "Approuvé",
        priority: "low",
      },
      {
        id: 3,
        employee: "Sophie Leroy",
        type: "Absence maladie",
        dates: "20-21 Jan 2025",
        status: "En attente",
        priority: "high",
      },
      {
        id: 4,
        employee: "Thomas Bernard",
        type: "Congé sans solde",
        dates: "1-15 Fév 2025",
        status: "En révision",
        priority: "normal",
      },
    ]
  }

  const stats = getStatsForRole(currentUserRole)
  const recentRequests = getRecentRequestsForRole(currentUserRole)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En attente":
      case "À traiter":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "Approuvé":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "En révision":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === "high") {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const getPageTitle = (role: Role) => {
    switch (role) {
      case "Employé":
        return "Mon espace personnel"
      case "Responsable Hiérarchique":
        return "Gestion d'équipe"
      case "DRH":
        return "Tableau de bord"
      case "DG":
        return "Vue direction générale"
      default:
        return "Tableau de bord"
    }
  }

  const getPageDescription = (role: Role) => {
    switch (role) {
      case "Employé":
        return "Suivez vos demandes et gérez vos congés"
      case "Responsable Hiérarchique":
        return "Gérez les demandes de votre équipe"
      case "DRH":
        return "Vue d'ensemble complète du système "
      case "DG":
        return "Supervision générale des ressources humaines"
      default:
        return "Vue d'ensemble de votre système de gestion "
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">{getPageTitle(currentUserRole)}</h1>
        <p className="text-muted-foreground mt-2 text-pretty">{getPageDescription(currentUserRole)}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {stat.trend === "up" && <TrendingUp className="w-3 h-3 text-primary" />}
                {stat.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(currentUserRole === "DRH" || currentUserRole === "DG") && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Requests Trend */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Évolution des demandes</CardTitle>
              <CardDescription>Demandes par mois avec statuts</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={monthlyRequestsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-rose))" opacity={0.3} />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--chart-rose))"
                    fontSize={12}
                    tickLine={{ stroke: "hsl(var(--chart-rose))" }}
                    axisLine={{ stroke: "hsl(var(--chart-rose))" }}
                  />
                  <YAxis
                    stroke="hsl(var(--chart-rose))"
                    fontSize={12}
                    tickLine={{ stroke: "hsl(var(--chart-rose))" }}
                    axisLine={{ stroke: "hsl(var(--chart-rose))" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="demandes"
                    stroke="hsl(var(--chart-rose))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-rose))", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="approuvees"
                    stroke="hsl(var(--chart-rose))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-rose))", strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Request Types Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Types de demandes</CardTitle>
              <CardDescription>Répartition par type de congé</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={requestTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {requestTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
              <div className="flex flex-wrap gap-2 mt-4">
                {requestTypeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Department Requests */}
          <Card className="border-border/50 md:col-span-2">
            <CardHeader>
              <CardTitle>Demandes par département</CardTitle>
              <CardDescription>Nombre de demandes par service</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-1))" opacity={0.3} />
                  <XAxis
                    dataKey="department"
                    stroke="hsl(var(--chart-1))"
                    fontSize={12}
                    tickLine={{ stroke: "hsl(var(--chart-1))" }}
                    axisLine={{ stroke: "hsl(var(--chart-1))" }}
                  />
                  <YAxis
                    stroke="hsl(var(--chart-1))"
                    fontSize={12}
                    tickLine={{ stroke: "hsl(var(--chart-1))" }}
                    axisLine={{ stroke: "hsl(var(--chart-1))" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="demandes" fill="hsl(var(--chart-rose))" radius={[4, 4, 0, 0]} />                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Requests */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {currentUserRole === "Employé"
              ? "Mes demandes récentes"
              : currentUserRole === "Responsable Hiérarchique"
              ? "Demandes de l'équipe"
              : "Demandes récentes"}
          </CardTitle>
          <CardDescription>
            {currentUserRole === "Employé"
              ? "Vos dernières demandes de congés et permissions"
              : currentUserRole === "Responsable Hiérarchique"
              ? "Les demandes de vos collaborateurs à traiter"
              : "Les dernières demandes de congés et permissions"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getPriorityIcon(request.priority)}
                  <div>
                    <p className="font-medium">{request.employee}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.type} • {request.dates}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
