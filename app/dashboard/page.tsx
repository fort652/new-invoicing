"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import { useRequireConvexUser } from "@/app/hooks/useRequireConvexUser";

export default function DashboardPage() {
  const { user } = useUser();
  const { currentUser, revoked } = useRequireConvexUser();
  const stats = useQuery(
    api.invoices.getStats,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const recentInvoices = useQuery(
    api.invoices.list,
    currentUser ? { userId: currentUser._id } : "skip"
  );
  const usageLimits = useQuery(
    api.users.checkUsageLimits,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  if (revoked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Signing out...</div>
      </div>
    );
  }

  if (!currentUser || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.firstName || "User"}!
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-900 dark:text-gray-300">
            Here&apos;s an overview of your invoicing activity
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Invoices</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Paid</h3>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{stats.paid}</p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</h3>
            <p className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.sent + stats.overdue}
            </p>
          </div>
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Draft</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.draft}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Revenue Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-900 dark:text-gray-300">Total Revenue</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  R{stats.totalRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 dark:text-gray-300">Paid</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  R{stats.paidRevenue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 dark:text-gray-300">Pending</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  R{stats.pendingRevenue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {usageLimits && (
            <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Subscription
                </h3>
                {usageLimits.isPro ? (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    PRO
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                    FREE
                  </span>
                )}
              </div>
              {usageLimits.isPro ? (
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>✓ Unlimited clients</p>
                  <p>✓ Unlimited invoices</p>
                  <p>✓ Unlimited emails</p>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Clients:</span>
                    <span className={usageLimits.canCreateClient ? '' : 'text-red-600 font-semibold'}>
                      {usageLimits.clientsUsed}/{usageLimits.clientsLimit}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Invoices:</span>
                    <span className={usageLimits.canCreateInvoice ? '' : 'text-red-600 font-semibold'}>
                      {usageLimits.invoicesUsed}/{usageLimits.invoicesLimit}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Emails:</span>
                    <span className={usageLimits.canSendEmail ? '' : 'text-red-600 font-semibold'}>
                      {usageLimits.emailsUsed}/{usageLimits.emailsLimit}
                    </span>
                  </div>
                </div>
              )}
              <Link
                href="/subscription"
                className="block w-full mt-4 rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700 text-sm"
              >
                {usageLimits.isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
              </Link>
            </div>
          )}

          <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                href="/invoices/new"
                className="block w-full rounded-lg bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
              >
                Create New Invoice
              </Link>
              <Link
                href="/clients"
                className="block w-full rounded-lg border-2 border-blue-600 dark:border-blue-400 px-4 py-2 text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Add New Client
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-4 sm:p-6 shadow">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Invoices
          </h3>
          {recentInvoices && recentInvoices.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Invoice #
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Client
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Amount
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentInvoices.slice(0, 5).map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/invoices/${invoice._id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {invoice.client?.name || "Unknown"}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        R{invoice.total.toFixed(2)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            invoice.status === "paid"
                              ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : invoice.status === "sent"
                              ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                              : invoice.status === "overdue"
                              ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                              : invoice.status === "draft"
                              ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                              : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-900 dark:text-white">No invoices yet. Create your first invoice!</p>
          )}
        </div>
      </main>
    </div>
  );
}
