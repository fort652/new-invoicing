import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, invoice, userId } = body;

    if (!to || !invoice || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { error: "Convex URL not configured" },
        { status: 500 }
      );
    }

    const userResponse = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: "users:getCurrentUser",
        args: { clerkId: userId },
        format: "json",
      }),
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: "Failed to check user limits" },
        { status: 500 }
      );
    }

    const userData = await userResponse.json();
    const user = userData.value;

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const planType = user.planType || "free";
    const isPro = planType === "pro";

    if (!isPro) {
      const usageResponse = await fetch(`${convexUrl}/api/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "subscriptions:getUsageTracking",
          args: { userId: user._id },
          format: "json",
        }),
      });

      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        const usage = usageData.value;
        const emailsSent = usage?.emailSendCount ?? 0;

        if (emailsSent >= 5) {
          return NextResponse.json(
            { error: "Free tier limit reached. Upgrade to Pro to send unlimited emails." },
            { status: 403 }
          );
        }
      }
    }

    const lineItemsHtml = invoice.lineItems
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">R${item.rate.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">R${item.amount.toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice ${invoice.invoiceNumber}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb;">
          <div style="max-width: 800px; margin: 40px auto; background-color: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">INVOICE</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 18px;">#${invoice.invoiceNumber}</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px;">
              
              <!-- Invoice Info -->
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

              <!-- Bill To -->
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

              <!-- Line Items -->
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

              <!-- Totals -->
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

              <!-- Notes & Terms -->
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

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Thank you for your business!</p>
            </div>

          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "Invoice App <invoices@invoice-snap-demo.co.za>",
      to: [to],
      subject: `Invoice ${invoice.invoiceNumber} from Invoice App`,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!isPro) {
      await fetch(`${convexUrl}/api/mutation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: "subscriptions:incrementEmailSendCount",
          args: { userId: user._id },
          format: "json",
        }),
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Send invoice error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
