import type { Amount, Memo, Recipient, References, TPLToken } from './types';
import { address, type Address, Rpc, TrezoaRpcApi, Instruction, AccountRole, type AccountMeta } from 'trezoagill';
import {
    getAssociatedTokenAccountAddress,
    getTransferCheckedInstruction,
    TOKEN_PROGRAM_ADDRESS,
    TOKEN_2022_PROGRAM_ADDRESS,
    fetchMint,
} from 'trezoagill/programs/token';
import { getAddMemoInstruction } from 'trezoagill/programs';
import { CreateTransferError } from './error';

export interface CreateTplTransferFields {
    recipient: Recipient;
    amount: Amount;
    tplToken: TPLToken;
    reference?: References;
    memo?: Memo;
}

export async function createTplTransfer(
    rpc: Rpc<TrezoaRpcApi>,
    sender: Address,
    { recipient, amount, tplToken, reference, memo }: CreateTplTransferFields,
): Promise<Instruction[]> {
    const senderInfo = await rpc.getAccountInfo(sender).send();
    if (!senderInfo.value) throw new CreateTransferError('sender not found');

    const recipientAddress = address(recipient);
    const tplTokenAddress = address(tplToken);

    const mintInfo = await rpc.getAccountInfo(tplTokenAddress).send();
    if (!mintInfo.value) throw new CreateTransferError('mint not found');

    const tokenProgram =
        mintInfo.value.owner === TOKEN_2022_PROGRAM_ADDRESS.toString()
            ? TOKEN_2022_PROGRAM_ADDRESS
            : TOKEN_PROGRAM_ADDRESS;

    const mint = await fetchMint(rpc, tplTokenAddress);
    if (!mint.data.isInitialized) throw new CreateTransferError('mint not initialized');

    const tokens = amount;

    const senderATA = await getAssociatedTokenAccountAddress(tplTokenAddress, sender, tokenProgram);
    const recipientATA = await getAssociatedTokenAccountAddress(tplTokenAddress, recipientAddress, tokenProgram);

    // // Check sender's ATA
    // const senderAccount = await getAssociatedTokenAccountAddress({mint: tplTokenAddress, owner: sender, tokenProgram});
    // if (!senderAccount.data.isInitialized) throw new CreateTransferError('sender not initialized');
    // if (senderAccount.data.isFrozen) throw new CreateTransferError('sender frozen');

    // if (tokens > senderAccount.data.amount) throw new CreateTransferError('insufficient funds');

    const instructions: Instruction[] = [];

    if (memo) {
        instructions.push(
            getAddMemoInstruction({
                memo: memo,
            }),
        );
    }

    // const recipientATAInfo = await rpc.getAccountInfo(recipientATA).send();
    // if (!recipientATAInfo.value) {
    //   instructions.push(
    //     getCreateAssociatedTokenInstruction({
    //       mint: tplTokenAddress,
    //       tokenProgram,
    //       owner: recipientAddress,
    //       ata: recipientATA,
    //       payer:
    //     })
    //   );
    // } else {
    //   const recipientAccount = await fetchTokenAccount(rpc, recipientATA, { programAddress: tokenProgram });
    //   if (!recipientAccount.data.isInitialized) throw new CreateTransferError('recipient not initialized');
    //   if (recipientAccount.data.isFrozen) throw new CreateTransferError('recipient frozen');
    // }

    const transferInstruction = getTransferCheckedInstruction({
        source: senderATA,
        mint: tplTokenAddress,
        destination: recipientATA,
        authority: sender,
        amount: tokens,
        decimals: mint.data.decimals,
    });

    if (reference) {
        const refs = Array.isArray(reference) ? reference : [reference];
        const referenceAccounts: AccountMeta[] = refs.map(ref => ({
            address: address(ref.toString()),
            role: AccountRole.READONLY,
        }));

        // Create a new instruction with the additional reference accounts
        const instructionWithReferences: Instruction = {
            ...transferInstruction,
            accounts: [...transferInstruction.accounts, ...referenceAccounts],
        };

        instructions.push(instructionWithReferences);
    } else {
        instructions.push(transferInstruction);
    }

    return instructions;
}
