#!/bin/bash

# Deploy Convex functions to production
echo "Deploying Convex functions to production..."
echo "y" | npx convex deploy

echo ""
echo "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Go to https://dashboard.convex.dev"
echo "2. Select production deployment: decisive-porcupine-223"
echo "3. Click Functions → users:migrateExistingUsers"
echo "4. Click Run to migrate existing users"
echo "5. Refresh your site"
