# Trezoa Commerce Kit

Modern toolkit for building Trezoa commerce applications

<!-- TODO: Add npm version badges when packages are published -->

## Overview

Trezoa Commerce Kit is a comprehensive TypeScript SDK for building e-commerce applications on Trezoa. It provides everything from low-level payment primitives to high-level React components, enabling developers to integrate payments, tips, and checkout flows with minimal configuration.

Built on modern Trezoa libraries (@trezoa/kit, Wallet Standard) with a focus on type safety, developer experience, and production readiness.

**Key Features:**
- Complete payment flows for tips, purchases, and cart checkout
- Production-ready React components with customizable theming
- Framework-agnostic commerce logic
- Wallet Standard integration for multi-wallet support
- Full Trezoa Pay protocol implementation
- TypeScript-first with comprehensive type definitions

## Packages

| Package | Description | Docs |
|---------|-------------|------|
| [@trezoa-commerce/kit](./) | All-in-one SDK with complete functionality |  |
| [@trezoa-commerce/react](./packages/react) | React components for payments, tips, and checkout | [README](./packages/react/README.md) |
| [@trezoa-commerce/sdk](./packages/sdk) | Core React hooks for Trezoa development | [README](./packages/sdk/README.md) |
| [@trezoa-commerce/headless](./packages/headless) | Framework-agnostic commerce logic | [README](./packages/headless/README.md) |
| [@trezoa-commerce/connector](./packages/connector) | Wallet connection built on Wallet Standard | [README](./packages/connector/README.md) |
| [@trezoa-commerce/trezoa-pay](./packages/trezoa-pay) | Trezoa Pay protocol implementation | [README](./packages/trezoa-pay/README.md) |

## Package Overview

### @trezoa-commerce/kit
Meta-package that re-exports all functionality. Install this for complete access to the entire toolkit.

### @trezoa-commerce/react
Complete UI components for commerce applications:
- PaymentButton with secure iframe architecture
- Tip modal with customizable amounts
- Wallet connection UI
- Transaction state management
- Customizable theming system

### @trezoa-commerce/sdk
Type-safe React hooks for Trezoa development:
- Wallet management (`useWallet`, `useStandardWallets`)
- Account operations (`useBalance`, `useTransferTRZ`)
- Token transfers (`useTransferToken`)
- RPC client access (`useArcClient`)

### @trezoa-commerce/headless
Framework-agnostic commerce primitives:
- Payment flow logic
- Cart management
- Order processing
- Checkout calculations
- Type definitions

### @trezoa-commerce/connector
Headless wallet connector with optional React support:
- Wallet Standard integration
- Multi-wallet detection and connection
- React provider and hooks
- Framework-agnostic core client

### @trezoa-commerce/trezoa-pay
Complete Trezoa Pay protocol implementation:
- Payment URL creation and parsing
- QR code generation
- TRZ and TPL token transfers
- Transaction building

## Architecture

```
commerce-kit/   # @trezoa-commerce/kit - all packages in one install
|---packages/
│   ├── @trezoa-commerce/connector
│   ├── @trezoa-commerce/headless
│   ├── @trezoa-commerce/react
│   ├── @trezoa-commerce/sdk
│   └── @trezoa-commerce/trezoa-pay
```

**Choosing a Package:**
- Need everything? → `@trezoa-commerce/kit`
- Wallet connection? → `@trezoa-commerce/connector`
- Custom UI or non-React framework? → `@trezoa-commerce/headless`
- Building React app with UI? → `@trezoa-commerce/react`
- Need just hooks? → `@trezoa-commerce/sdk`
- Trezoa Pay protocol? → `@trezoa-commerce/trezoa-pay`

## Usage Examples

### E-commerce Checkout

```typescript
import { PaymentButton } from '@trezoa-commerce/react';

function CheckoutButton() {
  return (
    <PaymentButton
      config={{
        merchant: {
          name: 'Digital Store',
          wallet: 'merchant-wallet-address'
        },
        mode: 'cart',
        products: [
          {
            id: 'course-1',
            name: 'Trezoa Development Course',
            price: 100000000, // 0.1 TRZ in lamports
            currency: 'TRZ'
          }
        ],
        allowedMints: ['TRZ', 'USDC'],
        theme: {
          primaryColor: '#9945FF',
          borderRadius: 'lg'
        }
      }}
      onPaymentSuccess={(signature) => {
        console.log('Payment successful!', signature);
      }}
    />
  );
}
```

### Custom Integration with Hooks

```typescript
import { ArcProvider, useWallet, useTransferTRZ } from '@trezoa-commerce/sdk';

function CustomPayment() {
  const { wallet, connect } = useWallet();
  const { transferTRZ, isLoading } = useTransferTRZ();

  const handlePayment = async () => {
    if (!wallet) {
      await connect();
      return;
    }

    const { signature } = await transferTRZ({
      to: 'merchant-address',
      amount: BigInt(1_000_000_000) // 1 TRZ
    });

    console.log('Payment sent:', signature);
  };

  return <button onClick={handlePayment}>Pay 1 TRZ</button>;
}
```

<!-- TODO: Add Example for each package -->

## Development

### Prerequisites
- Node.js 18+
- pnpm 8+

### Setup
```bash
git clone https://github.com/trzledgerfoundation/commerce-kit.git
cd commerce-kit
pnpm install
```

### Commands
```bash
pnpm build          # Build all packages
pnpm test           # Run all tests
pnpm dev            # Watch mode for development
pnpm format         # Format code
pnpm lint           # Lint code
```

### Working on Individual Packages

Navigate to a package and use its scripts:

```bash
cd packages/sdk
pnpm dev          # Watch mode
pnpm test:watch   # Test watch mode
```

## Documentation

Coming soon.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT
