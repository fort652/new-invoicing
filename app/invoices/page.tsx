"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import PageHeader from "@/app/components/PageHeader";
export default function InvoicesPage() {
  const { user } = useUser();
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );
  const invoices = useQuery(
    api.invoices.list,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <PageHeader description="Manage all your invoices in one place" />
        
        <div className="mb-6 flex justify-end">
          <Link
            href="/invoices/new"
            className="rounded-lg bg-blue-600 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-white hover:bg-blue-700 whitespace-nowrap"
          >
            Create Invoice
          </Link>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 shadow">
          {!invoices ? (
            <div className="p-8 text-center">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-900 dark:text-white mb-4">No invoices yet</p>
              <Link
                href="/invoices/new"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
              >
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Invoice #
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Client
                    </th>
                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Issue Date
                    </th>
                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Due Date
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Amount
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/invoices/${invoice._id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {invoice.client?.name || "Unknown"}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
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
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                          <Link
                            href={`/invoices/${invoice._id}`}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            View
                          </Link>
                          <Link
                            href={`/invoices/${invoice._id}/edit`}
                            className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
