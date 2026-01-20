"use client"
import { useEffect, useState } from "react";
import NotificationService from "@/lib/services/NotificationService";
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, Bell, Sun, Moon, ChevronDown, Settings, LogOut, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"

export default function Header({ toggleSidebar }: { toggleSidebar?: () => void }) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const notificationService = new NotificationService();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;

    notificationService
      .getUnreadCount(user.id)   // <- ici on envoie userId
      .then((res) => setUnreadCount(res.count))
      .catch((err) => console.error("Erreur notifications:", err));
  }, [user]);



  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="flex h-16 items-center gap-4 px-6 justify-between">
        <div className="flex items-center gap-4">
          {toggleSidebar && (
            <Button variant="ghost" size="sm" onClick={toggleSidebar}>
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-10" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />

            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1
                bg-destructive text-white text-xs rounded-full
                flex items-center justify-center"
              >
                {unreadCount}
              </span>
            )}
          </Button>


          {/* Sélecteur de thème */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <span className="sr-only">Changer le thème</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setTheme("light")}>Clair</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Sombre</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>Système</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profil utilisateur */}
          {user && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-2">
                    <Avatar className="w-8 h-8">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      ) : (
                        <AvatarFallback>{(user.nom?.[0] || "U") + (user.prenom?.[0] || "")}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium">{user.nom || "Utilisateur"}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Bouton direct */}
              <Button variant="outline" size="sm" onClick={logout} className="ml-2">
                Déconnexion
              </Button>
            </>
          )}

        </div>
      </div>
    </header>
  )
}
