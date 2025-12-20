import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import { adminLoginSchema, userLoginSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed default admin if not exists
  async function seedAdmin() {
    const existingAdmin = await storage.getAdminByEmail("mrrameez32@gmail.com");
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("rameez1122", 10);
      await storage.createAdmin({
        email: "mrrameez32@gmail.com",
        password: hashedPassword,
        name: "Admin",
      });
      console.log("Default admin created");
    }
  }
  
  // Initialize admin on startup
  seedAdmin().catch(console.error);

  // User login/register
  app.post("/api/users/login", async (req, res) => {
    try {
      const { email, name } = userLoginSchema.parse(req.body);
      
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({ email, name });
      }
      
      res.json({ user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("User login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // User reports
  app.post("/api/users/reports", async (req, res) => {
    try {
      const { userId, location, wasteType, amount } = req.body;
      
      if (!userId || !location || !wasteType || !amount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const report = await storage.createReport({
        userId: parseInt(userId),
        location,
        wasteType,
        amount: amount.toString(),
        status: "pending",
      });

      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.get("/api/users/:userId/reports", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const allReports = await storage.getAllReports();
      const userReports = allReports.filter(r => r.userId === userId);
      res.json(userReports);
    } catch (error) {
      console.error("Error fetching user reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // User transactions
  app.get("/api/users/:userId/transactions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const allTransactions = await storage.getAllTransactions();
      const userTransactions = allTransactions.filter(t => t.userId === userId);
      res.json(userTransactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // User rewards
  app.get("/api/users/:userId/rewards", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const reward = await storage.getUserReward(userId);
      res.json(reward);
    } catch (error) {
      console.error("Error fetching user rewards:", error);
      res.status(500).json({ error: "Failed to fetch rewards" });
    }
  });

  // Public stats endpoint
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);
      
      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Return admin without password
      const { password: _, ...adminWithoutPassword } = admin;
      res.json({ admin: adminWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid input", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Admin stats
  app.get("/api/admin/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Users management
  app.get("/api/admin/users", async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Get rewards for each user
      const usersWithRewards = await Promise.all(
        users.map(async (user) => {
          const reward = await storage.getUserReward(user.id);
          return { ...user, reward };
        })
      );
      res.json(usersWithRewards);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/:id/tokens", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { amount } = req.body;

      if (typeof amount !== "number") {
        return res.status(400).json({ error: "Amount must be a number" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get or create user's reward
      let reward = await storage.getUserReward(userId);
      if (reward) {
        const newPoints = Math.max(0, reward.points + amount);
        reward = await storage.updateReward(reward.id, { points: newPoints });
      } else {
        reward = await storage.createReward({
          userId,
          points: Math.max(0, amount),
          level: 1,
          isAvailable: true,
          name: `${user.name}'s Reward`,
          collectionInfo: "User reward balance",
        });
      }

      // Create transaction record
      await storage.createTransaction({
        userId,
        type: amount >= 0 ? "earned" : "redeemed",
        amount: Math.abs(amount),
        description: amount >= 0 ? "Admin token adjustment (added)" : "Admin token adjustment (removed)",
      });

      res.json({ success: true, reward });
    } catch (error) {
      console.error("Error adjusting tokens:", error);
      res.status(500).json({ error: "Failed to adjust tokens" });
    }
  });

  // Reports management
  app.get("/api/admin/reports", async (_req, res) => {
    try {
      const reports = await storage.getAllReports();
      // Get user info for each report
      const reportsWithUsers = await Promise.all(
        reports.map(async (report) => {
          const user = await storage.getUser(report.userId);
          const collector = report.collectorId ? await storage.getUser(report.collectorId) : undefined;
          return { ...report, user, collector };
        })
      );
      res.json(reportsWithUsers);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.patch("/api/admin/reports/:id", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const report = await storage.updateReport(reportId, { status });
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      // If verified, award tokens to the user
      if (status === "verified") {
        const user = await storage.getUser(report.userId);
        if (user) {
          const match = report.amount.match(/(\d+(\.\d+)?)/);
          const wasteAmount = match ? parseFloat(match[0]) : 10;
          const tokenReward = Math.round(wasteAmount * 10);

          let reward = await storage.getUserReward(report.userId);
          if (reward) {
            await storage.updateReward(reward.id, { points: reward.points + tokenReward });
          } else {
            await storage.createReward({
              userId: report.userId,
              points: tokenReward,
              level: 1,
              isAvailable: true,
              name: `${user.name}'s Reward`,
              collectionInfo: "User reward balance",
            });
          }

          await storage.createTransaction({
            userId: report.userId,
            type: "earned",
            amount: tokenReward,
            description: `Reward for verified waste report`,
          });
        }
      }

      res.json(report);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ error: "Failed to update report" });
    }
  });

  app.patch("/api/admin/reports/:id/assign", async (req, res) => {
    try {
      const reportId = parseInt(req.params.id);
      const { collectorId } = req.body;

      if (!collectorId) {
        return res.status(400).json({ error: "Collector ID is required" });
      }

      const collector = await storage.getUser(parseInt(collectorId));
      if (!collector) {
        return res.status(404).json({ error: "Collector not found" });
      }

      const report = await storage.updateReport(reportId, { 
        collectorId: parseInt(collectorId),
        status: "in_progress"
      });
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      // Notify the collector
      await storage.createNotification({
        userId: parseInt(collectorId),
        message: `You have been assigned to collect waste at ${report.location}`,
        type: "info",
      });

      res.json(report);
    } catch (error) {
      console.error("Error assigning collector:", error);
      res.status(500).json({ error: "Failed to assign collector" });
    }
  });

  // Rewards management
  app.get("/api/admin/rewards", async (_req, res) => {
    try {
      const rewards = await storage.getAllRewards();
      res.json(rewards);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      res.status(500).json({ error: "Failed to fetch rewards" });
    }
  });

  app.post("/api/admin/rewards", async (req, res) => {
    try {
      const { name, description, points, collectionInfo, isAvailable } = req.body;

      if (!name || !points || !collectionInfo) {
        return res.status(400).json({ error: "Name, points, and collection info are required" });
      }

      // For admin-created rewards, we use a system user ID (0)
      const reward = await storage.createReward({
        userId: 0,
        name,
        description: description || "",
        points: parseInt(points),
        collectionInfo,
        isAvailable: isAvailable !== false,
        level: 1,
      });

      res.status(201).json(reward);
    } catch (error) {
      console.error("Error creating reward:", error);
      res.status(500).json({ error: "Failed to create reward" });
    }
  });

  app.patch("/api/admin/rewards/:id", async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const updateData = req.body;

      const reward = await storage.updateReward(rewardId, updateData);
      if (!reward) {
        return res.status(404).json({ error: "Reward not found" });
      }

      res.json(reward);
    } catch (error) {
      console.error("Error updating reward:", error);
      res.status(500).json({ error: "Failed to update reward" });
    }
  });

  app.delete("/api/admin/rewards/:id", async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const deleted = await storage.deleteReward(rewardId);
      
      if (!deleted) {
        return res.status(404).json({ error: "Reward not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting reward:", error);
      res.status(500).json({ error: "Failed to delete reward" });
    }
  });

  // Transactions
  app.get("/api/admin/transactions", async (_req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      // Get user info for each transaction
      const transactionsWithUsers = await Promise.all(
        transactions.map(async (tx) => {
          const user = await storage.getUser(tx.userId);
          return { ...tx, user };
        })
      );
      res.json(transactionsWithUsers);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Notifications
  app.get("/api/admin/notifications", async (_req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      // Get user info for each notification
      const notificationsWithUsers = await Promise.all(
        notifications.map(async (notification) => {
          const user = await storage.getUser(notification.userId);
          return { ...notification, user };
        })
      );
      res.json(notificationsWithUsers);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/admin/notifications", async (req, res) => {
    try {
      const { message, type, userId } = req.body;

      if (!message || !type) {
        return res.status(400).json({ error: "Message and type are required" });
      }

      if (userId) {
        // Send to specific user
        const user = await storage.getUser(parseInt(userId));
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const notification = await storage.createNotification({
          userId: parseInt(userId),
          message,
          type,
        });

        res.status(201).json(notification);
      } else {
        // Send to all users
        const allUsers = await storage.getAllUsers();
        if (allUsers.length === 0) {
          return res.status(400).json({ error: "No users to notify" });
        }

        const notificationsData = allUsers.map(user => ({
          userId: user.id,
          message,
          type,
        }));

        const notifications = await storage.createBulkNotifications(notificationsData);
        res.status(201).json({ 
          success: true, 
          count: notifications.length,
          message: `Notification sent to ${notifications.length} users`
        });
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  return httpServer;
}
