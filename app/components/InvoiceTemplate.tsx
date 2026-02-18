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
}: InvoiceTemplateProps) {
  return (
    <div className="bg-white text-black">
      <div style={{ border: "3px solid #000000", padding: "2rem", marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.25rem", fontWeight: "700", color: "#000000", margin: "0 0 0.5rem 0", letterSpacing: "0.1em" }}>
          INVOICE
        </h1>
        <p style={{ fontSize: "1.125rem", fontWeight: "600", color: "#000000", margin: "0" }}>
          #{invoiceNumber}
        </p>
        <div style={{ marginTop: "1rem" }}>
          <span style={{ border: "2px solid #000000", padding: "0.25rem 1rem", display: "inline-block", fontSize: "0.875rem", fontWeight: "600" }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      <div style={{ padding: "0 2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
              Issue Date
            </p>
            <p style={{ fontSize: "1rem", fontWeight: "600", color: "#000000" }}>
              {new Date(issueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
              Due Date
            </p>
            <p style={{ fontSize: "1rem", fontWeight: "600", color: "#000000" }}>
              {new Date(dueDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.25rem" }}>
              Amount Due
            </p>
            <p style={{ fontSize: "1.25rem", fontWeight: "700", color: "#000000" }}>
              R{total.toFixed(2)}
            </p>
          </div>
        </div>

        <div style={{ border: "2px solid #000000", padding: "1.5rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.75rem", fontWeight: "600", color: "#000000", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
            Bill To
          </h3>
          <p style={{ fontSize: "1.125rem", fontWeight: "700", color: "#000000", marginBottom: "0.25rem" }}>
            {client.name}
          </p>
          <p style={{ fontSize: "0.875rem", color: "#000000" }}>{client.email}</p>
          {client.phone && <p style={{ fontSize: "0.875rem", color: "#000000" }}>{client.phone}</p>}
          {client.address && <p style={{ fontSize: "0.875rem", color: "#000000", marginTop: "0.5rem" }}>{client.address}</p>}
          {(client.city || client.state || client.zipCode) && (
            <p style={{ fontSize: "0.875rem", color: "#000000" }}>
              {[client.city, client.state, client.zipCode].filter(Boolean).join(", ")}
            </p>
          )}
          {client.country && <p style={{ fontSize: "0.875rem", color: "#000000" }}>{client.country}</p>}
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000000" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: "600", color: "#000000", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Description
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.6875rem", fontWeight: "600", color: "#000000", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Qty
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.6875rem", fontWeight: "600", color: "#000000", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Rate
                </th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.6875rem", fontWeight: "600", color: "#000000", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#000000" }}>{item.description}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#000000", textAlign: "right" }}>{item.quantity}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#000000", textAlign: "right" }}>R{item.rate.toFixed(2)}</td>
                  <td style={{ padding: "1rem", fontSize: "0.875rem", fontWeight: "600", color: "#000000", textAlign: "right" }}>
                    R{item.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "2rem" }}>
          <div style={{ width: "100%", maxWidth: "24rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid #e5e7eb" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Subtotal</span>
              <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#000000" }}>R{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid #e5e7eb" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Tax</span>
              <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#000000" }}>R{tax.toFixed(2)}</span>
            </div>
            {deliveryCost && deliveryCost > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid #e5e7eb" }}>
                <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>Delivery</span>
                <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#000000" }}>R{deliveryCost.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "1rem 0", borderTop: "3px solid #000000", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "1.25rem", fontWeight: "700", color: "#000000" }}>Total</span>
              <span style={{ fontSize: "1.5rem", fontWeight: "700", color: "#000000" }}>R{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {(notes || terms) && (
          <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "2rem", marginTop: "2rem" }}>
            {notes && (
              <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f9fafb", borderLeft: "4px solid #000000" }}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: "600", color: "#000000", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  Notes
                </h4>
                <p style={{ fontSize: "0.875rem", color: "#000000", whiteSpace: "pre-wrap", lineHeight: "1.6", margin: "0" }}>
                  {notes}
                </p>
              </div>
            )}
            {terms && (
              <div style={{ padding: "1rem", backgroundColor: "#f9fafb", borderLeft: "4px solid #000000" }}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: "600", color: "#000000", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  Terms & Conditions
                </h4>
                <p style={{ fontSize: "0.875rem", color: "#000000", whiteSpace: "pre-wrap", lineHeight: "1.6", margin: "0" }}>
                  {terms}
                </p>
              </div>
            )}
          </div>
        )}

        <div style={{ borderTop: "2px solid #000000", marginTop: "2rem", paddingTop: "1.5rem", paddingBottom: "1.5rem", textAlign: "center" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: "500", color: "#000000", margin: "0" }}>
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
