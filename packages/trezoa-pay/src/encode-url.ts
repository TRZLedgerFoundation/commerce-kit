import { TREZOA_PROTOCOL, HTTPS_PROTOCOL, TRZ_DECIMALS } from './constants';
import type { Amount, Label, Link, Memo, Message, Recipient, References, TPLToken } from './types';

/**
 * Fields of a Trezoa Pay transfer request URL.
 */
export interface TransferRequestURLFields {
    /** `recipient` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#recipient). */
    recipient: Recipient;
    /** `amount` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#amount). */
    amount?: Amount;
    /** `tpl-token` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#tpl-token). */
    tplToken?: TPLToken;
    /** `reference` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#reference). */
    reference?: References;
    /** `label` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#label). */
    label?: Label;
    /** `message` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#message). */
    message?: Message;
    /** `memo` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#memo). */
    memo?: Memo;
}

/**
 * Convert bigint lamports to decimal string without floating-point precision issues.
 *
 * @param amount - Amount in lamports as bigint
 * @param decimals - Number of decimal places (defaults to TRZ_DECIMALS)
 */
function lamportsToDecimal(amount: bigint, decimals = TRZ_DECIMALS): string {
    const neg = amount < 0n;
    const abs = neg ? -amount : amount;
    const base = 10n ** BigInt(decimals);
    const int = abs / base;
    const frac = abs % base;
    if (frac === 0n) return `${neg ? '-' : ''}${int}`;
    const fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
    return `${neg ? '-' : ''}${int}.${fracStr}`;
}

/**
 * Encode a Trezoa Pay transfer request URL.
 *
 * @param fields - Fields to encode in the URL.
 */
export function encodeURL(fields: TransferRequestURLFields | TransactionRequestURLFields): URL {
    if ('link' in fields) {
        return encodeTransactionRequestURL(fields);
    } else {
        return encodeTransferRequestURL(fields);
    }
}

/**
 * Encode a Trezoa Pay transfer request URL.
 *
 * @param fields - Fields to encode in the URL.
 */
export function encodeTransferRequestURL({
    recipient,
    amount,
    tplToken,
    reference,
    label,
    message,
    memo,
}: TransferRequestURLFields): URL {
    const pathname = recipient.toString();
    const url = new URL(TREZOA_PROTOCOL + pathname);

    if (amount !== undefined) {
        // Convert bigint lamports to decimal without floating-point
        const amountStr = lamportsToDecimal(amount, TRZ_DECIMALS);
        url.searchParams.append('amount', amountStr);
    }

    if (tplToken) {
        try {
            // Ensure tplToken is properly converted to string
            const tokenAddress = tplToken.toString();
            url.searchParams.append('tpl-token', tokenAddress);
        } catch (error) {
            throw new Error(`Invalid TPL token address: ${tplToken}`);
        }
    }

    if (reference) {
        const references = Array.isArray(reference) ? reference : [reference];
        for (const ref of references) {
            url.searchParams.append('reference', ref.toString());
        }
    }

    if (label) {
        url.searchParams.append('label', label);
    }

    if (message) {
        url.searchParams.append('message', message);
    }

    if (memo) {
        url.searchParams.append('memo', memo);
    }

    return url;
}

/**
 * Fields of a Trezoa Pay transaction request URL.
 */
export interface TransactionRequestURLFields {
    /** `link` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#link). */
    link: Link;
    /** `label` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#label-1). */
    label?: Label;
    /** `message` in the [Trezoa Pay spec](https://github.com/trezoa-labs/trezoa-pay/blob/master/SPEC.md#message-1). */
    message?: Message;
}

/**
 * Encode a Trezoa Pay transaction request URL.
 *
 * @param fields - Fields to encode in the URL.
 */
export function encodeTransactionRequestURL({ link, label, message }: TransactionRequestURLFields): URL {
    // Remove trailing slashes
    const pathname = String(link).replace(/\/\?/, '?').replace(/\/$/, '');

    // Handle absolute and relative URLs
    const url = pathname.startsWith('http') ? new URL(pathname) : new URL(TREZOA_PROTOCOL + pathname);

    // Validate the protocol
    if (url.protocol !== TREZOA_PROTOCOL && url.protocol !== HTTPS_PROTOCOL) {
        throw new Error('invalid link');
    }

    // Add label and message as query parameters
    if (label) {
        url.searchParams.append('label', label);
    }

    if (message) {
        url.searchParams.append('message', message);
    }

    return url;
}
