/**
 * Simple RPC utilities for wallet flow
 *
 * Simplified from over-engineered pooling system to basic RPC client creation
 */

import { createTrezoaRpc, createTrezoaRpcSubscriptions } from '@trezoa/kit';

// Type aliases for RPC clients
type TrezoaRpc = ReturnType<typeof createTrezoaRpc>;
type TrezoaRpcSubscriptions = ReturnType<typeof createTrezoaRpcSubscriptions>;

/**
 * Create RPC connection for wallet operations
 *
 * @param rpcUrl - RPC endpoint URL
 * @param commitment - Transaction confirmation level
 * @returns RPC client
 */
export function createRpc(rpcUrl: string, _commitment?: 'processed' | 'confirmed' | 'finalized'): TrezoaRpc {
    return createTrezoaRpc(rpcUrl);
}

/**
 * Create WebSocket connection for wallet operations
 *
 * @param rpcUrl - RPC endpoint URL (will be converted to WebSocket URL)
 * @param commitment - Transaction confirmation level
 * @returns WebSocket client
 */
export function createWebSocket(
    rpcUrl: string,
    _commitment?: 'processed' | 'confirmed' | 'finalized',
): TrezoaRpcSubscriptions {
    const wsUrl = rpcUrl.replace('https://', 'wss://').replace('http://', 'ws://');
    return createTrezoaRpcSubscriptions(wsUrl);
}

// Backward compatibility aliases (to avoid breaking changes during migration)
export const getSharedRpc = createRpc;
export const getSharedWebSocket = createWebSocket;

/**
 * No-op for backward compatibility - connection cleanup not needed with simple approach
 */
export function releaseRpcConnection(_rpcUrl: string, _commitment?: 'processed' | 'confirmed' | 'finalized'): void {
    // No-op - simple RPC creation doesn't require cleanup
}
