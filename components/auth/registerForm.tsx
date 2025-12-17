"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [registerData, setRegisterData] = useState({
    nom: "",
    prenom: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    poste: "",
    agenceId: 1, // valeur par défaut à adapter selon tes agences
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        nom: registerData.nom,
        prenom: registerData.prenom,
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        poste: registerData.poste,
        agenceId: Number(registerData.agenceId), // s'assurer que c'est un nombre
      });
      router.push("/login"); // redirection après inscription
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg bg-card/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Créer un compte</CardTitle>
          <CardDescription>Remplissez les informations ci-dessous</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input
                  id="nom"
                  name="nom"
                  value={registerData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={registerData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                name="username"
                value={registerData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={registerData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="poste">Poste</Label>
              <Input
                id="poste"
                name="poste"
                value={registerData.poste}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="agenceId">Agence</Label>
              <select
                id="agenceId"
                name="agenceId"
                value={registerData.agenceId}
                onChange={handleChange}
                className="w-full h-11 border border-border/50 rounded-md p-2"
                required
              >
                <option value={1}>Agence 1</option>
                <option value={2}>Agence 2</option>
                {/* Ajoute d'autres agences ici */}
              </select>
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={registerData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={registerData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer mon compte"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login" className="text-primary hover:underline">
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
