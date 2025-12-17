"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import AuthService from "@/lib/services/AuthService";
import type { User } from "@/types/index";
import type { LoginPayload, RegisterPayload } from "@/lib/services/AuthService";
import { useRouter } from "next/navigation";

const authService = new AuthService();

interface AuthContextType {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginPayload) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUserFromAPI();
        setUser(userData);
        setPermissions(userData.permissions || []);
      } else {
        setUser(null);
        setPermissions([]);
      }
    } catch {
      localStorage.removeItem("auth_token");
      setUser(null);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginPayload) => {
    const result = await authService.login(data);
    setUser(result.user);
    setPermissions(result.user.permissions || []);
  };

  const register = async (data: RegisterPayload) => {
    const result = await authService.register(data);
    setUser(result.user);
    setPermissions(result.user.permissions || []);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPermissions([]);
    router.push("/login");
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, permissions, isLoading, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
