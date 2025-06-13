import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  username: text("username"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ipAssets = pgTable("ip_assets", {
  id: serial("id").primaryKey(),
  ipId: text("ip_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  assetType: text("asset_type").notNull(), // 'design' or 'song'
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  ipfsHash: text("ipfs_hash"),
  metadataHash: text("metadata_hash"),
  culturalOrigin: text("cultural_origin"),
  language: text("language"),
  region: text("region"),
  creationDate: text("creation_date"),
  royaltyRate: decimal("royalty_rate", { precision: 5, scale: 2 }).default("5.00"),
  registrationTxHash: text("registration_tx_hash"),
  licenseTermsId: text("license_terms_id"),
  idgtRegistered: boolean("idgt_registered").default(false),
  idgtRewardAmount: text("idgt_reward_amount"),
  idgtTransactionHash: text("idgt_transaction_hash"),
  status: text("status").default("pending"), // 'pending', 'registered', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const royaltyPayments = pgTable("royalty_payments", {
  id: serial("id").primaryKey(),
  ipAssetId: integer("ip_asset_id").references(() => ipAssets.id),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: text("currency").default("WIP"),
  claimerAddress: text("claimer_address").notNull(),
  txHash: text("tx_hash"),
  status: text("status").default("pending"), // 'pending', 'claimed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const derivativeWorks = pgTable("derivative_works", {
  id: serial("id").primaryKey(),
  parentIpId: text("parent_ip_id").notNull(),
  childIpId: text("child_ip_id").notNull(),
  licenseTermsId: text("license_terms_id").notNull(),
  registrationTxHash: text("registration_tx_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
  username: true,
  email: true,
});

export const insertIpAssetSchema = createInsertSchema(ipAssets).pick({
  title: true,
  description: true,
  assetType: true,
  fileName: true,
  fileSize: true,
  culturalOrigin: true,
  language: true,
  region: true,
  creationDate: true,
  royaltyRate: true,
});

export const insertRoyaltyPaymentSchema = createInsertSchema(royaltyPayments).pick({
  ipAssetId: true,
  amount: true,
  currency: true,
  claimerAddress: true,
});

export const insertDerivativeWorkSchema = createInsertSchema(derivativeWorks).pick({
  parentIpId: true,
  childIpId: true,
  licenseTermsId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertIpAsset = z.infer<typeof insertIpAssetSchema>;
export type IpAsset = typeof ipAssets.$inferSelect;
export type InsertRoyaltyPayment = z.infer<typeof insertRoyaltyPaymentSchema>;
export type RoyaltyPayment = typeof royaltyPayments.$inferSelect;
export type InsertDerivativeWork = z.infer<typeof insertDerivativeWorkSchema>;
export type DerivativeWork = typeof derivativeWorks.$inferSelect;
