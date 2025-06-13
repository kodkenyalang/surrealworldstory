import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';

// Environment configuration
const privateKey = process.env.WALLET_PRIVATE_KEY as `0x${string}`;
const rpcUrl = process.env.VITE_STORY_RPC_URL || 'https://testnet.storyrpc.io';

// Create account from private key
export const account = privateKeyToAccount(privateKey || '0x0000000000000000000000000000000000000000000000000000000000000000');

// Create wallet client
export const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(rpcUrl),
});

// Create public client
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

// Story Protocol configuration
const config: StoryConfig = {
  account: account,
  rpcProviderUrl: rpcUrl,
  chainId: 'sepolia'
};

// Initialize Story client
export const client = StoryClient.newClient(config);

// Contract addresses
export const NFTContractAddress = process.env.VITE_NFT_CONTRACT_ADDRESS as `0x${string}` || '0x1514000000000000000000000000000000000000';
export const RoyaltyPolicyLRP = process.env.VITE_ROYALTY_POLICY_LRP as `0x${string}` || '0x1514000000000000000000000000000000000000';