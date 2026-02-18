# TypeScript Declaration Fix for Paystack

## Issue

The `@paystack/inline-js` package doesn't include TypeScript declarations, which causes a build error:

```
Type error: Could not find a declaration file for module '@paystack/inline-js'
```

## Solution

Created a custom TypeScript declaration file at `/types/paystack-inline-js.d.ts` that defines the types for the Paystack package.

## What Was Added

### `/types/paystack-inline-js.d.ts`

This file contains TypeScript type definitions for:

1. **PaystackTransaction** - Transaction response interface
2. **PaystackConfig** - Configuration for checkout
3. **PaymentRequestConfig** - Extended config for payment requests
4. **Paystack** - Main class with methods:
   - `checkout()` - Open payment popup
   - `newTransaction()` - Create new transaction
   - `preloadTransaction()` - Preload transaction for faster checkout
   - `paymentRequest()` - Payment request API

## Usage

Now you can import and use Paystack with full TypeScript support:

```typescript
import Paystack from '@paystack/inline-js';

const popup = new Paystack();

await popup.checkout({
  key: 'pk_test_xxxxx',
  email: 'user@example.com',
  amount: 19900,
  currency: 'ZAR',
  planInterval: 'monthly',
  onSuccess: (transaction) => {
    console.log('Payment successful:', transaction.reference);
  },
  onError: (error) => {
    console.error('Payment failed:', error.message);
  }
});
```

## TypeScript Configuration

The `tsconfig.json` already includes all TypeScript files:

```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ]
}
```

This means the `/types/paystack-inline-js.d.ts` file is automatically picked up by TypeScript.

## SSR (Server-Side Rendering) Fix

The Paystack library requires `window` object which is only available in the browser. To prevent SSR errors during build, the library is dynamically imported only on the client side:

```typescript
useEffect(() => {
  const loadPaystack = async () => {
    if (typeof window !== 'undefined') {
      const Paystack = (await import('@paystack/inline-js')).default;
      setPopup(new Paystack());
    }
  };
  loadPaystack();
}, []);
```

This ensures:
- ✅ No `window is not defined` errors during build
- ✅ Paystack loads only in the browser
- ✅ Page can be pre-rendered successfully
- ✅ No performance impact (loads asynchronously)

## Build Status

✅ TypeScript compilation succeeds
✅ No type errors
✅ No SSR errors
✅ Full IntelliSense support in IDE
✅ Type safety for Paystack integration
✅ Production build completes successfully

## Alternative Solutions

If you prefer, you could also:

1. **Install community types** (if available):
   ```bash
   npm install --save-dev @types/paystack__inline-js
   ```
   
2. **Use type assertion**:
   ```typescript
   const Paystack = (await import('@paystack/inline-js')).default as any;
   ```
   
3. **Disable type checking** (not recommended):
   ```typescript
   // @ts-ignore
   import Paystack from '@paystack/inline-js';
   ```

However, the custom declaration file is the cleanest solution as it:
- Provides full type safety
- Enables IntelliSense
- Documents the API
- Doesn't require external packages
- Works in both development and production

## Maintenance

If Paystack releases official TypeScript types in the future, you can:

1. Remove `/types/paystack-inline-js.d.ts`
2. Install official types: `npm install --save-dev @types/paystack__inline-js`
3. Update imports if needed

For now, the custom declaration file provides everything needed for a type-safe integration.
