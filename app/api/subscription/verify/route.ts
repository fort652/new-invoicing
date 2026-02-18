import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { verifyTransaction } from '@/lib/paystack';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(
        new URL('/sign-in', request.url)
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.redirect(
        new URL('/dashboard?error=no_reference', request.url)
      );
    }

    const verification = await verifyTransaction(reference);

    if (verification.status !== 'success') {
      return NextResponse.redirect(
        new URL('/dashboard?error=payment_failed', request.url)
      );
    }

    const user = await convex.query(api.users.getUserByClerkId, {
      clerkId: userId,
    });

    if (!user) {
      return NextResponse.redirect(
        new URL('/dashboard?error=user_not_found', request.url)
      );
    }

    const now = Date.now();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await convex.mutation(api.subscriptions.createOrUpdateSubscription, {
      userId: user._id,
      planType: 'pro',
      paystackCustomerCode: verification.customer.customer_code,
      paystackAuthorizationCode: verification.authorization.authorization_code,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth.getTime(),
      cancelAtPeriodEnd: false,
    });

    return NextResponse.redirect(
      new URL('/dashboard?success=subscription_activated', request.url)
    );
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=verification_failed', request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    const verification = await verifyTransaction(reference);

    if (verification.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed', verification },
        { status: 400 }
      );
    }

    const user = await convex.query(api.users.getUserByClerkId, {
      clerkId: userId,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const now = Date.now();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await convex.mutation(api.subscriptions.createOrUpdateSubscription, {
      userId: user._id,
      planType: 'pro',
      paystackCustomerCode: verification.customer.customer_code,
      paystackAuthorizationCode: verification.authorization.authorization_code,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth.getTime(),
      cancelAtPeriodEnd: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      verification,
    });
  } catch (error: any) {
    console.error('Error verifying subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify subscription' },
      { status: 500 }
    );
  }
}
