"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as Id<"invoices">;

  const invoice = useQuery(api.invoices.get, { id: invoiceId });
  const updateInvoice = useMutation(api.invoices.update);
  const deleteInvoice = useMutation(api.invoices.remove);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  const handleSendEmail = async () => {
    if (!emailTo || !invoice) return;

    setIsSending(true);
    setEmailStatus(null);

    try {
      const response = await fetch("/api/send-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailTo,
          invoice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setEmailStatus({ type: "success", message: "Invoice sent successfully!" });
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailTo("");
        setEmailStatus(null);
      }, 2000);
    } catch (error: any) {
      setEmailStatus({ type: "error", message: error.message || "Failed to send email" });
    } finally {
      setIsSending(false);
    }
  };

  const openEmailModal = () => {
    setEmailTo(invoice?.client?.email || "");
    setShowEmailModal(true);
    setEmailStatus(null);
  };

  const generateEmailHTML = () => {
    if (!invoice) return "";

    const lineItemsHtml = invoice.lineItems
      ?.map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">R${item.rate.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">R${item.amount.toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoiceNumber}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 800px; margin: 40px auto; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">INVOICE</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 18px;">#${invoice.invoiceNumber}</p>
            </div>

            <div style="padding: 40px;">
              
              <div style="margin-bottom: 32px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                  <div>
                    <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 14px;">Issue Date</p>
                    <p style="margin: 0; font-weight: 600;">${new Date(invoice.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 14px;">Due Date</p>
                    <p style="margin: 0; font-weight: 600;">${new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div style="margin-bottom: 32px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 16px;">Bill To:</h3>
                <p style="margin: 0; font-weight: 600; color: #111827;">${invoice.client?.name || "N/A"}</p>
                ${invoice.client?.email ? `<p style="margin: 4px 0 0 0; color: #6b7280;">${invoice.client.email}</p>` : ""}
                ${invoice.client?.phone ? `<p style="margin: 4px 0 0 0; color: #6b7280;">${invoice.client.phone}</p>` : ""}
                ${invoice.client?.address ? `<p style="margin: 4px 0 0 0; color: #6b7280;">${invoice.client.address}</p>` : ""}
                ${
                  invoice.client?.city || invoice.client?.state || invoice.client?.zipCode
                    ? `<p style="margin: 4px 0 0 0; color: #6b7280;">${[invoice.client?.city, invoice.client?.state, invoice.client?.zipCode].filter(Boolean).join(", ")}</p>`
                    : ""
                }
                ${invoice.client?.country ? `<p style="margin: 4px 0 0 0; color: #6b7280;">${invoice.client.country}</p>` : ""}
              </div>

              <div style="margin-bottom: 32px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f9fafb;">
                      <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Description</th>
                      <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Qty</th>
                      <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Rate</th>
                      <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${lineItemsHtml}
                  </tbody>
                </table>
              </div>

              <div style="margin-bottom: 32px;">
                <div style="max-width: 300px; margin-left: auto;">
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">Subtotal:</span>
                    <span style="font-weight: 600;">R${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">Tax:</span>
                    <span style="font-weight: 600;">R${invoice.tax.toFixed(2)}</span>
                  </div>
                  ${
                    invoice.deliveryCost
                      ? `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280;">Delivery:</span>
                    <span style="font-weight: 600;">R${invoice.deliveryCost.toFixed(2)}</span>
                  </div>`
                      : ""
                  }
                  <div style="display: flex; justify-content: space-between; padding: 16px 0; border-top: 2px solid #2563eb; margin-top: 8px;">
                    <span style="font-size: 18px; font-weight: 700; color: #111827;">Total:</span>
                    <span style="font-size: 18px; font-weight: 700; color: #2563eb;">R${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              ${
                invoice.notes || invoice.terms
                  ? `
                <div style="padding-top: 32px; border-top: 1px solid #e5e7eb;">
                  ${
                    invoice.notes
                      ? `
                    <div style="margin-bottom: 24px;">
                      <h4 style="margin: 0 0 8px 0; color: #111827; font-size: 14px; font-weight: 600;">Notes:</h4>
                      <p style="margin: 0; color: #6b7280; white-space: pre-wrap;">${invoice.notes}</p>
                    </div>
                  `
                      : ""
                  }
                  ${
                    invoice.terms
                      ? `
                    <div>
                      <h4 style="margin: 0 0 8px 0; color: #111827; font-size: 14px; font-weight: 600;">Terms & Conditions:</h4>
                      <p style="margin: 0; color: #6b7280; white-space: pre-wrap;">${invoice.terms}</p>
                    </div>
                  `
                      : ""
                  }
                </div>
              `
                  : ""
              }

            </div>

            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Thank you for your business!</p>
            </div>

          </div>
        </body>
      </html>
    `;
  };

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

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
              <Link href="/invoices" className="text-gray-900 dark:text-white font-semibold">
                Invoices
              </Link>
              <Link href="/clients" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Clients
              </Link>
              <Link href="/settings" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Settings
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
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
            <button
              onClick={() => setShowPreviewModal(true)}
              className="rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Preview Email
            </button>
            <button
              onClick={openEmailModal}
              className="rounded-lg border-2 border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50"
            >
              Send Email
            </button>
            <Link
              href={`/invoices/${invoiceId}/edit`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Edit
            </Link>
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-8 shadow mb-6">
          <div className="mb-8 flex justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">INVOICE</h3>
              <p className="text-gray-900">Invoice #: {invoice.invoiceNumber}</p>
              <p className="text-gray-900">
                Issue Date: {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
              <p className="text-gray-900">
                Due Date: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
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
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Bill To:</h4>
              <p className="text-gray-900 font-medium">{invoice.client?.name}</p>
              <p className="text-gray-900">{invoice.client?.email}</p>
              {invoice.client?.phone && (
                <p className="text-gray-900">{invoice.client.phone}</p>
              )}
              {invoice.client?.address && (
                <p className="text-gray-900">{invoice.client.address}</p>
              )}
              {(invoice.client?.city || invoice.client?.state || invoice.client?.zipCode) && (
                <p className="text-gray-900">
                  {[invoice.client?.city, invoice.client?.state, invoice.client?.zipCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
              {invoice.client?.country && (
                <p className="text-gray-900">{invoice.client.country}</p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {invoice.lineItems?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
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
                <span>R{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax:</span>
                <span>R{invoice.tax.toFixed(2)}</span>
              </div>
              {invoice.deliveryCost && invoice.deliveryCost > 0 && (
                <div className="flex justify-between">
                  <span className="font-medium">Delivery:</span>
                  <span>R{invoice.deliveryCost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total:</span>
                <span>R{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {(invoice.notes || invoice.terms) && (
            <div className="border-t pt-6 space-y-4">
              {invoice.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Terms & Conditions:
                  </h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center text-gray-900 text-sm">
          <button
            onClick={() => window.print()}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Print Invoice
          </button>
        </div>
      </main>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Send Invoice via Email</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="client@example.com"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                disabled={isSending}
              />
            </div>

            {emailStatus && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  emailStatus.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {emailStatus.message}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailTo("");
                  setEmailStatus(null);
                }}
                className="rounded-lg border-2 border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={!emailTo || isSending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Email Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-900 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              <div 
                dangerouslySetInnerHTML={{ __html: generateEmailHTML() }}
                className="bg-white"
              />
            </div>
            <div className="p-6 border-t bg-white">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
