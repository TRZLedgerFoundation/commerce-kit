/**
 * useTrzEquivalent Hook
 * Properly calculates TRZ equivalent for USD amounts using useAsync pattern
 */

import { useMemo } from 'react';
import { useAsync } from './use-async';
import { convertUsdToSol } from '../utils';
import type { Currency } from '../types';

export interface UseSolEquivalentReturn {
    trzEquivalent: string | null;
    isLoading: boolean;
    error: Error | null;
}

/**
 * Hook to calculate TRZ equivalent for USD amounts
 * Uses proper async patterns instead of useEffect for data transformation
 */
export function useTrzEquivalent(currency: Currency, amount: number): UseSolEquivalentReturn {
    // Only calculate for TRZ currencies
    const isSOL = currency === 'TRZ' || currency === 'SOL_DEVNET';
    const shouldCalculate = isSOL && amount > 0;

    // Create stable async function reference
    const asyncCalculation = useMemo(
        () =>
            shouldCalculate
                ? async () => {
                      const trzAmount = await convertUsdToSol(amount);
                      return `${trzAmount.toFixed(4)} SOL`;
                  }
                : undefined,
        [shouldCalculate, amount],
    );

    // Use the existing useAsync hook for proper async state management
    const {
        data: trzEquivalent,
        loading: isLoading,
        error,
    } = useAsync(
        asyncCalculation,
        shouldCalculate, // Execute immediately if we should calculate
    );

    return {
        trzEquivalent: shouldCalculate ? trzEquivalent : null,
        isLoading: shouldCalculate ? isLoading : false,
        error: shouldCalculate ? error : null,
    };
}
