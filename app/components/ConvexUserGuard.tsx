"use client";

import { ReactNode } from "react";
import { useRequireConvexUser } from "@/app/hooks/useRequireConvexUser";

export function ConvexUserGuard({ children }: { children: ReactNode }) {
  const { revoked } = useRequireConvexUser();

  if (revoked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Signing out...</div>
      </div>
    );
  }

  return <>{children}</>;
}
