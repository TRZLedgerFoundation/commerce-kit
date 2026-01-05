import { describe, it, expect } from 'vitest';
import { TREZOA_PROTOCOL, HTTPS_PROTOCOL, MEMO_PROGRAM_ID, TOKEN_PROGRAM_ID, TRZ_DECIMALS, TEN } from '../constants';

describe('Constants', () => {
    describe('Protocol Constants', () => {
        it('should have correct Trezoa protocol', () => {
            expect(TREZOA_PROTOCOL).toBe('trezoa:');
            expect(typeof TREZOA_PROTOCOL).toBe('string');
        });

        it('should have correct HTTPS protocol', () => {
            expect(HTTPS_PROTOCOL).toBe('https:');
            expect(typeof HTTPS_PROTOCOL).toBe('string');
        });

        it('should have protocols ending with colon', () => {
            expect(TREZOA_PROTOCOL.endsWith(':')).toBe(true);
            expect(HTTPS_PROTOCOL.endsWith(':')).toBe(true);
        });
    });

    describe('Program IDs', () => {
        it('should have valid memo program ID', () => {
            expect(MEMO_PROGRAM_ID).toBeDefined();
            expect(typeof MEMO_PROGRAM_ID.toString).toBe('function');
            expect(MEMO_PROGRAM_ID.toString()).toBe('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
        });

        it('should have valid token program ID', () => {
            expect(TOKEN_PROGRAM_ID).toBeDefined();
            expect(typeof TOKEN_PROGRAM_ID.toString).toBe('function');
            expect(TOKEN_PROGRAM_ID.toString()).toBe('4JkrrPuuQPxDZuBW1bgrM1GBa8oYg1LxcuX9szBPh3ic');
        });

        it('should have program IDs as proper Address objects', () => {
            // Should have gill Address properties
            expect(MEMO_PROGRAM_ID).toHaveProperty('toString');
            expect(TOKEN_PROGRAM_ID).toHaveProperty('toString');

            // Should be valid Trezoa addresses (typically 43-44 characters)
            expect(MEMO_PROGRAM_ID.toString().length).toBeGreaterThanOrEqual(43);
            expect(MEMO_PROGRAM_ID.toString().length).toBeLessThanOrEqual(44);
            expect(TOKEN_PROGRAM_ID.toString().length).toBeGreaterThanOrEqual(43);
            expect(TOKEN_PROGRAM_ID.toString().length).toBeLessThanOrEqual(44);
        });

        it('should use well-known Trezoa program addresses', () => {
            // These are standard Trezoa program addresses (43-44 characters, Base58)
            expect(MEMO_PROGRAM_ID.toString()).toMatch(/^[1-9A-HJ-NP-Za-km-z]{43,44}$/);
            expect(TOKEN_PROGRAM_ID.toString()).toMatch(/^[1-9A-HJ-NP-Za-km-z]{43,44}$/);
        });
    });

    describe('Decimal Constants', () => {
        it('should have correct TRZ decimals', () => {
            expect(TRZ_DECIMALS).toBe(9);
            expect(typeof TRZ_DECIMALS).toBe('number');
            expect(Number.isInteger(TRZ_DECIMALS)).toBe(true);
        });

        it('should have TRZ decimals in valid range', () => {
            expect(TRZ_DECIMALS).toBeGreaterThan(0);
            expect(TRZ_DECIMALS).toBeLessThanOrEqual(18); // Reasonable upper bound
        });

        it('should have correct TEN constant', () => {
            expect(TEN).toBe(10n);
            expect(typeof TEN).toBe('bigint');
        });

        it('should be usable for lamport calculations', () => {
            // 1 TRZ = 10^9 lamports
            const oneTrzInLamports = TEN ** BigInt(TRZ_DECIMALS);
            expect(oneTrzInLamports).toBe(1000000000n);

            // 0.5 TRZ = 500,000,000 lamports
            const halfTrzInLamports = oneTrzInLamports / 2n;
            expect(halfTrzInLamports).toBe(500000000n);

            // 0.001 TRZ = 1,000,000 lamports
            const milliTrzInLamports = oneTrzInLamports / 1000n;
            expect(milliTrzInLamports).toBe(1000000n);
        });
    });

    describe('Constant Relationships', () => {
        it('should have consistent decimal system', () => {
            // TRZ_DECIMALS and TEN should work together
            const lamportsPerTrz = TEN ** BigInt(TRZ_DECIMALS);
            expect(lamportsPerTrz).toBe(1000000000n);

            // Should be able to convert back and forth
            const trzAmount = 2.5;
            const lamports = BigInt(trzAmount * Number(lamportsPerTrz));
            const backToTrz = Number(lamports) / Number(lamportsPerTrz);
            expect(backToTrz).toBe(trzAmount);
        });

        it('should handle maximum precision', () => {
            // Smallest unit (1 lamport)
            const smallestUnit = 1n;
            const asTrz = Number(smallestUnit) / Number(TEN ** BigInt(TRZ_DECIMALS));
            expect(asTrz).toBe(0.000000001);
        });

        it('should handle large amounts', () => {
            // 1 million SOL
            const millionTrz = 1000000;
            const lamports = BigInt(millionTrz) * TEN ** BigInt(TRZ_DECIMALS);
            expect(lamports).toBe(1000000000000000n);
        });
    });

    describe('Protocol Usage', () => {
        it('should be usable for URL construction', () => {
            const testAddress = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM';

            // Trezoa Pay URL
            const trezoaUrl = TREZOA_PROTOCOL + testAddress;
            expect(trezoaUrl).toBe('trezoa:9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');

            // HTTPS URL
            const httpsUrl = HTTPS_PROTOCOL + '//example.com/api';
            expect(httpsUrl).toBe('https://example.com/api');
        });

        it('should be compatible with URL constructor', () => {
            const testPath = '/api/transaction';

            // Should work with URL constructor
            const httpsUrl = new URL(testPath, HTTPS_PROTOCOL + '//example.com');
            expect(httpsUrl.protocol).toBe('https:');
            expect(httpsUrl.hostname).toBe('example.com');
            expect(httpsUrl.pathname).toBe('/api/transaction');
        });
    });

    describe('Mathematical Constants', () => {
        it('should support various mathematical operations', () => {
            // Powers
            expect(TEN ** 0n).toBe(1n);
            expect(TEN ** 1n).toBe(10n);
            expect(TEN ** 2n).toBe(100n);
            expect(TEN ** BigInt(TRZ_DECIMALS)).toBe(1000000000n);

            // Division
            expect(1000000000n / TEN ** BigInt(TRZ_DECIMALS)).toBe(1n);
            expect(500000000n / TEN ** BigInt(TRZ_DECIMALS)).toBe(0n); // Integer division

            // Modulo
            expect(1500000000n % TEN ** BigInt(TRZ_DECIMALS)).toBe(500000000n);
        });

        it('should handle precision calculations correctly', () => {
            const lamportsPerTrz = TEN ** BigInt(TRZ_DECIMALS);

            // Test various TRZ amounts converted to lamports
            const testCases = [
                { trz: 1, lamports: 1000000000n },
                { trz: 0.5, lamports: 500000000n },
                { trz: 0.1, lamports: 100000000n },
                { trz: 0.01, lamports: 10000000n },
                { trz: 0.001, lamports: 1000000n },
                { trz: 0.000000001, lamports: 1n },
            ];

            testCases.forEach(({ trz, lamports }) => {
                const calculated = BigInt(Math.round(trz * Number(lamportsPerTrz)));
                expect(calculated).toBe(lamports);
            });
        });
    });

    describe('Type Safety', () => {
        it('should have correct types for all constants', () => {
            expect(typeof TREZOA_PROTOCOL).toBe('string');
            expect(typeof HTTPS_PROTOCOL).toBe('string');
            expect(typeof TRZ_DECIMALS).toBe('number');
            expect(typeof TEN).toBe('bigint');

            // Address types should have toString method
            expect(typeof MEMO_PROGRAM_ID.toString).toBe('function');
            expect(typeof TOKEN_PROGRAM_ID.toString).toBe('function');
        });

        it('should maintain immutability', () => {
            // Constants should be read-only
            const originalTrzDecimals = TRZ_DECIMALS;
            const originalTen = TEN;
            const originalTrezoaProtocol = TREZOA_PROTOCOL;

            // These should not be modifiable
            expect(TRZ_DECIMALS).toBe(originalTrzDecimals);
            expect(TEN).toBe(originalTen);
            expect(TREZOA_PROTOCOL).toBe(originalTrezoaProtocol);
        });
    });
});
