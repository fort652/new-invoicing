interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Client {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface InvoiceTemplateProps {
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: number;
  dueDate: number;
  client: Client;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  deliveryCost?: number;
  total: number;
  notes?: string;
  terms?: string;
  darkModeSupport?: boolean;
}

export default function InvoiceTemplate({
  invoiceNumber,
  status,
  issueDate,
  dueDate,
  client,
  lineItems,
  subtotal,
  tax,
  deliveryCost,
  total,
  notes,
  terms,
  darkModeSupport = false,
}: InvoiceTemplateProps) {
  const dark = darkModeSupport;

  return (
    <div className={dark ? "bg-white dark:bg-gray-800" : "bg-white"}>
      <div className={`border-3 p-8 mb-8 text-center ${dark ? "border-black dark:border-gray-600" : "border-black"}`}>
        <h1 className={`text-4xl font-bold mb-2 tracking-wider ${dark ? "text-black dark:text-white" : "text-black"}`}>
          INVOICE
        </h1>
        <p className={`text-lg font-semibold ${dark ? "text-black dark:text-gray-300" : "text-black"}`}>
          #{invoiceNumber}
        </p>
        <div className="mt-4">
          <span className={`inline-block border-2 px-4 py-1 text-sm font-semibold ${dark ? "border-black dark:border-gray-600 text-black dark:text-white" : "border-black text-black"}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      <div className="px-8">
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Issue Date
            </p>
            <p className={`text-base font-semibold ${dark ? "text-black dark:text-white" : "text-black"}`}>
              {new Date(issueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Due Date
            </p>
            <p className={`text-base font-semibold ${dark ? "text-black dark:text-white" : "text-black"}`}>
              {new Date(dueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
              Amount Due
            </p>
            <p className={`text-xl font-bold ${dark ? "text-black dark:text-white" : "text-black"}`}>
              R{total.toFixed(2)}
            </p>
          </div>
        </div>

        <div className={`border-2 p-6 mb-8 ${dark ? "border-black dark:border-gray-600" : "border-black"}`}>
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${dark ? "text-black dark:text-white" : "text-black"}`}>
            Bill To
          </h3>
          <p className={`text-lg font-bold mb-1 ${dark ? "text-black dark:text-white" : "text-black"}`}>
            {client.name}
          </p>
          <p className={`text-sm ${dark ? "text-black dark:text-gray-300" : "text-black"}`}>{client.email}</p>
          {client.phone && <p className={`text-sm ${dark ? "text-black dark:text-gray-300" : "text-black"}`}>{client.phone}</p>}
          {client.address && <p className={`text-sm mt-2 ${dark ? "text-black dark:text-gray-300" : "text-black"}`}>{client.address}</p>}
          {(client.city || client.state || client.zipCode) && (
            <p className={`text-sm ${dark ? "text-black dark:text-gray-300" : "text-black"}`}>
              {[client.city, client.state, client.zipCode].filter(Boolean).join(", ")}
            </p>
          )}
          {client.country && <p className={`text-sm ${dark ? "text-black dark:text-gray-300" : "text-black"}`}>{client.country}</p>}
        </div>

        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className={`border-b-2 ${dark ? "border-black dark:border-gray-600" : "border-black"}`}>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${dark ? "text-black dark:text-white" : "text-black"}`}>
                  Description
                </th>
                <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${dark ? "text-black dark:text-white" : "text-black"}`}>
                  Qty
                </th>
                <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${dark ? "text-black dark:text-white" : "text-black"}`}>
                  Rate
                </th>
                <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${dark ? "text-black dark:text-white" : "text-black"}`}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} className={`border-b ${dark ? "border-gray-200 dark:border-gray-700" : "border-gray-200"}`}>
                  <td className={`px-4 py-4 text-sm ${dark ? "text-black dark:text-white" : "text-black"}`}>{item.description}</td>
                  <td className={`px-4 py-4 text-sm text-right ${dark ? "text-black dark:text-white" : "text-black"}`}>{item.quantity}</td>
                  <td className={`px-4 py-4 text-sm text-right ${dark ? "text-black dark:text-white" : "text-black"}`}>R{item.rate.toFixed(2)}</td>
                  <td className={`px-4 py-4 text-sm font-semibold text-right ${dark ? "text-black dark:text-white" : "text-black"}`}>
                    R{item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-full sm:w-96">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className={`text-sm font-semibold ${dark ? "text-black dark:text-white" : "text-black"}`}>R{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="text-sm text-gray-600">Tax</span>
              <span className={`text-sm font-semibold ${dark ? "text-black dark:text-white" : "text-black"}`}>R{tax.toFixed(2)}</span>
            </div>
            {deliveryCost && deliveryCost > 0 && (
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Delivery</span>
                <span className={`text-sm font-semibold ${dark ? "text-black dark:text-white" : "text-black"}`}>R{deliveryCost.toFixed(2)}</span>
              </div>
            )}
            <div className={`flex justify-between py-4 border-t-3 mt-2 ${dark ? "border-black dark:border-gray-600" : "border-black"}`}>
              <span className={`text-xl font-bold ${dark ? "text-black dark:text-white" : "text-black"}`}>Total</span>
              <span className={`text-2xl font-bold ${dark ? "text-black dark:text-white" : "text-black"}`}>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {(notes || terms) && (
          <div className={`border-t-2 pt-8 space-y-6 ${dark ? "border-gray-200 dark:border-gray-700" : "border-gray-200"}`}>
            {notes && (
              <div className={`p-4 border-l-4 ${dark ? "bg-gray-50 dark:bg-gray-900/50 border-black dark:border-gray-600" : "bg-gray-50 border-black"}`}>
                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${dark ? "text-black dark:text-white" : "text-black"}`}>
                  Notes
                </h4>
                <p className={`text-sm whitespace-pre-wrap leading-relaxed ${dark ? "text-black dark:text-gray-300" : "text-black"}`}>
                  {notes}
                </p>
              </div>
            )}
            {terms && (
              <div className={`p-4 border-l-4 ${dark ? "bg-gray-50 dark:bg-gray-900/50 border-black dark:border-gray-600" : "bg-gray-50 border-black"}`}>
                <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${dark ? "text-black dark:text-white" : "text-black"}`}>
                  Terms & Conditions
                </h4>
                <p className={`text-sm whitespace-pre-wrap leading-relaxed ${dark ? "text-black dark:text-gray-300" : "text-black"}`}>
                  {terms}
                </p>
              </div>
            )}
          </div>
        )}

        <div className={`border-t-2 mt-8 pt-6 pb-6 text-center ${dark ? "border-black dark:border-gray-600" : "border-black"}`}>
          <p className={`text-sm font-medium ${dark ? "text-black dark:text-white" : "text-black"}`}>
            Thank you for your business!
          </p>
        </div>
      </div>
    </div>
  );
}

