import { Address, toHex } from 'viem';
import { StoryClient } from '@story-protocol/core-sdk';
import { WIP_TOKEN_ADDRESS } from '@story-protocol/core-sdk';

// Initialize Story Protocol client
export const createStoryClient = () => {
  return StoryClient.newClient({
    chainId: 'sepolia', // or 'mainnet' for production
  });
};

// Configuration constants
export const STORY_CONFIG = {
  NFT_CONTRACT_ADDRESS: import.meta.env.VITE_NFT_CONTRACT_ADDRESS || '0x1514000000000000000000000000000000000000',
  WIP_TOKEN_ADDRESS: WIP_TOKEN_ADDRESS,
  ROYALTY_POLICY_LRP: import.meta.env.VITE_ROYALTY_POLICY_LRP || '0x1514000000000000000000000000000000000000',
  PARENT_IP_ID: import.meta.env.VITE_PARENT_IP_ID || '0x641E638e8FCA4d4844F509630B34c9D524d40BE5',
  PARENT_LICENSE_TERMS_ID: import.meta.env.VITE_PARENT_LICENSE_TERMS_ID || '96',
};

export interface IPMetadata {
  ipMetadataURI: string;
  ipMetadataHash: string;
  nftMetadataHash: string;
  nftMetadataURI: string;
}

export interface DerivativeIPParams {
  nftContract: Address;
  tokenId: string;
  derivData: {
    parentIpIds: Address[];
    licenseTermsIds: string[];
  };
  ipMetadata: IPMetadata;
}

export interface RoyaltyClaimParams {
  ancestorIpId: Address;
  claimer: Address;
  childIpIds: Address[];
  royaltyPolicies: Address[];
  currencyTokens: Address[];
}

// Utility functions for Story Protocol integration
export const createIPMetadata = (
  title: string,
  description: string,
  ipfsHash: string
): IPMetadata => {
  return {
    ipMetadataURI: `ipfs://${ipfsHash}`,
    ipMetadataHash: toHex(ipfsHash, { size: 32 }),
    nftMetadataHash: toHex(`${title}-${Date.now()}`, { size: 32 }),
    nftMetadataURI: `ipfs://${ipfsHash}/metadata.json`,
  };
};

// Register derivative IP with commercial licensing
export const registerDerivativeCommercial = async (params: DerivativeIPParams) => {
  try {
    const client = createStoryClient();
    
    const response = await client.ipAsset.registerDerivativeIp({
      nftContract: params.nftContract,
      tokenId: params.tokenId,
      derivData: params.derivData,
      ipMetadata: params.ipMetadata,
      txOptions: { waitForTransaction: true },
    });

    return response;
  } catch (error) {
    console.error('Error registering derivative IP:', error);
    throw error;
  }
};

// Claim revenue from royalties
export const claimRevenue = async (params: RoyaltyClaimParams) => {
  try {
    const client = createStoryClient();
    
    const response = await client.royalty.claimAllRevenue({
      ancestorIpId: params.ancestorIpId,
      claimer: params.claimer,
      childIpIds: params.childIpIds,
      royaltyPolicies: params.royaltyPolicies,
      currencyTokens: params.currencyTokens,
    });

    return response;
  } catch (error) {
    console.error('Error claiming revenue:', error);
    throw error;
  }
};

// IPFS integration utilities
export const uploadToIPFS = async (file: File): Promise<string> => {
  // This would integrate with IPFS service
  // For now, return a mock hash - in production, integrate with Pinata, IPFS HTTP API, etc.
  return `Qm${Math.random().toString(36).substr(2, 44)}`;
};

export const uploadMetadataToIPFS = async (metadata: any): Promise<string> => {
  // This would upload JSON metadata to IPFS
  // For now, return a mock hash - in production, integrate with IPFS service
  return `Qm${Math.random().toString(36).substr(2, 44)}`;
};