import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-paystack-signature");
    const payload = await request.text();

    if (!signature || !verifyPaystackSignature(payload, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      return NextResponse.json(
        { error: "Convex URL not configured" },
        { status: 500 }
      );
    }

    switch (event.event) {
      case "subscription.create":
      case "charge.success": {
        const { customer, subscription, plan } = event.data;
        
        if (!subscription) break;

        const email = customer.email;
        const subscriptionCode = subscription.subscription_code;
        const customerCode = customer.customer_code;

        const planInterval = plan?.interval || subscription.plan?.interval;
        let subscriptionPlan: "monthly" | "quarterly" | "annually" = "monthly";
        
        if (planInterval === "quarterly") subscriptionPlan = "quarterly";
        else if (planInterval === "annually") subscriptionPlan = "annually";

        const usersResponse = await fetch(`${convexUrl}/api/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: "users:list",
            args: {},
            format: "json",
          }),
        });

        if (!usersResponse.ok) break;

        const usersData = await usersResponse.json();
        const users = usersData.value || [];
        const user = users.find((u: any) => u.email === email);

        if (!user) break;

        const now = Date.now();
        let endDate = now;
        
        if (subscriptionPlan === "monthly") {
          endDate = now + 30 * 24 * 60 * 60 * 1000;
        } else if (subscriptionPlan === "quarterly") {
          endDate = now + 90 * 24 * 60 * 60 * 1000;
        } else if (subscriptionPlan === "annually") {
          endDate = now + 365 * 24 * 60 * 60 * 1000;
        }

        await fetch(`${convexUrl}/api/mutation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: "users:updateSubscription",
            args: {
              userId: user._id,
              subscriptionStatus: "pro",
              subscriptionPlan,
              paystackSubscriptionCode: subscriptionCode,
              paystackCustomerCode: customerCode,
              subscriptionStartDate: now,
              subscriptionEndDate: endDate,
            },
            format: "json",
          }),
        });

        break;
      }

      case "subscription.disable": {
        const { subscription, customer } = event.data;
        const email = customer.email;

        const usersResponse = await fetch(`${convexUrl}/api/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: "users:list",
            args: {},
            format: "json",
          }),
        });

        if (!usersResponse.ok) break;

        const usersData = await usersResponse.json();
        const users = usersData.value || [];
        const user = users.find((u: any) => u.email === email);

        if (!user) break;

        await fetch(`${convexUrl}/api/mutation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: "users:updateSubscription",
            args: {
              userId: user._id,
              subscriptionStatus: "cancelled",
            },
            format: "json",
          }),
        });

        break;
      }

      case "invoice.payment_failed": {
        console.log("Payment failed for subscription:", event.data);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
