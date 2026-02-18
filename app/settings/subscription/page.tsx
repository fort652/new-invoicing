"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";

export default function SubscriptionPage() {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser, user?.id ? { clerkId: user.id } : "skip");
  
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Skip subscription queries for now - these require the schema to be deployed
  const subscription: {
    cancelAtPeriodEnd?: boolean;
    currentPeriodEnd?: number;
  } | null = null;
  const usage: {
    invoiceCount?: number;
    clientCount?: number;
    emailSendCount?: number;
    resetAt?: number;
  } | null = null;

  const planType = currentUser?.planType || "free";

  const handleUpgrade = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    setIsUpgrading(true);
    try {
      const response = await fetch("/api/subscription/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.primaryEmailAddress.emailAddress,
          planType: "pro",
        }),
      });

      const data = await response.json();

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl;
      } else {
        alert("Failed to initialize payment");
      }
    } catch (error) {
      console.error("Error upgrading:", error);
      alert("Failed to upgrade subscription");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will lose access to Pro features at the end of your billing period.")) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        alert("Subscription cancelled successfully");
        window.location.reload();
      } else {
        alert(data.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling:", error);
      alert("Failed to cancel subscription");
    } finally {
      setIsCancelling(false);
    }
  };

  const limits = {
    free: {
      invoices: 5,
      clients: 3,
      emails: 5,
    },
    pro: {
      invoices: "Unlimited",
      clients: "Unlimited",
      emails: "Unlimited",
    },
  };

  const currentLimits = limits[planType];

  // Show loading state while data is being fetched
  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Subscription" />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Current Plan
          </h2>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 uppercase">
                  {planType}
                </span>
                {planType === "pro" && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {planType === "free" ? "Free forever" : "R10.00 / month"}
              </p>
            </div>

            {planType === "free" ? (
              <button
                onClick={handleUpgrade}
                disabled={isUpgrading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpgrading ? "Processing..." : "Upgrade to Pro"}
              </button>
            ) : (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? "Processing..." : "Cancel Subscription"}
              </button>
            )}
          </div>

          {subscription && subscription.cancelAtPeriodEnd && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200">
                Your subscription will be cancelled at the end of the current billing period on{" "}
                {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : "the next billing date"}
                .
              </p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Usage & Limits
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Invoices
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {usage?.invoiceCount || 0} / {currentLimits.invoices}
                </span>
              </div>
              {planType === "free" && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((usage?.invoiceCount || 0) / 5) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Clients
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {usage?.clientCount || 0} / {currentLimits.clients}
                </span>
              </div>
              {planType === "free" && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((usage?.clientCount || 0) / 3) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Email Sends
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {usage?.emailSendCount || 0} / {currentLimits.emails}
                </span>
              </div>
              {planType === "free" && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((usage?.emailSendCount || 0) / 5) * 100, 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {planType === "free" && usage && usage.resetAt && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Usage resets on {new Date(usage.resetAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Plan Comparison
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Free Plan
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                R0<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span>
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 5 invoices
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 3 clients
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Up to 5 email sends
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All basic features
                </li>
              </ul>
            </div>

            <div className="border-2 border-blue-600 dark:border-blue-500 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Recommended
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Pro Plan
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                R10<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span>
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited invoices
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited clients
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited email sends
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All premium features
                </li>
                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              {planType === "free" && (
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpgrading ? "Processing..." : "Upgrade Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
