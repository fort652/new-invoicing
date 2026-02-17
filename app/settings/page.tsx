"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SettingsPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Redirect to templates by default
    router.push("/settings/templates");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Invoice App</h1>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/invoices" className="text-gray-700 hover:text-gray-900">
                Invoices
              </Link>
              <Link href="/clients" className="text-gray-700 hover:text-gray-900">
                Clients
              </Link>
              <Link href="/settings" className="text-gray-900 font-semibold">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-900">Redirecting to templates...</p>
        </div>
      </main>
    </div>
  );
}
