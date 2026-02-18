'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function UsageBanner() {
  const { user: clerkUser } = useUser();

  const user = useQuery(
    api.users.getCurrentUser,
    clerkUser?.id ? { clerkId: clerkUser.id } : 'skip'
  );

  const usageLimits = useQuery(
    api.users.checkUsageLimits,
    user?._id ? { userId: user._id } : 'skip'
  );

  if (!usageLimits || usageLimits.isPro) {
    return null;
  }

  const isNearLimit =
    usageLimits.clientsUsed >= 2 ||
    usageLimits.invoicesUsed >= 4 ||
    usageLimits.emailsUsed >= 4;

  const isAtLimit =
    !usageLimits.canCreateClient ||
    !usageLimits.canCreateInvoice ||
    !usageLimits.canSendEmail;

  if (!isNearLimit && !isAtLimit) {
    return null;
  }

  return (
    <div
      className={`rounded-lg p-4 mb-6 ${
        isAtLimit
          ? 'bg-red-50 border border-red-200'
          : 'bg-yellow-50 border border-yellow-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3
            className={`font-semibold mb-1 ${
              isAtLimit ? 'text-red-900' : 'text-yellow-900'
            }`}
          >
            {isAtLimit ? 'Free Tier Limit Reached' : 'Approaching Free Tier Limit'}
          </h3>
          <p
            className={`text-sm mb-3 ${
              isAtLimit ? 'text-red-700' : 'text-yellow-700'
            }`}
          >
            {isAtLimit
              ? 'You have reached your free tier limits. Upgrade to Pro for unlimited access.'
              : 'You are approaching your free tier limits. Consider upgrading to Pro.'}
          </p>
          <div className="flex flex-wrap gap-4 text-sm mb-3">
            <div>
              <span
                className={`font-medium ${
                  isAtLimit ? 'text-red-900' : 'text-yellow-900'
                }`}
              >
                Clients:
              </span>{' '}
              <span
                className={
                  usageLimits.canCreateClient
                    ? 'text-gray-700'
                    : 'text-red-600 font-semibold'
                }
              >
                {usageLimits.clientsUsed} / {usageLimits.clientsLimit}
              </span>
            </div>
            <div>
              <span
                className={`font-medium ${
                  isAtLimit ? 'text-red-900' : 'text-yellow-900'
                }`}
              >
                Invoices:
              </span>{' '}
              <span
                className={
                  usageLimits.canCreateInvoice
                    ? 'text-gray-700'
                    : 'text-red-600 font-semibold'
                }
              >
                {usageLimits.invoicesUsed} / {usageLimits.invoicesLimit}
              </span>
            </div>
            <div>
              <span
                className={`font-medium ${
                  isAtLimit ? 'text-red-900' : 'text-yellow-900'
                }`}
              >
                Emails:
              </span>{' '}
              <span
                className={
                  usageLimits.canSendEmail
                    ? 'text-gray-700'
                    : 'text-red-600 font-semibold'
                }
              >
                {usageLimits.emailsUsed} / {usageLimits.emailsLimit}
              </span>
            </div>
          </div>
        </div>
        <Link
          href="/subscription"
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap text-sm font-semibold"
        >
          Upgrade to Pro
        </Link>
      </div>
    </div>
  );
}
