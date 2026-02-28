"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { equipementService } from "@/lib/services/EquipementService";
import { Equipement } from "@/types/index";



/* 🔹 Couleur selon état */
const getStatusColor = (etat?: string) => {
  switch (etat) {
    case "FONCTIONNEL":
      return "bg-green-100 text-green-800 border-green-200";
    case "EN_PANNE":
    case "HORS_SERVICE":
      return "bg-red-100 text-red-800 border-red-200";
    case "EN_REPARATION":
    case "EN_TRANSIT":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function EquipementDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [equipement, setEquipement] = useState<Equipement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [hoverIndex, setHoverIndex] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [fadeIn, setFadeIn] = useState(false);


 useEffect(() => {
  if (!params?.id) return;

  const fetchEquipement = async () => {
    try {
      setLoading(true);

      const id = Number(params.id);
      const data = await equipementService.getById(id);

      if (!data) {
        setError("Équipement introuvable");
        return;
      }

      setEquipement(data);
      setTimeout(() => setFadeIn(true), 100);
    } catch (err: any) {
      setError(err.message || "Impossible de récupérer l'équipement");
    } finally {
      setLoading(false);
    }
  };

  fetchEquipement();
}, [params?.id]);



  /* 🔹 Hover images */
  const handleMouseEnter = () => {
    if (!equipement?.images || equipement.images.length <= 1) return;

    const id = window.setInterval(() => {
      setHoverIndex((prev) =>
        equipement.images ? (prev + 1) % equipement.images.length : 0
      );
    }, 1500);

    setIntervalId(id);
  };

  const handleMouseLeave = () => {
    if (intervalId !== null) clearInterval(intervalId);
    setIntervalId(null);
    setHoverIndex(0);
  };

  /* 🔹 États UI */
  if (loading) {
    return (
      <p className="text-center py-10 text-lg text-gray-500">
        Chargement...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center py-10 text-lg text-red-600">
        {error}
      </p>
    );
  }

  if (!equipement) {
    return (
      <p className="text-center py-10 text-lg text-gray-500">
        Équipement introuvable
      </p>
    );
  }

  return (
    <div className="px-4 py-8 space-y-6 max-w-5xl mx-auto">
      {/* 🔙 Retour */}
      <div className="flex justify-center mb-6">
        <Button
          variant="outline"
          className="transition-transform hover:scale-105 hover:bg-gray-100"
          onClick={() => router.push("/dashboard/equipements")}
        >
          ← Retour à la liste
        </Button>
      </div>

      {/* 🧾 Carte principale */}
      <Card
        className={`shadow-lg border border-gray-200 transition-opacity duration-700 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        <CardHeader className="pb-4 text-center space-y-2">
          <h2 className="text-lg md:text-xl font-semibold text-gray-600">
            Détail de l'équipement
          </h2>
          <CardTitle className="text-2xl md:text-3xl">
            {equipement.nom}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 🔹 État */}
          <div className="flex justify-center items-center gap-2">
            <strong>État :</strong>
            <Badge className={getStatusColor(equipement.etat)}>
              {equipement.etat}
            </Badge>
          </div>

          {/* 🔹 Modèle / Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded shadow-sm text-center">
              <h3 className="font-semibold mb-1 text-gray-700">Modèle</h3>
              <p>{equipement.modele || "-"}</p>
            </div>
          </div>

          {equipement.responsableActuel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-blue-700 text-center">
                Responsable actuel
              </h3>

              <p>
                <strong>Nom :</strong>{" "}
                {equipement.responsableActuel.prenom}{" "}
                {equipement.responsableActuel.nom}
              </p>

              <p>
                <strong>Email :</strong>{" "}
                {equipement.responsableActuel.email || "-"}
              </p>

              <p>
                <strong>Poste :</strong>{" "}
                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm">
                  {equipement.responsableActuel.poste?.nom || "-"}
                </span>
              </p>

              <p>
                <strong>Agence :</strong>{" "}
                {equipement.responsableActuel.agence?.nom_agence || "-"}
              </p>

              <p>
                <strong>Rôle :</strong>{" "}
                {equipement.responsableActuel.roles?.[0]?.role?.nom || "-"}
              </p>
            </div>
          )}


          {(equipement.agenceActuelle || equipement.pointServiceActuel) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-700 text-center">
                Localisation actuelle
              </h3>

              <p>
                <strong>Agence :</strong>{" "}
                {equipement.agenceActuelle?.nom_agence || "-"}
              </p>

              <p>
                <strong>Point de service :</strong>{" "}
                {equipement.pointServiceActuel?.nom || "-"}
              </p>
            </div>
          )}


          {/* 🖼 Images */}
          {equipement.images && equipement.images.length > 0 && (
            <div
              className="w-full h-80 md:h-96 overflow-hidden rounded-lg relative cursor-pointer shadow-md"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/${equipement.images[hoverIndex]}`}
                alt={`Image ${hoverIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {equipement.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {equipement.images.map((_, idx) => (
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

          {equipement.mouvements?.length > 0 && (
            <div className="mt-10 space-y-4">
              <h3 className="text-xl font-semibold text-center text-gray-700">
                Historique des mouvements
              </h3>

              {equipement.mouvements.map((mvt) => (
                <Card key={mvt.id} className="shadow-sm">
                  <CardContent className="space-y-2 text-sm">

                    <p><strong>Type :</strong> {mvt.type}</p>

                    <p>
                      <strong>Initiateur :</strong>{" "}
                      {mvt.initiateur
                        ? `${mvt.initiateur.prenom} ${mvt.initiateur.nom} (${mvt.initiateur.poste?.nom})`
                        : "-"}
                    </p>

                    <p>
                      <strong>Responsable destination :</strong>{" "}
                      {mvt.responsableDestination
                        ? `${mvt.responsableDestination.prenom} ${mvt.responsableDestination.nom}`
                        : "-"}
                    </p>

                    <p>
                      <strong>Agence source :</strong>{" "}
                      {mvt.agenceSource?.nom || "-"}
                    </p>

                    <p>
                      <strong>Agence destination :</strong>{" "}
                      {mvt.agenceDestination?.nom || "-"}
                    </p>

                    <p>
                      <strong>Point service source :</strong>{" "}
                      {mvt.pointServiceSource?.nom || "-"}
                    </p>

                    <p>
                      <strong>Point service destination :</strong>{" "}
                      {mvt.pointServiceDestination?.nom || "-"}
                    </p>

                    <p><strong>État avant :</strong> {mvt.etatAvant}</p>
                    <p><strong>État après :</strong> {mvt.etatApres}</p>

                    <p>
                      <strong>Date :</strong>{" "}
                      {new Date(mvt.createdAt).toLocaleString("fr-FR")}
                    </p>

                    {mvt.commentaire && (
                      <p className="italic text-gray-600">{mvt.commentaire}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
