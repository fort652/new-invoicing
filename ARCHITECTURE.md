# Pro Subscription System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Journey                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Sign Up (Clerk)                                             │
│     ↓                                                            │
│  2. Free Tier (3 clients, 5 invoices, 5 emails)                │
│     ↓                                                            │
│  3. Create Resources → Counters Increment                       │
│     ↓                                                            │
│  4. Hit Limit → Error Message                                   │
│     ↓                                                            │
│  5. Visit /subscription                                         │
│     ↓                                                            │
│  6. Select Plan → Paystack Checkout                            │
│     ↓                                                            │
│  7. Complete Payment                                            │
│     ↓                                                            │
│  8. Webhook → Update to Pro                                     │
│     ↓                                                            │
│  9. Unlimited Access ✓                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Dashboard   │  │   Clients    │  │   Invoices   │         │
│  │              │  │              │  │              │         │
│  │ - Stats      │  │ - List       │  │ - List       │         │
│  │ - Sub Status │  │ - Create     │  │ - Create     │         │
│  │ - Quick Acts │  │ - Limits ✓   │  │ - Limits ✓   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │           Subscription Page                       │          │
│  │                                                   │          │
│  │  - Current Usage (Free Tier)                     │          │
│  │  - Plan Selection (Monthly/Quarterly/Annual)     │          │
│  │  - Paystack Integration                          │          │
│  │  - Pro Status Display                            │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │           Usage Banner Component                  │          │
│  │                                                   │          │
│  │  - Shows on Clients/Invoices pages               │          │
│  │  - Yellow warning (approaching limit)            │          │
│  │  - Red error (limit reached)                     │          │
│  │  - Upgrade CTA                                   │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                              ↓ Convex Queries/Mutations
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Convex)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │           users.ts Functions                │                │
│  │                                             │                │
│  │  - syncUser (create with free tier)        │                │
│  │  - getCurrentUser                           │                │
│  │  - checkUsageLimits ✓                      │                │
│  │  - incrementClientCount ✓                  │                │
│  │  - incrementInvoiceCount ✓                 │                │
│  │  - incrementEmailCount ✓                   │                │
│  │  - updateSubscription ✓                    │                │
│  │  - list (for webhook)                      │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │         clients.ts Functions                │                │
│  │                                             │                │
│  │  - create (with limit check) ✓             │                │
│  │  - list                                     │                │
│  │  - update                                   │                │
│  │  - remove                                   │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │        invoices.ts Functions                │                │
│  │                                             │                │
│  │  - create (with limit check) ✓             │                │
│  │  - list                                     │                │
│  │  - update                                   │                │
│  │  - remove                                   │                │
│  │  - getStats                                 │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │              Database Schema                │                │
│  │                                             │                │
│  │  users:                                     │                │
│  │    - subscriptionStatus ✓                  │                │
│  │    - subscriptionPlan ✓                    │                │
│  │    - paystackSubscriptionCode ✓            │                │
│  │    - paystackCustomerCode ✓                │                │
│  │    - subscriptionStartDate ✓               │                │
│  │    - subscriptionEndDate ✓                 │                │
│  │    - clientsCreated ✓                      │                │
│  │    - invoicesCreated ✓                     │                │
│  │    - emailsSent ✓                          │                │
│  │                                             │                │
│  │  clients, invoices, lineItems, templates   │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              ↑ API Calls
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│                      API Routes (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │      /api/send-invoice/route.ts             │                │
│  │                                             │                │
│  │  - Check email limit ✓                     │                │
│  │  - Send via Resend                         │                │
│  │  - Increment email counter ✓               │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │   /api/webhooks/paystack/route.ts ✓        │                │
│  │                                             │                │
│  │  - Verify signature (HMAC SHA512)          │                │
│  │  - Handle subscription.create              │                │
│  │  - Handle charge.success                   │                │
│  │  - Handle subscription.disable             │                │
│  │  - Handle invoice.payment_failed           │                │
│  │  - Update user subscription status         │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↑
                              ↑ Webhooks
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │              Paystack ✓                     │                │
│  │                                             │                │
│  │  - InlineJS (payment popup)                │                │
│  │  - Subscription management                 │                │
│  │  - Recurring billing                       │                │
│  │  - Webhook events                          │                │
│  │  - Test & Live modes                       │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │               Clerk                         │                │
│  │                                             │                │
│  │  - User authentication                     │                │
│  │  - Session management                      │                │
│  │  - User data sync                          │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
│  ┌────────────────────────────────────────────┐                │
│  │               Resend                        │                │
│  │                                             │                │
│  │  - Email sending                           │                │
│  │  - Invoice delivery                        │                │
│  └────────────────────────────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Free User Creates Client

```
User Action → clients/page.tsx
              ↓
          Create Client Button
              ↓
          clients.create mutation
              ↓
          Check user.subscriptionStatus
              ↓
          Check user.clientsCreated < 3
              ↓
          ┌─────────────┬─────────────┐
          │   < 3       │    >= 3     │
          ↓             ↓
      Create Client   Throw Error
          ↓             ↓
   Increment Counter  Show Error
          ↓
      Return Success
```

### 2. User Subscribes to Pro

```
User Action → /subscription page
              ↓
          Select Plan (Monthly/Quarterly/Annual)
              ↓
          Click "Subscribe Now"
              ↓
          Paystack InlineJS Checkout
              ↓
          User Enters Card Details
              ↓
          Paystack Processes Payment
              ↓
          Paystack Creates Subscription
              ↓
          Paystack Sends Webhook
              ↓
          /api/webhooks/paystack/route.ts
              ↓
          Verify Signature (HMAC SHA512)
              ↓
          Parse Event (subscription.create)
              ↓
          Find User by Email
              ↓
          users.updateSubscription mutation
              ↓
          Update:
            - subscriptionStatus = "pro"
            - subscriptionPlan = "monthly"
            - paystackSubscriptionCode
            - paystackCustomerCode
            - subscriptionStartDate
            - subscriptionEndDate
              ↓
          Return Success
              ↓
          User Refreshes → Pro Status Active
```

### 3. Pro User Creates Unlimited Resources

```
User Action → Create Client/Invoice
              ↓
          Check user.subscriptionStatus
              ↓
          subscriptionStatus === "pro"
              ↓
          Skip Limit Check
              ↓
          Create Resource
              ↓
          Skip Counter Increment
              ↓
          Return Success
```

## Security Layer

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Measures                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Webhook Signature Verification                              │
│     - HMAC SHA512 with Paystack secret key                     │
│     - Prevents unauthorized webhook calls                       │
│                                                                  │
│  2. Environment Variables                                       │
│     - API keys never in code                                    │
│     - Separate test/live keys                                   │
│                                                                  │
│  3. Server-Side Limit Enforcement                              │
│     - Limits checked in Convex mutations                        │
│     - Cannot be bypassed from client                            │
│                                                                  │
│  4. User Authentication                                         │
│     - Clerk handles auth                                        │
│     - User ID required for all operations                       │
│                                                                  │
│  5. Secure Data Storage                                         │
│     - Subscription codes in Convex                              │
│     - No sensitive data in client                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Subscription States

```
┌─────────────────────────────────────────────────────────────────┐
│                    Subscription Lifecycle                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FREE                                                            │
│   ↓                                                              │
│   │ User subscribes                                             │
│   ↓                                                              │
│  PRO (Active)                                                   │
│   ↓                                                              │
│   │ Payment succeeds each cycle                                 │
│   ↓                                                              │
│  PRO (Active) ... continues                                     │
│   ↓                                                              │
│   │ User cancels OR payment fails                               │
│   ↓                                                              │
│  CANCELLED                                                       │
│   ↓                                                              │
│   │ Existing data preserved                                     │
│   │ Usage limits re-applied                                     │
│   ↓                                                              │
│  FREE (with existing data)                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Webhook Events Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Paystack Webhooks                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  subscription.create                                            │
│   → User subscribed                                             │
│   → Update to Pro                                               │
│   → Set subscription details                                    │
│                                                                  │
│  charge.success                                                 │
│   → Payment succeeded                                           │
│   → Update to Pro (if subscription)                             │
│   → Log transaction                                             │
│                                                                  │
│  subscription.disable                                           │
│   → Subscription cancelled                                      │
│   → Update to Cancelled                                         │
│   → Keep existing data                                          │
│                                                                  │
│  invoice.payment_failed                                         │
│   → Payment failed                                              │
│   → Log failure                                                 │
│   → No immediate action                                         │
│   → Paystack retries automatically                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Design Decisions

1. **Server-Side Enforcement**: All limits checked in Convex mutations, not client-side
2. **Usage Counters**: Track usage separately from actual records for accuracy
3. **Graceful Degradation**: Pro users who cancel keep their data
4. **Clear Feedback**: Usage warnings before limits, clear errors at limits
5. **Webhook Verification**: HMAC SHA512 signature verification for security
6. **Flexible Plans**: Three billing options with savings incentives
7. **Test Mode**: Full test mode support for safe development

## Performance Considerations

- Convex queries are cached and reactive
- Usage limits checked only on mutations (not queries)
- Webhook processing is async (doesn't block user)
- Paystack InlineJS loads on-demand
- Usage banner only shows when needed

## Scalability

- Convex handles automatic scaling
- Webhook processing is stateless
- No background jobs needed (Paystack handles billing)
- Usage counters are simple integers (fast)
- Can support thousands of concurrent users
