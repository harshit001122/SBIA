import {
  users, companies, integrations, kpiMetrics, chartData,
  aiRecommendations, activities, notifications,
  type IUser, type InsertUser, type ICompany, type InsertCompany,
  type IIntegration, type InsertIntegration, type IKpiMetric, type InsertKpiMetric,
  type IChartData, type InsertChartData, type IAiRecommendation, type InsertAiRecommendation,
  type IActivity, type InsertActivity, type INotification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, sql, count, lte } from "drizzle-orm";
import { Pool } from "pg";
import dotenv from "dotenv";
import session from "express-session";
import createMemoryStore from "memorystore";

// Direct SQL connection for problematic queries
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    return result.rows[0] as IUser || undefined;
  } catch (error) {
    console.error("Error getting user:", error);
    return undefined;
  }
}


  async getUserByEmail(email: string): Promise<IUser | undefined> {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );
    return result.rows[0] as IUser || undefined;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return undefined;
  }
}


  async createUser(insertUser: InsertUser): Promise<IUser> {
  try {
    const result = await pool.query(
      `INSERT INTO users 
        (email, password, first_name, last_name, job_title, role, is_active, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        insertUser.email,
        insertUser.password,
        insertUser.firstName,
        insertUser.lastName,
        insertUser.jobTitle,
        insertUser.role,
        insertUser.isActive,
        insertUser.companyId,
      ]
    );
    return result.rows[0] as IUser;
  } catch (error) {
    console.error("Error creating user:", error);
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
    const result = await pool.query(
      `INSERT INTO companies (name)
       VALUES ($1)
       RETURNING id, name, industry, website, description, logo, settings, created_at, updated_at`,
      [insertCompany.name]
    );
    return result.rows[0] as ICompany;
  } catch (error) {
    console.error("Error creating company:", error);
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
      const result = await db.select().from(integrations).where(eq(integrations.companyId, companyId));
      return result;
    } catch (error) {
      console.error('Error getting company integrations:', error);
      return [];
    }
  }

  async getIntegration(id: string): Promise<IIntegration | undefined> {
    try {
      const result = await db.select().from(integrations).where(eq(integrations.id, id)).limit(1);
      return result[0] || undefined;
    } catch (error) {
      console.error('Error getting integration:', error);
      return undefined;
    }
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<IIntegration> {
    try {
      const result = await db.insert(integrations).values({
        ...insertIntegration,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating integration:', error);
      throw error;
    }
  }

  async updateIntegration(id: string, updates: Partial<InsertIntegration>): Promise<IIntegration | undefined> {
    try {
      const result = await db.update(integrations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(integrations.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating integration:', error);
      return undefined;
    }
  }

  async deleteIntegration(id: string): Promise<boolean> {
    try {
      const result = await db.delete(integrations).where(eq(integrations.id, id)).returning();
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting integration:', error);
      return false;
    }
  }

  // KPI methods
  async getCompanyKpiMetrics(companyId: string): Promise<IKpiMetric[]> {
    try {
      const result = await db.select().from(kpiMetrics).where(eq(kpiMetrics.companyId, companyId));
      return result;
    } catch (error) {
      console.error('Error getting company KPI metrics:', error);
      return [];
    }
  }

  async createKpiMetric(insertMetric: InsertKpiMetric): Promise<IKpiMetric> {
    try {
      const result = await db.insert(kpiMetrics).values({
        ...insertMetric,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating KPI metric:', error);
      throw error;
    }
  }

  async updateKpiMetric(id: string, updates: Partial<InsertKpiMetric>): Promise<IKpiMetric | undefined> {
    try {
      const result = await db.update(kpiMetrics)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(kpiMetrics.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating KPI metric:', error);
      return undefined;
    }
  }

  // Chart data methods
  async getCompanyChartData(companyId: string, chartType?: string): Promise<IChartData[]> {
    try {
      let query = db.select().from(chartData).where(eq(chartData.companyId, companyId));
      
      if (chartType) {
        query = query.where(eq(chartData.chartType, chartType));
      }
      
      const result = await query.orderBy(desc(chartData.date));
      return result;
    } catch (error) {
      console.error('Error getting company chart data:', error);
      return [];
    }
  }

  async createChartData(insertData: InsertChartData): Promise<IChartData> {
    try {
      const result = await db.insert(chartData).values({
        ...insertData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating chart data:', error);
      throw error;
    }
  }

  async getRevenueChartData(companyId: string, days: number = 30): Promise<IChartData[]> {
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - days);
      
      const result = await db.select()
        .from(chartData)
        .where(and(
          eq(chartData.companyId, companyId),
          eq(chartData.chartType, 'revenue'),
          gte(chartData.date, daysAgo)
        ))
        .orderBy(chartData.date);
      
      return result;
    } catch (error) {
      console.error('Error getting revenue chart data:', error);
      return [];
    }
  }

  async getUserChartData(companyId: string): Promise<IChartData[]> {
    try {
      const result = await db.select()
        .from(chartData)
        .where(and(
          eq(chartData.companyId, companyId),
          eq(chartData.chartType, 'users')
        ))
        .orderBy(chartData.date);
      
      return result;
    } catch (error) {
      console.error('Error getting user chart data:', error);
      return [];
    }
  }

  // AI recommendations methods
  async getCompanyAiRecommendations(companyId: string): Promise<IAiRecommendation[]> {
    try {
      const result = await db.select()
        .from(aiRecommendations)
        .where(eq(aiRecommendations.companyId, companyId))
        .orderBy(desc(aiRecommendations.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting company AI recommendations:', error);
      return [];
    }
  }

  async createAiRecommendation(insertRecommendation: InsertAiRecommendation): Promise<IAiRecommendation> {
    try {
      const result = await db.insert(aiRecommendations).values({
        ...insertRecommendation,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return result[0];
    } catch (error) {
      console.error('Error creating AI recommendation:', error);
      throw error;
    }
  }

  async updateAiRecommendation(id: string, updates: Partial<InsertAiRecommendation>): Promise<IAiRecommendation | undefined> {
    try {
      const result = await db.update(aiRecommendations)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(aiRecommendations.id, id))
        .returning();
      return result[0] || undefined;
    } catch (error) {
      console.error('Error updating AI recommendation:', error);
      return undefined;
    }
  }

  // Activity methods
  async getCompanyActivities(companyId: string, limit: number = 10): Promise<IActivity[]> {
    try {
      const result = await db.select()
        .from(activities)
        .where(eq(activities.companyId, companyId))
        .orderBy(desc(activities.createdAt))
        .limit(limit);
      
      return result;
    } catch (error) {
      console.error('Error getting company activities:', error);
      return [];
    }
  }

 async createActivity(insertActivity: InsertActivity): Promise<IActivity> {
  try {
    const result = await pool.query(
      `INSERT INTO activities (company_id, user_id, type, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        insertActivity.companyId,
        insertActivity.userId,
        insertActivity.type,
        insertActivity.description,
      ]
    );
    return result.rows[0] as IActivity;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
}


  // Notification methods
  async getUserNotifications(userId: string): Promise<INotification[]> {
    try {
      const result = await db.select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  async createNotification(insertNotification: InsertNotification): Promise<INotification> {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        insertNotification.userId,
        insertNotification.title,
        insertNotification.message,
        insertNotification.type,
      ]
    );
    return result.rows[0] as INotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}


  async markNotificationAsRead(id: string): Promise<boolean> {
    try {
      const result = await db.update(notifications)
        .set({ 
          isRead: true, 
          readAt: new Date() 
        })
        .where(eq(notifications.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const result = await db.select({ count: count() })
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ));
      
      return result[0]?.count || 0;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      return 0;
    }
  }
}

export const storage = new PostgreSQLStorage();