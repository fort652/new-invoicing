# Manual Subscription Upgrade Guide

## Why This Is Needed

The webhook isn't working yet because:
1. The Convex functions haven't been deployed to production
2. The webhook URL might not be configured in Paystack
3. The subscription fields don't exist in your user record yet

## Quick Fix: Manually Upgrade Your Account

### Step 1: Go to Convex Dashboard

1. Open: https://dashboard.convex.dev
2. Select your project: `new-invoice`
3. Select production deployment: `decisive-porcupine-223`

### Step 2: Find Your User

1. Click "Data" in the left sidebar
2. Click on the "users" table
3. Find your user record (look for your email)
4. Click on your user row to open it

### Step 3: Edit Your User

1. Click the "Edit" button (pencil icon)
2. You'll see your current user data

### Step 4: Add/Update Subscription Fields

Add or update these fields:

```json
{
  "subscriptionStatus": "pro",
  "subscriptionPlan": "monthly",
  "clientsCreated": 0,
  "invoicesCreated": 0,
  "emailsSent": 0,
  "subscriptionStartDate": 1708300800000,
  "paystackSubscriptionCode": "SUB_xxxxx",
  "paystackCustomerCode": "CUS_xxxxx"
}
```

**Important Notes:**
- `subscriptionStatus`: Change from `"free"` to `"pro"`
- `subscriptionPlan`: Use `"monthly"`, `"quarterly"`, or `"annually"` based on what you subscribed to
- `subscriptionStartDate`: Use current timestamp (or use: `Date.now()` in browser console)
- `paystackSubscriptionCode`: Optional - get from Paystack dashboard if you want
- `paystackCustomerCode`: Optional - get from Paystack dashboard if you want

### Step 5: Save Changes

1. Click "Save" or "Update"
2. Confirm the changes

### Step 6: Verify on Your Site

1. Go to: https://www.invoice-snap-demo.co.za
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. You should now see "PRO" status on the dashboard
4. Try creating more than 3 clients - it should work!

## Alternative: Use Migration Function

If the migration function has been deployed:

1. Go to Convex Dashboard
2. Click "Functions"
3. Find `users:migrateExistingUsers`
4. Click "Run Function"
5. This will initialize all users with free tier
6. Then manually update your user to "pro" as described above

## Get Your Paystack Subscription Details

If you want to add the Paystack codes:

1. Go to Paystack Dashboard: https://dashboard.paystack.com
2. Click "Customers" in the sidebar
3. Find your email
4. Click on your customer record
5. You'll see:
   - Customer Code (e.g., `CUS_xxxxx`)
   - Subscription Code (e.g., `SUB_xxxxx`)
6. Copy these and add them to your Convex user record

## Verify Pro Status

After updating, you should see:

✅ Dashboard shows "PRO" badge
✅ Subscription card shows "Active" status
✅ Can create unlimited clients
✅ Can create unlimited invoices
✅ Can send unlimited emails
✅ No usage limits displayed

## For Future Subscriptions (After Deployment)

Once you deploy the Convex functions and configure webhooks properly:

1. Webhooks will automatically update users to Pro
2. No manual intervention needed
3. Cancellations will be handled automatically
4. Failed payments will be logged

## Webhook Configuration (For Later)

After deploying Convex functions:

1. Go to Paystack Dashboard
2. Settings → Webhooks
3. Add webhook URL: `https://www.invoice-snap-demo.co.za/api/webhooks/paystack`
4. Select events:
   - `subscription.create`
   - `charge.success`
   - `subscription.disable`
   - `invoice.payment_failed`
5. Save

## Deploy Convex Functions

To make webhooks work automatically:

```bash
npx convex deploy
```

Type `y` when prompted, then the webhook handler will be live and future subscriptions will work automatically.

## Summary

**Right Now:**
- Manually update your user in Convex Dashboard
- Change `subscriptionStatus` to `"pro"`
- Refresh your site

**For Future:**
- Deploy Convex functions
- Configure Paystack webhook
- Subscriptions will work automatically

Your subscription payment was successful, you just need to manually activate Pro status in the database for now! 🎉
