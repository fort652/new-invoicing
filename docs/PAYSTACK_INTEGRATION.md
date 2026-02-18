# PayStack Integration Documentation

## Overview

This document provides comprehensive information about integrating PayStack payment processing into the invoicing application for subscription management.

## Test Credentials

```
Test Secret Key: sk_test_28067d17f921a3c69f6aba1ed64ab17422c24843
Test Public Key: pk_test_4e4c6f7143a8fe12d4b2764743b63442b0505b1d
```

**IMPORTANT:** These are test credentials. Never use test credentials in production.

## Subscription Plans

### Free Plan
- **Price:** R0 (Free)
- **Limits:**
  - Maximum 5 invoices
  - Maximum 3 clients
  - Maximum 5 email sends
  - All basic features included

### Pro Plan
- **Price:** R10/month (1000 cents in ZAR)
- **Limits:**
  - Unlimited invoices
  - Unlimited clients
  - Unlimited email sends
  - All premium features included

## API Endpoints

### Base URL
```
https://api.paystack.co
```

### Authentication
All API requests must include the Authorization header:
```
Authorization: Bearer YOUR_SECRET_KEY
```

### Key Endpoints

#### 1. Create Plan
**Endpoint:** `POST /plan`

**Purpose:** Create a subscription plan (Free or Pro)

**Request Body:**
```json
{
  "name": "Pro Plan",
  "interval": "monthly",
  "amount": 1000,
  "currency": "ZAR"
}
```

**Parameters:**
- `name` (string): Name of the plan
- `interval` (string): Billing interval - `hourly`, `daily`, `weekly`, `monthly`, `quarterly`, `biannually`, `annually`
- `amount` (integer): Amount in subunits (multiply by 100)
- `currency` (string): Currency code (ZAR for South African Rand)
- `invoice_limit` (optional, integer): Number of times to charge

**Response:**
```json
{
  "status": true,
  "message": "Plan created",
  "data": {
    "id": 123456,
    "name": "Pro Plan",
    "plan_code": "PLN_xxxxxxxxxx",
    "amount": 1000,
    "interval": "monthly",
    "currency": "ZAR"
  }
}
```

#### 2. Initialize Transaction
**Endpoint:** `POST /transaction/initialize`

**Purpose:** Start a payment transaction with optional plan subscription

**Request Body:**
```json
{
  "email": "customer@example.com",
  "amount": 1000,
  "currency": "ZAR",
  "plan": "PLN_xxxxxxxxxx",
  "callback_url": "https://yourapp.com/verify-payment",
  "metadata": {
    "custom_fields": [
      {
        "display_name": "Customer Name",
        "variable_name": "customer_name",
        "value": "John Doe"
      }
    ]
  }
}
```

**Response:**
```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxxxxxxxxx",
    "access_code": "xxxxxxxxxx",
    "reference": "xxxxxxxxxx"
  }
}
```

#### 3. Verify Transaction
**Endpoint:** `GET /transaction/verify/:reference`

**Purpose:** Verify payment status after customer completes payment

**Response:**
```json
{
  "status": true,
  "message": "Verification successful",
  "data": {
    "id": 123456,
    "status": "success",
    "reference": "xxxxxxxxxx",
    "amount": 1000,
    "currency": "ZAR",
    "customer": {
      "email": "customer@example.com"
    },
    "authorization": {
      "authorization_code": "AUTH_xxxxxxxxxx",
      "card_type": "visa",
      "last4": "1234",
      "exp_month": "12",
      "exp_year": "2025"
    }
  }
}
```

#### 4. Create Subscription
**Endpoint:** `POST /subscription`

**Purpose:** Create a subscription for a customer with existing authorization

**Request Body:**
```json
{
  "customer": "customer@example.com",
  "plan": "PLN_xxxxxxxxxx",
  "authorization": "AUTH_xxxxxxxxxx",
  "start_date": "2026-03-01T00:00:00Z"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Subscription successfully created",
  "data": {
    "customer": 123456,
    "plan": 789012,
    "subscription_code": "SUB_xxxxxxxxxx",
    "email_token": "xxxxxxxxxx",
    "status": "active",
    "amount": 1000,
    "next_payment_date": "2026-04-01T00:00:00Z"
  }
}
```

