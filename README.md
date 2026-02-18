# Invoice Management App

A modern, real-time invoicing application built with Next.js, Convex, and Clerk authentication.

## Features

- 🔐 **Authentication** - Secure user authentication with Clerk
- 📊 **Dashboard** - Overview of all invoices with statistics
- 📝 **Invoice Management** - Create, edit, view, and delete invoices
- 👥 **Client Management** - Manage client information
- ⚡ **Real-time Updates** - Instant synchronization across all devices using Convex
- 💰 **Financial Tracking** - Track revenue, paid and pending amounts
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database & Backend**: Convex (reactive database with TypeScript functions)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd new-invoice
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   
   This will:
   - Prompt you to log in with GitHub
   - Create a new Convex project
   - Generate a `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
   - Start the Convex development server

4. **Set up Clerk**
   
   - Go to [clerk.com](https://clerk.com) and create an account
   - Create a new application
   - Copy your API keys to `.env.local`:
     ```env
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
     CLERK_SECRET_KEY=sk_test_...
     ```

5. **Configure Clerk in Convex Dashboard**
   
   - Go to your Convex dashboard at [dashboard.convex.dev](https://dashboard.convex.dev)
   - Navigate to Settings → Authentication
   - Add Clerk as an authentication provider
   - Copy your Clerk Issuer URL (from Clerk dashboard → API Keys → JWT Templates)

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── dashboard/          # Dashboard page
│   ├── invoices/          # Invoice pages
│   │   ├── new/           # Create invoice
│   │   └── [id]/          # View invoice
│   ├── clients/           # Client management
│   ├── sign-in/           # Sign in page
│   ├── sign-up/           # Sign up page
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   └── providers.tsx      # Convex + Clerk providers
├── convex/
│   ├── schema.ts          # Database schema
│   ├── users.ts           # User functions
│   ├── clients.ts         # Client functions
│   └── invoices.ts        # Invoice functions
├── middleware.ts          # Clerk authentication middleware
└── .env.local            # Environment variables
```

## Database Schema

### Users
- Synced from Clerk authentication
- Stores user profile information

### Clients
- Client contact information
- Associated with user accounts

### Invoices
- Invoice details (number, dates, amounts, status)
- Linked to clients and users
- Supports multiple statuses: draft, sent, paid, overdue, cancelled

### Line Items
- Individual items on invoices
- Description, quantity, rate, and calculated amounts

## Features in Detail

### Dashboard
- Overview statistics (total invoices, paid, pending, draft)
- Revenue tracking (total, paid, pending)
- Recent invoices list
- Quick actions for creating invoices and clients

### Invoice Management
- Create invoices with multiple line items
- Auto-calculate totals and taxes
- Change invoice status
- View detailed invoice information
- Print invoices
- Real-time updates across all devices

### Client Management
- Add and manage client information
- Store complete contact details
- Delete clients (with confirmation)

### Real-time Synchronization
- All changes sync instantly using Convex
- Multiple users can view the same data simultaneously
- No manual refresh needed

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy Convex to Production

```bash
npx convex deploy
```

This will create a production deployment and give you a new `CONVEX_URL` to use in production.

## Development

- **Convex Dashboard**: Monitor your database and functions at [dashboard.convex.dev](https://dashboard.convex.dev)
- **Clerk Dashboard**: Manage authentication at [dashboard.clerk.com](https://dashboard.clerk.com)

## Learn More

- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT
