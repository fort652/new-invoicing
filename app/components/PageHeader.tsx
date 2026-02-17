"use client";

import { useUser } from "@clerk/nextjs";

interface PageHeaderProps {
  title?: string;
  description?: string;
  showWelcome?: boolean;
}

export default function PageHeader({ title, description, showWelcome = true }: PageHeaderProps) {
  const { user } = useUser();

  return (
    <div className="mb-6 sm:mb-8">
      {showWelcome && (
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Welcome, {user?.firstName || "User"}!
        </h2>
      )}
      {title && !showWelcome && (
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      )}
      {description && (
        <p className="mt-2 text-sm sm:text-base text-gray-900 dark:text-gray-300">
          {description}
        </p>
      )}
    </div>
  );
}
