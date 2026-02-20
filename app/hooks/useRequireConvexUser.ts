"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import type { Doc } from "@/convex/_generated/dataModel";

export function useRequireConvexUser(): {
  currentUser: Doc<"users"> | null | undefined;
  revoked: boolean;
} {
  const { user } = useUser();
  const { signOut } = useClerk();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const revoked = Boolean(user && currentUser === null);

  useEffect(() => {
    if (revoked) {
      signOut({ redirectUrl: "/access-revoked" });
    }
  }, [revoked, signOut]);

  return { currentUser, revoked };
}
