"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as Id<"invoices">;

  const invoice = useQuery(api.invoices.get, { id: invoiceId });
  const updateInvoice = useMutation(api.invoices.update);
  const deleteInvoice = useMutation(api.invoices.remove);

  const handleStatusChange = async (
    status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  ) => {
    await updateInvoice({ id: invoiceId, status });
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      await deleteInvoice({ id: invoiceId });
      router.push("/invoices");
    }
  };

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

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
              <Link href="/invoices" className="text-gray-900 font-semibold">
                Invoices
              </Link>
              <Link href="/clients" className="text-gray-700 hover:text-gray-900">
                Clients
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link href="/invoices" className="text-blue-600 hover:text-blue-800 mb-2 block">
              ← Back to Invoices
            </Link>
            <h2 className="text-3xl font-bold text-gray-900">
              Invoice {invoice.invoiceNumber}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="rounded-lg border-2 border-red-600 px-4 py-2 text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
            <Link
              href={`/invoices/${invoiceId}/edit`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white p-8 shadow mb-6">
          <div className="mb-8 flex justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4">INVOICE</h3>
              <p className="text-gray-600">Invoice #: {invoice.invoiceNumber}</p>
              <p className="text-gray-600">
                Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600">
                Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={invoice.status}
                  onChange={(e) =>
                    handleStatusChange(
                      e.target.value as "draft" | "sent" | "paid" | "overdue" | "cancelled"
                    )
                  }
                  className={`rounded-lg border-2 px-4 py-2 font-semibold ${
                    invoice.status === "paid"
                      ? "border-green-600 text-green-600"
                      : invoice.status === "sent"
                      ? "border-blue-600 text-blue-600"
                      : invoice.status === "overdue"
                      ? "border-red-600 text-red-600"
                      : invoice.status === "draft"
                      ? "border-gray-600 text-gray-600"
                      : "border-yellow-600 text-yellow-600"
                  }`}
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-8 grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Bill To:</h4>
              <p className="text-gray-700 font-medium">{invoice.client?.name}</p>
              <p className="text-gray-600">{invoice.client?.email}</p>
              {invoice.client?.phone && (
                <p className="text-gray-600">{invoice.client.phone}</p>
              )}
              {invoice.client?.address && (
                <p className="text-gray-600">{invoice.client.address}</p>
              )}
              {(invoice.client?.city || invoice.client?.state || invoice.client?.zipCode) && (
                <p className="text-gray-600">
                  {[invoice.client?.city, invoice.client?.state, invoice.client?.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {invoice.client?.country && (
                <p className="text-gray-600">{invoice.client.country}</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invoice.lineItems?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ${item.rate.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      ${item.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax:</span>
                <span>${invoice.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total:</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {(invoice.notes || invoice.terms) && (
            <div className="border-t pt-6 space-y-4">
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notes:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Terms & Conditions:
                  </h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-gray-500 text-sm">
          <button
            onClick={() => window.print()}
            className="text-blue-600 hover:text-blue-800"
          >
            Print Invoice
          </button>
        </div>
      </main>
    </div>
  );
}
