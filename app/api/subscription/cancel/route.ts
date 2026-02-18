import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { disableSubscription } from '@/lib/paystack';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    const subscription = await convex.query(api.subscriptions.getUserSubscription, {
      userId: user._id,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (!subscription.paystackSubscriptionCode) {
      await convex.mutation(api.subscriptions.cancelSubscription, {
        userId: user._id,
      });

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully',
      });
    }

    await disableSubscription(
      subscription.paystackSubscriptionCode,
      ''
    );

    await convex.mutation(api.subscriptions.cancelSubscription, {
      userId: user._id,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
