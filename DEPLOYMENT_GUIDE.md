# Deployment Guide - Fix Runtime Error

## Current Situation

Your production site (`www.invoice-snap-demo.co.za`) is showing errors because:

1. ✅ Your code has the fixes
2. ✅ Your build is successful
3. ❌ **The Convex functions haven't been deployed to production yet**

## The Problem

You have two Convex deployments:
- **Dev:** `energetic-bobcat-927` (currently in `.env.local`)
- **Prod:** `decisive-porcupine-223` (what your live site uses)

The updated functions with subscription support are only in your dev deployment, not in production.

## Solution: Deploy to Production

### Option 1: Deploy via Command Line (Recommended)

Run this command and confirm when prompted:

```bash
npx convex deploy
```

When asked: `Do you want to push your code to your prod deployment decisive-porcupine-223 now?`
- Type `y` and press Enter

This will:
1. Push all your updated Convex functions to production
2. Include the new subscription fields and migrations
3. Fix the runtime error on your live site

### Option 2: Deploy via Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Select your project: `new-invoice`
3. Select the production deployment: `decisive-porcupine-223`
4. Click "Deploy" or "Push to Production"
5. Confirm the deployment

### Option 3: Use Convex Dev (For Testing)

If you want to test first in dev:

```bash
# Start Convex dev server
npx convex dev

# In another terminal, start Next.js
npm run dev

# Test at http://localhost:3000
```

Once tested, deploy to production using Option 1.

## After Deployment

### 1. Run the Migration

Once deployed, you need to migrate existing users:

**Via Convex Dashboard:**
1. Go to https://dashboard.convex.dev
2. Select production deployment: `decisive-porcupine-223`
3. Go to "Functions"
4. Find `users:migrateExistingUsers`
5. Click "Run"
6. Confirm - it will update all existing users

**Or wait for auto-migration:**
- Users will be automatically migrated when they next log in
- The `syncUser` function now handles this

### 2. Verify the Fix

1. Visit your site: https://www.invoice-snap-demo.co.za
2. Log out and log back in
3. Check the dashboard loads without errors
4. Verify the subscription card appears

### 3. Check Console

Open browser DevTools (F12) and check:
- ✅ No `checkUsageLimits` errors
- ✅ No Convex server errors
- ✅ Dashboard loads correctly

## Environment Variables for Production

Make sure your production environment has:

```env
# Production Convex URL
NEXT_PUBLIC_CONVEX_URL=https://decisive-porcupine-223.convex.cloud

# Clerk (already set to live keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Resend
RESEND_API_KEY=re_...

# Paystack (use test keys for now, switch to live when ready)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
```

## Deployment Checklist

- [ ] Run `npx convex deploy` and confirm
- [ ] Wait for deployment to complete
- [ ] Run `migrateExistingUsers` in Convex Dashboard
- [ ] Visit live site and test
- [ ] Log out and log back in
- [ ] Check dashboard loads without errors
- [ ] Verify subscription features work
- [ ] Check browser console for errors

## Common Issues

### "Cannot prompt for input in non-interactive terminals"

**Solution:** Run the command directly in your terminal (not through a script):
```bash
npx convex deploy
```
Then type `y` when prompted.

### Functions deployed but still getting errors

**Solution:** Run the migration function:
1. Go to Convex Dashboard
2. Functions → `users:migrateExistingUsers`
3. Click "Run"

### Changes not reflecting on live site

**Solution:** 
1. Clear browser cache
2. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
3. Check you deployed to the correct deployment

## Quick Commands

```bash
# Deploy to production
npx convex deploy

# Start dev environment
npx convex dev

# Build for production
npm run build

# Check which deployment you're using
cat .env.local | grep CONVEX_DEPLOYMENT
```

## Support

If you're still having issues:

1. Check Convex Dashboard logs
2. Check browser console for specific errors
3. Verify deployment was successful
4. Try running migration function again
5. Log out and back in to trigger auto-migration

## Summary

**Quick Fix:**
1. Run `npx convex deploy` → type `y`
2. Go to Convex Dashboard → Run `migrateExistingUsers`
3. Refresh your site
4. Done! ✅

Your subscription system will then be fully deployed and working in production!
