import { Address } from 'viem'

// Story Protocol Contract Addresses for Aeneid Testnet
export const RoyaltyPolicyLRP: Address = process.env.VITE_ROYALTY_POLICY_LRP as Address || '0x1514000000000000000000000000000000000000'
export const SPGNFTContractAddress: Address = process.env.VITE_NFT_CONTRACT_ADDRESS as Address || '0x1514000000000000000000000000000000000000'

// NFT Contract Address (same as SPG NFT for compatibility)
export const NFTContractAddress: Address = SPGNFTContractAddress