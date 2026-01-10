import type { Amount, Memo, Recipient, References, TPLToken } from './types';
import {
    address,
    Address,
    pipe,
    createTransactionMessage,
    setTransactionMessageLifetimeUsingBlockhash,
    appendTransactionMessageInstructions,
    Rpc,
    TrezoaRpcApi,
    TransactionMessageWithBlockhashLifetime,
    TransactionSigner,
} from 'gill';
import { createTrzTransfer } from './create-trz-transfer';
import { createTplTransfer } from './create-tpl-transfer';
import { CreateTransferError } from './error';

export interface CreateTransferFields {
    recipient: Recipient;
    amount: Amount;
    tplToken?: TPLToken;
    reference?: References;
    memo?: Memo;
}

export async function createTransfer(
    rpc: Rpc<TrezoaRpcApi>,
    sender: Address,
    { recipient, amount, tplToken, reference, memo }: CreateTransferFields,
): Promise<TransactionMessageWithBlockhashLifetime> {
    const senderInfo = await rpc.getAccountInfo(sender).send();
    if (!senderInfo.value) throw new CreateTransferError('sender not found');

    const recipientAddress = address(recipient);
    const recipientInfo = await rpc.getAccountInfo(recipientAddress).send();
    if (!recipientInfo.value) throw new CreateTransferError('recipient not found');

    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const instructions = tplToken
        ? await createTplTransfer(rpc, sender, {
              recipient,
              amount,
              tplToken,
              reference,
              memo,
          })
        : await createTrzTransfer(rpc, sender, {
              recipient,
              amount,
              reference,
              memo,
          });

    // Build transaction using functional pipe pattern as recommended by Trezoa Kit docs
    return pipe(
        createTransactionMessage({ version: 0 }),
        tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
        tx => appendTransactionMessageInstructions(instructions, tx),
    );
}