#### 5. Fetch Subscription
**Endpoint:** `GET /subscription/:id_or_code`

**Purpose:** Get subscription details

**Response:**
```json
{
  "status": true,
  "message": "Subscription retrieved",
  "data": {
    "customer": 123456,
    "plan": {
      "name": "Pro Plan",
      "plan_code": "PLN_xxxxxxxxxx",
      "amount": 1000
    },
    "subscription_code": "SUB_xxxxxxxxxx",
    "status": "active",
    "amount": 1000,
    "next_payment_date": "2026-04-01T00:00:00Z"
  }
}
```

#### 6. Disable Subscription
**Endpoint:** `POST /subscription/disable`

**Purpose:** Cancel a subscription

**Request Body:**
```json
{
  "code": "SUB_xxxxxxxxxx",
  "token": "xxxxxxxxxx"
}
```

#### 7. Enable Subscription
**Endpoint:** `POST /subscription/enable`

**Purpose:** Reactivate a cancelled subscription

**Request Body:**
```json
{
  "code": "SUB_xxxxxxxxxx",
  "token": "xxxxxxxxxx"
}
```

## Webhook Events

### Setup
Configure webhook URL in PayStack Dashboard:
```
https://yourapp.com/api/webhooks/paystack
```

### Signature Validation
Verify webhook authenticity using HMAC SHA512:

```javascript
const crypto = require('crypto');

function validateWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
```

### IP Whitelisting
Only accept webhooks from these IPs:
- 52.31.139.75
- 52.49.173.169
- 52.214.14.220

### Subscription Events

#### 1. subscription.create
Fired when a subscription is created.

```json
{
  "event": "subscription.create",
  "data": {
    "customer": {
      "email": "customer@example.com"
    },
    "plan": {
      "name": "Pro Plan",
      "plan_code": "PLN_xxxxxxxxxx"
    },
    "subscription_code": "SUB_xxxxxxxxxx",
    "status": "active"
  }
}
```

**Action:** Update user's plan to Pro in database.

#### 2. subscription.disable
Fired when a subscription is cancelled or expires.

```json
{
  "event": "subscription.disable",
  "data": {
    "subscription_code": "SUB_xxxxxxxxxx",
    "status": "complete"
  }
}
```

**Action:** Downgrade user to Free plan.

#### 3. subscription.not_renew
Fired when a subscription won't renew on next payment date.

```json
{
  "event": "subscription.not_renew",
  "data": {
    "subscription_code": "SUB_xxxxxxxxxx"
  }
}
```

**Action:** Notify user about upcoming cancellation.

#### 4. invoice.create
Fired 3 days before next payment attempt.

```json
{
  "event": "invoice.create",
  "data": {
    "subscription": {
      "subscription_code": "SUB_xxxxxxxxxx"
    },
    "amount": 1000
  }
}
```

**Action:** Send reminder email to user.

#### 5. invoice.payment_failed
Fired when subscription payment fails.

```json
{
  "event": "invoice.payment_failed",
  "data": {
    "subscription": {
      "subscription_code": "SUB_xxxxxxxxxx"
    }
  }
}
```

**Action:** Notify user to update payment method.

#### 6. charge.success
Fired when a payment succeeds.

```json
{
  "event": "charge.success",
  "data": {
    "reference": "xxxxxxxxxx",
    "amount": 1000,
    "customer": {
      "email": "customer@example.com"
    }
  }
}
```

**Action:** Update subscription status and extend access.

## Implementation Flow

### 1. User Upgrades to Pro

```
1. User clicks "Upgrade to Pro" button
2. Frontend calls /api/subscription/initialize
3. Backend creates/retrieves plan from PayStack
4. Backend initializes transaction with plan_code
5. User redirected to PayStack checkout
6. User completes payment
7. PayStack redirects to callback URL
8. Frontend calls /api/subscription/verify
9. Backend verifies transaction
10. Backend updates user plan in database
11. Webhook confirms subscription creation
```

