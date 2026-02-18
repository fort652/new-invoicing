import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { validateWebhookSignature } from '@/lib/paystack';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const PAYSTACK_IPS = [
  '52.31.139.75',
  '52.49.173.169',
  '52.214.14.220',
];

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature');
    const body = await request.text();

    if (!signature) {
      console.error('No signature provided');
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    const isValid = validateWebhookSignature(body, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    console.log('Received PayStack webhook:', event.event);

    switch (event.event) {
      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;

      case 'subscription.not_renew':
        await handleSubscriptionNotRenew(event.data);
        break;

      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;

      case 'invoice.create':
        await handleInvoiceCreate(event.data);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreate(data: any) {
  console.log('Handling subscription.create:', data);

  const email = data.customer?.email;
  if (!email) {
    console.error('No customer email in subscription.create event');
    return;
  }

  const user = await convex.query(api.users.getUserByEmail, { email });
  if (!user) {
    console.error('User not found for email:', email);
    return;
  }

  const now = Date.now();
  const nextPaymentDate = data.next_payment_date
    ? new Date(data.next_payment_date).getTime()
    : now + 30 * 24 * 60 * 60 * 1000;

  await convex.mutation(api.subscriptions.createOrUpdateSubscription, {
    userId: user._id,
    planType: 'pro',
    paystackSubscriptionCode: data.subscription_code,
    paystackCustomerCode: data.customer?.customer_code,
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: nextPaymentDate,
    cancelAtPeriodEnd: false,
  });

  console.log('Subscription created for user:', user._id);
}

async function handleSubscriptionDisable(data: any) {
  console.log('Handling subscription.disable:', data);

  const subscriptionCode = data.subscription_code;
  if (!subscriptionCode) {
    console.error('No subscription code in subscription.disable event');
    return;
  }

  const subscription = await convex.query(
    api.subscriptions.getSubscriptionByPaystackCode,
    { paystackSubscriptionCode: subscriptionCode }
  );

  if (!subscription) {
    console.error('Subscription not found for code:', subscriptionCode);
    return;
  }

  await convex.mutation(api.subscriptions.createOrUpdateSubscription, {
    userId: subscription.userId,
    planType: 'free',
    status: 'expired',
    cancelAtPeriodEnd: false,
  });

  console.log('Subscription disabled for user:', subscription.userId);
}

async function handleSubscriptionNotRenew(data: any) {
  console.log('Handling subscription.not_renew:', data);

  const subscriptionCode = data.subscription_code;
  if (!subscriptionCode) {
    console.error('No subscription code in subscription.not_renew event');
    return;
  }

  const subscription = await convex.query(
    api.subscriptions.getSubscriptionByPaystackCode,
    { paystackSubscriptionCode: subscriptionCode }
  );

  if (!subscription) {
    console.error('Subscription not found for code:', subscriptionCode);
    return;
  }

  await convex.mutation(api.subscriptions.createOrUpdateSubscription, {
    userId: subscription.userId,
    planType: subscription.planType,
    paystackSubscriptionCode: subscription.paystackSubscriptionCode,
    paystackCustomerCode: subscription.paystackCustomerCode,
    paystackAuthorizationCode: subscription.paystackAuthorizationCode,
    status: 'cancelled',
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: true,
  });

  console.log('Subscription marked for non-renewal:', subscription.userId);
}

async function handleChargeSuccess(data: any) {
  console.log('Handling charge.success:', data);

  const email = data.customer?.email;
  if (!email) {
    console.error('No customer email in charge.success event');
    return;
  }

  const user = await convex.query(api.users.getUserByEmail, { email });
  if (!user) {
    console.error('User not found for email:', email);
    return;
  }

  const subscription = await convex.query(api.subscriptions.getUserSubscription, {
    userId: user._id,
  });

  if (subscription && subscription.status === 'attention') {
    const now = Date.now();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await convex.mutation(api.subscriptions.createOrUpdateSubscription, {
      userId: user._id,
      planType: subscription.planType,
      paystackSubscriptionCode: subscription.paystackSubscriptionCode,
      paystackCustomerCode: subscription.paystackCustomerCode,
      paystackAuthorizationCode: subscription.paystackAuthorizationCode,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth.getTime(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    });

    console.log('Subscription reactivated after successful charge:', user._id);
  }
}

async function handleInvoiceCreate(data: any) {
  console.log('Handling invoice.create:', data);
}

async function handleInvoicePaymentFailed(data: any) {
  console.log('Handling invoice.payment_failed:', data);

  const subscriptionCode = data.subscription?.subscription_code;
  if (!subscriptionCode) {
    console.error('No subscription code in invoice.payment_failed event');
    return;
  }

  const subscription = await convex.query(
    api.subscriptions.getSubscriptionByPaystackCode,
    { paystackSubscriptionCode: subscriptionCode }
  );

  if (!subscription) {
    console.error('Subscription not found for code:', subscriptionCode);
    return;
  }

  await convex.mutation(api.subscriptions.createOrUpdateSubscription, {
    userId: subscription.userId,
    planType: subscription.planType,
    paystackSubscriptionCode: subscription.paystackSubscriptionCode,
    paystackCustomerCode: subscription.paystackCustomerCode,
    paystackAuthorizationCode: subscription.paystackAuthorizationCode,
    status: 'attention',
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
  });

  console.log('Subscription marked as needing attention:', subscription.userId);
}
