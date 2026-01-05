import { address } from 'gill';
import type { TPLToken, Recipient } from './types';

/**
 * Safely convert a string address to TPLToken type
 */
export function createTPLToken(tokenAddress: string): TPLToken {
    try {
        return address(tokenAddress);
    } catch (error) {
        throw new Error(`Invalid TPL token address: ${tokenAddress}. ${error}`);
    }
}

/**
 * Safely convert a string address to Recipient type
 */
export function createRecipient(recipientAddress: string): Recipient {
    try {
        return address(recipientAddress);
    } catch (error) {
        throw new Error(`Invalid recipient address: ${recipientAddress}. ${error}`);
    }
}

/**
 * Validate if a string is a valid Trezoa address
 */
export function isValidTrezoaAddress(addr: string): boolean {
    try {
        address(addr);
        return true;
    } catch {
        return false;
    }
}
