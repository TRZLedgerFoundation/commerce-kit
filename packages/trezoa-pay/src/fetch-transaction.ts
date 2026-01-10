import { Address, Rpc, TrezoaRpcApi, Signature, Transaction } from 'trezoagill';

export async function fetchTransaction(rpc: Rpc<TrezoaRpcApi>, signature: Signature): Promise<Transaction> {
    const response = await rpc.getTransaction(signature).send();
    const transaction = response?.transaction;
    if (!transaction) {
        throw new Error('Transaction not found');
    }

    return transaction as unknown as Transaction;
}
