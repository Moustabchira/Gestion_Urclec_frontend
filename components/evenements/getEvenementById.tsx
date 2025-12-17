"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Evenement } from "@/types/index";
import * as EvenementService from "@/lib/services/EvenementService";

const getStatusColor = (statut?: string) => {
  switch (statut) {
    case "EN_ATTENTE": return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "VALIDE": return "bg-green-100 text-green-800 border-green-200";
    case "REJETE": return "bg-red-100 text-red-800 border-red-200";
    case "PUBLIE": return "bg-blue-100 text-blue-800 border-blue-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function EvenementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [evenement, setEvenement] = useState<Evenement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoverIndex, setHoverIndex] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    const fetchEvenement = async () => {
      try {
        setLoading(true);
        const data = await EvenementService.getEvenementById(Number(params.id));
        setEvenement(data);
        setTimeout(() => setFadeIn(true), 100); // fade-in progressif
      } catch (err: any) {
        setError(err.message || "Impossible de récupérer l'événement");
      } finally {
        setLoading(false);
      }
    };
    fetchEvenement();
  }, [params?.id]);

  const handleMouseEnter = () => {
    if (!evenement?.images || evenement.images.length <= 1) return;
    const id = window.setInterval(() => {
      setHoverIndex((prev) => (evenement.images ? (prev + 1) % evenement.images.length : 0));
    }, 1500);
    setIntervalId(id);
  };

  const handleMouseLeave = () => {
    if (intervalId !== null) clearInterval(intervalId);
    setIntervalId(null);
    setHoverIndex(0);
  };

  if (loading) return <p className="text-center py-10 text-lg text-gray-500">Chargement...</p>;
  if (error) return <p className="text-center py-10 text-lg text-red-600">{error}</p>;
  if (!evenement) return <p className="text-center py-10 text-lg text-gray-500">Événement introuvable</p>;

  return (
    <div className="px-4 py-8 space-y-6 max-w-5xl mx-auto">
      {/* Bouton retour */}
      <div className="flex justify-center mb-6">
        <Button
          variant="outline"
          className="transition-transform hover:scale-105 hover:bg-gray-100"
          onClick={() => router.push("/dashboard/evenements")}
        >
          ← Retour à la liste
        </Button>
      </div>

      {/* Carte principale */}
      <Card className={`shadow-lg border border-gray-200 transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <CardHeader className="pb-4 text-center space-y-2">
          {/* Détail de l'événement */}
          <h2 className="text-lg md:text-xl font-semibold text-gray-600">Détail de l'événement</h2>
          {/* Titre principal */}
          <CardTitle className="text-2xl md:text-3xl">{evenement.titre}</CardTitle>
          <CardDescription className="text-gray-500">
            Créé le : {new Date(evenement.createdAt).toLocaleDateString("fr-FR")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Statut */}
          <div className={`flex justify-center items-center gap-2 transition-opacity duration-700 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
            <strong>Statut :</strong>
            <Badge className={getStatusColor(evenement.statut)}>{evenement.statut || "EN_ATTENTE"}</Badge>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity duration-700">
            <div className="bg-gray-50 p-4 rounded shadow-sm text-center">
              <h3 className="font-semibold mb-1 text-gray-700">Date de début</h3>
              <p>{evenement.dateDebut ? new Date(evenement.dateDebut).toLocaleString("fr-FR") : "-"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded shadow-sm text-center">
              <h3 className="font-semibold mb-1 text-gray-700">Date de fin</h3>
              <p>{evenement.dateFin ? new Date(evenement.dateFin).toLocaleString("fr-FR") : "-"}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-4 rounded shadow-sm transition-opacity duration-700 text-center">
            <h3 className="font-semibold mb-2 text-gray-700">Description</h3>
            <p className="text-gray-700">{evenement.description}</p>
          </div>

          {/* Images */}
          {evenement.images && evenement.images.length > 0 && (
            <div
              className="w-full h-80 md:h-96 overflow-hidden rounded-lg relative cursor-pointer shadow-md transition-opacity duration-700"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${evenement.images[hoverIndex]}`}
                alt={`Image ${hoverIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              {evenement.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {evenement.images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-3 h-3 rounded-full border border-white ${
                        idx === hoverIndex ? "bg-white" : "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
