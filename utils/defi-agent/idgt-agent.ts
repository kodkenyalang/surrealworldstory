import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { http, createWalletClient, createPublicClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// Story Aeneid Testnet configuration
const storyAeneidTestnet = {
  id: 1513,
  name: 'Story Aeneid Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.story.foundation'],
    },
  },
  blockExplorers: {
    default: { name: 'Story Explorer', url: 'https://explorer.story.foundation' },
  },
} as const;

// IDGT Token Contract ABI (simplified)
const IDGT_TOKEN_ABI = [
  {
    "inputs": [{"name": "owner", "type": "address"}, {"name": "ipId", "type": "string"}],
    "name": "registerIP",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "ipId", "type": "string"}, {"name": "amount", "type": "uint256"}],
    "name": "payRoyalty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "ipId", "type": "string"}],
    "name": "payUsageFee",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}],
    "name": "getUserRoyalties",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export class IDGTDefiAgent {
  private walletClient: any;
  private publicClient: any;
  private openai: any;
  private storyIPTokenAddress: `0x${string}`;

  constructor(privateKey: string, rpcUrl: string, storyIPTokenAddress: string) {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    
    this.walletClient = createWalletClient({
      account: account,
      transport: http(rpcUrl),
      chain: storyAeneidTestnet,
    });

    this.publicClient = createPublicClient({
      transport: http(rpcUrl),
      chain: storyAeneidTestnet,
    });

    this.storyIPTokenAddress = storyIPTokenAddress as `0x${string}`;
    
    // Initialize OpenRouter
    this.openai = createOpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }

  async initialize() {
    // Simplified initialization without GOAT SDK
    console.log('IDGT DeFi Agent initialized for Story Protocol');
  }

  async processIPRegistration(ownerAddress: string, ipId: string): Promise<string> {
    try {
      // Register IP and mint Story Protocol IP tokens
      const hash = await this.walletClient.writeContract({
        address: this.storyIPTokenAddress,
        abi: IDGT_TOKEN_ABI,
        functionName: 'registerIP',
        args: [ownerAddress as `0x${string}`, ipId],
      });

      return `IP ${ipId} registered for owner ${ownerAddress}. Transaction: ${hash}. 100 IP tokens minted as reward.`;
    } catch (error) {
      throw new Error(`Failed to register IP: ${error}`);
    }
  }

  async payRoyalty(ipId: string, amount: bigint): Promise<string> {
    try {
      const hash = await this.walletClient.writeContract({
        address: this.storyIPTokenAddress,
        abi: IDGT_TOKEN_ABI,
        functionName: 'payRoyalty',
        args: [ipId, amount],
      });

      return `Royalty payment of ${amount} IP tokens for IP ${ipId} completed. Transaction: ${hash}`;
    } catch (error) {
      throw new Error(`Failed to pay royalty: ${error}`);
    }
  }

  async payUsageFee(ipId: string, ethAmount: bigint): Promise<string> {
    try {
      const hash = await this.walletClient.writeContract({
        address: this.storyIPTokenAddress,
        abi: IDGT_TOKEN_ABI,
        functionName: 'payUsageFee',
        args: [ipId],
        value: ethAmount,
      });

      return `Usage fee paid for IP ${ipId}. Transaction: ${hash}. Fee converted to IP tokens and paid to IP owner.`;
    } catch (error) {
      throw new Error(`Failed to pay usage fee: ${error}`);
    }
  }

  async getUserBalance(userAddress: string): Promise<bigint> {
    try {
      const balance = await this.publicClient.readContract({
        address: this.storyIPTokenAddress,
        abi: IDGT_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`],
      });

      return balance as bigint;
    } catch (error) {
      throw new Error(`Failed to get user balance: ${error}`);
    }
  }

  async getUserRoyalties(userAddress: string): Promise<bigint> {
    try {
      const royalties = await this.publicClient.readContract({
        address: this.storyIPTokenAddress,
        abi: IDGT_TOKEN_ABI,
        functionName: 'getUserRoyalties',
        args: [userAddress as `0x${string}`],
      });

      return royalties as bigint;
    } catch (error) {
      throw new Error(`Failed to get user royalties: ${error}`);
    }
  }

  async processAgentRequest(prompt: string): Promise<string> {
    try {
      const result = await generateText({
        model: this.openai("gpt-4o-mini"),
        prompt: `
        You are the IDGT (Indigenous Digital Governance Token) DeFi Agent for VerifydIP platform on Story Protocol.
        
        Your capabilities:
        1. Register IP assets and mint Story Protocol IP tokens as rewards
        2. Process royalty payments between users using Story Protocol tokens
        3. Handle usage fees for IP assets on Story Aeneid Testnet
        4. Check user balances and royalty earnings
        5. Manage indigenous cultural IP protection and monetization
        
        Story Protocol Integration:
        - Network: Story Aeneid Testnet (Chain ID: 1513)
        - Native Token: IP token
        - Focus: Indigenous cultural heritage protection
        
        User request: ${prompt}
        
        Always prioritize indigenous creators' rights and fair compensation through the Story Protocol token system.
        Provide specific guidance on IP registration, royalty collection, and cultural heritage protection.
        `,
      });

      return result.text;
    } catch (error) {
      throw new Error(`Failed to process agent request: ${error}`);
    }
  }

  // Utility functions for the agent
  async handleIPRegistrationRequest(ipId: string, ownerAddress: string): Promise<string> {
    return await this.processIPRegistration(ownerAddress, ipId);
  }

  async handleRoyaltyPayment(ipId: string, amount: string): Promise<string> {
    const amountBigInt = BigInt(amount);
    return await this.payRoyalty(ipId, amountBigInt);
  }

  async handleUsageFeePayment(ipId: string, ethAmount: string): Promise<string> {
    const ethAmountBigInt = BigInt(ethAmount);
    return await this.payUsageFee(ipId, ethAmountBigInt);
  }

  async getAccountSummary(userAddress: string): Promise<{
    balance: string;
    royalties: string;
    balanceFormatted: string;
    royaltiesFormatted: string;
  }> {
    const balance = await this.getUserBalance(userAddress);
    const royalties = await this.getUserRoyalties(userAddress);

    return {
      balance: balance.toString(),
      royalties: royalties.toString(),
      balanceFormatted: `${(Number(balance) / 1e18).toFixed(2)} IDGT`,
      royaltiesFormatted: `${(Number(royalties) / 1e18).toFixed(2)} IDGT`,
    };
  }
}

export default IDGTDefiAgent;