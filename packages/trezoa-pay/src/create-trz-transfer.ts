import { getTransferInstruction } from 'gill/programs';
import type { Amount, Memo, Recipient, References } from './types';
import { address, Address, Rpc, TrezoaRpcApi, TransactionSigner, Instruction } from 'gill';
import { getTransferTrzInstruction } from 'gill/programs';

export interface CreateTrzTransferFields {
    recipient: Recipient;
    amount: Amount;
    reference?: References;
    memo?: Memo;
}

export async function createTrzTransfer(
    rpc: Rpc<TrezoaRpcApi>,
    sender: Address,
    { recipient, amount, reference, memo }: CreateTrzTransferFields,
): Promise<Instruction[]> {
    const recipientAddress = address(recipient);

    // Safely coerce amount to number with precision check
    let numericAmount: number;

    if (typeof amount === 'bigint') {
        if (amount > BigInt(Number.MAX_SAFE_INTEGER)) {
            throw new RangeError(
                `Amount ${amount} exceeds the safe integer range (max: ${Number.MAX_SAFE_INTEGER}). ` +
                    'Use a smaller value or handle large amounts with BigInt-compatible methods.',
            );
        }
        numericAmount = Number(amount);
    } else if (typeof amount === 'string') {
        // Parse string to BigInt first to check precision safety
        const bigintAmount = BigInt(amount);
        if (bigintAmount > BigInt(Number.MAX_SAFE_INTEGER)) {
            throw new RangeError(
                `Amount "${amount}" exceeds the safe integer range (max: ${Number.MAX_SAFE_INTEGER}). ` +
                    'Use a smaller value or handle large amounts with BigInt-compatible methods.',
            );
        }
        numericAmount = Number(amount);
    } else {
        // Assume it's already a number or can be safely coerced
        numericAmount = Number(amount);
    }

    return [
        getTransferInstruction({
            source: sender,
            destination: recipientAddress,
            amount: numericAmount,
            authority: sender,
        }),
    ];
}
