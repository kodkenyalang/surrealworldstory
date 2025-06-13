import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { idgtService } from "./idgt-service";
import { insertUserSchema, insertIpAssetSchema, insertRoyaltyPaymentSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/svg+xml',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByWalletAddress(userData.walletAddress);
      if (existingUser) {
        return res.json(existingUser);
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users/wallet/:address", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserByWalletAddress(req.params.address);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // IP Asset routes
  app.post("/api/ip-assets", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const ipAssetData = insertIpAssetSchema.parse({
        ...req.body,
        fileName: req.file.filename,
        fileSize: req.file.size,
      });

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const ipAsset = await storage.createIpAsset({
        ...ipAssetData,
        userId: parseInt(userId),
      });

      res.json(ipAsset);
    } catch (error) {
      console.error('Error creating IP asset:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid IP asset data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create IP asset" });
    }
  });

  app.get("/api/ip-assets/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const ipAssets = await storage.getIpAssetsByUserId(userId);
      res.json(ipAssets);
    } catch (error) {
      console.error('Error fetching IP assets:', error);
      res.status(500).json({ message: "Failed to fetch IP assets" });
    }
  });

  app.get("/api/ip-assets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const ipAsset = await storage.getIpAsset(id);
      if (!ipAsset) {
        return res.status(404).json({ message: "IP asset not found" });
      }
      res.json(ipAsset);
    } catch (error) {
      console.error('Error fetching IP asset:', error);
      res.status(500).json({ message: "Failed to fetch IP asset" });
    }
  });

  app.patch("/api/ip-assets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedAsset = await storage.updateIpAsset(id, updates);
      if (!updatedAsset) {
        return res.status(404).json({ message: "IP asset not found" });
      }
      
      res.json(updatedAsset);
    } catch (error) {
      console.error('Error updating IP asset:', error);
      res.status(500).json({ message: "Failed to update IP asset" });
    }
  });

  // Verification route
  app.get("/api/verify/:ipId", async (req: Request, res: Response) => {
    try {
      const ipAsset = await storage.getIpAssetByIpId(req.params.ipId);
      if (!ipAsset) {
        return res.status(404).json({ message: "IP asset not found", verified: false });
      }
      
      const user = ipAsset.userId ? await storage.getUser(ipAsset.userId) : null;
      const derivatives = await storage.getDerivativeWorksByParentId(ipAsset.ipId);
      
      res.json({
        verified: true,
        asset: ipAsset,
        owner: user,
        derivatives: derivatives.length,
      });
    } catch (error) {
      console.error('Error verifying IP:', error);
      res.status(500).json({ message: "Failed to verify IP" });
    }
  });

  // Royalty routes
  app.get("/api/royalties/user/:userId", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const royalties = await storage.getRoyaltyPaymentsByUserId(userId);
      
      const totalEarned = royalties
        .filter(r => r.status === 'claimed')
        .reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
        
      const availableToClaim = royalties
        .filter(r => r.status === 'pending')
        .reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
      
      res.json({
        payments: royalties,
        totalEarned,
        availableToClaim,
      });
    } catch (error) {
      console.error('Error fetching royalties:', error);
      res.status(500).json({ message: "Failed to fetch royalties" });
    }
  });

  app.post("/api/royalties", async (req: Request, res: Response) => {
    try {
      const royaltyData = insertRoyaltyPaymentSchema.parse(req.body);
      const royalty = await storage.createRoyaltyPayment(royaltyData);
      res.json(royalty);
    } catch (error) {
      console.error('Error creating royalty payment:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid royalty data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create royalty payment" });
    }
  });

  app.patch("/api/royalties/:id/claim", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { txHash } = req.body;
      
      const updatedRoyalty = await storage.updateRoyaltyPayment(id, {
        status: 'claimed',
        txHash,
      });
      
      if (!updatedRoyalty) {
        return res.status(404).json({ message: "Royalty payment not found" });
      }
      
      res.json(updatedRoyalty);
    } catch (error) {
      console.error('Error claiming royalty:', error);
      res.status(500).json({ message: "Failed to claim royalty" });
    }
  });

  // Story Protocol integration routes
  app.post("/api/story/register-ip", async (req: Request, res: Response) => {
    try {
      const { ipAssetId, parentIpIds, licenseTermsIds } = req.body;
      
      // This would integrate with the actual Story Protocol SDK
      // For now, we'll simulate the registration process
      const mockIpId = `0x${Math.random().toString(16).substr(2, 40)}`;
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      // Update the IP asset with registration details
      await storage.updateIpAsset(parseInt(ipAssetId), {
        ipId: mockIpId,
        registrationTxHash: mockTxHash,
        status: 'registered',
      });
      
      res.json({
        ipId: mockIpId,
        txHash: mockTxHash,
        success: true,
      });
    } catch (error) {
      console.error('Error registering IP:', error);
      res.status(500).json({ message: "Failed to register IP" });
    }
  });

  app.post("/api/story/claim-revenue", async (req: Request, res: Response) => {
    try {
      const { ancestorIpId, claimer, childIpIds, royaltyPolicies, currencyTokens } = req.body;
      
      // This would integrate with the actual Story Protocol SDK
      // For now, we'll simulate the revenue claiming process
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const mockClaimedAmount = (Math.random() * 10).toFixed(2);
      
      res.json({
        txHash: mockTxHash,
        claimedAmount: mockClaimedAmount,
        currency: 'WIP',
        success: true,
      });
    } catch (error) {
      console.error('Error claiming revenue:', error);
      res.status(500).json({ message: "Failed to claim revenue" });
    }
  });

  // IDGT Token System Routes
  app.post("/api/idgt/register-ip", async (req: Request, res: Response) => {
    try {
      const { ipAssetId, ownerAddress, ipId } = req.body;
      
      if (!ipAssetId || !ownerAddress || !ipId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await idgtService.processIPRegistration(ipAssetId, ownerAddress, ipId);
      
      if (result.success) {
        res.json({
          success: true,
          message: "IP registered successfully and IDGT tokens awarded",
          transactionHash: result.transactionHash,
          tokensAwarded: result.tokensAwarded
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.error || "Failed to register IP"
        });
      }
    } catch (error) {
      console.error('Error registering IP for IDGT:', error);
      res.status(500).json({ message: "Failed to register IP" });
    }
  });

  app.post("/api/idgt/pay-royalty", async (req: Request, res: Response) => {
    try {
      const { ipId, amount, payerAddress } = req.body;
      
      if (!ipId || !amount || !payerAddress) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await idgtService.processRoyaltyPayment(ipId, amount, payerAddress);
      
      res.json({
        success: result.success,
        message: result.success ? "Royalty payment processed successfully" : result.error,
        transactionHash: result.transactionHash,
        amountPaid: result.amountPaid
      });
    } catch (error) {
      console.error('Error processing royalty payment:', error);
      res.status(500).json({ message: "Failed to process royalty payment" });
    }
  });

  app.post("/api/idgt/pay-usage-fee", async (req: Request, res: Response) => {
    try {
      const { ipId, ethAmount, userAddress } = req.body;
      
      if (!ipId || !ethAmount || !userAddress) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const result = await idgtService.processUsageFee(ipId, ethAmount, userAddress);
      
      res.json({
        success: result.success,
        message: result.success ? "Usage fee processed successfully" : result.error,
        transactionHash: result.transactionHash,
        feeAmount: result.feeAmount
      });
    } catch (error) {
      console.error('Error processing usage fee:', error);
      res.status(500).json({ message: "Failed to process usage fee" });
    }
  });

  app.get("/api/idgt/user/:address", async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      
      if (!address) {
        return res.status(400).json({ message: "User address required" });
      }

      const tokenInfo = await idgtService.getUserTokenInfo(address);
      res.json(tokenInfo);
    } catch (error) {
      console.error('Error fetching user token info:', error);
      res.status(500).json({ message: "Failed to fetch token information" });
    }
  });

  app.get("/api/idgt/stats", async (req: Request, res: Response) => {
    try {
      const stats = await idgtService.getIDGTStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching IDGT stats:', error);
      res.status(500).json({ message: "Failed to fetch IDGT statistics" });
    }
  });

  app.post("/api/idgt/agent", async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt required" });
      }

      const response = await idgtService.processAgentQuery(prompt);
      res.json({ response });
    } catch (error) {
      console.error('Error processing agent query:', error);
      res.status(500).json({ message: "Failed to process agent request" });
    }
  });

  // DeFi Ecosystem Routes
  
  // Liquid Staking Routes
  app.get("/api/defi/staking/:address", async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      
      // Mock staking data - would integrate with actual smart contract
      const stakingData = {
        stakedAmount: "1000.0",
        lstBalance: "1050.0",
        rewards: "50.0",
        exchangeRate: "1.05",
        unstakeRequests: [],
        totalValueLocked: "50000000.0"
      };
      
      res.json(stakingData);
    } catch (error) {
      console.error('Error fetching staking data:', error);
      res.status(500).json({ message: "Failed to fetch staking data" });
    }
  });

  app.post("/api/defi/stake", async (req: Request, res: Response) => {
    try {
      const { amount, userAddress } = req.body;
      
      if (!amount || !userAddress) {
        return res.status(400).json({ message: "Amount and user address required" });
      }

      // Mock staking transaction - would interact with LST contract
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const lstMinted = (parseFloat(amount) * 1.0).toString(); // 1:1 exchange rate initially
      
      res.json({
        success: true,
        transactionHash: txHash,
        lstMinted,
        message: `Staked ${amount} tokens and minted ${lstMinted} LST`
      });
    } catch (error) {
      console.error('Error staking tokens:', error);
      res.status(500).json({ message: "Failed to stake tokens" });
    }
  });

  app.post("/api/defi/unstake", async (req: Request, res: Response) => {
    try {
      const { amount, userAddress } = req.body;
      
      if (!amount || !userAddress) {
        return res.status(400).json({ message: "Amount and user address required" });
      }

      // Mock unstaking request - would interact with LST contract
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const unlockTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days from now
      
      res.json({
        success: true,
        transactionHash: txHash,
        unlockTime,
        message: `Unstake request for ${amount} LST submitted. Unlock in 7 days.`
      });
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      res.status(500).json({ message: "Failed to unstake tokens" });
    }
  });

  // IP Registry Routes
  app.get("/api/defi/ip-registry/:address", async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      
      // Mock IP registry data - would query LoomIPRegistry contract
      const ipRegistryData = {
        ownedTokens: [
          {
            tokenId: 1,
            patternName: "Batak Ulos Sacred Pattern",
            culturalOrigin: "Batak",
            artisanName: "Maria Simbolon",
            isVerified: true,
            royaltyPercentage: 5,
            registrationDate: "2024-01-15"
          },
          {
            tokenId: 2,
            patternName: "Javanese Batik Kawung",
            culturalOrigin: "Javanese",
            artisanName: "Pak Suharto",
            isVerified: false,
            royaltyPercentage: 3,
            registrationDate: "2024-01-20"
          }
        ],
        totalRegistered: 127,
        verifiedCount: 89
      };
      
      res.json(ipRegistryData);
    } catch (error) {
      console.error('Error fetching IP registry data:', error);
      res.status(500).json({ message: "Failed to fetch IP registry data" });
    }
  });

  app.post("/api/defi/register-ip", async (req: Request, res: Response) => {
    try {
      const { 
        culturalOrigin, 
        artisanName, 
        patternName, 
        technique, 
        materials, 
        region, 
        tribe, 
        royaltyPercentage,
        ownerAddress 
      } = req.body;
      
      if (!culturalOrigin || !patternName || !ownerAddress) {
        return res.status(400).json({ message: "Cultural origin, pattern name, and owner address required" });
      }

      // Mock IP registration - would interact with LoomIPRegistry contract
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const tokenId = Math.floor(Math.random() * 10000) + 1;
      
      res.json({
        success: true,
        transactionHash: txHash,
        tokenId,
        message: `IP pattern "${patternName}" registered successfully`,
        metadata: {
          culturalOrigin,
          artisanName,
          patternName,
          technique,
          materials,
          region,
          tribe,
          royaltyPercentage
        }
      });
    } catch (error) {
      console.error('Error registering IP:', error);
      res.status(500).json({ message: "Failed to register IP" });
    }
  });

  // Stablecoin Borrowing Routes
  app.get("/api/defi/loan/:address", async (req: Request, res: Response) => {
    try {
      const { address } = req.params;
      
      // Mock loan data - would query IPStablecoin contract
      const loanData = {
        hasPosition: true,
        collateralAmount: "500.0",
        borrowedAmount: "400.0",
        accruedInterest: "12.0",
        healthFactor: 125,
        utilizationRatio: 82,
        collateralValue: "525.0",
        borrowingCapacity: "472.5",
        liquidationThreshold: "498.75",
        interestRate: 3.0
      };
      
      res.json(loanData);
    } catch (error) {
      console.error('Error fetching loan data:', error);
      res.status(500).json({ message: "Failed to fetch loan data" });
    }
  });

  app.post("/api/defi/borrow", async (req: Request, res: Response) => {
    try {
      const { collateralAmount, borrowAmount, userAddress } = req.body;
      
      if (!collateralAmount || !borrowAmount || !userAddress) {
        return res.status(400).json({ message: "Collateral amount, borrow amount, and user address required" });
      }

      // Validate borrowing capacity (90% LTV)
      const collateralValue = parseFloat(collateralAmount) * 100; // Mock $100 per LST
      const maxBorrowable = collateralValue * 0.9;
      
      if (parseFloat(borrowAmount) > maxBorrowable) {
        return res.status(400).json({ 
          message: `Borrow amount exceeds 90% LTV. Max borrowable: ${maxBorrowable.toFixed(2)} IPUSD` 
        });
      }

      // Mock borrowing transaction - would interact with IPStablecoin contract
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      res.json({
        success: true,
        transactionHash: txHash,
        collateralDeposited: collateralAmount,
        stablecoinMinted: borrowAmount,
        healthFactor: ((collateralValue * 0.95) / parseFloat(borrowAmount)) * 100,
        message: `Borrowed ${borrowAmount} IPUSD against ${collateralAmount} LST collateral`
      });
    } catch (error) {
      console.error('Error borrowing stablecoin:', error);
      res.status(500).json({ message: "Failed to borrow stablecoin" });
    }
  });

  app.post("/api/defi/repay", async (req: Request, res: Response) => {
    try {
      const { amount, userAddress } = req.body;
      
      if (!amount || !userAddress) {
        return res.status(400).json({ message: "Amount and user address required" });
      }

      // Mock repayment transaction - would interact with IPStablecoin contract
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const interestPaid = parseFloat(amount) * 0.03; // 3% of repayment as interest
      const principalPaid = parseFloat(amount) - interestPaid;
      
      res.json({
        success: true,
        transactionHash: txHash,
        totalRepaid: amount,
        principalPaid: principalPaid.toFixed(2),
        interestPaid: interestPaid.toFixed(2),
        message: `Repaid ${amount} IPUSD (${principalPaid.toFixed(2)} principal + ${interestPaid.toFixed(2)} interest)`
      });
    } catch (error) {
      console.error('Error repaying loan:', error);
      res.status(500).json({ message: "Failed to repay loan" });
    }
  });

  // DeFi Statistics
  app.get("/api/defi/stats", async (req: Request, res: Response) => {
    try {
      const stats = {
        totalValueLocked: "50,000,000",
        totalStaked: "35,000,000",
        totalBorrowed: "28,000,000",
        averageHealthFactor: 145,
        registeredPatterns: 127,
        verifiedPatterns: 89,
        activeBorrowers: 1234,
        liquidationEvents: 12
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching DeFi stats:', error);
      res.status(500).json({ message: "Failed to fetch DeFi statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
