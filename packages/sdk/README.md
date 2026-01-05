# @trezoa-commerce/sdk

Modern React hooks for Trezoa development - Type-safe, progressive complexity, built on Trezoa Kit

<!-- TODO: Add npm version badge when published -->

## Installation

```bash
pnpm add @trezoa-commerce/sdk
```

## Quick Start

```typescript
import { ArcProvider, useTransferTRZ } from '@trezoa-commerce/sdk';

function App() {
  return (
    <ArcProvider config={{ network: 'devnet' }}>
      <TransferComponent />
    </ArcProvider>
  );
}

function TransferComponent() {
  const { transferTRZ } = useTransferTRZ();

  return <button onClick={() => transferTRZ({ to: 'address', amount: 1n })}>Send</button>;
}
```

## Features

- Trezoa React Provider with automatic RPC client management
- Trezoa Kit/Gill-based Trezoa Hooks for common operations

### Arc Provider

```typescript
<ArcProvider
  config={{
    network: 'mainnet',
    rpcUrl: 'https://your-private-rpc.com'
  }}
>
  <YourApp />
</ArcProvider>
```

### Hooks

- **useArcClient()** - Access RPC client and configuration
- **useTransferTRZ()** - Transfer TRZ with automatic retry
- **useTransferToken()** - Transfer TPL tokens with automatic retry
- **useStandardWallets()** - Wallet Standard integration

## Examples

### TRZ Transfer

```typescript
function SendTRZ() {
  const { transferTRZ, isLoading } = useTransferTRZ();

  const handleTransfer = async () => {
    try {
      const { signature } = await transferTRZ({
        to: 'recipient-address',
        amount: BigInt(1_000_000_000) // 1 TRZ in lamports
      });
      console.log('Transfer successful:', signature);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  return (
    <button onClick={handleTransfer} disabled={isLoading}>
      Send 1 TRZ
    </button>
  );
}
```

## Configuration

### ArcProvider Setup

```typescript
function App() {
  return (
    <ArcProvider
      config={{
        network: 'devnet',
        rpcUrl: 'https://api.devnet.trezoa.com',
        debug: true
      }}
    >
      <YourApp />
    </ArcProvider>
  );
}
```

## Development

```bash
pnpm build              # Build package
pnpm dev                # Watch mode
pnpm type-check         # Type check
pnpm test               # Run tests
pnpm lint               # Lint code
```

## License

MIT
