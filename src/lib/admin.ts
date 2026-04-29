import { walletsClient } from './circle';
import { v4 as uuidv4 } from 'uuid';

export async function createSystemWallet() {
  try {
    const response = await walletsClient.createWallets({
      accountType: 'EOA',
      blockchains: ['ARC-TESTNET' as any],
      walletSetId: uuidv4(), // This should ideally be a fixed wallet set
      count: 1,
      idempotencyKey: uuidv4(),
    });
    return response.data?.wallets?.[0];
  } catch (error) {
    console.error('Failed to create system wallet:', error);
    throw error;
  }
}
