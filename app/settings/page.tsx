"use client";

import { useUser } from "@clerk/nextjs";
import Navigation from "@/app/components/Navigation";
import Link from "next/link";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-900 dark:text-gray-300">
            Manage your application preferences
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/settings/subscription"
            className="block rounded-lg bg-white dark:bg-gray-800 p-6 shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription</h3>
                <p className="mt-1 text-gray-900 dark:text-gray-300">
                  Manage your subscription plan and billing
                </p>
              </div>
            </div>
          </Link>

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
