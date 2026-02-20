"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import Navigation from "@/app/components/Navigation";
import { useParams, useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import InvoiceTemplate, { generateInvoiceHTML } from "@/app/components/InvoiceTemplate";
import { useRequireConvexUser } from "@/app/hooks/useRequireConvexUser";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as Id<"invoices">;
  const { revoked } = useRequireConvexUser();

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
          <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; color: #111827;">${item.description}</td>
          <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">${item.quantity}</td>
          <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">R${item.rate.toFixed(2)}</td>
          <td style="padding: 16px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #000000;">R${item.amount.toFixed(2)}</td>
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
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #111827; margin: 0; padding: 0; background-color: #ffffff;">
          <div style="max-width: 800px; margin: 40px auto; background-color: white; border: 1px solid #e5e7eb; overflow: hidden;">
            
            <div style="background: white; border: 3px solid #000000; padding: 40px; text-align: center; margin-bottom: 32px;">
              <h1 style="color: #000000; margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 0.1em;">INVOICE</h1>
              <p style="color: #000000; margin: 8px 0 0 0; font-size: 18px; font-weight: 600;">#${invoice.invoiceNumber}</p>
            </div>

            <div style="padding: 40px;">
              
              <div style="margin-bottom: 32px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                  <div>
                    <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Issue Date</p>
                    <p style="margin: 0; font-weight: 600; color: #111827; font-size: 16px;">${new Date(invoice.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Due Date</p>
                    <p style="margin: 0; font-weight: 600; color: #111827; font-size: 16px;">${new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Amount Due</p>
                    <p style="margin: 0; font-weight: 700; color: #000000; font-size: 20px;">R${invoice.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div style="margin-bottom: 32px; padding: 24px; background-color: white; border: 2px solid #000000;">
                <h3 style="margin: 0 0 12px 0; color: #000000; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Bill To</h3>
                <p style="margin: 0; font-weight: 700; color: #000000; font-size: 16px;">${invoice.client?.name || "N/A"}</p>
                ${invoice.client?.email ? `<p style="margin: 4px 0 0 0; color: #111827;">${invoice.client.email}</p>` : ""}
                ${invoice.client?.phone ? `<p style="margin: 4px 0 0 0; color: #111827;">${invoice.client.phone}</p>` : ""}
                ${invoice.client?.address ? `<p style="margin: 8px 0 0 0; color: #111827;">${invoice.client.address}</p>` : ""}
                ${
                  invoice.client?.city || invoice.client?.state || invoice.client?.zipCode
                    ? `<p style="margin: 4px 0 0 0; color: #111827;">${[invoice.client?.city, invoice.client?.state, invoice.client?.zipCode].filter(Boolean).join(", ")}</p>`
                    : ""
                }
                ${invoice.client?.country ? `<p style="margin: 4px 0 0 0; color: #111827;">${invoice.client.country}</p>` : ""}
              </div>

              <div style="margin-bottom: 32px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: white; border-bottom: 2px solid #000000;">
                      <th style="padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">Description</th>
                      <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
                      <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">Rate</th>
                      <th style="padding: 12px 16px; text-align: right; font-size: 11px; font-weight: 600; color: #000000; text-transform: uppercase; letter-spacing: 0.05em;">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${lineItemsHtml}
                  </tbody>
                </table>
              </div>

              <div style="margin-bottom: 32px;">
                <div style="max-width: 400px; margin-left: auto;">
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Subtotal</span>
                    <span style="font-weight: 600; color: #111827; font-size: 14px;">R${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Tax</span>
                    <span style="font-weight: 600; color: #111827; font-size: 14px;">R${invoice.tax.toFixed(2)}</span>
                  </div>
                  ${
                    invoice.deliveryCost
                      ? `<div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Delivery</span>
                    <span style="font-weight: 600; color: #111827; font-size: 14px;">R${invoice.deliveryCost.toFixed(2)}</span>
                  </div>`
                      : ""
                  }
                  <div style="display: flex; justify-content: space-between; padding: 16px 0; border-top: 3px solid #000000; margin-top: 8px;">
                    <span style="font-size: 20px; font-weight: 700; color: #000000;">Total</span>
                    <span style="font-size: 24px; font-weight: 700; color: #000000;">R${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              ${
                invoice.notes || invoice.terms
                  ? `
                <div style="padding-top: 32px; border-top: 2px solid #e5e7eb; margin-top: 32px;">
                  ${
                    invoice.notes
                      ? `
                    <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-left: 4px solid #000000;">
                      <h4 style="margin: 0 0 8px 0; color: #000000; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Notes</h4>
                      <p style="margin: 0; color: #111827; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${invoice.notes}</p>
                    </div>
                  `
                      : ""
                  }
                  ${
                    invoice.terms
                      ? `
                    <div style="padding: 16px; background-color: #f9fafb; border-left: 4px solid #000000;">
                      <h4 style="margin: 0 0 8px 0; color: #000000; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Terms & Conditions</h4>
                      <p style="margin: 0; color: #111827; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${invoice.terms}</p>
                    </div>
                  `
                      : ""
                  }
                </div>
              `
                  : ""
              }

            </div>

            <div style="background-color: white; padding: 24px; text-align: center; border-top: 2px solid #000000;">
              <p style="margin: 0; color: #111827; font-size: 14px; font-weight: 500;">Thank you for your business!</p>
            </div>

          </div>
        </body>
      </html>
    `;
  };

  if (revoked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Signing out...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="mb-6 no-print">
          <Link href="/invoices" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Invoices
          </Link>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {invoice.invoiceNumber}
            </h1>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  invoice.status === "paid"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                    : invoice.status === "sent"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                    : invoice.status === "overdue"
                    ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                    : invoice.status === "draft"
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                    : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                }`}
              >
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={() => setShowPreviewModal(true)}
              className="inline-flex items-center rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
            <button
              onClick={openEmailModal}
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </button>
            <Link
              href={`/invoices/${invoiceId}/edit`}
              className="inline-flex items-center rounded-lg bg-gray-900 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:hover:bg-gray-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center rounded-lg border-2 border-red-600 dark:border-red-400 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <div className="mb-4 no-print flex justify-end">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
            <select
              value={invoice.status}
              onChange={(e) =>
                handleStatusChange(
                  e.target.value as "draft" | "sent" | "paid" | "overdue" | "cancelled"
                )
              }
              className={`rounded-lg border-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer ${
                invoice.status === "paid"
                  ? "border-green-500"
                  : invoice.status === "sent"
                  ? "border-blue-500"
                  : invoice.status === "overdue"
                  ? "border-red-500"
                  : invoice.status === "draft"
                  ? "border-gray-500"
                  : "border-yellow-500"
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

        <div id="invoice-content" className="rounded-xl shadow-lg overflow-hidden mb-6">
          <InvoiceTemplate
            invoiceNumber={invoice.invoiceNumber}
            status={invoice.status}
            issueDate={invoice.issueDate}
            dueDate={invoice.dueDate}
            client={invoice.client || { name: "N/A", email: "" }}
            lineItems={invoice.lineItems || []}
            subtotal={invoice.subtotal}
            tax={invoice.tax}
            deliveryCost={invoice.deliveryCost}
            total={invoice.total}
            notes={invoice.notes}
            terms={invoice.terms}
            darkModeSupport={true}
          />
        </div>

        <div id="invoice-print" className="hidden print:block">
          <InvoiceTemplate
            invoiceNumber={invoice.invoiceNumber}
            status={invoice.status}
            issueDate={invoice.issueDate}
            dueDate={invoice.dueDate}
            client={invoice.client || { name: "N/A", email: "" }}
            lineItems={invoice.lineItems || []}
            subtotal={invoice.subtotal}
            tax={invoice.tax}
            deliveryCost={invoice.deliveryCost}
            total={invoice.total}
            notes={invoice.notes}
            terms={invoice.terms}
          />
        </div>
      </main>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
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
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
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
                className="rounded-lg border-2 border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Preview</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
              <InvoiceTemplate
                invoiceNumber={invoice.invoiceNumber}
                status={invoice.status}
                issueDate={invoice.issueDate}
                dueDate={invoice.dueDate}
                client={invoice.client || { name: "N/A", email: "" }}
                lineItems={invoice.lineItems || []}
                subtotal={invoice.subtotal}
                tax={invoice.tax}
                deliveryCost={invoice.deliveryCost}
                total={invoice.total}
                notes={invoice.notes}
                terms={invoice.terms}
              />
            </div>
            <div className="p-6 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
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
