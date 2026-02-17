# Email Functionality Setup

## Overview
The invoice app now supports sending invoices via email using Resend.

## Features
- ✅ Send invoice emails directly to clients
- ✅ Beautiful HTML email template
- ✅ Pre-fills client email from invoice
- ✅ Success/error notifications
- ✅ Professional invoice formatting

## Setup Instructions

### 1. Get Resend API Key

1. Go to https://resend.com
2. Sign up for a free account (3,000 emails/month free)
3. Verify your email
4. Go to API Keys section
5. Create a new API key
6. Copy the API key (starts with `re_`)

### 2. Add API Key to Vercel

Since you already added it to Vercel, you're all set! But for reference:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add: `RESEND_API_KEY` = `your_api_key_here`
4. Redeploy

### 3. Configure Email Domain (Optional)

By default, emails are sent from `onboarding@resend.dev`. To use your own domain:

1. In Resend dashboard, go to Domains
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records shown
4. Update the `from` field in `app/api/send-invoice/route.ts`:
   ```typescript
   from: "Invoice App <invoices@yourdomain.com>",
   ```

## How to Use

1. Open any invoice detail page
2. Click the "Send Email" button
3. Enter recipient email (pre-filled with client email)
4. Click "Send Email"
5. Wait for confirmation

## Email Template Features

The email includes:
- Professional header with invoice number
- Issue and due dates
- Client billing information
- Itemized line items table
- Subtotal, tax, and total
- Notes and terms (if provided)
- Responsive design
- Print-friendly

## Testing

To test locally:
1. Add your Resend API key to `.env.local`
2. Run `npm run dev`
3. Create/view an invoice
4. Click "Send Email"
5. Check the recipient's inbox

## Troubleshooting

### Email not sending
- Check that `RESEND_API_KEY` is set in Vercel
- Verify the API key is valid
- Check Vercel function logs for errors

### Email goes to spam
- Use a verified domain instead of `onboarding@resend.dev`
- Add SPF, DKIM, and DMARC records

### Rate limits
- Free tier: 3,000 emails/month, 100/day
- Upgrade plan if needed

## API Endpoint

**POST** `/api/send-invoice`

**Body:**
```json
{
  "to": "client@example.com",
  "invoice": {
    // Full invoice object from Convex
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

## Cost

- **Free tier**: 3,000 emails/month
- **Pro**: $20/month for 50,000 emails
- **Enterprise**: Custom pricing

## Next Steps

Consider adding:
- Email templates for different invoice statuses
- Bulk email sending
- Email tracking (opened, clicked)
- Automatic reminders for overdue invoices
- PDF attachment generation
