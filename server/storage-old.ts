import {
  users, companies, integrations, kpiMetrics, chartData,
  aiRecommendations, activities, notifications,
  type IUser, type InsertUser, type ICompany, type InsertCompany,
  type IIntegration, type InsertIntegration, type IKpiMetric, type InsertKpiMetric,
  type IChartData, type InsertChartData, type IAiRecommendation, type InsertAiRecommendation,
  type IActivity, type InsertActivity, type INotification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<IUser | undefined>;
  getUserByEmail(email: string): Promise<IUser | undefined>;
  createUser(user: InsertUser): Promise<IUser>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<IUser | undefined>;
  updateUserLastActive(id: string): Promise<void>;

  // Company methods
  getCompany(id: string): Promise<ICompany | undefined>;
  createCompany(company: InsertCompany): Promise<ICompany>;
  updateCompany(id: string, updates: Partial<InsertCompany>): Promise<ICompany | undefined>;
  getCompanyUsers(companyId: string): Promise<IUser[]>;

  // Integration methods
  getCompanyIntegrations(companyId: string): Promise<IIntegration[]>;
  getIntegration(id: string): Promise<IIntegration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<IIntegration>;
  updateIntegration(id: string, updates: Partial<InsertIntegration>): Promise<IIntegration | undefined>;
  deleteIntegration(id: string): Promise<boolean>;

  // KPI methods
  getCompanyKpiMetrics(companyId: string): Promise<IKpiMetric[]>;
  createKpiMetric(metric: InsertKpiMetric): Promise<IKpiMetric>;
  updateKpiMetric(id: string, updates: Partial<InsertKpiMetric>): Promise<IKpiMetric | undefined>;

  // Chart data methods
  getCompanyChartData(companyId: string, chartType?: string): Promise<IChartData[]>;
  createChartData(data: InsertChartData): Promise<IChartData>;
  getRevenueChartData(companyId: string, days?: number): Promise<IChartData[]>;
  getUserChartData(companyId: string): Promise<IChartData[]>;

  // AI recommendations methods
  getCompanyAiRecommendations(companyId: string): Promise<IAiRecommendation[]>;
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<IAiRecommendation>;
  updateAiRecommendation(id: string, updates: Partial<InsertAiRecommendation>): Promise<IAiRecommendation | undefined>;

  // Activity methods
  getCompanyActivities(companyId: string, limit?: number): Promise<IActivity[]>;
  createActivity(activity: InsertActivity): Promise<IActivity>;

  // Notification methods
  getUserNotifications(userId: string): Promise<INotification[]>;
  createNotification(notification: InsertNotification): Promise<INotification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  getUnreadNotificationCount(userId: string): Promise<number>;

  sessionStore: any;
}

export class PostgreSQLStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: string): Promise<IUser | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    try {
      const result = await db.insert(users).values({
        ...insertUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<IUser | undefined> {
    try {
      const result = await db.update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async updateUserLastActive(id: string): Promise<void> {
    try {
      await db.update(users)
        .set({ lastActiveAt: new Date() })
        .where(eq(users.id, id));
    } catch (error) {
      console.error('Error updating user last active:', error);
    }
  }

  // Company methods
  async getCompany(id: string): Promise<ICompany | undefined> {
    try {
      const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting company:', error);
      return undefined;
    }
  }

  async createCompany(insertCompany: InsertCompany): Promise<ICompany> {
    try {
      const result = await db.insert(companies).values({
        ...insertCompany,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<ICompany | undefined> {
    try {
      const result = await db.update(companies)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(companies.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating company:', error);
      return undefined;
    }
  }

  async getCompanyUsers(companyId: string): Promise<IUser[]> {
    try {
      const result = await db.select().from(users).where(eq(users.companyId, companyId));
      return result;
    } catch (error) {
      console.error('Error getting company users:', error);
      return [];
    }
  }

  // Integration methods
  async getCompanyIntegrations(companyId: string): Promise<IIntegration[]> {
    try {
      const integrations = await Integration.find({ companyId: new mongoose.Types.ObjectId(companyId) });
      return integrations;
    } catch (error) {
      console.error('Error getting company integrations:', error);
      return [];
    }
  }

  async getIntegration(id: string): Promise<IIntegration | undefined> {
    try {
      const integration = await Integration.findById(id);
      return integration || undefined;
    } catch (error) {
      console.error('Error getting integration:', error);
      return undefined;
    }
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<IIntegration> {
    try {
      const integrationData = {
        ...insertIntegration,
        companyId: new mongoose.Types.ObjectId(insertIntegration.companyId)
      };
      const integration = new Integration(integrationData);
      await integration.save();
      return integration;
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  }

  async updateIntegration(id: string, updates: Partial<InsertIntegration>): Promise<IIntegration | undefined> {
    try {
      const updateData = {
        ...updates,
        companyId: updates.companyId ? new mongoose.Types.ObjectId(updates.companyId) : undefined,
        updatedAt: new Date()
      };
      const integration = await Integration.findByIdAndUpdate(id, updateData, { new: true });
      return integration || undefined;
    } catch (error) {
      console.error('Error updating integration:', error);
      return undefined;
    }
  }

  async deleteIntegration(id: string): Promise<boolean> {
    try {
      const result = await Integration.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting integration:', error);
      return false;
    }
  }

  // KPI methods
  async getCompanyKpiMetrics(companyId: string): Promise<IKpiMetric[]> {
    try {
      const kpiMetrics = await KpiMetric.find({ companyId: new mongoose.Types.ObjectId(companyId) });
      return kpiMetrics;
    } catch (error) {
      console.error('Error getting company KPI metrics:', error);
      return [];
    }
  }

  async createKpiMetric(insertMetric: InsertKpiMetric): Promise<IKpiMetric> {
    try {
      const metricData = {
        ...insertMetric,
        companyId: new mongoose.Types.ObjectId(insertMetric.companyId)
      };
      const metric = new KpiMetric(metricData);
      await metric.save();
      return metric;
    } catch (error) {
      console.error('Error creating KPI metric:', error);
      throw error;
    }
  }

  async updateKpiMetric(id: string, updates: Partial<InsertKpiMetric>): Promise<IKpiMetric | undefined> {
    try {
      const updateData = {
        ...updates,
        companyId: updates.companyId ? new mongoose.Types.ObjectId(updates.companyId) : undefined,
        updatedAt: new Date()
      };
      const metric = await KpiMetric.findByIdAndUpdate(id, updateData, { new: true });
      return metric || undefined;
    } catch (error) {
      console.error('Error updating KPI metric:', error);
      return undefined;
    }
  }

  // Chart data methods
  async getCompanyChartData(companyId: string, chartType?: string): Promise<IChartData[]> {
    try {
      const filter: any = { companyId: new mongoose.Types.ObjectId(companyId) };
      if (chartType) {
        filter.chartType = chartType;
      }
      const chartData = await ChartData.find(filter).sort({ date: 1 });
      return chartData;
    } catch (error) {
      console.error('Error getting company chart data:', error);
      return [];
    }
  }

  async createChartData(insertData: InsertChartData): Promise<IChartData> {
    try {
      const chartDataDoc = {
        ...insertData,
        companyId: new mongoose.Types.ObjectId(insertData.companyId)
      };
      const data = new ChartData(chartDataDoc);
      await data.save();
      return data;
    } catch (error) {
      console.error('Error creating chart data:', error);
      throw error;
    }
  }

  async getRevenueChartData(companyId: string, days: number = 30): Promise<IChartData[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const chartData = await ChartData.find({
        companyId: new mongoose.Types.ObjectId(companyId),
        chartType: 'revenue',
        date: { $gte: startDate }
      }).sort({ date: 1 });
      
      return chartData;
    } catch (error) {
      console.error('Error getting revenue chart data:', error);
      return [];
    }
  }

  async getUserChartData(companyId: string): Promise<IChartData[]> {
    try {
      const chartData = await ChartData.find({
        companyId: new mongoose.Types.ObjectId(companyId),
        chartType: 'users'
      }).sort({ date: 1 });
      
      return chartData;
    } catch (error) {
      console.error('Error getting user chart data:', error);
      return [];
    }
  }

  // AI recommendations methods
  async getCompanyAiRecommendations(companyId: string): Promise<IAiRecommendation[]> {
    try {
      const recommendations = await AiRecommendation.find({ 
        companyId: new mongoose.Types.ObjectId(companyId) 
      }).sort({ confidence: -1 });
      return recommendations;
    } catch (error) {
      console.error('Error getting company AI recommendations:', error);
      return [];
    }
  }

  async createAiRecommendation(insertRecommendation: InsertAiRecommendation): Promise<IAiRecommendation> {
    try {
      const recommendationData = {
        ...insertRecommendation,
        companyId: new mongoose.Types.ObjectId(insertRecommendation.companyId)
      };
      const recommendation = new AiRecommendation(recommendationData);
      await recommendation.save();
      return recommendation;
    } catch (error) {
      console.error('Error creating AI recommendation:', error);
      throw error;
    }
  }

  async updateAiRecommendation(id: string, updates: Partial<InsertAiRecommendation>): Promise<IAiRecommendation | undefined> {
    try {
      const updateData = {
        ...updates,
        companyId: updates.companyId ? new mongoose.Types.ObjectId(updates.companyId) : undefined,
        updatedAt: new Date()
      };
      const recommendation = await AiRecommendation.findByIdAndUpdate(id, updateData, { new: true });
      return recommendation || undefined;
    } catch (error) {
      console.error('Error updating AI recommendation:', error);
      return undefined;
    }
  }

  // Activity methods
  async getCompanyActivities(companyId: string, limit: number = 10): Promise<IActivity[]> {
    try {
      const activities = await Activity.find({ 
        companyId: new mongoose.Types.ObjectId(companyId) 
      })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit);
      
      return activities;
    } catch (error) {
      console.error('Error getting company activities:', error);
      return [];
    }
  }

  async createActivity(insertActivity: InsertActivity): Promise<IActivity> {
    try {
      const activityData = {
        ...insertActivity,
        companyId: new mongoose.Types.ObjectId(insertActivity.companyId),
        userId: new mongoose.Types.ObjectId(insertActivity.userId)
      };
      const activity = new Activity(activityData);
      await activity.save();
      return activity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  // Notification methods
  async getUserNotifications(userId: string): Promise<INotification[]> {
    try {
      const notifications = await Notification.find({ 
        userId: new mongoose.Types.ObjectId(userId) 
      }).sort({ createdAt: -1 });
      
      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  async createNotification(insertNotification: InsertNotification): Promise<INotification> {
    try {
      const notificationData = {
        ...insertNotification,
        userId: new mongoose.Types.ObjectId(insertNotification.userId)
      };
      const notification = new Notification(notificationData);
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    try {
      const result = await Notification.findByIdAndUpdate(id, { 
        isRead: true, 
        readAt: new Date() 
      });
      return !!result;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const count = await Notification.countDocuments({ 
        userId: new mongoose.Types.ObjectId(userId), 
        isRead: false 
      });
      return count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }
}

export const storage = new PostgreSQLStorage();