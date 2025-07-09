import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertIntegrationSchema, insertKpiMetricSchema, insertChartDataSchema,
  insertAiRecommendationSchema, insertActivitySchema, insertNotificationSchema 
} from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Dashboard APIs
  app.get("/api/dashboard/kpi-metrics", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const metrics = await storage.getCompanyKpiMetrics(user.companyId.toString());
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching KPI metrics:', error);
      res.status(500).json({ message: "Failed to fetch KPI metrics" });
    }
  });

  app.post("/api/dashboard/kpi-metrics", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const validatedData = insertKpiMetricSchema.parse({
        ...req.body,
        companyId: user.companyId.toString(),
      });

      const metric = await storage.createKpiMetric(validatedData);
      res.status(201).json(metric);
    } catch (error) {
      console.error('Error creating KPI metric:', error);
      res.status(400).json({ message: error.message || "Failed to create KPI metric" });
    }
  });

  app.get("/api/dashboard/chart-data", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const { type } = req.query;
      const chartData = await storage.getCompanyChartData(user.companyId.toString(), type as string);
      res.json(chartData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  });

  app.get("/api/dashboard/revenue-chart", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const { days = 30 } = req.query;
      const chartData = await storage.getRevenueChartData(user.companyId.toString(), Number(days));
      res.json(chartData);
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      res.status(500).json({ message: "Failed to fetch revenue chart data" });
    }
  });

  app.get("/api/dashboard/user-chart", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const chartData = await storage.getUserChartData(user.companyId.toString());
      res.json(chartData);
    } catch (error) {
      console.error('Error fetching user chart data:', error);
      res.status(500).json({ message: "Failed to fetch user chart data" });
    }
  });

  app.post("/api/dashboard/chart-data", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const validatedData = insertChartDataSchema.parse({
        ...req.body,
        companyId: user.companyId.toString(),
      });

      const data = await storage.createChartData(validatedData);
      res.status(201).json(data);
    } catch (error) {
      console.error('Error creating chart data:', error);
      res.status(400).json({ message: error.message || "Failed to create chart data" });
    }
  });

  // AI Recommendations APIs
  app.get("/api/ai-recommendations", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const recommendations = await storage.getCompanyAiRecommendations(user.companyId.toString());
      res.json(recommendations);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      res.status(500).json({ message: "Failed to fetch AI recommendations" });
    }
  });

  app.post("/api/ai-recommendations", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const validatedData = insertAiRecommendationSchema.parse({
        ...req.body,
        companyId: user.companyId.toString(),
      });

      const recommendation = await storage.createAiRecommendation(validatedData);
      res.status(201).json(recommendation);
    } catch (error) {
      console.error('Error creating AI recommendation:', error);
      res.status(400).json({ message: error.message || "Failed to create AI recommendation" });
    }
  });

  app.patch("/api/ai-recommendations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const recommendation = await storage.updateAiRecommendation(Number(id), req.body);
      
      if (!recommendation) {
        return res.status(404).json({ message: "Recommendation not found" });
      }

      res.json(recommendation);
    } catch (error) {
      console.error('Error updating AI recommendation:', error);
      res.status(400).json({ message: error.message || "Failed to update AI recommendation" });
    }
  });

  // Integrations APIs
  app.get("/api/integrations", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const integrations = await storage.getCompanyIntegrations(user.companyId);
      res.json(integrations);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post("/api/integrations", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const validatedData = insertIntegrationSchema.parse({
        ...req.body,
        companyId: user.companyId,
      });

      const integration = await storage.createIntegration(validatedData);

      // Create activity for integration
      await storage.createActivity({
        companyId: user.companyId,
        userId: user.id,
        type: "integration_added",
        description: `${integration.name} integration was added`,
        source: "Integrations",
        metadata: { integrationId: integration.id },
      });

      res.status(201).json(integration);
    } catch (error) {
      console.error('Error creating integration:', error);
      res.status(400).json({ message: error.message || "Failed to create integration" });
    }
  });

  app.patch("/api/integrations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const integration = await storage.updateIntegration(Number(id), req.body);
      
      if (!integration) {
        return res.status(404).json({ message: "Integration not found" });
      }

      res.json(integration);
    } catch (error) {
      console.error('Error updating integration:', error);
      res.status(400).json({ message: error.message || "Failed to update integration" });
    }
  });

  app.delete("/api/integrations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteIntegration(Number(id));
      
      if (!success) {
        return res.status(404).json({ message: "Integration not found" });
      }

      res.sendStatus(204);
    } catch (error) {
      console.error('Error deleting integration:', error);
      res.status(500).json({ message: "Failed to delete integration" });
    }
  });

  // Team APIs
  app.get("/api/team", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const teamMembers = await storage.getCompanyUsers(user.companyId);
      res.json(teamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  // Company APIs
  app.get("/api/company", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const company = await storage.getCompany(user.companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.patch("/api/company", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const company = await storage.updateCompany(user.companyId, req.body);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.json(company);
    } catch (error) {
      console.error('Error updating company:', error);
      res.status(400).json({ message: error.message || "Failed to update company" });
    }
  });

  // Activities APIs
  app.get("/api/activities", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const { limit = 10 } = req.query;
      const activities = await storage.getCompanyActivities(user.companyId, Number(limit));
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      if (!user.companyId) {
        return res.status(400).json({ message: "No company associated with user" });
      }

      const validatedData = insertActivitySchema.parse({
        ...req.body,
        companyId: user.companyId,
        userId: user.id,
      });

      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      console.error('Error creating activity:', error);
      res.status(400).json({ message: error.message || "Failed to create activity" });
    }
  });

  // Notifications APIs
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const notifications = await storage.getUserNotifications(user.id);
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/notifications/unread-count", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.markNotificationAsRead(Number(id));
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.sendStatus(200);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post("/api/notifications", requireAuth, async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(400).json({ message: error.message || "Failed to create notification" });
    }
  });

  // User profile APIs
  app.patch("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const updatedUser = await storage.updateUser(user.id, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
