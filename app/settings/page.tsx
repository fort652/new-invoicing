"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useUser();

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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="mt-2 text-gray-900 dark:text-gray-300">
            Manage your application preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/settings/templates"
            className="block rounded-lg bg-white dark:bg-gray-800 p-6 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Templates</h3>
                <p className="mt-1 text-gray-900 dark:text-gray-300">
                  Manage your Terms & Conditions and Notes templates
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/settings/theme"
            className="block rounded-lg bg-white dark:bg-gray-800 p-6 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theme</h3>
                <p className="mt-1 text-gray-900 dark:text-gray-300">
                  Switch between light and dark mode
                </p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
