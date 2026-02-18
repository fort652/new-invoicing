# Quick Start: Testing Pro Subscription

## Prerequisites

1. Paystack test account (sign up at https://paystack.com)
2. Development server running (`npm run dev`)
3. Convex deployment running (`npx convex dev`)

## Step 1: Configure Paystack Keys

1. Log into your Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your **Test Public Key** and **Test Secret Key**
4. Update `.env.local`:

```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
PAYSTACK_SECRET_KEY=sk_test_your_key_here
```

5. Restart your dev server

## Step 2: Set Up Webhook (Optional for Testing)

For local testing, you can use ngrok or similar:

```bash
ngrok http 3000
```

Then in Paystack Dashboard:
1. Go to Settings > Webhooks
2. Add webhook URL: `https://your-ngrok-url.ngrok.io/api/webhooks/paystack`
3. Select events: `subscription.create`, `charge.success`, `subscription.disable`

**Note**: For basic testing, you can skip webhooks and manually update the database.

## Step 3: Test Free Tier Limits

1. Sign up/login to your app
2. Go to Clients page
3. Create 3 clients (you should see usage warnings)
4. Try to create a 4th client → should show error
5. Go to Invoices page
6. Create 5 invoices
7. Try to create a 6th → should show error

## Step 4: Test Subscription Flow

1. Click "Subscription" in navigation
2. You should see:
   - Current usage stats
   - Three plan options (Monthly, Quarterly, Annual)
3. Select a plan (try Monthly for testing)
4. Click "Subscribe Now"
5. Paystack popup should appear

## Step 5: Complete Test Payment

Use Paystack test card:
- **Card Number**: 4084084084084081
- **CVV**: 408
- **Expiry**: Any future date (e.g., 12/25)
- **PIN**: 0000

Click "Pay" in the Paystack popup.

## Step 6: Verify Pro Status

### If Webhook is Set Up:
- Wait a few seconds
- Refresh the page
- You should see "Pro Subscription" status
- Try creating more clients/invoices → should work without limits

### If No Webhook (Manual Testing):
1. Open Convex Dashboard
2. Go to your `users` table
3. Find your user
4. Manually update:
   - `subscriptionStatus`: "pro"
   - `subscriptionPlan`: "monthly"
5. Refresh your app
6. You should now have unlimited access

## Step 7: Test Pro Features

1. Create more than 3 clients → should work
2. Create more than 5 invoices → should work
3. Send more than 5 emails → should work
4. Visit `/subscription` → should show Pro status

## Common Issues

### Paystack Popup Not Appearing
- Check browser console for errors
- Verify `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set
- Make sure you're using the public key (starts with `pk_`)

### Payment Succeeds But Status Not Updated
- Check webhook is configured correctly
- Check webhook logs in Paystack Dashboard
- Verify webhook URL is accessible
- Manually update database as workaround

### Limits Not Working
- Check Convex functions are deployed
- Verify user is logged in
- Check browser console for errors
- Check Convex function logs

## Testing Different Plans

### Monthly Plan (R199.00)
```typescript
// Amount in Paystack is in cents
amount: 19900 // R199.00
interval: 'monthly'
```

### Quarterly Plan (R540.00)
```typescript
amount: 54000 // R540.00
interval: 'quarterly'
```

### Annual Plan (R1,990.00)
```typescript
amount: 199000 // R1,990.00
interval: 'annually'
```

## Webhook Event Testing

You can test webhook events using Paystack's webhook testing tool:

1. Go to Paystack Dashboard > Settings > Webhooks
2. Click "Test Webhook"
3. Select event type (e.g., `subscription.create`)
4. Click "Send Test"
5. Check your app to see if status updated

## Resetting Test Data

To reset your test user:

1. Go to Convex Dashboard
2. Find your user in `users` table
3. Update:
   - `subscriptionStatus`: "free"
   - `clientsCreated`: 0
   - `invoicesCreated`: 0
   - `emailsSent`: 0
4. Delete test clients/invoices if needed

## Going to Production

1. Get live Paystack keys from Dashboard
2. Update `.env.local` with live keys
3. Update webhook URL to production domain
4. Test with small real payment first
5. Monitor Paystack Dashboard for transactions

## Support Resources

- **Paystack Docs**: https://paystack.com/docs
- **Paystack Test Cards**: https://paystack.com/docs/payments/test-payments/
- **Webhook Events**: https://paystack.com/docs/payments/webhooks/

## Quick Commands

```bash
# Start development
npm run dev

# Start Convex
npx convex dev

# Check package installation
npm list @paystack/inline-js

# View Convex logs
# Go to: https://dashboard.convex.dev
```

## Test Checklist

- [ ] Paystack keys configured
- [ ] Can create 3 clients (free tier)
- [ ] Cannot create 4th client (limit error)
- [ ] Can create 5 invoices (free tier)
- [ ] Cannot create 6th invoice (limit error)
- [ ] Usage banner shows on clients/invoices pages
- [ ] Subscription page loads
- [ ] Can select different plans
- [ ] Paystack popup opens
- [ ] Test payment succeeds
- [ ] Pro status activated (webhook or manual)
- [ ] Can create unlimited clients
- [ ] Can create unlimited invoices
- [ ] Can send unlimited emails
- [ ] Pro status shows on subscription page

## Next Steps After Testing

1. Customize plan pricing for your market
2. Add subscription cancellation UI
3. Add billing history page
4. Set up email notifications
5. Configure production webhook
6. Test with live keys
7. Launch! 🚀