export function generateInvoiceHTML(invoice: InvoiceTemplateProps): string {
  const lineItemsHtml = invoice.lineItems
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 16px; color: #000000;">${item.description}</td>
          <td style="padding: 16px; text-align: right; color: #000000;">${item.quantity}</td>
          <td style="padding: 16px; text-align: right; color: #000000;">R${item.rate.toFixed(2)}</td>
          <td style="padding: 16px; text-align: right; font-weight: 600; color: #000000;">R${item.amount.toFixed(2)}</td>
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
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #000000; margin: 0; padding: 0; background-color: #ffffff;">
        <div style="max-width: 800px; margin: 40px auto; background-color: white; border: 1px solid #e5e7eb;">
          
          <div style="background: white; border: 3px solid #000000; padding: 40px; text-align: center; margin-bottom: 32px;">
            <h1 style="color: #000000; margin: 0; font-size: 36px; font-weight: bold; letter-spacing: 0.1em;">INVOICE</h1>
            <p style="color: #000000; margin: 8px 0 0 0; font-size: 18px; font-weight: 600;">#${invoice.invoiceNumber}</p>
          </div>

          <div style="padding: 0 40px 40px 40px;">
            
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px;">
              <div>
                <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Issue Date</p>
                <p style="margin: 0; font-weight: 600; color: #000000; font-size: 16px;">${new Date(invoice.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Due Date</p>
                <p style="margin: 0; font-weight: 600; color: #000000; font-size: 16px;">${new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p style="color: #6b7280; margin: 0 0 4px 0; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Amount Due</p>
                <p style="margin: 0; font-weight: 700; color: #000000; font-size: 20px;">R${invoice.total.toFixed(2)}</p>
              </div>
            </div>

            <div style="margin-bottom: 32px; padding: 24px; background-color: white; border: 2px solid #000000;">
              <h3 style="margin: 0 0 12px 0; color: #000000; font-size: 12px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Bill To</h3>
              <p style="margin: 0; font-weight: 700; color: #000000; font-size: 16px;">${invoice.client.name}</p>
              ${invoice.client.email ? `<p style="margin: 4px 0 0 0; color: #000000;">${invoice.client.email}</p>` : ""}
              ${invoice.client.phone ? `<p style="margin: 4px 0 0 0; color: #000000;">${invoice.client.phone}</p>` : ""}
              ${invoice.client.address ? `<p style="margin: 8px 0 0 0; color: #000000;">${invoice.client.address}</p>` : ""}
              ${
                invoice.client.city || invoice.client.state || invoice.client.zipCode
                  ? `<p style="margin: 4px 0 0 0; color: #000000;">${[invoice.client.city, invoice.client.state, invoice.client.zipCode].filter(Boolean).join(", ")}</p>`
                  : ""
              }
              ${invoice.client.country ? `<p style="margin: 4px 0 0 0; color: #000000;">${invoice.client.country}</p>` : ""}
            </div>

            <div style="margin-bottom: 32px; overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #000000;">
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
                  <span style="font-weight: 600; color: #000000; font-size: 14px;">R${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 14px;">Tax</span>
                  <span style="font-weight: 600; color: #000000; font-size: 14px;">R${invoice.tax.toFixed(2)}</span>
                </div>
                ${
                  invoice.deliveryCost && invoice.deliveryCost > 0
                    ? `<div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                  <span style="color: #6b7280; font-size: 14px;">Delivery</span>
                  <span style="font-weight: 600; color: #000000; font-size: 14px;">R${invoice.deliveryCost.toFixed(2)}</span>
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
              <div style="border-top: 2px solid #e5e7eb; padding-top: 32px; margin-top: 32px;">
                ${
                  invoice.notes
                    ? `
                  <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-left: 4px solid #000000;">
                    <h4 style="margin: 0 0 8px 0; color: #000000; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Notes</h4>
                    <p style="margin: 0; color: #000000; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${invoice.notes}</p>
                  </div>
                `
                    : ""
                }
                ${
                  invoice.terms
                    ? `
                  <div style="padding: 16px; background-color: #f9fafb; border-left: 4px solid #000000;">
                    <h4 style="margin: 0 0 8px 0; color: #000000; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Terms & Conditions</h4>
                    <p style="margin: 0; color: #000000; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${invoice.terms}</p>
                  </div>
                `
                    : ""
                }
              </div>
            `
                : ""
            }

            <div style="border-top: 2px solid #000000; margin-top: 32px; padding-top: 24px; text-align: center;">
              <p style="margin: 0; color: #000000; font-size: 14px; font-weight: 500;">Thank you for your business!</p>
            </div>
          </div>

        </div>
      </body>
    </html>
  `;
}
