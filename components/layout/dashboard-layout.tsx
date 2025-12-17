"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Sidebar from "./sidebar";
import Header from "./header";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Ouvrir la sidebar par défaut sur desktop, fermer sur mobile
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Contenu principal */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? "lg:pl-64" : ""}`}>
        {/* Header avec bouton toggle, notifications, thème et profil */}
        <Header toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
