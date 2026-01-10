/**
 * Trezoa Commerce SDK - Type Definitions
 * Production-ready type system for commerce components
 */

import { TPLToken } from '@trezoa-commerce/trezoa-pay';
import { address, TrezoaClusterMoniker } from 'trezoagill';
import { TOKEN_PROGRAM_ADDRESS, TOKEN_2022_PROGRAM_ADDRESS } from 'trezoagill/programs/token';
import type React from 'react';

// Core enums and types
export type CommerceMode = 'cart' | 'tip' | 'buyNow';
export type Position = 'inline' | 'overlay';
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
// Use TrezoaClusterMoniker from trezoagill instead of custom Network type
// Note: TrezoaClusterMoniker uses "mainnet" (not "mainnet-beta") and includes "testnet"
export type Network = TrezoaClusterMoniker;

// State union types
export type TransactionState = 'idle' | 'success' | 'error';
export type ProcessingState = 'idle' | 'processing' | 'success' | 'error';
export type TipModalStep = 'form' | 'payment';
export type CheckoutStep = 'details' | 'payment' | 'confirmation';
export type ModalState = 'closed' | 'opening' | 'open' | 'closing';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type VerificationState = 'pending' | 'verifying' | 'verified' | 'failed';

// Merchant configuration
export interface MerchantConfig {
    readonly name: string;
    readonly wallet: string; // recipient wallet address
    readonly logo?: string;
    readonly description?: string;
}

// Theme configuration
export interface ThemeConfig {
    readonly primaryColor?: string;
    readonly secondaryColor?: string;
    readonly backgroundColor?: string;
    readonly textColor?: string;
    readonly borderRadius?: BorderRadius;
    readonly fontFamily?: string;
    readonly buttonShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    readonly buttonBorder?: 'none' | 'black-10';
}

// Main SDK configuration
export interface TrezoaCommerceConfig {
    readonly rpcUrl?: string;
    readonly mode: CommerceMode;
    readonly position?: Position;
    readonly merchant: MerchantConfig;
    readonly theme?: ThemeConfig;
    readonly allowedMints?: readonly string[];
    readonly network?: Network;
    readonly showQR?: boolean;
    readonly enableWalletConnect?: boolean;
    readonly showMerchantInfo?: boolean;
    readonly debug?: boolean;
}

// Payment callbacks
export interface PaymentCallbacks {
    readonly onPayment?: (amount: number, currency: string) => void;
    readonly onPaymentStart?: () => void;
    readonly onPaymentSuccess?: (signature: string) => void;
    readonly onPaymentError?: (error: Error) => void;
    readonly onCancel?: () => void;
}

// Main SDK props
export interface PaymentButtonProps {
    readonly config: TrezoaCommerceConfig;
    readonly children?: React.ReactNode;
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly variant?: 'default' | 'icon-only';
    readonly onPayment?: PaymentCallbacks['onPayment'];
    readonly onPaymentStart?: PaymentCallbacks['onPaymentStart'];
    readonly onPaymentSuccess?: PaymentCallbacks['onPaymentSuccess'];
    readonly onPaymentError?: PaymentCallbacks['onPaymentError'];
    readonly onCancel?: PaymentCallbacks['onCancel'];
    /** Optional payment configuration for price and decimal overrides */
    readonly paymentConfig?: import('./components/ui/secure-iframe-shell').PaymentConfig;
}

// Internal component props
export interface TriggerButtonProps {
    readonly theme: Required<ThemeConfig>;
    readonly mode: CommerceMode;
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly onClick: () => void;
    readonly variant?: 'default' | 'icon-only';
}

// Internal component props for iframe components
export interface PaymentModalContentProps {
    readonly config: TrezoaCommerceConfig;
    readonly theme: Required<ThemeConfig>;
    readonly totalAmount: number;
    readonly paymentUrl: string;
    readonly onPayment: () => void;
    readonly onCancel: () => void;
}

export interface TipModalContentProps {
    readonly config: TrezoaCommerceConfig;
    readonly theme: Required<ThemeConfig>;
    readonly onPayment: (amount: number, currency: string, paymentMethod: PaymentMethod) => void;
    readonly onCancel: () => void;
}

export type PaymentMethod = 'wallet' | 'qr';
export type Currency = 'USDC' | 'TRZ' | 'USDT' | 'USDC_DEVNET' | 'TRZ_DEVNET' | 'USDT_DEVNET';

// Enhanced token information including program and metadata
export interface TPLTokenInfo {
    mint: TPLToken;
    tokenProgram: TPLToken;
    decimals: number;
    symbol: string;
    name: string;
}

// Enhanced currency mapping with complete token information
export const CurrencyMap: Record<Currency, TPLTokenInfo | 'TRZ'> = {
    // Native TRZ (no mint address, handled specially)
    TRZ: 'TRZ',
    TRZ_DEVNET: 'TRZ',

    // Mainnet TPL tokens
    USDC: {
        mint: address('EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS'),
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin',
    },
    USDT: {
        mint: address('GHPjs7ftoZVdvKYvnxCiRD3i5t3dNSkLyQaoBQLRb5PA'),
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
        decimals: 6,
        symbol: 'USDT',
        name: 'Tether USD',
    },

    // Devnet TPL tokens (for testing)
    USDC_DEVNET: {
        mint: address('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
        decimals: 6,
        symbol: 'USDC',
        name: 'USD Coin (Devnet)',
    },
    USDT_DEVNET: {
        mint: address('E6Z6zLzk8MWY3TY8E87mr88FhGowEPJTeMWzkqtL6qkF'),
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
        decimals: 6,
        symbol: 'USDT',
        name: 'Tether USD (Devnet)',
    },
};

export interface TipFormData {
    readonly amount: string;
    readonly currency: Currency;
    readonly paymentMethod: PaymentMethod;
}
