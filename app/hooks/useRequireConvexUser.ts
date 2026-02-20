"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import type { Doc } from "@/convex/_generated/dataModel";

const NEW_SIGNUP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function isNewSignup(clerkUser: { createdAt?: number | Date } | null): boolean {
  if (!clerkUser?.createdAt) return false;
  let createdMs: number;
  if (typeof clerkUser.createdAt === "number") {
    createdMs = clerkUser.createdAt < 1e12 ? clerkUser.createdAt * 1000 : clerkUser.createdAt;
  } else {
    createdMs = new Date(clerkUser.createdAt).getTime();
  }
  return Date.now() - createdMs < NEW_SIGNUP_WINDOW_MS;
}

export function useRequireConvexUser(): {
  currentUser: Doc<"users"> | null | undefined;
  revoked: boolean;
} {
  const { user } = useUser();
  const { signOut } = useClerk();
  const syncUser = useMutation(api.users.syncUser);
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const noConvexUser = Boolean(user && currentUser === null);
  const newSignup = isNewSignup(user);
  const revoked = noConvexUser && !newSignup;

  useEffect(() => {
    if (revoked) {
      signOut({ redirectUrl: "/access-revoked" });
    }
  }, [revoked, signOut]);

  useEffect(() => {
    if (noConvexUser && newSignup && user) {
      syncUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        name: user.fullName ?? undefined,
        imageUrl: user.imageUrl ?? undefined,
      });
    }
  }, [noConvexUser, newSignup, user, syncUser]);

  return { currentUser, revoked };
}
