import type { User } from "@/types/index";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface RegisterPayload {
  nom: string;
  prenom: string;
  username?: string;
  email: string;
  password: string;
  poste: string;
  agenceId: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export default class AuthService {
  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!this.getToken();
  }

  // Récupérer le token depuis localStorage ou cookie
  getToken(): string | null {
    const localToken = localStorage.getItem("auth_token");
    if (localToken) return localToken;

    const match = document.cookie.match(new RegExp("(^| )auth_token=([^;]+)"));
    return match ? match[2] : null;
  }

  // Sauvegarder user + token
  private saveAuth(user: User, token: string) {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    document.cookie = `auth_token=${token}; path=/; max-age=3600; samesite=strict${
      process.env.NODE_ENV === "production" ? "; secure" : ""
    }`;
  }

  // Inscription
  async register(data: RegisterPayload) {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erreur lors de l'inscription");
    }

    const result = await res.json(); // 👈 { user, token }

    result.user.permissions = extractPermissions(result.user);
    this.saveAuth(result.user, result.token);

    return result.user; // ✅ IMPORTANT
  }


  // Connexion
  async login(data: LoginPayload) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Email ou mot de passe incorrect");
    }

    const result = await res.json(); // { user, token }
    result.user.permissions = extractPermissions(result.user);
    this.saveAuth(result.user, result.token);
    return result;
  }

  // Déconnexion
  async logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    document.cookie = "auth_token=; path=/; max-age=0";
  }

  // Récupérer l'utilisateur connecté depuis l'API
  async getCurrentUserFromAPI(): Promise<User> {
    const token = this.getToken();
    if (!token) throw new Error("Utilisateur non connecté");

    const res = await fetch(`${API_URL}/api/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Impossible de récupérer l'utilisateur connecté");
    }

    const user: User = await res.json();
    user.permissions = extractPermissions(user);
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  }
}

// 🛠 Utilitaire pour extraire les permissions depuis les rôles
function extractPermissions(user: User): string[] {
  if (!user.roles) return [];

  return user.roles
    .flatMap(userRole =>
      userRole.role?.permissions?.map(rp => rp.permission?.slug ?? "") ?? []
    )
    .filter(Boolean); // enlève les chaînes vides
}
