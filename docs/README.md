# Documentation Index

Welcome to the Invoice Management App documentation. This directory contains comprehensive guides for implementing and using the subscription system with PayStack integration.

## Quick Start

1. **[Subscription Setup Guide](./SUBSCRIPTION_SETUP.md)** - Start here for step-by-step setup instructions
2. **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** - Overview of what was built
3. **[PayStack Integration](./PAYSTACK_INTEGRATION.md)** - Complete PayStack API documentation
4. **[PayStack API Reference](./PAYSTACK_API_REFERENCE.md)** - Quick API reference

## Documents

### Setup & Configuration

#### [SUBSCRIPTION_SETUP.md](./SUBSCRIPTION_SETUP.md)
Complete setup guide covering:
- Environment variables configuration
- Convex schema deployment
- PayStack webhook setup
- Testing procedures
- Going live checklist
- Troubleshooting guide

**Start here if you're setting up the system for the first time.**

### Implementation Details

#### [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
Comprehensive overview including:
- What was implemented
- Database schema changes
- API routes created
- UI components added
- Security features
- Testing procedures
- Future enhancements

**Read this to understand the complete system architecture.**

### API Documentation

#### [PAYSTACK_INTEGRATION.md](./PAYSTACK_INTEGRATION.md)
Detailed PayStack integration guide:
- Test credentials
- Subscription plans (Free & Pro)
- All API endpoints with examples
- Webhook events and handling
- Implementation flow diagrams
- Currency handling
- Error handling
- Security best practices
- Database schema
- Monitoring and logging

**Reference this for detailed PayStack API information.**

#### [PAYSTACK_API_REFERENCE.md](./PAYSTACK_API_REFERENCE.md)
Quick reference guide:
- Base URL and authentication
- Core endpoints
- Request/response examples
- Webhook event structures
- Test data
- Common errors
- Best practices

**Use this as a quick lookup while coding.**

## Features Overview

### Free Plan (R0/month)
- ✅ 5 invoices per month
- ✅ 3 clients total
- ✅ 5 email sends per month
- ✅ All basic features

### Pro Plan (R10/month)
- ✅ Unlimited invoices
- ✅ Unlimited clients
- ✅ Unlimited email sends
- ✅ All premium features
- ✅ Priority support

## Quick Links

### PayStack Resources
- [PayStack Documentation](https://paystack.com/docs/)
- [PayStack API Reference](https://paystack.com/docs/api/)
- [PayStack Dashboard](https://dashboard.paystack.com/)
- [PayStack Support](mailto:support@paystack.com)
- [PayStack Slack Community](https://paystack.com/slack)

### Test Credentials
```
Secret Key: sk_test_28067d17f921a3c69f6aba1ed64ab17422c24843
Public Key: pk_test_4e4c6f7143a8fe12d4b2764743b63442b0505b1d
```

### Test Card (Successful Payment)
```
Card: 4084084084084081
CVV: 408
Expiry: 12/28
PIN: 0000
OTP: 123456
```

## File Structure

```
docs/
├── README.md                      # This file - Documentation index
├── SUBSCRIPTION_SETUP.md          # Setup guide
├── IMPLEMENTATION_SUMMARY.md      # Implementation overview
├── PAYSTACK_INTEGRATION.md        # Detailed PayStack guide
└── PAYSTACK_API_REFERENCE.md      # Quick API reference
```

## Getting Help

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is correct
   - Verify webhook is enabled in PayStack dashboard
   - Use ngrok for local testing
   - Check signature validation

2. **Payment fails immediately**
   - Verify test credentials in test mode
   - Check test card details
   - Verify PayStack account is active

3. **Subscription not updating**
   - Check webhook events are received
   - Verify Convex functions work
   - Check server logs for errors

### Support Channels

1. **PayStack Issues**
   - Email: support@paystack.com
   - Slack: https://paystack.com/slack
   - Dashboard logs: https://dashboard.paystack.com/

2. **Application Issues**
   - Check Convex dashboard logs
   - Review PayStack webhook logs
   - Check server console logs

## Development Workflow

### 1. Initial Setup
```bash
# Copy environment variables
cp .env.example .env.local

# Install dependencies
npm install

# Deploy Convex schema
npx convex dev

# Start development server
npm run dev
```

### 2. Testing
```bash
# Use ngrok for webhook testing
ngrok http 3000

# Configure webhook in PayStack dashboard
# Test with provided test cards
```

### 3. Going Live
```bash
# Update to live credentials
# Deploy to production
# Update webhook URL
# Test in production
```

## Security Checklist

- [ ] Environment variables configured
- [ ] Webhook signature validation enabled
- [ ] IP whitelisting configured
- [ ] HTTPS enabled
- [ ] Test credentials not in production
- [ ] Error logging enabled
- [ ] Rate limiting implemented

## Monitoring Checklist

- [ ] Webhook delivery monitoring
- [ ] Payment failure alerts
- [ ] Usage tracking analytics
- [ ] MRR tracking
- [ ] Error rate monitoring

## Next Steps

1. **Read** [SUBSCRIPTION_SETUP.md](./SUBSCRIPTION_SETUP.md) for setup instructions
2. **Configure** environment variables
3. **Deploy** Convex schema
4. **Set up** PayStack webhook
5. **Test** complete flow
6. **Go live** with production credentials

## Contributing

When adding new features or documentation:

1. Update relevant documentation files
2. Add examples and code snippets
3. Update this README if adding new docs
4. Test all examples
5. Update troubleshooting sections

## Version History

- **v1.0.0** (2026-02-18) - Initial subscription system implementation
  - Free and Pro plans
  - PayStack integration
  - Usage tracking
  - Webhook handling
  - Complete documentation

## License

MIT License - See main project README for details
