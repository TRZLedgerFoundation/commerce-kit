import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTrezoaPay } from '../../hooks/use-trezoa-pay';
import { toMinorUnits } from '@trezoa-commerce/headless/src/utils/validation';

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

vi.mock('@trezoa-commerce/headless/src/utils/validation', () => ({
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

// Get the mocked function
import { createTrezoaPayRequest } from '@trezoa-commerce/headless';
const mockCreateTrezoaPayRequest = vi.mocked(createTrezoaPayRequest);

const mockPaymentRequest = {
    qrCode: 'data:image/png;base64,mock-qr-code',
    url: 'trezoa:9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM?amount=1.5&tpl-token=EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS',
    reference: 'mock-reference',
};

describe('useTrezoaPay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('toMinorUnits utility function', () => {
        it('should convert decimal amounts to minor units correctly', () => {
            expect(toMinorUnits(1.5, 6)).toBe(1500000n); // 1.5 USDC
            expect(toMinorUnits(0.001, 9)).toBe(1000000n); // 0.001 TRZ
            expect(toMinorUnits(100, 2)).toBe(10000n); // 100 units with 2 decimals
            expect(toMinorUnits(0, 6)).toBe(0n); // Zero amount
        });

        it('should handle whole numbers correctly', () => {
            expect(toMinorUnits(5, 6)).toBe(5000000n); // 5 USDC
            expect(toMinorUnits(1, 9)).toBe(1000000000n); // 1 TRZ
        });

        it('should handle precision correctly', () => {
            expect(toMinorUnits(1.123456, 6)).toBe(1123456n); // Exact precision
            expect(toMinorUnits(1.123456789, 9)).toBe(1123456789n); // Max TRZ precision
        });

        it('should throw error for invalid inputs', () => {
            expect(() => toMinorUnits(NaN, 6)).toThrow('Invalid amount/decimals');
            expect(() => toMinorUnits(Infinity, 6)).toThrow('Invalid amount/decimals');
            expect(() => toMinorUnits(1, -1)).toThrow('Invalid amount/decimals');
        });
    });

    describe('useTrezoaPay hook', () => {
        const mockPaymentRequest = {
            url: 'trezoa:9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM?amount=1.5&tpl-token=EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS',
            qrCode: 'data:image/png;base64,mock-qr-code',
            reference: 'mock-reference',
        };

        it('should initialize with loading state', () => {
            mockCreateTrezoaPayRequest.mockImplementation(() => new Promise(() => {})); // Never resolves

            const { result } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC'),
            );

            expect(result.current.loading).toBe(true);
            expect(result.current.paymentRequest).toBe(null);
        });

        it('should create payment request successfully', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            const { result } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC'),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.paymentRequest).toEqual({
                ...mockPaymentRequest,
                memo: expect.stringMatching(/^tip-\d+$/),
            });

            expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                {
                    recipient: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
                    amount: 10000000n, // 10 USDC in minor units (6 decimals)
                    tplToken: 'EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS', // USDC mint from CurrencyMap
                    memo: expect.stringMatching(/^tip-\d+$/),
                    label: 'commerceKit',
                    message: undefined,
                },
                {
                    size: 256,
                    background: 'white',
                    color: 'black',
                    margin: undefined,
                    errorCorrectionLevel: undefined,
                    logo: undefined,
                    logoSize: undefined,
                    logoBackgroundColor: undefined,
                    logoMargin: undefined,
                    dotStyle: undefined,
                    cornerStyle: undefined,
                },
            );
        });

        it('should handle TRZ currency correctly', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            const { result } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 0.5, 'TRZ'),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    amount: 500000000n, // 0.5 TRZ in lamports (9 decimals)
                    tplToken: undefined, // TRZ doesn't use tplToken
                }),
                expect.any(Object),
            );
        });

        it('should handle custom QR options', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            const qrOptions = {
                size: 400,
                background: '#000000',
                color: '#ffffff',
                label: 'Custom Payment',
                message: 'Pay for premium service',
                margin: 20,
                errorCorrectionLevel: 'H' as const,
                dotStyle: 'rounded' as const,
                cornerStyle: 'extra-rounded' as const,
            };

            const { result } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 25, 'USDT', qrOptions),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                expect.objectContaining({
                    label: 'Custom Payment',
                    message: 'Pay for premium service',
                }),
                expect.objectContaining({
                    size: 400,
                    background: '#000000',
                    color: '#ffffff',
                    margin: 20,
                    errorCorrectionLevel: 'H',
                    dotStyle: 'rounded',
                    cornerStyle: 'extra-rounded',
                }),
            );
        });

        it('should handle errors gracefully', async () => {
            const mockError = new Error('Payment creation failed');
            mockCreateTrezoaPayRequest.mockRejectedValue(mockError);

            const { result } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC'),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.paymentRequest).toBe(null);
            expect(result.current.error).toEqual(mockError);
        });

        it('should generate unique references for each payment', async () => {
            const requests: any[] = [];
            mockCreateTrezoaPayRequest.mockImplementation(params => {
                requests.push(params);
                return Promise.resolve(mockPaymentRequest);
            });

            // Create multiple payment requests
            const { result: result1 } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC'),
            );

            const { result: result2 } = renderHook(() =>
                useTrezoaPay('GjwcWFQYzemBtpUoN5fMAP2FZviTtMRWCmrppGuTthJS', 20, 'USDT'),
            );

            await waitFor(() => {
                expect(result1.current.loading).toBe(false);
                expect(result2.current.loading).toBe(false);
            });

            // References should be different
            expect(requests).toHaveLength(2);
            expect(requests[0].memo).not.toBe(requests[1].memo);
            expect(requests[0].memo).toMatch(/^tip-\d+$/);
            expect(requests[1].memo).toMatch(/^tip-\d+$/);
        });

        it('should recreate request when parameters change', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            const { result, rerender } = renderHook(
                ({ recipient, amount, currency }) => useTrezoaPay(recipient, amount, currency),
                {
                    initialProps: {
                        recipient: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
                        amount: 10,
                        currency: 'USDC' as const,
                    },
                },
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockCreateTrezoaPayRequest).toHaveBeenCalledTimes(1);

            // Change amount
            rerender({
                recipient: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
                amount: 20,
                currency: 'USDC' as const,
            });

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledTimes(2);
            });

            // Change currency
            rerender({
                recipient: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
                amount: 20,
                currency: 'TRZ' as const,
            });

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledTimes(3);
            });
        });

        it('should handle advanced QR customization options', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            const advancedOptions = {
                size: 512,
                background: 'transparent',
                color: '#6366f1',
                label: 'Premium Service',
                message: 'Thank you for your purchase!',
                margin: 40,
                errorCorrectionLevel: 'Q' as const,
                logo: 'https://example.com/logo.png',
                logoSize: 50,
                logoBackgroundColor: '#ffffff',
                logoMargin: 10,
                dotStyle: 'dots' as const,
                cornerStyle: 'full-rounded' as const,
            };

            renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 15.99, 'USDC', advancedOptions),
            );

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining({
                        size: 512,
                        background: 'transparent',
                        color: '#6366f1',
                        margin: 40,
                        errorCorrectionLevel: 'Q',
                        logo: 'https://example.com/logo.png',
                        logoSize: 50,
                        logoBackgroundColor: '#ffffff',
                        logoMargin: 10,
                        dotStyle: 'dots',
                        cornerStyle: 'full-rounded',
                    }),
                );
            });
        });

        it('should add memo to payment request', async () => {
            const mockRequest = { ...mockPaymentRequest };
            mockCreateTrezoaPayRequest.mockResolvedValue(mockRequest);

            const { result } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC'),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.paymentRequest?.memo).toMatch(/^tip-\d+$/);
            expect(typeof result.current.paymentRequest?.memo).toBe('string');
        });
    });

    describe('Currency handling', () => {
        it('should handle USDC correctly', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            renderHook(() => useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 100, 'USDC'));

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                    expect.objectContaining({
                        amount: 100000000n, // 100 USDC with 6 decimals
                        tplToken: 'EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS', // USDC mint
                    }),
                    expect.any(Object),
                );
            });
        });

        it('should handle USDT correctly', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            renderHook(() => useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 50, 'USDT'));

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                    expect.objectContaining({
                        amount: 50000000n, // 50 USDT with 6 decimals
                        tplToken: 'GHPjs7ftoZVdvKYvnxCiRD3i5t3dNSkLyQaoBQLRb5PA', // USDT mint
                    }),
                    expect.any(Object),
                );
            });
        });

        it('should handle TRZ correctly', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            renderHook(() => useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 2.5, 'TRZ'));

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                    expect.objectContaining({
                        amount: 2500000000n, // 2.5 TRZ with 9 decimals
                        tplToken: undefined, // TRZ doesn't use tplToken
                    }),
                    expect.any(Object),
                );
            });
        });

        it('should handle devnet currencies correctly', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            // Test USDC_DEVNET
            const { rerender } = renderHook(
                ({ currency }) => useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, currency),
                { initialProps: { currency: 'USDC_DEVNET' as const } },
            );

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                    expect.objectContaining({
                        amount: 10000000n, // 10 USDC_DEVNET with 6 decimals
                        tplToken: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // USDC_DEVNET mint
                    }),
                    expect.any(Object),
                );
            });

            // Test SOL_DEVNET
            rerender({ currency: 'SOL_DEVNET' as const });

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                    expect.objectContaining({
                        amount: 10000000000n, // 10 SOL_DEVNET with 9 decimals
                        tplToken: undefined, // SOL_DEVNET doesn't use tplToken
                    }),
                    expect.any(Object),
                );
            });
        });

        it('should validate all supported currencies without errors', () => {
            const supportedCurrencies: Array<'USDC' | 'TRZ' | 'USDT' | 'USDC_DEVNET' | 'SOL_DEVNET' | 'USDT_DEVNET'> = [
                'USDC',
                'TRZ',
                'USDT',
                'USDC_DEVNET',
                'SOL_DEVNET',
                'USDT_DEVNET',
            ];

            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            supportedCurrencies.forEach(currency => {
                expect(() => {
                    renderHook(() => useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, currency));
                }).not.toThrow();
            });
        });
    });

    describe('QR Code options', () => {
        it('should use default QR options when none provided', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            renderHook(() => useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC'));

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(expect.any(Object), {
                    size: 256,
                    background: 'white',
                    color: 'black',
                    margin: undefined,
                    errorCorrectionLevel: undefined,
                    logo: undefined,
                    logoSize: undefined,
                    logoBackgroundColor: undefined,
                    logoMargin: undefined,
                    dotStyle: undefined,
                    cornerStyle: undefined,
                });
            });
        });

        it('should override default QR options with provided options', async () => {
            mockCreateTrezoaPayRequest.mockResolvedValue(mockPaymentRequest);

            const customOptions = {
                size: 300,
                background: 'blue',
                color: 'red',
                label: 'Custom Label',
                message: 'Custom Message',
            };

            renderHook(() => useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC', customOptions));

            await waitFor(() => {
                expect(mockCreateTrezoaPayRequest).toHaveBeenCalledWith(
                    expect.objectContaining({
                        label: 'Custom Label',
                        message: 'Custom Message',
                    }),
                    expect.objectContaining({
                        size: 300,
                        background: 'blue',
                        color: 'red',
                    }),
                );
            });
        });
    });

    describe('Reference generation', () => {
        it('should generate random references', async () => {
            const requests: any[] = [];
            mockCreateTrezoaPayRequest.mockImplementation(params => {
                requests.push(params.memo);
                return Promise.resolve(mockPaymentRequest);
            });

            // Create multiple hooks to test reference uniqueness
            const { result: result1 } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC'),
            );

            const { result: result2 } = renderHook(() =>
                useTrezoaPay('GjwcWFQYzemBtpUoN5fMAP2FZviTtMRWCmrppGuTthJS', 20, 'USDT'),
            );

            await waitFor(() => {
                expect(result1.current.loading).toBe(false);
                expect(result2.current.loading).toBe(false);
            });

            // References should be different
            expect(requests).toHaveLength(2);
            expect(requests[0]).not.toBe(requests[1]);
            expect(requests[0]).toMatch(/^tip-\d+$/);
            expect(requests[1]).toMatch(/^tip-\d+$/);
        });
    });

    describe('Error scenarios', () => {
        it('should handle network errors', async () => {
            const networkError = new Error('Network error');
            mockCreateTrezoaPayRequest.mockRejectedValue(networkError);

            const { result } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC'),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.paymentRequest).toBe(null);
            expect(result.current.error).toEqual(networkError);
        });

        it('should handle invalid recipient addresses', async () => {
            const addressError = new Error('Invalid recipient address');
            mockCreateTrezoaPayRequest.mockRejectedValue(addressError);

            const { result } = renderHook(() => useTrezoaPay('invalid-address', 10, 'USDC'));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.paymentRequest).toBe(null);
            expect(result.current.error).toEqual(addressError);
        });

        it('should throw error for unsupported currency', () => {
            // Mock console.error to avoid test output noise
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                renderHook(() => useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'ZZZ' as any));
            }).toThrow(
                'Unsupported currency: ZZZ. Supported currencies are: SOL, SOL_DEVNET, USDC, USDT, USDC_DEVNET, USDT_DEVNET',
            );

            consoleSpy.mockRestore();
        });

        it('should throw error for another invalid currency format', () => {
            // Mock console.error to avoid test output noise
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                renderHook(() =>
                    useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 15, 'INVALID_TOKEN' as any),
                );
            }).toThrow('Unsupported currency: INVALID_TOKEN');

            consoleSpy.mockRestore();
        });
    });

    describe('Async timing', () => {
        it('should maintain loading state until request completes', async () => {
            let resolveRequest: (value: any) => void;
            const pendingPromise = new Promise(resolve => {
                resolveRequest = resolve;
            });

            mockCreateTrezoaPayRequest.mockReturnValue(pendingPromise);

            const { result } = renderHook(() =>
                useTrezoaPay('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 10, 'USDC'),
            );

            expect(result.current.loading).toBe(true);
            expect(result.current.paymentRequest).toBe(null);

            await act(async () => {
                resolveRequest!(mockPaymentRequest);
            });

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.paymentRequest).toBeDefined();
        });
    });
});
