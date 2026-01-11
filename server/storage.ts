import { 
  users, reports, rewards, transactions, notifications, admins, bins, redemptionRequests,
  type User, type InsertUser, 
  type Report, type InsertReport,
  type Reward, type InsertReward,
  type Transaction, type InsertTransaction,
  type Notification, type InsertNotification,
  type Admin, type InsertAdmin,
  type Bin, type InsertBin,
  type RedemptionRequest, type InsertRedemptionRequest,
  type DashboardStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  
  // Reports
  getReport(id: number): Promise<Report | undefined>;
  getAllReports(): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReport(id: number, data: Partial<Report>): Promise<Report | undefined>;
  
  // Rewards
  getReward(id: number): Promise<Reward | undefined>;
  getAllRewards(): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  updateReward(id: number, data: Partial<Reward>): Promise<Reward | undefined>;
  deleteReward(id: number): Promise<boolean>;
  getUserReward(userId: number): Promise<Reward | undefined>;
  
  // Transactions
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Notifications
  getAllNotifications(): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  createBulkNotifications(notifications: InsertNotification[]): Promise<Notification[]>;
  
  // Admin
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Bins
  getBin(id: number): Promise<Bin | undefined>;
  getAllBins(): Promise<Bin[]>;
  createBin(bin: InsertBin): Promise<Bin>;
  updateBin(id: number, data: Partial<Bin>): Promise<Bin | undefined>;
  deleteBin(id: number): Promise<boolean>;

  // Redemption Requests
  getRedemptionRequest(id: number): Promise<RedemptionRequest | undefined>;
  getAllRedemptionRequests(): Promise<RedemptionRequest[]>;
  getUserRedemptionRequests(userId: number): Promise<RedemptionRequest[]>;
  createRedemptionRequest(request: InsertRedemptionRequest): Promise<RedemptionRequest>;
  updateRedemptionRequest(id: number, data: Partial<RedemptionRequest>): Promise<RedemptionRequest | undefined>;
  
  // Stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Reports
  async getReport(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports).orderBy(desc(reports.createdAt));
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(insertReport).returning();
    return report;
  }

  async updateReport(id: number, data: Partial<Report>): Promise<Report | undefined> {
    const [report] = await db.update(reports).set(data).where(eq(reports.id, id)).returning();
    return report || undefined;
  }

  // Rewards
  async getReward(id: number): Promise<Reward | undefined> {
    const [reward] = await db.select().from(rewards).where(eq(rewards.id, id));
    return reward || undefined;
  }

  async getAllRewards(): Promise<Reward[]> {
    return db.select().from(rewards).orderBy(desc(rewards.createdAt));
  }

  async createReward(insertReward: InsertReward): Promise<Reward> {
    const [reward] = await db.insert(rewards).values(insertReward).returning();
    return reward;
  }

  async updateReward(id: number, data: Partial<Reward>): Promise<Reward | undefined> {
    const updateData = { ...data, updatedAt: new Date() };
    const [reward] = await db.update(rewards).set(updateData).where(eq(rewards.id, id)).returning();
    return reward || undefined;
  }

  async deleteReward(id: number): Promise<boolean> {
    const result = await db.delete(rewards).where(eq(rewards.id, id)).returning();
    return result.length > 0;
  }

  async getUserReward(userId: number): Promise<Reward | undefined> {
    const [reward] = await db.select().from(rewards).where(eq(rewards.userId, userId));
    return reward || undefined;
  }

  // Transactions
  async getAllTransactions(): Promise<Transaction[]> {
    return db.select().from(transactions).orderBy(desc(transactions.date));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  // Notifications
  async getAllNotifications(): Promise<Notification[]> {
    return db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async createBulkNotifications(insertNotifications: InsertNotification[]): Promise<Notification[]> {
    if (insertNotifications.length === 0) return [];
    return db.insert(notifications).values(insertNotifications).returning();
  }

  // Admin
  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(insertAdmin).returning();
    return admin;
  }

  // Dashboard Stats
  // Bins
  async getBin(id: number): Promise<Bin | undefined> {
    const [bin] = await db.select().from(bins).where(eq(bins.id, id));
    return bin || undefined;
  }

  async getAllBins(): Promise<Bin[]> {
    return db.select().from(bins).orderBy(desc(bins.createdAt));
  }

  async createBin(insertBin: InsertBin): Promise<Bin> {
    const [bin] = await db.insert(bins).values(insertBin).returning();
    return bin;
  }

  async updateBin(id: number, data: Partial<Bin>): Promise<Bin | undefined> {
    const [bin] = await db.update(bins).set(data).where(eq(bins.id, id)).returning();
    return bin || undefined;
  }

  async deleteBin(id: number): Promise<boolean> {
    const result = await db.delete(bins).where(eq(bins.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Redemption Requests
  async getRedemptionRequest(id: number): Promise<RedemptionRequest | undefined> {
    const [request] = await db.select().from(redemptionRequests).where(eq(redemptionRequests.id, id));
    return request || undefined;
  }

  async getAllRedemptionRequests(): Promise<RedemptionRequest[]> {
    return db.select().from(redemptionRequests).orderBy(desc(redemptionRequests.createdAt));
  }

  async getUserRedemptionRequests(userId: number): Promise<RedemptionRequest[]> {
    return db.select().from(redemptionRequests).where(eq(redemptionRequests.userId, userId)).orderBy(desc(redemptionRequests.createdAt));
  }

  async createRedemptionRequest(insertRequest: InsertRedemptionRequest): Promise<RedemptionRequest> {
    const [request] = await db.insert(redemptionRequests).values(insertRequest).returning();
    return request;
  }

  async updateRedemptionRequest(id: number, data: Partial<RedemptionRequest>): Promise<RedemptionRequest | undefined> {
    const [request] = await db.update(redemptionRequests).set(data).where(eq(redemptionRequests.id, id)).returning();
    return request || undefined;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [reportCount] = await db.select({ count: sql<number>`count(*)` }).from(reports);
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(reports).where(eq(reports.status, 'pending'));
    
    const allReports = await db.select().from(reports).where(eq(reports.status, 'collected'));
    let totalWasteCollected = 0;
    for (const report of allReports) {
      const match = report.amount.match(/(\d+(\.\d+)?)/);
      if (match) {
        totalWasteCollected += parseFloat(match[0]);
      }
    }

    const [tokensResult] = await db.select({ 
      total: sql<number>`COALESCE(SUM(CASE WHEN type = 'earned' THEN amount ELSE 0 END), 0)` 
    }).from(transactions);

    return {
      totalUsers: Number(userCount?.count) || 0,
      totalReports: Number(reportCount?.count) || 0,
      pendingReports: Number(pendingCount?.count) || 0,
      totalWasteCollected: Math.round(totalWasteCollected * 10) / 10,
      tokensDistributed: Number(tokensResult?.total) || 0,
      co2Offset: Math.round(totalWasteCollected * 0.5 * 10) / 10,
    };
  }
}

export const storage = new DatabaseStorage();
