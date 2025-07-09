import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// User Interface and Schema
export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  role: string;
  isActive: boolean;
  lastActiveAt?: Date;
  companyId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, maxlength: 255 },
  password: { type: String, required: true },
  firstName: { type: String, required: true, maxlength: 100 },
  lastName: { type: String, required: true, maxlength: 100 },
  jobTitle: { type: String, maxlength: 100 },
  role: { type: String, required: true, default: "member", maxlength: 50 },
  isActive: { type: Boolean, required: true, default: true },
  lastActiveAt: { type: Date, default: Date.now },
  companyId: { type: Schema.Types.ObjectId, ref: "Company" },
}, { timestamps: true });

export const User = mongoose.model<IUser>("User", userSchema);

// Company Interface and Schema
export interface ICompany extends Document {
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  logo?: string;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>({
  name: { type: String, required: true, maxlength: 200 },
  industry: { type: String, maxlength: 100 },
  website: { type: String, maxlength: 255 },
  description: { type: String },
  logo: { type: String },
  settings: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const Company = mongoose.model<ICompany>("Company", companySchema);

// Integration Interface and Schema
export interface IIntegration extends Document {
  companyId: mongoose.Types.ObjectId;
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

const integrationSchema = new Schema<IIntegration>({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true, maxlength: 100 },
  type: { type: String, required: true, maxlength: 50 },
  provider: { type: String, required: true, maxlength: 100 },
  status: { type: String, required: true, default: "disconnected", maxlength: 20 },
  config: { type: Schema.Types.Mixed, default: {} },
  credentials: { type: Schema.Types.Mixed, default: {} },
  lastSyncAt: { type: Date },
  dataPoints: { type: Number, default: 0 },
}, { timestamps: true });

export const Integration = mongoose.model<IIntegration>("Integration", integrationSchema);

// KPI Metric Interface and Schema
export interface IKpiMetric extends Document {
  companyId: mongoose.Types.ObjectId;
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

const kpiMetricSchema = new Schema<IKpiMetric>({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  name: { type: String, required: true, maxlength: 100 },
  value: { type: String, required: true, maxlength: 50 },
  previousValue: { type: String, maxlength: 50 },
  changePercentage: { type: String, maxlength: 20 },
  period: { type: String, required: true, maxlength: 50 },
  icon: { type: String, required: true, maxlength: 50 },
  color: { type: String, required: true, maxlength: 20 },
}, { timestamps: true });

export const KpiMetric = mongoose.model<IKpiMetric>("KpiMetric", kpiMetricSchema);

// Chart Data Interface and Schema
export interface IChartData extends Document {
  companyId: mongoose.Types.ObjectId;
  chartType: string;
  label: string;
  value: number;
  date: Date;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const chartDataSchema = new Schema<IChartData>({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  chartType: { type: String, required: true, maxlength: 50 },
  label: { type: String, required: true, maxlength: 100 },
  value: { type: Number, required: true },
  date: { type: Date, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const ChartData = mongoose.model<IChartData>("ChartData", chartDataSchema);

// AI Recommendation Interface and Schema
export interface IAiRecommendation extends Document {
  companyId: mongoose.Types.ObjectId;
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

const aiRecommendationSchema = new Schema<IAiRecommendation>({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true },
  category: { type: String, required: true, maxlength: 100 },
  priority: { type: String, required: true, maxlength: 20 },
  confidence: { type: Number, required: true, min: 0, max: 100 },
  isImplemented: { type: Boolean, required: true, default: false },
  implementedAt: { type: Date },
  estimatedImpact: { type: String, required: true, maxlength: 100 },
  requiredActions: [{ type: String }],
}, { timestamps: true });

export const AiRecommendation = mongoose.model<IAiRecommendation>("AiRecommendation", aiRecommendationSchema);

// Activity Interface and Schema
export interface IActivity extends Document {
  companyId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: string;
  description: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true, maxlength: 50 },
  description: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const Activity = mongoose.model<IActivity>("Activity", activitySchema);

// Notification Interface and Schema
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  readAt?: Date;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true, maxlength: 200 },
  message: { type: String, required: true },
  type: { type: String, required: true, maxlength: 50 },
  isRead: { type: Boolean, required: true, default: false },
  readAt: { type: Date },
  metadata: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);

// Zod Validation Schemas
export const insertUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  jobTitle: z.string().max(100).optional(),
  role: z.string().max(50).default("member"),
  isActive: z.boolean().default(true),
  companyId: z.string().optional(),
});

export const insertCompanySchema = z.object({
  name: z.string().min(1).max(200),
  industry: z.string().max(100).optional(),
  website: z.string().max(255).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  settings: z.any().default({}),
});

export const insertIntegrationSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(50),
  provider: z.string().min(1).max(100),
  status: z.string().max(20).default("disconnected"),
  config: z.any().default({}),
  credentials: z.any().default({}),
  dataPoints: z.number().default(0),
});

export const insertKpiMetricSchema = z.object({
  companyId: z.string(),
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(50),
  previousValue: z.string().max(50).optional(),
  changePercentage: z.string().max(20).optional(),
  period: z.string().min(1).max(50),
  icon: z.string().min(1).max(50),
  color: z.string().min(1).max(20),
});

export const insertChartDataSchema = z.object({
  companyId: z.string(),
  chartType: z.string().min(1).max(50),
  label: z.string().min(1).max(100),
  value: z.number(),
  date: z.date(),
  metadata: z.any().default({}),
});

export const insertAiRecommendationSchema = z.object({
  companyId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  category: z.string().min(1).max(100),
  priority: z.string().min(1).max(20),
  confidence: z.number().min(0).max(100),
  isImplemented: z.boolean().default(false),
  estimatedImpact: z.string().min(1).max(100),
  requiredActions: z.array(z.string()),
});

export const insertActivitySchema = z.object({
  companyId: z.string(),
  userId: z.string(),
  type: z.string().min(1).max(50),
  description: z.string().min(1),
  metadata: z.any().default({}),
});

export const insertNotificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(200),
  message: z.string().min(1),
  type: z.string().min(1).max(50),
  isRead: z.boolean().default(false),
  metadata: z.any().default({}),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type exports (using the interfaces as types)
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = IUser;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = ICompany;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = IIntegration;
export type InsertKpiMetric = z.infer<typeof insertKpiMetricSchema>;
export type KpiMetric = IKpiMetric;
export type InsertChartData = z.infer<typeof insertChartDataSchema>;
export type ChartData = IChartData;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;
export type AiRecommendation = IAiRecommendation;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = IActivity;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = INotification;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;