### 2. Subscription Renewal

```
1. PayStack sends invoice.create webhook (3 days before)
2. App sends reminder email to user
3. PayStack attempts charge on payment date
4. PayStack sends charge.success or invoice.payment_failed
5. App updates subscription status accordingly
```

### 3. User Cancels Subscription

```
1. User clicks "Cancel Subscription"
2. Frontend calls /api/subscription/cancel
3. Backend calls PayStack disable subscription
4. PayStack sends subscription.not_renew webhook
5. App marks subscription for cancellation
6. On next payment date, subscription.disable webhook received
7. App downgrades user to Free plan
```

## Currency and Amounts

### ZAR (South African Rand)
- Subunit: Cent
- Multiply amount by 100
- Example: R10.00 = 1000 cents

### Amount Calculation
```javascript
// Convert ZAR to cents
const amountInCents = amountInZAR * 100;

// Convert cents to ZAR
const amountInZAR = amountInCents / 100;
```

## Error Handling

### Common Errors

1. **Invalid API Key**
```json
{
  "status": false,
  "message": "Invalid key"
}
```

2. **Insufficient Funds**
```json
{
  "status": false,
  "message": "Insufficient funds"
}
```

3. **Card Declined**
```json
{
  "status": false,
  "message": "Transaction declined"
}
```

### Retry Logic
- Failed webhooks are retried every 3 minutes for first 4 attempts
- Then retried hourly for 72 hours
- Always return 200 OK from webhook endpoint

## Testing

### Test Cards

**Successful Payment:**
```
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

**Failed Payment:**
```
Card Number: 5060666666666666666
CVV: 123
Expiry: Any future date
```

### Test Scenarios

1. **Successful Subscription**
   - Use successful test card
   - Verify subscription created
   - Check webhook received

2. **Failed Payment**
   - Use failed test card
   - Verify error handling
   - Check user remains on current plan

3. **Subscription Cancellation**
   - Create subscription
   - Cancel subscription
   - Verify downgrade on next billing date

## Security Best Practices

1. **Never expose secret keys in frontend code**
2. **Always validate webhook signatures**
3. **Use HTTPS for all webhook endpoints**
4. **Whitelist PayStack IP addresses**
5. **Store sensitive data encrypted**
6. **Log all payment transactions**
7. **Implement rate limiting on payment endpoints**
8. **Use environment variables for API keys**

## Database Schema

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_type VARCHAR(10) CHECK (plan_type IN ('free', 'pro')),
  paystack_subscription_code VARCHAR(255),
  paystack_customer_code VARCHAR(255),
  paystack_authorization_code VARCHAR(255),
  status VARCHAR(20) CHECK (status IN ('active', 'cancelled', 'expired', 'attention')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Usage Tracking Table
```sql
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  invoice_count INTEGER DEFAULT 0,
  client_count INTEGER DEFAULT 0,
  email_send_count INTEGER DEFAULT 0,
  reset_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

```env
# PayStack Configuration
PAYSTACK_SECRET_KEY=sk_test_28067d17f921a3c69f6aba1ed64ab17422c24843
PAYSTACK_PUBLIC_KEY=pk_test_4e4c6f7143a8fe12d4b2764743b63442b0505b1d
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Plan Configuration
PRO_PLAN_CODE=PLN_xxxxxxxxxx
PRO_PLAN_AMOUNT=1000
PRO_PLAN_CURRENCY=ZAR
```

## Monitoring and Logging

### Log All Events
```javascript
{
  timestamp: '2026-02-18T14:30:00Z',
  event: 'subscription.create',
  user_id: 'user_123',
  subscription_code: 'SUB_xxx',
  status: 'success',
  metadata: {}
}
```

### Metrics to Track
- Successful subscriptions
- Failed payments
- Cancellation rate
- Revenue (MRR)
- Webhook delivery success rate

## Support and Resources

- PayStack Documentation: https://paystack.com/docs/
- PayStack API Reference: https://paystack.com/docs/api/
- PayStack Support: support@paystack.com
- PayStack Slack Community: https://paystack.com/slack
