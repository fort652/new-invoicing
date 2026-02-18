# Database Migration Guide

## Issue

If you have existing users in your database from before the subscription feature was added, they won't have the new subscription fields, which will cause errors when trying to check usage limits.

## Error Symptoms

You might see errors like:
```
[CONVEX Q(users:checkUsageLimits)] Server Error
```

This happens because existing users don't have:
- `subscriptionStatus`
- `clientsCreated`
- `invoicesCreated`
- `emailsSent`

## Solution

### Option 1: Automatic Migration (Recommended)

Run the migration function to update all existing users at once.

#### Step 1: Open Convex Dashboard

Go to your Convex dashboard: https://dashboard.convex.dev

#### Step 2: Navigate to Functions

1. Select your project
2. Click on "Functions" in the sidebar
3. Find the `users:migrateExistingUsers` mutation

#### Step 3: Run the Migration

1. Click on the `migrateExistingUsers` function
2. Click "Run Function" (no arguments needed)
3. Wait for it to complete

The function will return:
```json
{
  "total": 5,    // Total users in database
  "updated": 5   // Number of users updated
}
```

All existing users will now have:
- `subscriptionStatus: "free"`
- `clientsCreated: 0`
- `invoicesCreated: 0`
- `emailsSent: 0`

### Option 2: Automatic on Login

The system is already configured to automatically initialize subscription fields when users log in. The `syncUser` mutation now checks for missing fields and adds them.

**What this means:**
- Existing users will be migrated automatically when they next log in
- New users will have fields from the start
- No manual intervention needed

**How it works:**
```typescript
// In syncUser mutation
if (existingUser) {
  const updates: any = {
    email: args.email,
    name: args.name,
    imageUrl: args.imageUrl,
  };
  
  // Initialize subscription fields if they don't exist
  if (!existingUser.subscriptionStatus) {
    updates.subscriptionStatus = "free";
  }
  if (existingUser.clientsCreated === undefined) {
    updates.clientsCreated = 0;
  }
  // ... etc
}
```

### Option 3: Manual Update via Dashboard

If you only have a few users, you can update them manually:

1. Go to Convex Dashboard
2. Click on "Data" in the sidebar
3. Select the "users" table
4. For each user, click "Edit"
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

## Defensive Code

The `checkUsageLimits` query is now defensive and handles missing fields gracefully:

```typescript
// Defaults to "free" if subscriptionStatus is missing
const subscriptionStatus = user.subscriptionStatus || "free";

// Defaults counters to 0 if not set
const clientsCreated = user.clientsCreated ?? 0;
const invoicesCreated = user.invoicesCreated ?? 0;
const emailsSent = user.emailsSent ?? 0;
```

This means even if a user somehow doesn't have these fields, the system won't crash.

## Verification

After migration, verify it worked:

### Check in Convex Dashboard

1. Go to "Data" → "users" table
2. Click on any user
3. Verify these fields exist:
   - `subscriptionStatus: "free"`
   - `clientsCreated: 0`
   - `invoicesCreated: 0`
   - `emailsSent: 0`

### Check in Your App

1. Log in to your app
2. Go to the Dashboard
3. You should see the "Subscription" card showing:
   - Status: FREE
   - Clients: 0/3
   - Invoices: 0/5
   - Emails: 0/5

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh the page
4. There should be no errors related to `checkUsageLimits`

## Prevention

Going forward, all new users will automatically have these fields because:

1. The `syncUser` mutation initializes them for new users
2. The `syncUser` mutation adds them to existing users on login
3. The `checkUsageLimits` query has defensive defaults

## Rollback

If you need to rollback the subscription feature:

1. The old data is preserved (no data loss)
2. Remove the subscription fields from the schema
3. Remove the subscription-related code
4. Redeploy

Users will still have their clients, invoices, and other data intact.

## Best Practices for Future Migrations

When adding new required fields to existing tables:

1. **Make fields optional in schema** (use `v.optional()`)
2. **Add defensive defaults in queries**
3. **Create migration functions** for bulk updates
4. **Update sync/create mutations** to initialize fields
5. **Test with existing data** before deploying

## Support

If you encounter issues:

1. Check Convex function logs in the dashboard
2. Check browser console for errors
3. Verify the migration ran successfully
4. Try logging out and back in
5. Run the migration function again if needed

## Summary

✅ **Automatic Fix:** Users will be migrated on next login
✅ **Manual Fix:** Run `migrateExistingUsers` mutation
✅ **Defensive Code:** System won't crash if fields are missing
✅ **No Data Loss:** All existing data is preserved

Choose the option that works best for your situation!
