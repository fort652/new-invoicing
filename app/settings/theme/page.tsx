"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useTheme } from "@/app/theme-provider";

export default function ThemePage() {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice App</h1>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Dashboard
              </Link>
              <Link href="/invoices" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Invoices
              </Link>
              <Link href="/clients" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Clients
              </Link>
              <Link href="/settings" className="text-gray-900 dark:text-white font-semibold">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/settings" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-2 block">
            ← Back to Settings
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Theme Settings</h2>
          <p className="mt-2 text-gray-900 dark:text-gray-300">
            Choose your preferred color theme
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Appearance</h3>
          
          <div className="space-y-4">
            <div
              onClick={() => setTheme("light")}
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                theme === "light"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Light Mode</h4>
                  <p className="text-gray-900 dark:text-gray-300 mt-1">
                    Classic light theme with bright backgrounds
                  </p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  theme === "light" 
                    ? "border-blue-600 bg-blue-600" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {theme === "light" && (
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div
              onClick={() => setTheme("dark")}
              className={`cursor-pointer rounded-lg border-2 p-6 transition-all ${
                theme === "dark"
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Dark Mode</h4>
                  <p className="text-gray-900 dark:text-gray-300 mt-1">
                    Easy on the eyes with dark backgrounds
                  </p>
                </div>
                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                  theme === "dark" 
                    ? "border-blue-600 bg-blue-600" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {theme === "dark" && (
                    <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-900 dark:text-gray-300">
              <strong>Current theme:</strong> {theme === "light" ? "Light Mode" : "Dark Mode"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
