import { IDGTDefiAgent } from '../utils/defi-agent/idgt-agent';
import { IStorage, storage } from './storage';

export class IDGTService {
  private agent: IDGTDefiAgent | null = null;
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  async initializeAgent(): Promise<void> {
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    const rpcUrl = 'https://rpc.story.foundation';
    const storyIPTokenAddress = process.env.STORY_IP_TOKEN_ADDRESS || '0x1514000000000000000000000000000000000000';

    if (!privateKey) {
      throw new Error('WALLET_PRIVATE_KEY environment variable is required');
    }

    this.agent = new IDGTDefiAgent(privateKey, rpcUrl, storyIPTokenAddress);
    await this.agent.initialize();
  }

  async processIPRegistration(ipAssetId: number, ownerAddress: string, ipId: string): Promise<{
    success: boolean;
    transactionHash?: string;
    tokensAwarded?: string;
    error?: string;
  }> {
    try {
      if (!this.agent) {
        await this.initializeAgent();
      }

      const result = await this.agent!.handleIPRegistrationRequest(ipId, ownerAddress);
      
      // Update IP asset with IDGT registration status
      await this.storage.updateIpAsset(ipAssetId, {
        idgtRegistered: true,
        idgtRewardAmount: '100000000000000000000', // 100 IDGT in wei
        idgtTransactionHash: this.extractTransactionHash(result)
      });

      return {
        success: true,
        transactionHash: this.extractTransactionHash(result),
        tokensAwarded: '100 IDGT'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async processRoyaltyPayment(ipId: string, amount: string, payerAddress: string): Promise<{
    success: boolean;
    transactionHash?: string;
    amountPaid?: string;
    error?: string;
  }> {
    try {
      if (!this.agent) {
        await this.initializeAgent();
      }

      const result = await this.agent!.handleRoyaltyPayment(ipId, amount);
      
      return {
        success: true,
        transactionHash: this.extractTransactionHash(result),
        amountPaid: `${(Number(amount) / 1e18).toFixed(2)} IDGT`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async processUsageFee(ipId: string, ethAmount: string, userAddress: string): Promise<{
    success: boolean;
    transactionHash?: string;
    feeAmount?: string;
    error?: string;
  }> {
    try {
      if (!this.agent) {
        await this.initializeAgent();
      }

      const result = await this.agent!.handleUsageFeePayment(ipId, ethAmount);
      
      return {
        success: true,
        transactionHash: this.extractTransactionHash(result),
        feeAmount: `${(Number(ethAmount) * 0.05).toFixed(6)} ETH converted to IDGT`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getUserTokenInfo(userAddress: string): Promise<{
    balance: string;
    royalties: string;
    balanceFormatted: string;
    royaltiesFormatted: string;
  }> {
    try {
      if (!this.agent) {
        await this.initializeAgent();
      }

      return await this.agent!.getAccountSummary(userAddress);
    } catch (error) {
      return {
        balance: '0',
        royalties: '0',
        balanceFormatted: '0.00 IDGT',
        royaltiesFormatted: '0.00 IDGT'
      };
    }
  }

  async processAgentQuery(prompt: string): Promise<string> {
    try {
      if (!this.agent) {
        await this.initializeAgent();
      }

      return await this.agent!.processAgentRequest(prompt);
    } catch (error) {
      return `Error processing request: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private extractTransactionHash(result: string): string {
    const hashMatch = result.match(/Transaction: (0x[a-fA-F0-9]+)/);
    return hashMatch ? hashMatch[1] : '';
  }

  async getIDGTStats(): Promise<{
    totalSupply: string;
    totalHolders: number;
    totalRoyaltiesPaid: string;
    totalIPsRegistered: number;
  }> {
    // This would typically query the blockchain for actual stats
    // For now, return demo data structure
    return {
      totalSupply: '1,000,000 IDGT',
      totalHolders: 42,
      totalRoyaltiesPaid: '15,230.50 IDGT',
      totalIPsRegistered: 127
    };
  }
}

export const idgtService = new IDGTService(storage);