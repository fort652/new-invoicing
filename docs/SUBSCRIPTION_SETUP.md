# Subscription System Setup Guide

This guide will help you set up the subscription system with PayStack integration.

## Prerequisites

1. PayStack account (test or live)
2. Convex backend deployed
3. Clerk authentication configured
4. Resend email service configured

## Step 1: Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

### Required Environment Variables

```env
# PayStack Credentials (from your PayStack dashboard)
PAYSTACK_SECRET_KEY=sk_test_28067d17f921a3c69f6aba1ed64ab17422c24843
PAYSTACK_PUBLIC_KEY=pk_test_4e4c6f7143a8fe12d4b2764743b63442b0505b1d

# Application URL (for PayStack callbacks)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your production URL in production
```

**IMPORTANT:** 
- Use test credentials (`sk_test_...` and `pk_test_...`) for development
- Use live credentials (`sk_live_...` and `pk_live_...`) for production
- Never commit your `.env.local` file to version control

## Step 2: Deploy Convex Schema

The subscription system requires new tables in your Convex database. Deploy the schema:

```bash
npx convex dev
```

This will create the following tables:
- `subscriptions` - Stores user subscription data
- `usageTracking` - Tracks usage limits for free plan users

## Step 3: Configure PayStack Webhook

### Development (using ngrok or similar)

1. Install ngrok:
```bash
npm install -g ngrok
```

2. Start your Next.js app:
```bash
npm run dev
```

3. In a new terminal, expose your local server:
```bash
ngrok http 3000
```

4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

5. Go to PayStack Dashboard → Settings → Webhooks

6. Add webhook URL:
```
https://abc123.ngrok.io/api/webhooks/paystack
```

### Production

1. Deploy your application to production

2. Go to PayStack Dashboard → Settings → Webhooks

3. Add webhook URL:
```
https://yourdomain.com/api/webhooks/paystack
```

### Webhook Events to Enable

Enable these webhook events in your PayStack dashboard:
- `subscription.create`
- `subscription.disable`
- `subscription.not_renew`
- `charge.success`
- `invoice.create`
- `invoice.payment_failed`

## Step 4: Create PayStack Plans

You have two options to create plans:

### Option A: Automatic (Recommended)

Plans are automatically created when a user first attempts to upgrade. The system will:
1. Check if a "Pro Plan - Monthly" plan exists
2. If not, create it with the configured amount (R10.00)
3. Use the plan for the subscription

### Option B: Manual

1. Go to PayStack Dashboard → Plans
2. Click "Create Plan"
3. Fill in the details:
   - Name: `Pro Plan - Monthly`
   - Amount: `1000` (R10.00 in cents)
   - Interval: `Monthly`
   - Currency: `ZAR`
4. Save the plan
5. Note the plan code (starts with `PLN_`)

## Step 5: Test the Integration

### Test Card Details

Use these test cards for testing:

**Successful Payment:**
```
Card Number: 4084084084084081
CVV: 408
Expiry: Any future date (e.g., 12/28)
PIN: 0000
OTP: 123456
```

**Failed Payment:**
```
Card Number: 5060666666666666666
CVV: 123
Expiry: Any future date
```

### Testing Flow

1. **Test Free Plan Limits:**
   - Create 5 invoices (should succeed)
   - Try to create 6th invoice (should fail with limit error)
   - Create 3 clients (should succeed)
   - Try to create 4th client (should fail with limit error)
   - Send 5 emails (should succeed)
   - Try to send 6th email (should fail with limit error)

2. **Test Upgrade to Pro:**
   - Go to Settings → Subscription
   - Click "Upgrade to Pro"
   - Complete payment with test card
   - Verify subscription is active
   - Verify limits are now unlimited

3. **Test Subscription Cancellation:**
   - Go to Settings → Subscription
   - Click "Cancel Subscription"
   - Confirm cancellation
   - Verify subscription is marked for cancellation

4. **Test Webhook Events:**
   - Check your server logs for webhook events
   - Verify subscription status updates in database
   - Test failed payment scenarios

## Step 6: Monitor and Debug

### Check Logs

1. **Server Logs:**
```bash
# Watch your server logs for webhook events
npm run dev
```

2. **Convex Logs:**
```bash
# Open Convex dashboard
npx convex dashboard
```

3. **PayStack Logs:**
   - Go to PayStack Dashboard → Developers → Logs
   - Check webhook delivery status
   - View request/response details

### Common Issues

#### Webhook not receiving events

**Solution:**
1. Verify webhook URL is correct
2. Check webhook is enabled in PayStack dashboard
3. Verify your server is accessible (use ngrok for local testing)
4. Check webhook signature validation is working

#### Payment fails immediately

**Solution:**
1. Verify you're using test credentials in test mode
2. Check test card details are correct
3. Verify PayStack account is active

#### Subscription not updating in database

**Solution:**
1. Check webhook events are being received
2. Verify Convex functions are working
3. Check for errors in server logs
4. Verify user exists in database

## Step 7: Go Live

### Pre-Launch Checklist

- [ ] Replace test credentials with live credentials
- [ ] Update webhook URL to production URL
- [ ] Test complete flow in production
- [ ] Set up monitoring and alerts
- [ ] Configure proper error handling
- [ ] Set up email notifications for failed payments
- [ ] Document support procedures

### Live Credentials

1. Go to PayStack Dashboard → Settings → API Keys & Webhooks
2. Switch to "Live" mode
3. Copy your live secret key
4. Update `.env.local`:
```env
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
```

### Production Webhook

Update webhook URL in PayStack dashboard:
```
https://yourdomain.com/api/webhooks/paystack
```

## Features

### Free Plan
- 5 invoices per month
- 3 clients total
- 5 email sends per month
- All basic features

### Pro Plan (R10/month)
- Unlimited invoices
- Unlimited clients
- Unlimited email sends
- All premium features
- Priority support

## Support

### PayStack Support
- Documentation: https://paystack.com/docs/
- Support: support@paystack.com
- Slack Community: https://paystack.com/slack

### Application Support
- Check logs in Convex dashboard
- Review PayStack webhook logs
- Contact development team

## Security Best Practices

1. **Never expose secret keys in frontend code**
2. **Always validate webhook signatures**
3. **Use HTTPS for all webhook endpoints**
4. **Whitelist PayStack IP addresses**
5. **Store sensitive data encrypted**
6. **Log all payment transactions**
7. **Implement rate limiting on payment endpoints**
8. **Use environment variables for API keys**

## Monitoring

### Metrics to Track
- Successful subscriptions
- Failed payments
- Cancellation rate
- Monthly Recurring Revenue (MRR)
- Webhook delivery success rate
- Usage patterns (free vs pro users)

### Alerts to Set Up
- Failed webhook deliveries
- Failed payment attempts
- High cancellation rate
- Unusual usage patterns
- API errors

## Troubleshooting

### User can't upgrade

1. Check if user email is valid
2. Verify PayStack credentials are correct
3. Check if plan exists in PayStack
4. Review server logs for errors

### Webhook events not processing

1. Verify webhook signature validation
2. Check IP whitelisting
3. Review webhook logs in PayStack dashboard
4. Check server is returning 200 OK

### Usage limits not enforcing

1. Verify user plan type is set correctly
2. Check usage tracking is initialized
3. Review Convex function logs
4. Test with fresh user account

## Additional Resources

- [PayStack Integration Documentation](./PAYSTACK_INTEGRATION.md)
- [API Reference](https://paystack.com/docs/api/)
- [Webhook Events](https://paystack.com/docs/payments/webhooks/)
- [Test Cards](https://paystack.com/docs/payments/test-payments/)
