"use client";

import Link from "next/link";
import { useState } from "react";
import { Monitor, Building, Users, FileText, Briefcase, ChevronDown, ChevronUp, ShieldCheck, LockKeyhole, Calendar, Activity} from "lucide-react";

export default function Sidebar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background border-r w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-16 border-b">
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg overflow-hidden">
          <img
            src="/images/urclec.png"
            alt="Logo"
            className="w-40 h-auto"
          />
        </div>
        <span className="text-lg font-semibold text-red-800">URCLEC</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
        >
          <Monitor className="w-5 h-5" />
          Tableau de bord
        </Link>

        <Link
          href="/dashboard/agences"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
        >
          <Building className="w-5 h-5" />
          Agences
        </Link>


        <Link
          href="/dashboard/pointDeServices"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
        >
          <Building className="w-5 h-5" />
          Points de service
        </Link>


        {/* Utilisateurs avec sous-menu */}
        <div>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              Utilisateurs
            </div>
            {userMenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {userMenuOpen && (
            <div className="ml-6 mt-1 flex flex-col space-y-1">
              <Link
                href="/dashboard/users"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
              >
                <Users className="w-4 h-4" />
                Liste des utilisateurs
              </Link>
              <Link
                href="/dashboard/users/roles"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
              >
                <ShieldCheck size={20} />               
                Rôles
              </Link>
              <Link
                href="/dashboard/users/permission"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
              >
                <LockKeyhole size={20} />
                Permissions
              </Link>
              <Link
                href="/dashboard/users/poste"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
              >
                <Briefcase size={20} />
                Postes
              </Link>
            </div>
          )}
        </div>

        {/* Lien pour voir toutes les demandes (admin / DRH) */}
        <Link
          href="/dashboard/demandes"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
        >
          <FileText className="w-5 h-5" />
          Demandes
        </Link>

        <Link
          href="/dashboard/evenements"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
        >
          <Calendar className="w-5 h-5" />
          Événements
        </Link>

        <Link
          href="/dashboard/equipements"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
        >
          <Monitor className="w-5 h-5" />
          Équipements
        </Link>

        <Link
          href="/dashboard/equipements/affectation"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
        >
          <Monitor className="w-5 h-5" />
          Affectations
        </Link>

        <Link
          href="/dashboard/actions/credits"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
        >
          <Building className="w-5 h-5" />
          Crédits
        </Link>

        <Link
          href="/dashboard/actions"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-accent"
        >
          <Activity className="w-5 h-5" />
          Actions
        </Link>
      </nav>
    </div>
  );
}
