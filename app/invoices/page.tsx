"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Invoice App</h1>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/invoices"
                className="text-gray-900 font-semibold"
              >
                Invoices
              </Link>
              <Link
                href="/clients"
                className="text-gray-700 hover:text-gray-900"
              >
                Clients
              </Link>
              <Link
                href="/settings"
                className="text-gray-700 hover:text-gray-900"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Invoices</h2>
            <p className="mt-2 text-gray-900">
              Manage all your invoices in one place
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Create Invoice
          </Link>
        </div>

        <div className="rounded-lg bg-white shadow">
          {!invoices ? (
            <div className="p-8 text-center">Loading...</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-900 mb-4">No invoices yet</p>
              <Link
                href="/invoices/new"
                className="text-blue-600 hover:text-blue-800"
              >
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/invoices/${invoice._id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {invoice.client?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        R{invoice.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            invoice.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "sent"
                              ? "bg-blue-100 text-blue-800"
                              : invoice.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : invoice.status === "draft"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/invoices/${invoice._id}`}
                          className="text-blue-600 hover:text-blue-800 mr-4"
                        >
                          View
                        </Link>
                        <Link
                          href={`/invoices/${invoice._id}/edit`}
                          className="text-gray-900 hover:text-gray-700"
                        >
                          Edit
                        </Link>
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
