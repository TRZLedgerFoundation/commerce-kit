import { describe, expect } from '@jest/globals';
import {
    address,
    createTrezoaClient,
    TrezoaClient,
} from 'gill';
import {
    COMMERCE_PROGRAM_PROGRAM_ADDRESS,
} from '../../src/generated';
import { TOKEN_PROGRAM_ADDRESS } from 'gill/programs';

/**
 * These tests should be used to verify that the local test validator is working as expected.
 * If these tests fail, it is likely the reason for the other tests to fail.
 */
describe('Local Test Validator', () => {
    let client: TrezoaClient;
    const usdcMint = address('EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS');
    const usdtMint = address('GHPjs7ftoZVdvKYvnxCiRD3i5t3dNSkLyQaoBQLRb5PA');
    beforeEach(async () => {
        // Initialize trezoa client
        client = createTrezoaClient({
            urlOrMoniker: 'http://localhost:8899',
        });
    }, 20_000);

    describe('Setup', () => {
        it('should verify the commerce program is deployed', async () => {
            const programAccount = await client.rpc.getAccountInfo(
                address(COMMERCE_PROGRAM_PROGRAM_ADDRESS)
            ).send();

            expect(programAccount.value).not.toBeNull();
            expect(programAccount.value?.executable).toBe(true);
        });

        it('should verify USDC mint exists', async () => {
            const mintAccount = await client.rpc.getAccountInfo(usdcMint).send();

            expect(mintAccount.value).not.toBeNull();
            expect(mintAccount.value?.owner).toBe(TOKEN_PROGRAM_ADDRESS);
        });
        it('should verify USDT mint exists', async () => {
            const mintAccount = await client.rpc.getAccountInfo(usdtMint).send();

            expect(mintAccount.value).not.toBeNull();
            expect(mintAccount.value?.owner).toBe(TOKEN_PROGRAM_ADDRESS);
        });
    });
});