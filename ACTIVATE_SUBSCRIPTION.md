# Activate Your Pro Subscription

## Good News!

Your production deployment already has a subscription system! You just need to activate your Pro status using the existing functions.

## Quick Activation

Run this command to activate your subscription:

```bash
cd /Users/juriewagener/workspace/new-invoicing
```

Then find your user ID first. You can do this by going to:
1. https://dashboard.convex.dev
2. Select production: `decisive-porcupine-223`
3. Click "Data" → "users"
4. Find your user by email
5. Copy your user ID (looks like: `j97abc123def456`)

Then run:

```bash
CONVEX_DEPLOYMENT=prod:decisive-porcupine-223 npx convex run subscriptions:createOrUpdateSubscription '{
  "userId": "YOUR_USER_ID_HERE",
  "status": "active",
  "plan": "monthly",
  "paystackSubscriptionCode": "SUB_from_paystack",
  "paystackCustomerCode": "CUS_from_paystack"
}'
```

Replace:
- `YOUR_USER_ID_HERE` with your actual user ID from Convex
- `SUB_from_paystack` with your subscription code from Paystack (optional)
- `CUS_from_paystack` with your customer code from Paystack (optional)

## Or Use the Dashboard (Easier)

### Option 1: Use Convex Dashboard Functions

1. Go to https://dashboard.convex.dev
2. Select production: `decisive-porcupine-223`
3. Click "Functions"
4. Find `subscriptions:createOrUpdateSubscription`
5. Click on it
6. Enter your parameters:
   ```json
   {
     "userId": "your_user_id",
     "status": "active",
     "plan": "monthly"
   }
   ```
7. Click "Run"

### Option 2: Manually Edit in Database

1. Go to https://dashboard.convex.dev
2. Select production: `decisive-porcupine-223`
3. Click "Data" → "subscriptions" table (if it exists)
4. Or "Data" → "users" table
5. Find your record
6. Edit to add Pro status
7. Save

## What to Look For

The existing system might store subscription data differently. Check:
- Is there a separate "subscriptions" table?
- Or is subscription data in the "users" table?
- What fields does it use?

## After Activation

1. Refresh your site: https://www.invoice-snap-demo.co.za
2. Hard refresh: Cmd+Shift+R
3. You should see PRO status
4. Try creating unlimited clients/invoices

## Summary

Your production already has a subscription system - you just need to activate your Pro status using the existing functions or by editing the database directly.

The easiest way is through the Convex Dashboard! 🎯
