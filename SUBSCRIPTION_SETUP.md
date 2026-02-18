# Pro Subscription Setup Guide

## Overview

The invoicing app now includes a Pro subscription system powered by Paystack. Users can upgrade from the free tier to unlock unlimited access to all features.

## Subscription Tiers

### Free Tier
- **Clients**: 3 maximum
- **Invoices**: 5 maximum
- **Emails**: 5 maximum

### Pro Tier
- **Clients**: Unlimited
- **Invoices**: Unlimited
- **Emails**: Unlimited

## Subscription Plans

### Monthly Plan
- **Price**: R199.00/month
- **Billing**: Every month

### Quarterly Plan
- **Price**: R540.00/quarter
- **Billing**: Every 3 months
- **Savings**: 9% compared to monthly

### Annual Plan
- **Price**: R1,990.00/year
- **Billing**: Once per year
- **Savings**: 17% compared to monthly

## Setup Instructions

### 1. Paystack Configuration

1. Sign up for a Paystack account at https://paystack.com
2. Get your API keys from the Paystack Dashboard
3. Update `.env.local` with your Paystack keys:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

### 2. Webhook Configuration

1. In your Paystack Dashboard, go to Settings > Webhooks
2. Add your webhook URL: `https://yourdomain.com/api/webhooks/paystack`
3. Select the following events:
   - `subscription.create`
   - `charge.success`
   - `subscription.disable`
   - `invoice.payment_failed`

### 3. Database Migration

The schema has been updated to include subscription fields. Run:

```bash
npx convex dev
```

This will automatically apply the schema changes to your Convex database.

### 4. Test the Integration

Use Paystack test cards:
- **Success**: 4084084084084081 (CVV: 408, Expiry: any future date)
- **Failure**: 5060666666666666666 (CVV: 123, Expiry: any future date)

## How It Works

### User Flow

1. User signs up (automatically on free tier)
2. User creates clients/invoices/sends emails (tracked against limits)
3. When limit is reached, user sees upgrade prompts
4. User visits `/subscription` page
5. User selects a plan and subscribes
6. Paystack processes payment and creates subscription
7. Webhook updates user to Pro status
8. User now has unlimited access

### Technical Implementation

#### Limit Checking

Limits are enforced in three places:

1. **Client Creation** (`convex/clients.ts`)
   - Checks `clientsCreated` count before allowing creation
   - Increments counter after successful creation

2. **Invoice Creation** (`convex/invoices.ts`)
   - Checks `invoicesCreated` count before allowing creation
   - Increments counter after successful creation

3. **Email Sending** (`app/api/send-invoice/route.ts`)
   - Checks `emailsSent` count before sending
   - Increments counter after successful send

#### Subscription Events

The webhook handler (`app/api/webhooks/paystack/route.ts`) processes:

- `subscription.create` / `charge.success`: Upgrades user to Pro
- `subscription.disable`: Downgrades user (keeps existing data)
- `invoice.payment_failed`: Logs failure (no immediate action)

#### Frontend Components

1. **Subscription Page** (`app/subscription/page.tsx`)
   - Shows current usage for free users
   - Displays plan options
   - Handles Paystack checkout

2. **Usage Banner** (`app/components/UsageBanner.tsx`)
   - Shows usage warnings when approaching limits
   - Displays upgrade CTA
   - Appears on clients and invoices pages

3. **Navigation** (`app/components/Navigation.tsx`)
   - Includes link to subscription page

## API Reference

### Convex Functions

#### `users:checkUsageLimits`
Query to check user's current usage and limits.

```typescript
const limits = useQuery(api.users.checkUsageLimits, { userId });
// Returns: { isPro, canCreateClient, canCreateInvoice, canSendEmail, ... }
```

#### `users:updateSubscription`
Mutation to update user's subscription status.

```typescript
await updateSubscription({
  userId,
  subscriptionStatus: "pro",
  subscriptionPlan: "monthly",
  paystackSubscriptionCode: "SUB_xxxxx",
  paystackCustomerCode: "CUS_xxxxx",
  subscriptionStartDate: Date.now(),
  subscriptionEndDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
});
```

## Currency Support

Currently configured for South African Rand (ZAR). To change currency:

1. Update the `currency` in `app/subscription/page.tsx`
2. Update plan amounts (Paystack uses smallest currency unit)
3. Update display symbols

## Security

- Webhook signatures are verified using HMAC SHA512
- Subscription codes are stored securely in Convex
- API keys are environment variables (never committed)

## Troubleshooting

### Subscription not activating
- Check webhook logs in Paystack Dashboard
- Verify webhook URL is accessible
- Check Convex function logs

### Payment failing
- Verify Paystack public key is correct
- Check test mode vs live mode
- Ensure card details are valid

### Limits not updating
- Check Convex mutations are completing
- Verify user ID is being passed correctly
- Check browser console for errors

## Going Live

1. Switch to Paystack live keys in `.env.local`
2. Update webhook URL to production domain
3. Test with real card (small amount)
4. Monitor first few transactions closely

## Support

For Paystack-specific issues:
- Documentation: https://paystack.com/docs
- Support: support@paystack.com

For implementation questions, check the code comments in:
- `convex/schema.ts`
- `convex/users.ts`
- `app/subscription/page.tsx`
- `app/api/webhooks/paystack/route.ts`
