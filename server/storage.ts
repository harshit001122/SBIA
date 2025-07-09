import { 
  users, companies, integrations, kpiMetrics, chartData, 
  aiRecommendations, activities, notifications,
  type User, type InsertUser, type Company, type InsertCompany,
  type Integration, type InsertIntegration, type KpiMetric, type InsertKpiMetric,
  type ChartData, type InsertChartData, type AiRecommendation, type InsertAiRecommendation,
  type Activity, type InsertActivity, type Notification, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  updateUserLastActive(id: number): Promise<void>;

  // Company methods
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company | undefined>;
  getCompanyUsers(companyId: number): Promise<User[]>;

  // Integration methods
  getCompanyIntegrations(companyId: number): Promise<Integration[]>;
  getIntegration(id: number): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, updates: Partial<InsertIntegration>): Promise<Integration | undefined>;
  deleteIntegration(id: number): Promise<boolean>;

  // KPI methods
  getCompanyKpiMetrics(companyId: number): Promise<KpiMetric[]>;
  createKpiMetric(metric: InsertKpiMetric): Promise<KpiMetric>;
  updateKpiMetric(id: number, updates: Partial<InsertKpiMetric>): Promise<KpiMetric | undefined>;

  // Chart data methods
  getCompanyChartData(companyId: number, chartType?: string): Promise<ChartData[]>;
  createChartData(data: InsertChartData): Promise<ChartData>;
  getRevenueChartData(companyId: number, days?: number): Promise<ChartData[]>;
  getUserChartData(companyId: number): Promise<ChartData[]>;

  // AI recommendations methods
  getCompanyAiRecommendations(companyId: number): Promise<AiRecommendation[]>;
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  updateAiRecommendation(id: number, updates: Partial<InsertAiRecommendation>): Promise<AiRecommendation | undefined>;

  // Activity methods
  getCompanyActivities(companyId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Notification methods
  getUserNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  getUnreadNotificationCount(userId: number): Promise<number>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserLastActive(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastActiveAt: new Date() })
      .where(eq(users.id, id));
  }

  // Company methods
  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(insertCompany)
      .returning();
    return company;
  }

  async updateCompany(id: number, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const [company] = await db
      .update(companies)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return company || undefined;
  }

  async getCompanyUsers(companyId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.companyId, companyId));
  }

  // Integration methods
  async getCompanyIntegrations(companyId: number): Promise<Integration[]> {
    return await db.select().from(integrations).where(eq(integrations.companyId, companyId));
  }

  async getIntegration(id: number): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.id, id));
    return integration || undefined;
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const [integration] = await db
      .insert(integrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updateIntegration(id: number, updates: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const [integration] = await db
      .update(integrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return integration || undefined;
  }

  async deleteIntegration(id: number): Promise<boolean> {
    const result = await db.delete(integrations).where(eq(integrations.id, id));
    return (result.rowCount || 0) > 0;
  }

  // KPI methods
  async getCompanyKpiMetrics(companyId: number): Promise<KpiMetric[]> {
    return await db.select().from(kpiMetrics).where(eq(kpiMetrics.companyId, companyId));
  }

  async createKpiMetric(insertMetric: InsertKpiMetric): Promise<KpiMetric> {
    const [metric] = await db
      .insert(kpiMetrics)
      .values(insertMetric)
      .returning();
    return metric;
  }

  async updateKpiMetric(id: number, updates: Partial<InsertKpiMetric>): Promise<KpiMetric | undefined> {
    const [metric] = await db
      .update(kpiMetrics)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(kpiMetrics.id, id))
      .returning();
    return metric || undefined;
  }

  // Chart data methods
  async getCompanyChartData(companyId: number, chartType?: string): Promise<ChartData[]> {
    if (chartType) {
      return await db
        .select()
        .from(chartData)
        .where(and(eq(chartData.companyId, companyId), eq(chartData.chartType, chartType)));
    }
    
    return await db.select().from(chartData).where(eq(chartData.companyId, companyId));
  }

  async createChartData(insertData: InsertChartData): Promise<ChartData> {
    const [data] = await db
      .insert(chartData)
      .values(insertData)
      .returning();
    return data;
  }

  async getRevenueChartData(companyId: number, days: number = 30): Promise<ChartData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return await db
      .select()
      .from(chartData)
      .where(
        and(
          eq(chartData.companyId, companyId),
          eq(chartData.chartType, 'revenue')
        )
      )
      .orderBy(chartData.date);
  }

  async getUserChartData(companyId: number): Promise<ChartData[]> {
    return await db
      .select()
      .from(chartData)
      .where(
        and(
          eq(chartData.companyId, companyId),
          eq(chartData.chartType, 'users')
        )
      );
  }

  // AI recommendations methods
  async getCompanyAiRecommendations(companyId: number): Promise<AiRecommendation[]> {
    return await db
      .select()
      .from(aiRecommendations)
      .where(eq(aiRecommendations.companyId, companyId))
      .orderBy(desc(aiRecommendations.confidence));
  }

  async createAiRecommendation(insertRecommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const [recommendation] = await db
      .insert(aiRecommendations)
      .values(insertRecommendation)
      .returning();
    return recommendation;
  }

  async updateAiRecommendation(id: number, updates: Partial<InsertAiRecommendation>): Promise<AiRecommendation | undefined> {
    const [recommendation] = await db
      .update(aiRecommendations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(aiRecommendations.id, id))
      .returning();
    return recommendation || undefined;
  }

  // Activity methods
  async getCompanyActivities(companyId: number, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.companyId, companyId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  // Notification methods
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return result.count;
  }
}

export const storage = new DatabaseStorage();
