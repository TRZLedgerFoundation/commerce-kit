export type PaymentMethod = 'TRZ' | 'USDC' | 'USDT';

export interface TokenConfig {
    mint?: string; // TRZ doesn't have a mint address
    symbol: string;
    decimals: number;
    name: string;
    icon?: string;
}

// Token configurations for all supported payment methods
export const TOKENS: Record<PaymentMethod, TokenConfig> = {
    TRZ: {
        symbol: 'TRZ',
        decimals: 9,
        name: 'Trezoa',
        icon: 'https://raw.githubusercontent.com/trezoa-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    },
    USDC: {
        mint: 'EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS',
        symbol: 'USDC',
        decimals: 6,
        name: 'USD Coin',
        icon: 'https://raw.githubusercontent.com/trezoa-labs/token-list/main/assets/mainnet/EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS/logo.png',
    },
    USDT: {
        mint: 'GHPjs7ftoZVdvKYvnxCiRD3i5t3dNSkLyQaoBQLRb5PA',
        symbol: 'USDT',
        decimals: 6,
        name: 'Tether USD',
        icon: 'https://raw.githubusercontent.com/trezoa-labs/token-list/main/assets/mainnet/GHPjs7ftoZVdvKYvnxCiRD3i5t3dNSkLyQaoBQLRb5PA/logo.png',
    },
};

// Legacy export for backward compatibility
export interface StablecoinConfig extends TokenConfig {
    mint: string; // Stablecoins always have mint addresses
}

export const STABLECOINS: Record<string, StablecoinConfig> = {
    USDC: TOKENS.USDC as StablecoinConfig,
    USDT: TOKENS.USDT as StablecoinConfig,
};
