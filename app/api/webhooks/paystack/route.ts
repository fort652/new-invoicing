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

    console.log("Webhook received:", { event: JSON.parse(payload).event });

    if (!signature || !verifyPaystackSignature(payload, signature)) {
      console.error("Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(payload);
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!convexUrl) {
      console.error("Convex URL not configured");
      return NextResponse.json(
        { error: "Convex URL not configured" },
        { status: 500 }
      );
    }

    console.log("Processing event:", event.event, "Data:", JSON.stringify(event.data));

    switch (event.event) {
      case "subscription.create":
      case "charge.success": {
        const { customer, subscription, plan, authorization } = event.data;
        
        console.log("Customer:", customer?.email);
        console.log("Has subscription:", !!subscription);
        console.log("Has authorization:", !!authorization);
        
        if (!subscription && !authorization) {
          console.log("No subscription or authorization, skipping");
          break;
        }

        const email = customer.email;
        const subscriptionCode = subscription?.subscription_code;
        const customerCode = customer.customer_code;
        const authorizationCode = authorization?.authorization_code;

        console.log("Fetching users from Convex...");
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

        if (!usersResponse.ok) {
          console.error("Failed to fetch users:", usersResponse.status);
          break;
        }

        const usersData = await usersResponse.json();
        const users = usersData.value || [];
        console.log("Found users:", users.length);
        
        const user = users.find((u: any) => u.email === email);

        if (!user) {
          console.error("User not found with email:", email);
          break;
        }

        console.log("Found user:", user._id, user.email);

        const now = Date.now();
        const endDate = now + 30 * 24 * 60 * 60 * 1000;

        console.log("Creating subscription...");
        const subscriptionResponse = await fetch(`${convexUrl}/api/mutation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: "subscriptions:createOrUpdateSubscription",
            args: {
              userId: user._id,
              planType: "pro",
              paystackSubscriptionCode: subscriptionCode,
              paystackCustomerCode: customerCode,
              paystackAuthorizationCode: authorizationCode,
              status: "active",
              currentPeriodStart: now,
              currentPeriodEnd: endDate,
              cancelAtPeriodEnd: false,
            },
            format: "json",
          }),
        });

        if (!subscriptionResponse.ok) {
          console.error("Failed to create subscription:", subscriptionResponse.status);
          const errorText = await subscriptionResponse.text();
          console.error("Error:", errorText);
        } else {
          const result = await subscriptionResponse.json();
          console.log("Subscription created successfully:", result);
        }

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
            path: "subscriptions:cancelSubscription",
            args: {
              userId: user._id,
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
