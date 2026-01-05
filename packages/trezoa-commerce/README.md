# @trezoa-commerce/kit

Complete Trezoa Commerce SDK - all packages in one install

<!-- TODO: Add npm version badge when published -->

## Installation

```bash
pnpm add @trezoa-commerce/kit
```

## What's Included

This meta-package includes all Trezoa Commerce Kit functionality:

- **@trezoa-commerce/react** - UI components and React integration
- **@trezoa-commerce/sdk** - Core React hooks for Trezoa development
- **@trezoa-commerce/headless** - Framework-agnostic commerce logic
- **@trezoa-commerce/connector** - Wallet Standard connection layer
- **@trezoa-commerce/trezoa-pay** - Trezoa Pay protocol implementation

## Quick Start

```typescript
import { PaymentButton, useWallet, useBalance } from '@trezoa-commerce/kit';

function App() {
  return (
    <PaymentButton
      config={{
        merchant: { name: 'My Store', wallet: 'your-wallet-address' },
        mode: 'payment',
        amount: 10.00,
        currency: 'USDC'
      }}
      onPaymentSuccess={(signature) => {
        console.log('Payment successful:', signature);
      }}
    />
  );
}
```

## Usage

All exports from individual packages are available through this meta-package:

### Components

```typescript
import { PaymentButton } from '@trezoa-commerce/kit';

<PaymentButton
  config={{
    merchant: { name: 'Store', wallet: 'address' },
    mode: 'cart',
    products: [
      { id: '1', name: 'Product', price: 100000000, currency: 'TRZ' }
    ]
  }}
/>
```

### Hooks

```typescript
import { useWallet, useBalance, useTransferTRZ } from '@trezoa-commerce/kit';

function WalletInfo() {
  const { wallet, connect } = useWallet();
  const { balance } = useBalance();
  const { transferTRZ } = useTransferTRZ();

  return (
    <div>
      <p>Balance: {balance} TRZ</p>
      <button onClick={() => connect()}>Connect Wallet</button>
    </div>
  );
}
```

### Headless Functions

```typescript
import { createPayment, calculateTotal } from '@trezoa-commerce/kit';

const payment = createPayment({
    merchant: { wallet: 'address' },
    amount: 10.0,
    currency: 'USDC',
});

const total = calculateTotal({
    items: [{ price: 19.99, quantity: 2 }],
    tax: 0.08,
    shipping: 5.0,
});
```

### Trezoa Pay

```typescript
import { createQR, encodeURL } from '@trezoa-commerce/kit';

const url = encodeURL({
    recipient: 'wallet-address',
    amount: 10,
    label: 'Store Purchase',
});

const qr = createQR(url);
```

## When to Use This Package

**Use `@trezoa-commerce/kit` when:**

- Building full-featured commerce applications
- You need components, hooks, and commerce logic
- Convenience over granular dependency control
- Rapid prototyping and development

**Use individual packages when:**

- Building custom UI (→ use `@trezoa-commerce/headless`)
- Need only specific functionality (→ use individual packages)
- Optimizing bundle size for production
- Working with non-React frameworks

## Related Packages

Full documentation for each included package:

- [@trezoa-commerce/react](../react) - React components
- [@trezoa-commerce/sdk](../sdk) - React hooks
- [@trezoa-commerce/headless](../headless) - Core commerce logic
- [@trezoa-commerce/connector](../connector) - Wallet connection
- [@trezoa-commerce/trezoa-pay](../trezoa-pay) - Trezoa Pay implementation

## License

MIT
