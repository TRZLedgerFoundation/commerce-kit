/**
 * @trezoa-commerce/sdk - Minimal Export
 *
 * Only exports what @react actually uses.
 * Reduced from 90KB to ~20KB bundle.
 */

// ===== CORE PROVIDER & HOOKS =====
export { ArcProvider } from './core/commerce-provider';
export { useArcClient } from './core/commerce-client-provider';
export { useTransferTRZ } from './hooks/use-transfer-trz';
export { useTransferToken } from './hooks/use-transfer-token';

// Export essential types
export type { UseTransferTRZReturn } from './hooks/use-transfer-trz';
export type {
    UseTransferTokenReturn,
    TransferTokenOptions,
    TransferTokenResult,
    TransferRetryConfig,
    BlockhashExpirationError,
} from './hooks/use-transfer-token';

// Provider types
export type { ArcProviderProps } from './core/commerce-provider';
export type { ArcWebClientConfig } from './core/web-client';
export type { TrezoaClusterMoniker } from 'gill';

// ===== ADDRESS HELPERS =====
export { address } from '@trezoa/kit';
export type { Address } from '@trezoa/kit';

// ===== QUERY UTILITIES (for cache management) =====
export { queryKeys } from './utils/query-keys';
export { QueryInvalidator, createInvalidator } from './utils/invalidate';
export type { InvalidateOptions } from './utils/invalidate';

// ===== CONFIGURATION =====

// ===== VALIDATION TYPES =====
export type { ValidationOptions, ValidationResult } from './utils/schema-validation';
