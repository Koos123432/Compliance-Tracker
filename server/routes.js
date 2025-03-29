import { createServer } from "http";
import { storage } from "./storage.js";
import { broadcastMessage } from "./websocket.js";
import { format } from "date-fns";

export async function registerRoutes(app) {
  const httpServer = createServer(app);

  function generateUniqueNumber(prefix) {
    const date = format(new Date(), "yyyy-MM");
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${date}-${randomPart}`;
  }

  // API Routes
  app.get("/api/inspections", async (req, res) => {
    try {
      const inspections = await storage.getInspections();
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.get("/api/inspections/:id", async (req, res) => {
    try {
      const inspection = await storage.getInspection(Number(req.params.id));
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspection" });
    }
  });

  app.post("/api/inspections", async (req, res) => {
    try {
      const inspection = await storage.createInspection({
        ...req.body,
        inspectionNumber: req.body.inspectionNumber || generateUniqueNumber("INS")
      });

      // Create activity record
      await storage.createActivity({
        userId: req.body.assignedOfficerId || 1,
        activityType: "create_inspection",
        description: `New inspection ${inspection.inspectionNumber} created`,
        entityId: inspection.id,
        entityType: "inspection"
      });

      res.status(201).json(inspection);
    } catch (error) {
      res.status(400).json({ message: "Invalid inspection data", error });
    }
  });

  return httpServer;
}