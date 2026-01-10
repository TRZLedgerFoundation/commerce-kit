import { describe, it } from '@jest/globals';
import {
    createTrezoaClient,
    TrezoaClient,
    KeyPairSigner,
    generateExtractableKeyPairSigner,
} from 'trezoagill';
import { setupWallets } from './helpers/transactions';
import { assertGetOrCreateOperator } from './helpers/state-utils';

describe('Initialize Operator Instruction', () => {
    let client: TrezoaClient;
    let payer: KeyPairSigner;
    let operatorAuthority: KeyPairSigner;
    beforeEach(async () => {
        client = createTrezoaClient({ urlOrMoniker: 'http://localhost:8899' });
        payer = await generateExtractableKeyPairSigner();
        operatorAuthority = await generateExtractableKeyPairSigner();
        await setupWallets(client, [payer, operatorAuthority]);
    }, 20_000);

    it('should create an operator', async () => {
        try {
            await assertGetOrCreateOperator({ client, payer, owner: operatorAuthority, failIfExists: true });
        } catch (error) {
            console.error('Failed to create operator:', error);
            throw error;
        }
    }, 10_000);
});