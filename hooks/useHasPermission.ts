import { useAuth } from "@/context/AuthContext";

export function useHasPermission(slug: string): boolean {
  const { permissions } = useAuth();
  return permissions.includes(slug);
}
