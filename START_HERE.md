# 🚀 START HERE - Automatic Subscription Fix

## What Was Wrong
Your app was pointing to the **dev** Convex deployment, but the subscription functions were deployed to **production**. This caused the webhook to fail silently.

## What's Fixed
✅ Environment variables now point to production Convex
✅ Added detailed logging to webhook
✅ Added test endpoint for debugging
✅ All subscription functions deployed to production

## Quick Start (3 Steps)

### Step 1: Start Development Server
```bash
npm run dev
```

Your app will now connect to **production** Convex where the subscription functions are deployed.

### Step 2: Test Locally
Open your browser to:
- Main app: http://localhost:3000
- Test webhook: http://localhost:3000/api/webhooks/paystack/test

The test endpoint should show:
```json
{
  "status": "ok",
  "hasPaystackSecret": true,
  "hasConvexUrl": true,
  "convexUrl": "https://decisive-porcupine-223.convex.cloud"
}
```

### Step 3: Test Payment Flow
1. Go to http://localhost:3000/subscription
2. Click "Subscribe to Pro"
3. Use Paystack test card:
   - Card: `4084 0840 8408 4081`
   - CVV: `408`
   - Expiry: Any future date
   - PIN: `0000`
   - OTP: `123456`

4. Watch your terminal for webhook logs:
```
Webhook received: { event: 'charge.success' }
Processing event: charge.success
Customer: your@email.com
Creating subscription...
Subscription created successfully!
```

5. Refresh the page - you should see "Pro" status!

## Important Notes

### For Local Testing
The webhook will ONLY work if:
1. Your app is accessible from the internet (use ngrok or deploy to production)
2. Paystack webhook URL points to your public URL

### For Production
1. Deploy your app:
   ```bash
   npm run build
   vercel deploy --prod  # or your hosting platform
   ```

2. Update Paystack webhook URL:
   - Go to Paystack Dashboard → Settings → Webhooks
   - Set URL to: `https://your-domain.com/api/webhooks/paystack`

3. Test with real payment

## Environment Variables

Your `.env.local` now has:
```env
# Production Convex (ACTIVE)
NEXT_PUBLIC_CONVEX_URL=https://decisive-porcupine-223.convex.cloud
CONVEX_DEPLOYMENT=prod:decisive-porcupine-223

# Dev Convex (commented out)
# NEXT_PUBLIC_CONVEX_URL=https://energetic-bobcat-927.convex.cloud
# CONVEX_DEPLOYMENT=dev:energetic-bobcat-927
```

## Troubleshooting

### "Still showing free tier"
1. Check terminal logs - is webhook being called?
2. Check Paystack dashboard → Webhooks → Logs
3. Verify your email in app matches payment email
4. Try the test command:
   ```bash
   CONVEX_DEPLOYMENT=prod:decisive-porcupine-223 npx convex run subscriptions:createOrUpdateSubscription '{
     "userId": "YOUR_USER_ID",
     "planType": "pro",
     "status": "active",
     "currentPeriodStart": 1739912400000,
     "currentPeriodEnd": 1742504400000
   }'
   ```

### "Webhook not being called"
- For local testing: Use ngrok to expose localhost
- For production: Ensure app is deployed and webhook URL is correct

### "Invalid signature"
- Check `PAYSTACK_SECRET_KEY` is correct
- Ensure it matches your Paystack dashboard

## Files Changed

1. `.env.local` - Updated to production Convex
2. `app/api/webhooks/paystack/route.ts` - Added detailed logging
3. `app/api/webhooks/paystack/test/route.ts` - New test endpoint
4. `convex/subscriptions.ts` - Restored subscription functions
5. `convex/schema.ts` - Updated to match production

## What Happens Now

When you make a payment:
1. ✅ Paystack sends webhook to your server
2. ✅ Webhook finds your user by email
3. ✅ Webhook calls `subscriptions:createOrUpdateSubscription`
4. ✅ Function creates subscription record with `planType: "pro"`
5. ✅ Function updates user record with `planType: "pro"`
6. ✅ Your dashboard shows "Pro" status
7. ✅ All limits removed (unlimited clients, invoices, emails)

**No manual database edits needed!** 🎉

## Need Help?

1. Read `WEBHOOK_TROUBLESHOOTING.md` for detailed debugging
2. Read `AUTOMATIC_SUBSCRIPTION_SETUP.md` for system overview
3. Check terminal logs for errors
4. Check Paystack webhook logs

---

**Ready to test? Run `npm run dev` and go to http://localhost:3000/subscription**
