import { pgTable, text, boolean, timestamp, uuid, integer, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  jobTitle: text("job_title"),
  role: text("role").notNull().default("member"),
  isActive: boolean("is_active").notNull().default(true),
  lastActiveAt: timestamp("last_active_at", { withTimezone: true }).defaultNow(),
  companyId: uuid("company_id").references(() => companies.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  activities: many(activities),
  notifications: many(notifications),
}));

// Companies table
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry"),
  website: text("website"),
  description: text("description"),
  logo: text("logo"),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  integrations: many(integrations),
  kpiMetrics: many(kpiMetrics),
  chartData: many(chartData),
  aiRecommendations: many(aiRecommendations),
  activities: many(activities),
}));

// Integrations table
export const integrations = pgTable("integrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("disconnected"),
  config: jsonb("config").default({}),
  credentials: jsonb("credentials").default({}),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  dataPoints: integer("data_points").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const integrationsRelations = relations(integrations, ({ one }) => ({
  company: one(companies, {
    fields: [integrations.companyId],
    references: [companies.id],
  }),
}));

// KPI Metrics table
export const kpiMetrics = pgTable("kpi_metrics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  name: text("name").notNull(),
  value: text("value").notNull(),
  previousValue: text("previous_value"),
  changePercentage: text("change_percentage"),
  period: text("period").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const kpiMetricsRelations = relations(kpiMetrics, ({ one }) => ({
  company: one(companies, {
    fields: [kpiMetrics.companyId],
    references: [companies.id],
  }),
}));

// Chart Data table
export const chartData = pgTable("chart_data", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  chartType: text("chart_type").notNull(),
  label: text("label").notNull(),
  value: decimal("value").notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chartDataRelations = relations(chartData, ({ one }) => ({
  company: one(companies, {
    fields: [chartData.companyId],
    references: [companies.id],
  }),
}));

// AI Recommendations table
export const aiRecommendations = pgTable("ai_recommendations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  priority: text("priority").notNull(),
  confidence: integer("confidence").notNull(),
  isImplemented: boolean("is_implemented").notNull().default(false),
  implementedAt: timestamp("implemented_at", { withTimezone: true }),
  estimatedImpact: text("estimated_impact").notNull(),
  requiredActions: text("required_actions").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const aiRecommendationsRelations = relations(aiRecommendations, ({ one }) => ({
  company: one(companies, {
    fields: [aiRecommendations.companyId],
    references: [companies.id],
  }),
}));

// Activities table
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  company: one(companies, {
    fields: [activities.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at", { withTimezone: true }),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas using Drizzle
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastActiveAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastSyncAt: true,
});

export const insertKpiMetricSchema = createInsertSchema(kpiMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChartDataSchema = createInsertSchema(chartData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  implementedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  readAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  jobTitle: z.string().optional(),
  companyName: z.string().min(1, "Company name is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type exports using Drizzle types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SelectUser = typeof users.$inferSelect;
export type User = SelectUser;

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type SelectCompany = typeof companies.$inferSelect;
export type Company = SelectCompany;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type SelectIntegration = typeof integrations.$inferSelect;
export type Integration = SelectIntegration;

export type InsertKpiMetric = z.infer<typeof insertKpiMetricSchema>;
export type SelectKpiMetric = typeof kpiMetrics.$inferSelect;
export type KpiMetric = SelectKpiMetric;

export type InsertChartData = z.infer<typeof insertChartDataSchema>;
export type SelectChartData = typeof chartData.$inferSelect;
export type ChartData = SelectChartData;

export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type SelectAiRecommendation = typeof aiRecommendations.$inferSelect;
export type AiRecommendation = SelectAiRecommendation;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type SelectActivity = typeof activities.$inferSelect;
export type Activity = SelectActivity;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SelectNotification = typeof notifications.$inferSelect;
export type Notification = SelectNotification;

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Legacy interface types for compatibility (these maintain the original interfaces for the storage layer)
export interface IUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  role: string;
  isActive: boolean;
  lastActiveAt?: Date;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompany {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  logo?: string;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIntegration {
  id: string;
  companyId: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  config: any;
  credentials: any;
  lastSyncAt?: Date;
  dataPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IKpiMetric {
  id: string;
  companyId: string;
  name: string;
  value: string;
  previousValue?: string;
  changePercentage?: string;
  period: string;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChartData {
  id: string;
  companyId: string;
  chartType: string;
  label: string;
  value: string;
  date: Date;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAiRecommendation {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  confidence: number;
  isImplemented: boolean;
  implementedAt?: Date;
  estimatedImpact: string;
  requiredActions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IActivity {
  id: string;
  companyId: string;
  userId: string;
  type: string;
  description: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: Date;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}