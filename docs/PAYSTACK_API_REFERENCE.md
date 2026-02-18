# PayStack API Quick Reference

This document provides a quick reference for the PayStack API endpoints explored and implemented.

## Base URL
```
https://api.paystack.co
```

## Authentication
All requests require the Authorization header:
```
Authorization: Bearer YOUR_SECRET_KEY
```

## Core Endpoints Used

### 1. Plans

#### Create Plan
```http
POST /plan
Content-Type: application/json

{
  "name": "Pro Plan - Monthly",
  "amount": 1000,
  "interval": "monthly",
  "currency": "ZAR"
}
```

#### List Plans
```http
GET /plan
```

### 2. Transactions

#### Initialize Transaction
```http
POST /transaction/initialize
Content-Type: application/json

{
  "email": "customer@example.com",
  "amount": 1000,
  "currency": "ZAR",
  "plan": "PLN_xxxxxxxxxx",
  "callback_url": "https://yourapp.com/verify",
  "metadata": {
    "userId": "user_123",
    "planType": "pro"
  }
}
```

Response:
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

#### Verify Transaction
```http
GET /transaction/verify/:reference
```

Response:
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
      "email": "customer@example.com",
      "customer_code": "CUS_xxxxxxxxxx"
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

### 3. Subscriptions

#### Create Subscription
```http
POST /subscription
Content-Type: application/json

{
  "customer": "customer@example.com",
  "plan": "PLN_xxxxxxxxxx",
  "authorization": "AUTH_xxxxxxxxxx",
  "start_date": "2026-03-01T00:00:00Z"
}
```

#### Fetch Subscription
```http
GET /subscription/:id_or_code
```

#### Disable Subscription
```http
POST /subscription/disable
Content-Type: application/json

{
  "code": "SUB_xxxxxxxxxx",
  "token": "xxxxxxxxxx"
}
```

#### Enable Subscription
```http
POST /subscription/enable
Content-Type: application/json

{
  "code": "SUB_xxxxxxxxxx",
  "token": "xxxxxxxxxx"
}
```

## Webhook Events

### Event Structure
```json
{
  "event": "subscription.create",
  "data": {
    "customer": {
      "email": "customer@example.com",
      "customer_code": "CUS_xxxxxxxxxx"
    },
    "plan": {
      "name": "Pro Plan",
      "plan_code": "PLN_xxxxxxxxxx",
      "amount": 1000
    },
    "subscription_code": "SUB_xxxxxxxxxx",
    "status": "active",
    "next_payment_date": "2026-03-18T00:00:00Z"
  }
}
```

### Subscription Events

#### subscription.create
Fired when a subscription is created.

#### subscription.disable
Fired when a subscription is cancelled or expires.

#### subscription.not_renew
Fired when a subscription won't renew on next payment date.

#### invoice.create
Fired 3 days before next payment attempt.

#### invoice.payment_failed
Fired when subscription payment fails.

#### charge.success
Fired when a payment succeeds.

### Webhook Signature Validation

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

### Webhook IP Whitelist
```
52.31.139.75
52.49.173.169
52.214.14.220
```

## Currency Handling

### ZAR (South African Rand)
- Subunit: Cent
- Multiply by 100 for API calls
- Example: R10.00 = 1000 cents

```javascript
// Convert ZAR to cents
const amountInCents = amountInZAR * 100;

// Convert cents to ZAR
const amountInZAR = amountInCents / 100;
```

## Test Data

### Test Credentials
```
Secret Key: sk_test_28067d17f921a3c69f6aba1ed64ab17422c24843
Public Key: pk_test_4e4c6f7143a8fe12d4b2764743b63442b0505b1d
```

### Test Cards

**Successful Payment:**
```
Card Number: 4084084084084081
CVV: 408
Expiry: 12/28
PIN: 0000
OTP: 123456
```

**Failed Payment:**
```
Card Number: 5060666666666666666
CVV: 123
Expiry: 12/28
```

## Error Handling

### Common Errors

```json
{
  "status": false,
  "message": "Invalid key"
}
```

```json
{
  "status": false,
  "message": "Insufficient funds"
}
```

```json
{
  "status": false,
  "message": "Transaction declined"
}
```

## Rate Limits

PayStack has rate limits on API calls:
- Test mode: More lenient
- Live mode: Stricter limits
- Webhooks: Retried automatically

## Best Practices

1. **Always verify transactions** - Don't rely solely on callbacks
2. **Validate webhook signatures** - Prevent fraudulent requests
3. **Handle idempotency** - Webhooks may be sent multiple times
4. **Log everything** - Keep audit trail of all payment events
5. **Use HTTPS** - All communication must be encrypted
6. **Store authorization codes** - For future recurring charges
7. **Monitor webhook delivery** - Set up alerts for failures

## Subscription Statuses

- `active` - Subscription is active and billing
- `non-renewing` - Subscription won't renew on next date
- `cancelled` - Subscription has been cancelled
- `attention` - Payment failed, needs attention
- `complete` - All billing cycles completed

## Documentation Links

- Main Documentation: https://paystack.com/docs/
- API Reference: https://paystack.com/docs/api/
- Webhooks Guide: https://paystack.com/docs/payments/webhooks/
- Subscriptions: https://paystack.com/docs/payments/subscriptions/
- Test Cards: https://paystack.com/docs/payments/test-payments/

## Support

- Email: support@paystack.com
- Slack Community: https://paystack.com/slack
- Dashboard: https://dashboard.paystack.com/

## Implementation Notes

### Key Decisions Made

1. **Plan Creation**: Automatic on first upgrade attempt
2. **Subscription Model**: Monthly recurring only
3. **Currency**: ZAR (South African Rand) only
4. **Payment Flow**: Redirect to PayStack checkout
5. **Webhook Handling**: Async processing with signature validation

### Integration Points

1. **Frontend**: React components for subscription UI
2. **Backend**: Next.js API routes for payment processing
3. **Database**: Convex for subscription and usage data
4. **Webhooks**: Real-time subscription status updates

### Security Measures

1. Webhook signature validation
2. IP whitelisting
3. HTTPS only communication
4. Environment variable protection
5. Authentication required for all endpoints
