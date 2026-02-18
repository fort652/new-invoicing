import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { initializeTransaction, createPlan, listPlans, PRO_PLAN_NAME, PRO_PLAN_AMOUNT, PRO_PLAN_CURRENCY } from '@/lib/paystack';

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

    const body = await request.json();
    const { email, planType } = body;

    if (!email || !planType) {
      return NextResponse.json(
        { error: 'Email and plan type are required' },
        { status: 400 }
      );
    }

    if (planType !== 'pro') {
      return NextResponse.json(
        { error: 'Only pro plan can be initialized for payment' },
        { status: 400 }
      );
    }

    let planCode: string | undefined;

    const plans = await listPlans();
    const existingPlan = plans.find(
      (p) => p.name === PRO_PLAN_NAME && p.amount === PRO_PLAN_AMOUNT
    );

    if (existingPlan) {
      planCode = existingPlan.plan_code;
    } else {
      const newPlan = await createPlan(
        PRO_PLAN_NAME,
        PRO_PLAN_AMOUNT,
        'monthly',
        PRO_PLAN_CURRENCY
      );
      planCode = newPlan.plan_code;
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subscription/verify`;

    const transaction = await initializeTransaction(
      email,
      PRO_PLAN_AMOUNT,
      planCode,
      callbackUrl,
      {
        userId,
        planType: 'pro',
      }
    );

    return NextResponse.json({
      authorizationUrl: transaction.authorization_url,
      reference: transaction.reference,
    });
  } catch (error: any) {
    console.error('Error initializing subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize subscription' },
      { status: 500 }
    );
  }
}
