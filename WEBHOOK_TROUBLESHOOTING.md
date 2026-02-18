# Webhook Troubleshooting Guide

## Issue: Subscription not upgrading automatically

### Root Cause Found
Your `.env.local` was pointing to the **dev** Convex deployment, but the subscription functions were deployed to **production**. This has now been fixed.

## What Was Changed

### 1. Environment Configuration
Updated `.env.local` to point to production:
```env
NEXT_PUBLIC_CONVEX_URL=https://decisive-porcupine-223.convex.cloud
CONVEX_DEPLOYMENT=prod:decisive-porcupine-223
```

### 2. Added Logging to Webhook
The webhook now logs detailed information to help debug:
- Event type received
- Customer email
- Whether subscription/authorization exists
- User lookup results
- Subscription creation results

### 3. Added Test Endpoint
Created `/api/webhooks/paystack/test` to verify webhook connectivity

## Steps to Fix

### 1. Restart Your Development Server
```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 2. Test Locally First
Visit: `http://localhost:3000/api/webhooks/paystack/test`

You should see:
```json
{
  "status": "ok",
  "message": "Webhook endpoint is accessible",
  "env": {
    "hasPaystackSecret": true,
    "hasConvexUrl": true,
    "convexUrl": "https://decisive-porcupine-223.convex.cloud"
  }
}
```

### 3. Deploy to Production
```bash
# Build and deploy your Next.js app
npm run build

# Deploy to your hosting (Vercel/Netlify/etc)
vercel deploy --prod
# or
git push origin main  # if auto-deployed
```

### 4. Update Paystack Webhook URL
In your Paystack dashboard:
1. Go to Settings → Webhooks
2. Update webhook URL to: `https://your-domain.com/api/webhooks/paystack`
3. Make sure it's using HTTPS (not HTTP)

### 5. Test the Payment Flow
1. Go to `/subscription` page
2. Click "Subscribe to Pro"
3. Complete payment with test card
4. Check server logs for webhook activity

## How to Check Logs

### Local Development
Check your terminal where `npm run dev` is running. You should see:
```
Webhook received: { event: 'charge.success' }
Processing event: charge.success
Customer: your@email.com
Has subscription: false
Has authorization: true
Fetching users from Convex...
Found users: 2
Found user: jh71xy... your@email.com
Creating subscription...
Subscription created successfully: { value: "js79me8..." }
```

### Production (Vercel)
```bash
vercel logs --follow
```

### Production (Other Hosts)
Check your hosting platform's logs dashboard

## Common Issues

### Issue 1: "Invalid signature"
**Cause**: Wrong `PAYSTACK_SECRET_KEY` or webhook not from Paystack
**Fix**: Verify your secret key matches Paystack dashboard

### Issue 2: "User not found with email"
**Cause**: Email in Paystack doesn't match email in your app
**Fix**: Make sure you're logged in with the same email you use for payment

### Issue 3: "Failed to create subscription"
**Cause**: Convex function error
**Fix**: Check Convex dashboard logs at https://dashboard.convex.dev

### Issue 4: Webhook not being called at all
**Cause**: 
- App not deployed to production
- Webhook URL incorrect in Paystack
- Webhook URL not accessible (localhost won't work)

**Fix**:
1. Deploy app to production
2. Update Paystack webhook URL to production URL
3. Test webhook URL is accessible: `https://your-domain.com/api/webhooks/paystack/test`

## Testing with Paystack Test Mode

### Test Card Details
```
Card Number: 4084 0840 8408 4081
CVV: 408
Expiry: Any future date
PIN: 0000
OTP: 123456
```

### Expected Flow
1. User clicks "Subscribe to Pro"
2. Paystack modal opens
3. User enters test card details
4. Payment succeeds
5. Paystack sends webhook to your server
6. Webhook creates subscription in Convex
7. User's `planType` changes to "pro"
8. Page refreshes showing Pro status

## Verification Checklist

- [ ] `.env.local` points to production Convex URL
- [ ] App is deployed to production (not just localhost)
- [ ] Paystack webhook URL is set to production URL
- [ ] Paystack webhook URL uses HTTPS
- [ ] `PAYSTACK_SECRET_KEY` is correct in production environment
- [ ] Test endpoint is accessible: `/api/webhooks/paystack/test`
- [ ] Subscription functions are deployed to production Convex
- [ ] User email in app matches email used for payment

## Quick Test Command

Test if subscription function works directly:
```bash
CONVEX_DEPLOYMENT=prod:decisive-porcupine-223 npx convex run subscriptions:createOrUpdateSubscription '{
  "userId": "YOUR_USER_ID",
  "planType": "pro",
  "status": "active",
  "currentPeriodStart": 1739912400000,
  "currentPeriodEnd": 1742504400000
}'
```

Replace `YOUR_USER_ID` with your actual user ID from Convex.

## Next Steps

1. **Restart dev server** with new environment variables
2. **Test locally** to ensure webhook endpoint is accessible
3. **Deploy to production** 
4. **Update Paystack webhook URL** to production URL
5. **Test payment flow** end-to-end
6. **Check logs** to verify webhook is being called

## Support

If still not working after following these steps:
1. Check server logs for errors
2. Check Paystack dashboard → Webhooks → Logs
3. Verify all environment variables are set correctly
4. Test the subscription function directly using the command above

The webhook should now work automatically! 🎉
