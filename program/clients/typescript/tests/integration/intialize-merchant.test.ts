import { describe, it } from '@jest/globals';
import {
    createTrezoaClient,
    TrezoaClient,
    KeyPairSigner,
    generateExtractableKeyPairSigner,
} from 'gill';
import {
    setupWallets
} from './helpers/transactions';
import { assertGetOrCreateMerchant } from './helpers/state-utils';

describe('Commerce Program Integration Tests', () => {
    let client: TrezoaClient;
    let payer: KeyPairSigner;
    let merchantAuthority: KeyPairSigner;
    let settlementWallet: KeyPairSigner;
    beforeEach(async () => {
        client = createTrezoaClient({ urlOrMoniker: 'http://localhost:8899' });
        payer = await generateExtractableKeyPairSigner();
        merchantAuthority = await generateExtractableKeyPairSigner();
        settlementWallet = await generateExtractableKeyPairSigner();
        await setupWallets(client, [payer, merchantAuthority]);
    }, 20_000);

    describe('Merchant Management', () => {
        it('should initialize a merchant', async () => {
            try {
                await assertGetOrCreateMerchant({ client, payer, authority: merchantAuthority, settlementWallet, failIfExists: true });
            } catch (error) {
                console.error('Failed to initialize merchant:', error);
                throw error;
            }
        }, 10_000);
    });
});