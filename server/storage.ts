import { 
  users, 
  ipAssets, 
  royaltyPayments, 
  derivativeWorks,
  type User, 
  type InsertUser,
  type IpAsset,
  type InsertIpAsset,
  type RoyaltyPayment,
  type InsertRoyaltyPayment,
  type DerivativeWork,
  type InsertDerivativeWork
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // IP Asset management
  getIpAsset(id: number): Promise<IpAsset | undefined>;
  getIpAssetByIpId(ipId: string): Promise<IpAsset | undefined>;
  getIpAssetsByUserId(userId: number): Promise<IpAsset[]>;
  createIpAsset(ipAsset: InsertIpAsset & { userId: number }): Promise<IpAsset>;
  updateIpAsset(id: number, updates: Partial<IpAsset>): Promise<IpAsset | undefined>;
  
  // Royalty management
  getRoyaltyPaymentsByIpAssetId(ipAssetId: number): Promise<RoyaltyPayment[]>;
  getRoyaltyPaymentsByUserId(userId: number): Promise<RoyaltyPayment[]>;
  createRoyaltyPayment(payment: InsertRoyaltyPayment): Promise<RoyaltyPayment>;
  updateRoyaltyPayment(id: number, updates: Partial<RoyaltyPayment>): Promise<RoyaltyPayment | undefined>;
  
  // Derivative work management
  getDerivativeWorksByParentId(parentIpId: string): Promise<DerivativeWork[]>;
  createDerivativeWork(derivative: InsertDerivativeWork): Promise<DerivativeWork>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ipAssets: Map<number, IpAsset>;
  private royaltyPayments: Map<number, RoyaltyPayment>;
  private derivativeWorks: Map<number, DerivativeWork>;
  private currentUserId: number;
  private currentIpAssetId: number;
  private currentRoyaltyId: number;
  private currentDerivativeId: number;

  constructor() {
    this.users = new Map();
    this.ipAssets = new Map();
    this.royaltyPayments = new Map();
    this.derivativeWorks = new Map();
    this.currentUserId = 1;
    this.currentIpAssetId = 1;
    this.currentRoyaltyId = 1;
    this.currentDerivativeId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      username: insertUser.username || null,
      email: insertUser.email || null
    };
    this.users.set(id, user);
    return user;
  }

  async getIpAsset(id: number): Promise<IpAsset | undefined> {
    return this.ipAssets.get(id);
  }

  async getIpAssetByIpId(ipId: string): Promise<IpAsset | undefined> {
    return Array.from(this.ipAssets.values()).find(
      (asset) => asset.ipId === ipId,
    );
  }

  async getIpAssetsByUserId(userId: number): Promise<IpAsset[]> {
    return Array.from(this.ipAssets.values()).filter(
      (asset) => asset.userId === userId,
    );
  }

  async createIpAsset(ipAssetData: InsertIpAsset & { userId: number }): Promise<IpAsset> {
    const id = this.currentIpAssetId++;
    const ipAsset: IpAsset = {
      ...ipAssetData,
      id,
      ipId: `ip_${id}_${Date.now()}`,
      status: "pending",
      createdAt: new Date(),
    };
    this.ipAssets.set(id, ipAsset);
    return ipAsset;
  }

  async updateIpAsset(id: number, updates: Partial<IpAsset>): Promise<IpAsset | undefined> {
    const existing = this.ipAssets.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.ipAssets.set(id, updated);
    return updated;
  }

  async getRoyaltyPaymentsByIpAssetId(ipAssetId: number): Promise<RoyaltyPayment[]> {
    return Array.from(this.royaltyPayments.values()).filter(
      (payment) => payment.ipAssetId === ipAssetId,
    );
  }

  async getRoyaltyPaymentsByUserId(userId: number): Promise<RoyaltyPayment[]> {
    const userAssets = await this.getIpAssetsByUserId(userId);
    const assetIds = userAssets.map(asset => asset.id);
    
    return Array.from(this.royaltyPayments.values()).filter(
      (payment) => payment.ipAssetId && assetIds.includes(payment.ipAssetId),
    );
  }

  async createRoyaltyPayment(paymentData: InsertRoyaltyPayment): Promise<RoyaltyPayment> {
    const id = this.currentRoyaltyId++;
    const payment: RoyaltyPayment = {
      ...paymentData,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.royaltyPayments.set(id, payment);
    return payment;
  }

  async updateRoyaltyPayment(id: number, updates: Partial<RoyaltyPayment>): Promise<RoyaltyPayment | undefined> {
    const existing = this.royaltyPayments.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.royaltyPayments.set(id, updated);
    return updated;
  }

  async getDerivativeWorksByParentId(parentIpId: string): Promise<DerivativeWork[]> {
    return Array.from(this.derivativeWorks.values()).filter(
      (work) => work.parentIpId === parentIpId,
    );
  }

  async createDerivativeWork(derivativeData: InsertDerivativeWork): Promise<DerivativeWork> {
    const id = this.currentDerivativeId++;
    const derivative: DerivativeWork = {
      ...derivativeData,
      id,
      createdAt: new Date(),
    };
    this.derivativeWorks.set(id, derivative);
    return derivative;
  }
}

export const storage = new MemStorage();
