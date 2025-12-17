"use client";

import { getUsers } from "@/lib/services/UserService";
import { User } from "@/types/index";
import { usePaginatedData } from "./use-paginatedData";

export type UserFormatted = Omit<User, "createdAt" | "updatedAt" | "archivedAt"> & {
  createdAt: string;
  updatedAt?: string;
  archivedAt?: string;
};

function formatUserDates(user: User): UserFormatted {
  return {
    ...user,
    createdAt: new Date(user.createdAt).toISOString().split("T")[0],
    updatedAt: user.updatedAt
      ? new Date(user.updatedAt).toISOString().split("T")[0]
      : undefined,
    archivedAt: user.archivedAt
      ? new Date(user.archivedAt).toISOString().split("T")[0]
      : undefined,
  };
}

export function useUsers(page = 1, limit = 10) {
  const { items, meta, isLoading, refresh, goToPage } = usePaginatedData<User>(getUsers, page, limit);
  const formattedUsers: UserFormatted[] = items.map(formatUserDates);

  return { users: formattedUsers, meta, isLoading, refresh, goToPage };
}
