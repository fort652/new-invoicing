'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import PageHeader from '../components/PageHeader';

interface PaystackTransaction {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
  customer_code?: string;
  authorization_code?: string;
}

interface SubscriptionPlan {
  name: string;
  amount: number;
  interval: 'monthly' | 'quarterly' | 'annually';
  description: string;
  savings?: string;
}

const subscriptionPlans: Record<string, SubscriptionPlan> = {
  monthly: {
    name: 'Pro Plan (Monthly)',
    amount: 2000,
    interval: 'monthly',
    description: 'Billed monthly',
  },
  quarterly: {
    name: 'Pro Plan (Quarterly)',
    amount: 5400,
    interval: 'quarterly',
    description: 'Billed every 3 months',
    savings: 'Save 10%',
  },
  annually: {
    name: 'Pro Plan (Annual)',
    amount: 19900,
    interval: 'annually',
    description: 'Billed yearly',
    savings: 'Save 17%',
  },
};

export default function SubscriptionPage() {
  const { user: clerkUser } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [popup, setPopup] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const user = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  );

  const usageLimits = useQuery(
    api.users.checkUsageLimits,
    user?._id ? { userId: user._id } : 'skip'
  );

  const createOrUpdateSubscription = useMutation(api.subscriptions.createOrUpdateSubscription);

  useEffect(() => {
    const loadPaystack = async () => {
      if (typeof window !== 'undefined') {
        const Paystack = (await import('@paystack/inline-js')).default;
        setPopup(new Paystack());
      }
    };
    loadPaystack();
  }, []);

  const handleSubscribe = async () => {
    if (!popup || !user || !clerkUser) {
      setMessage({ type: 'error', text: 'Payment system not ready. Please try again.' });
      return;
    }

    const plan = subscriptionPlans[selectedPlan];
    setLoading(true);
    setMessage(null);

    try {
      await popup.checkout({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        amount: plan.amount,
        currency: 'ZAR',
        planInterval: plan.interval,
        onSuccess: async (transaction: PaystackTransaction) => {
          try {
            await createOrUpdateSubscription({
              userId: user._id,
              planType: "pro",
              paystackSubscriptionCode: transaction.reference,
              paystackCustomerCode: transaction.customer_code,
              paystackAuthorizationCode: transaction.authorization_code,
              status: "active",
            });
            setMessage({
              type: 'success',
              text: `Subscription activated! Reference: ${transaction.reference}`,
            });
          } catch (error: any) {
            setMessage({
              type: 'error',
              text: `Failed to activate subscription: ${error.message}`,
            });
          }
          setLoading(false);
        },
        onCancel: () => {
          setMessage({ type: 'error', text: 'Payment was cancelled' });
          setLoading(false);
        },
        onError: (error: Error) => {
          setMessage({ type: 'error', text: `Payment error: ${error.message}` });
          setLoading(false);
        },
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  if (!user || !usageLimits) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const isPro = usageLimits.isPro;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
        description={
          isPro
            ? 'You are currently on the Pro plan'
            : 'Unlock unlimited clients, invoices, and emails'
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isPro ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pro Subscription</h2>
                <p className="text-gray-600 mt-1">
                  You have unlimited access to all features
                </p>
              </div>
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold">
                Active
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold mb-4">Your Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlimited clients
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlimited invoices
                </li>
                <li className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Unlimited email sending
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Usage (Free Tier)</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Clients</span>
                    <span className={`font-semibold ${usageLimits.canCreateClient ? 'text-gray-900' : 'text-red-600'}`}>
                      {usageLimits.clientsUsed} / {usageLimits.clientsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${usageLimits.canCreateClient ? 'bg-blue-600' : 'bg-red-600'}`}
                      style={{ width: `${(usageLimits.clientsUsed / usageLimits.clientsLimit) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Invoices</span>
                    <span className={`font-semibold ${usageLimits.canCreateInvoice ? 'text-gray-900' : 'text-red-600'}`}>
                      {usageLimits.invoicesUsed} / {usageLimits.invoicesLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${usageLimits.canCreateInvoice ? 'bg-blue-600' : 'bg-red-600'}`}
                      style={{ width: `${(usageLimits.invoicesUsed / usageLimits.invoicesLimit) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Emails Sent</span>
                    <span className={`font-semibold ${usageLimits.canSendEmail ? 'text-gray-900' : 'text-red-600'}`}>
                      {usageLimits.emailsUsed} / {usageLimits.emailsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${usageLimits.canSendEmail ? 'bg-blue-600' : 'bg-red-600'}`}
                      style={{ width: `${(usageLimits.emailsUsed / usageLimits.emailsLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-100 border border-green-400 text-green-700'
                    : 'bg-red-100 border border-red-400 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {Object.entries(subscriptionPlans).map(([key, plan]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedPlan(key)}
                    className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedPlan === key
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.savings && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
                        {plan.savings}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>

                    <div className="mb-4">
                      <div className="text-3xl font-bold text-gray-900">
                        R{(plan.amount / 100).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600">per {plan.interval}</div>
                    </div>

                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Unlimited clients
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Unlimited invoices
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Unlimited emails
                      </li>
                    </ul>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Subscribe Now'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Secure payment powered by Paystack
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
