import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTrezoaPay } from '../../hooks/use-trezoa-pay';

// Mock the headless SDK
vi.mock('@trezoa-commerce/headless', () => ({
    createTrezoaPayRequest: vi.fn(),
    toMinorUnits: vi.fn((amount: number, decimals: number): bigint => {
        // Real implementation for tests
        if (!Number.isFinite(amount) || decimals < 0) {
            throw new Error('Invalid amount/decimals');
        }
        const s = amount.toFixed(decimals);
        const parts = s.split('.');
        const integerPart = parts[0] || '0';
        const fractionalPartRaw = parts[1] || '';
        const normalizedFractional =
            decimals === 0 || fractionalPartRaw.length === 0
                ? decimals === 0
                    ? '0'
                    : '0'.repeat(decimals)
                : fractionalPartRaw.padEnd(decimals, '0');
        return BigInt(integerPart) * 10n ** BigInt(decimals) + BigInt(normalizedFractional);
    }),
}));

describe('Trezoa Pay Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should integrate useTrezoaPay hook with proper types', () => {
        const { result } = renderHook(() => useTrezoaPay('DemoMerchantPublicKey123456789', 10, 'USDC'));

        expect(result.current.loading).toBeDefined();
        expect(result.current.paymentRequest).toBeDefined();
    });

    it('should handle different currencies', () => {
        const { result: usdcResult } = renderHook(() => useTrezoaPay('merchant123', 5, 'USDC'));

        const { result: solResult } = renderHook(() => useTrezoaPay('merchant123', 5, 'TRZ'));

        expect(usdcResult.current).toBeDefined();
        expect(solResult.current).toBeDefined();
    });

    it('should handle QR options', () => {
        const qrOptions = {
            size: 300,
            background: 'white',
            color: 'black',
            label: 'Test Payment',
            message: 'Test message',
        };

        const { result } = renderHook(() => useTrezoaPay('merchant123', 10, 'USDC', qrOptions));

        expect(result.current).toBeDefined();
    });
});
