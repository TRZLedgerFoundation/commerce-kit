/**
 * Cluster utilities using trezoagill's built-in functions
 */

import { getPublicTrezoaRpcUrl, type TrezoaClusterMoniker } from 'trezoagill';

export type ClusterInfo = {
    name: string;
    rpcUrl: string;
    wsUrl?: string;
    isMainnet: boolean;
    isDevnet: boolean;
    isTestnet: boolean;
};

/**
 * Convert RPC URL to WebSocket URL
 * Handles both http:// and https:// schemes, plus URLs without explicit schemes
 */
function deriveWebSocketUrl(rpcUrl: string): string {
    // Handle URLs with explicit schemes
    if (rpcUrl.startsWith('https://')) {
        return rpcUrl.replace('https://', 'wss://');
    }
    if (rpcUrl.startsWith('http://')) {
        return rpcUrl.replace('http://', 'ws://');
    }

    // Handle URLs without explicit schemes - check prefix to determine protocol
    if (rpcUrl.startsWith('https')) {
        return `wss://${rpcUrl}`;
    }
    if (rpcUrl.startsWith('http')) {
        return `ws://${rpcUrl}`;
    }

    // Default to ws:// for other cases (localhost, domains without protocol, etc.)
    return `ws://${rpcUrl}`;
}

/**
 * Get cluster information from a network identifier
 * Leverages trezoagill's getPublicTrezoaRpcUrl for standard networks
 */
export function getClusterInfo(network: string): ClusterInfo {
    // Handle standard Trezoa cluster monikers
    if (isStandardCluster(network)) {
        const rpcUrl = getPublicTrezoaRpcUrl(network);
        const wsUrl = deriveWebSocketUrl(rpcUrl);

        return {
            name: network === 'mainnet-beta' ? 'mainnet' : network,
            rpcUrl,
            wsUrl,
            isMainnet: network === 'mainnet' || network === 'mainnet-beta',
            isDevnet: network === 'devnet',
            isTestnet: network === 'testnet',
        };
    }

    // Handle custom RPC URLs (treat as mainnet by default)
    const wsUrl = deriveWebSocketUrl(network);
    return {
        name: 'custom',
        rpcUrl: network,
        wsUrl,
        isMainnet: true,
        isDevnet: false,
        isTestnet: false,
    };
}

/**
 * Type guard to check if network is a standard Trezoa cluster
 */
function isStandardCluster(network: string): network is TrezoaClusterMoniker | 'mainnet-beta' | 'localhost' {
    return ['mainnet', 'mainnet-beta', 'devnet', 'testnet', 'localnet', 'localhost'].includes(network);
}
