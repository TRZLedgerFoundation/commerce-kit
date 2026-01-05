# @trezoa-commerce/trezoa-pay

Trezoa Pay SDK implementation with QR code generation built on Trezoa Kit/Gill

<!-- TODO: Add npm version badge when published -->

## Installation

```bash
pnpm add @trezoa-commerce/trezoa-pay
```

## Features

- Trezoa Pay URL encoding and parsing
- QR code generation with styling options
- TRZ and TPL token transfer building
- Transaction request support
- TypeScript-first with complete type definitions
- Compliant with [Trezoa Pay specification](https://docs.trezoapay.com/spec)

## API

### URL Functions

- **encodeURL(fields)** - Create Trezoa Pay URL from payment parameters
- **parseURL(url)** - Parse Trezoa Pay URL into components

### QR Code Generation

- **createQR(url, size?, background?, color?)** - Generate basic QR code as data URL
- **createStyledQRCode(url, options)** - Generate QR code with custom styling (logo, colors, dot/corner styles)

### Transaction Building

- **createTransfer(params)** - Build TRZ transfer transaction
- **createTRZTransfer(params)** - Build TRZ transfer (alias)
- **createTPLTransfer(params)** - Build TPL token transfer transaction

## Examples

### Basic Payment URL

```typescript
import { encodeURL, createQR } from '@trezoa-commerce/trezoa-pay';

const url = encodeURL({
    recipient: 'wallet-address',
    amount: 0.1,
    label: 'Store Purchase',
    message: 'Thank you!',
    // tplToken: USDC_MINT, (optional)
});

const qr = await createQR(url);
```

### Styled QR Code

```typescript
import { createStyledQRCode } from '@trezoa-commerce/trezoa-pay';

const qr = await createStyledQRCode(url, {
    width: 400,
    color: { dark: '#9945FF', light: '#FFFFFF' },
    dotStyle: 'rounded',
    cornerStyle: 'extra-rounded',
    logo: 'https://mystore.com/logo.png',
    logoSize: 80,
});
```

## Development

```bash
pnpm build              # Build package
pnpm dev                # Watch mode
pnpm test               # Run tests
pnpm test:watch         # Run tests in watch mode
```

## License

MIT
