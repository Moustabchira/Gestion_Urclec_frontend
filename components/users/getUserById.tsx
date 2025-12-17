"use client";

import { useState, useEffect } from "react";
import { getUserById } from "@/lib/services/UserService";
import { User } from "@/types/index";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, User as UserIcon, Mail, Briefcase, Building, UserCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserDetailProps {
  userId: string | number;
  onBack: () => void; // callback pour retourner à la liste
}

export default function UserDetail({ userId, onBack }: UserDetailProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUserById(userId);
        if (!data) setError("Utilisateur non trouvé");
        else setUser(data);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "DG": return "bg-purple-100 text-purple-700 border-purple-200";
      case "DRH": return "bg-red-100 text-red-700 border-red-200";
      case "Responsable Hiérarchique": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Employé": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="animate-spin w-12 h-12 text-blue-600" />
      </div>
    );

  if (error)
    return <div className="text-red-500 py-32 text-center font-medium text-lg">{error}</div>;

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <Button
        variant="outline"
        className="mb-6 flex items-center gap-2"
        onClick={onBack}
      >
        <ArrowLeft className="w-5 h-5" /> Retour à la liste
      </Button>

      <Card className="shadow-lg border border-gray-100">
        <CardHeader className="text-center py-6">
          <UserIcon className="w-20 h-20 text-gray-400 mx-auto mb-4" />
          <CardTitle className="text-3xl">{user.prenom} {user.nom}</CardTitle>
          <CardDescription className="text-gray-500 text-lg">Fiche détaillée de l'utilisateur</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-lg">
            <div className="flex items-center gap-3">
              <UserIcon className="w-6 h-6 text-gray-500" />
              <span><strong>Username:</strong> {user.username}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-gray-500" />
              <span><strong>Email:</strong> {user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-gray-500" />
              <span><strong>Poste:</strong> {user.poste?.nom || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Building className="w-6 h-6 text-gray-500" />
              <span><strong>Agence:</strong> {user.agence?.nom_agence || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <UserCheck className="w-6 h-6 text-gray-500" />
              <span><strong>Chef:</strong> {user.chef ? `${user.chef.prenom} ${user.chef.nom}` : "—"}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <strong>Rôles:</strong>
              {user.roles?.map(r => (
                <Badge key={r.roleId} className={getRoleColor(r.role?.nom || "")}>
                  {r.role?.nom}
                </Badge>
              )) || "—"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
