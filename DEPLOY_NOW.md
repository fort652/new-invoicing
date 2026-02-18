# 🚨 DEPLOY NOW - Quick Instructions

## The Issue

Your live site is showing errors because the updated Convex functions haven't been deployed to production yet.

## Quick Fix - Deploy in 3 Steps

### Step 1: Open Terminal

Open your terminal application (not through Cursor/VS Code, use the actual Terminal app on Mac).

### Step 2: Navigate to Project

```bash
cd /Users/juriewagener/workspace/new-invoicing
```

### Step 3: Deploy

```bash
npx convex deploy
```

When you see:
```
Do you want to push your code to your prod deployment decisive-porcupine-223 now?
```

**Type `y` and press Enter**

### Step 4: Wait for Completion

You'll see output like:
```
✓ Deploying...
✓ Functions deployed successfully
```

### Step 5: Run Migration

1. Open browser: https://dashboard.convex.dev
2. Select project: `new-invoice`
3. Select deployment: `decisive-porcupine-223` (production)
4. Click "Functions" in sidebar
5. Find `users:migrateExistingUsers`
6. Click "Run Function"
7. Click "Run" to confirm

You should see:
```json
{
  "total": X,
  "updated": Y
}
```

### Step 6: Test Your Site

1. Go to: https://www.invoice-snap-demo.co.za
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Log out and log back in
4. Check dashboard loads without errors

## Alternative: Deploy from Convex Dashboard

If the command line doesn't work:

1. Go to https://dashboard.convex.dev
2. Select your project: `new-invoice`
3. Select production: `decisive-porcupine-223`
4. Click "Settings" or "Deploy"
5. Look for "Deploy from local" or "Sync" button
6. Follow the prompts

## Verify Deployment

After deploying, check:

✅ No console errors about `checkUsageLimits`
✅ Dashboard loads correctly
✅ Subscription card appears
✅ No "Server Error" messages

## If Still Getting Errors

### Option A: Clear Cache
1. Hard refresh browser (Cmd+Shift+R)
2. Clear browser cache
3. Try again

### Option B: Check Deployment
1. Go to Convex Dashboard
2. Check "Functions" tab
3. Verify `checkUsageLimits` function exists
4. Verify `migrateExistingUsers` function exists

### Option C: Manual User Fix
If only affecting your account:

1. Go to Convex Dashboard
2. Click "Data" → "users" table
3. Find your user record
4. Click "Edit"
5. Add these fields:
   ```json
   {
     "subscriptionStatus": "free",
     "clientsCreated": 0,
     "invoicesCreated": 0,
     "emailsSent": 0
   }
   ```
6. Click "Save"
7. Refresh your site

## Why This Is Happening

Your code has the fixes, but Convex functions run on Convex's servers, not your Next.js server. You need to push the updated functions to Convex's production deployment.

Think of it like this:
- ✅ Your Next.js code is deployed (Vercel/hosting)
- ❌ Your Convex functions are NOT deployed yet
- 🎯 Need to deploy Convex functions separately

## Summary

**The fix is simple:**
1. Run `npx convex deploy` in terminal
2. Type `y` when prompted
3. Run migration in Convex Dashboard
4. Done!

Your site will work perfectly after this. The code is ready, it just needs to be deployed! 🚀
