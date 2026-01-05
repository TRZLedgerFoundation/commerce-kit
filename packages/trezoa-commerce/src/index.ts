/**
 * @trezoa-commerce/trezoa-commerce
 *
 * Comprehensive Trezoa Commerce SDK - All-in-one package for Trezoa e-commerce solutions
 *
 * This meta package reexports all Commerce Kit packages for convenient single-import usage.
 * Instead of importing from individual packages, you can now import everything from:
 *
 * import { PaymentButton, useTransferTRZ, ConnectorProvider } from '@trezoa-commerce/trezoa-commerce'
 */

// ===== MAIN EXPORTS - Most commonly used =====

// Main Payment Component (react)
export {
    PaymentButton,
    TrezoaCommerceSDK, // deprecated alias
} from '@trezoa-commerce/react';

// Core React Providers (connector)
export { ConnectorProvider, AppProvider, WalletProvider, UnifiedProvider } from '@trezoa-commerce/connector';

// Trezoa SDK Provider (sdk)
export { ArcProvider } from '@trezoa-commerce/sdk';

// Main Hooks (sdk)
export { useTransferTRZ, useTransferToken, useArcClient } from '@trezoa-commerce/sdk';

// Connector Hooks (connector)
export { useConnector, useConnectorClient } from '@trezoa-commerce/connector';

// ===== ALL EXPORTS BY PACKAGE =====

// Re-export everything from react
export * from '@trezoa-commerce/react';

// Re-export everything from connector
export * from '@trezoa-commerce/connector';

// Re-export everything from sdk
export * from '@trezoa-commerce/sdk';

// Re-export everything from trezoa-pay (including isValidTrezoaAddress)
export * from '@trezoa-commerce/trezoa-pay';

// Note: @trezoa-commerce/headless is available via the HeadlessSDK namespace export below
// Not re-exported at top level to avoid isValidTrezoaAddress conflict with trezoa-pay

// Note: ui-primitives is now internal to @trezoa-commerce/react

// ===== NAMESPACED EXPORTS FOR ADVANCED USAGE =====

import * as ConnectorKit from '@trezoa-commerce/connector';
import * as ReactSDK from '@trezoa-commerce/react';
import * as TrezoaHooks from '@trezoa-commerce/sdk';
import * as HeadlessSDK from '@trezoa-commerce/headless';
import * as TrezoaPay from '@trezoa-commerce/trezoa-pay';
// UIPrimitives namespace removed - ui-primitives is now internal to @trezoa-commerce/react

export { ConnectorKit, ReactSDK, TrezoaHooks, HeadlessSDK, TrezoaPay };

// ===== TYPE EXPORTS =====

// Main configuration types (react)
export type {
    MerchantConfig,
    ThemeConfig,
    TrezoaCommerceConfig,
    PaymentCallbacks,
    PaymentButtonProps,
    PaymentConfig,
    Product,
} from '@trezoa-commerce/react';

// Connector types (connector)
export type {
    ConnectorState,
    ConnectorConfig,
    WalletInfo,
    AccountInfo,
    ConnectorSnapshot,
    UnifiedProviderProps,
    ConnectorTheme,
} from '@trezoa-commerce/connector';

// Hook return types (sdk)
export type {
    UseTransferTRZReturn,
    UseTransferTokenReturn,
    TransferTokenOptions,
    TransferTokenResult,
    TransferRetryConfig,
    ArcProviderProps,
    ArcWebClientConfig,
} from '@trezoa-commerce/sdk';

// Network and address types
export type { TrezoaClusterMoniker, Address } from '@trezoa-commerce/sdk';
