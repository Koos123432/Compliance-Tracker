import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertInspectionSchema, 
  insertPersonSchema, 
  insertPhotoSchema, 
  insertBreachSchema, 
  insertInvestigationSchema, 
  insertReportSchema, 
  insertActivitySchema, 
  insertScheduleSchema 
} from "@shared/schema";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Helper function to generate unique numbers with prefix
  function generateUniqueNumber(prefix: string): string {
    const date = format(new Date(), "yyyy-MM");
    const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${date}-${randomPart}`;
  }

  // Inspections routes
  app.get("/api/inspections", async (req: Request, res: Response) => {
    try {
      const inspections = await storage.getInspections();
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  app.get("/api/inspections/:id", async (req: Request, res: Response) => {
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

  app.post("/api/inspections", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInspectionSchema.parse(req.body);
      
      // If inspection number is not provided, generate one
      if (!validatedData.inspectionNumber) {
        validatedData.inspectionNumber = generateUniqueNumber("INS");
      }
      
      const inspection = await storage.createInspection(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: validatedData.assignedOfficerId || 1, // Default to first user if not specified
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

  app.patch("/api/inspections/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const inspection = await storage.getInspection(id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      const updatedInspection = await storage.updateInspection(id, req.body);
      
      // Create activity record
      await storage.createActivity({
        userId: inspection.assignedOfficerId || 1,
        activityType: "update_inspection",
        description: `Inspection ${inspection.inspectionNumber} updated`,
        entityId: id,
        entityType: "inspection"
      });
      
      res.json(updatedInspection);
    } catch (error) {
      res.status(400).json({ message: "Failed to update inspection", error });
    }
  });

  // People routes
  app.get("/api/inspections/:id/people", async (req: Request, res: Response) => {
    try {
      const inspectionId = Number(req.params.id);
      const people = await storage.getPeople(inspectionId);
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  app.post("/api/people", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(validatedData);
      res.status(201).json(person);
    } catch (error) {
      res.status(400).json({ message: "Invalid person data", error });
    }
  });

  app.patch("/api/people/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const person = await storage.getPerson(id);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      const updatedPerson = await storage.updatePerson(id, req.body);
      res.json(updatedPerson);
    } catch (error) {
      res.status(400).json({ message: "Failed to update person", error });
    }
  });

  app.delete("/api/people/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const person = await storage.getPerson(id);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      
      await storage.deletePerson(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete person" });
    }
  });

  // Photos routes
  app.get("/api/inspections/:id/photos", async (req: Request, res: Response) => {
    try {
      const inspectionId = Number(req.params.id);
      const breachId = req.query.breachId ? Number(req.query.breachId) : undefined;
      const photos = await storage.getPhotos(inspectionId, breachId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  app.post("/api/photos", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(validatedData);
      res.status(201).json(photo);
    } catch (error) {
      res.status(400).json({ message: "Invalid photo data", error });
    }
  });

  app.delete("/api/photos/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const photo = await storage.getPhoto(id);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      await storage.deletePhoto(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Breaches routes
  app.get("/api/inspections/:id/breaches", async (req: Request, res: Response) => {
    try {
      const inspectionId = Number(req.params.id);
      const breaches = await storage.getBreaches(inspectionId);
      res.json(breaches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch breaches" });
    }
  });

  app.post("/api/breaches", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBreachSchema.parse(req.body);
      const breach = await storage.createBreach(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: 1, // Default to first user
        activityType: "create_breach",
        description: `New breach "${breach.title}" documented`,
        entityId: breach.id,
        entityType: "breach"
      });
      
      res.status(201).json(breach);
    } catch (error) {
      res.status(400).json({ message: "Invalid breach data", error });
    }
  });

  app.patch("/api/breaches/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const breach = await storage.getBreach(id);
      if (!breach) {
        return res.status(404).json({ message: "Breach not found" });
      }
      
      const updatedBreach = await storage.updateBreach(id, req.body);
      res.json(updatedBreach);
    } catch (error) {
      res.status(400).json({ message: "Failed to update breach", error });
    }
  });

  // Investigations routes
  app.get("/api/investigations", async (req: Request, res: Response) => {
    try {
      const investigations = await storage.getInvestigations();
      res.json(investigations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investigations" });
    }
  });

  app.get("/api/investigations/:id", async (req: Request, res: Response) => {
    try {
      const investigation = await storage.getInvestigation(Number(req.params.id));
      if (!investigation) {
        return res.status(404).json({ message: "Investigation not found" });
      }
      res.json(investigation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investigation" });
    }
  });

  app.post("/api/investigations", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInvestigationSchema.parse(req.body);
      
      // If case number is not provided, generate one
      if (!validatedData.caseNumber) {
        validatedData.caseNumber = generateUniqueNumber("INV");
      }
      
      const investigation = await storage.createInvestigation(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: validatedData.assignedOfficerId || 1,
        activityType: "create_investigation",
        description: `New investigation ${investigation.caseNumber} created`,
        entityId: investigation.id,
        entityType: "investigation"
      });
      
      res.status(201).json(investigation);
    } catch (error) {
      res.status(400).json({ message: "Invalid investigation data", error });
    }
  });

  // Reports routes
  app.get("/api/inspections/:id/reports", async (req: Request, res: Response) => {
    try {
      const inspectionId = Number(req.params.id);
      const reports = await storage.getReports(inspectionId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/reports", async (req: Request, res: Response) => {
    try {
      const validatedData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: 1, // Default to first user
        activityType: "create_report",
        description: `Report created for inspection #${report.inspectionId}`,
        entityId: report.id,
        entityType: "report"
      });
      
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ message: "Invalid report data", error });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Schedule routes
  app.get("/api/schedules", async (req: Request, res: Response) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req: Request, res: Response) => {
    try {
      const validatedData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(validatedData);
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Invalid schedule data", error });
    }
  });

  app.patch("/api/schedules/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const schedule = await storage.getSchedule(id);
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      const updatedSchedule = await storage.updateSchedule(id, req.body);
      res.json(updatedSchedule);
    } catch (error) {
      res.status(400).json({ message: "Failed to update schedule", error });
    }
  });

  // Initialize some demo data
  const demoData = async () => {
    // Check if we already have inspections
    const existingInspections = await storage.getInspections();
    if (existingInspections.length > 0) return;
    
    // Create a few inspections for demo purposes
    const inspection1 = await storage.createInspection({
      inspectionNumber: "INS-2023-0042",
      inspectionDate: new Date("2023-08-15T10:30:00"),
      inspectionType: "Routine Compliance Check",
      priority: "high",
      status: "scheduled",
      siteAddress: "123 Construction Site, Sydney",
      daNumber: "DA-2023-1234",
      principalContractor: "ABC Builders",
      licenseNumber: "LIC-12345",
      pca: "Sydney Certifiers",
      latitude: "-33.865143",
      longitude: "151.209900",
      notes: "Regular inspection of ongoing construction",
      assignedOfficerId: 1
    });
    
    const inspection2 = await storage.createInspection({
      inspectionNumber: "INS-2023-0043",
      inspectionDate: new Date("2023-08-15T13:15:00"),
      inspectionType: "Follow-up Inspection",
      priority: "medium",
      status: "scheduled",
      siteAddress: "456 Renovation Project, Parramatta",
      daNumber: "DA-2023-5678",
      principalContractor: "XYZ Renovations",
      licenseNumber: "LIC-67890",
      pca: "Western Sydney Certifiers",
      latitude: "-33.815143",
      longitude: "151.001900",
      notes: "Follow-up on previous non-compliance issues",
      assignedOfficerId: 1
    });
    
    // Create demo activities
    await storage.createActivity({
      userId: 1,
      activityType: "complete_inspection",
      description: "INS-2023-0039 inspection completed",
      entityId: 1,
      entityType: "inspection"
    });
    
    await storage.createActivity({
      userId: 1,
      activityType: "document_breach",
      description: "INS-2023-0037 breach documented",
      entityId: 1,
      entityType: "breach"
    });
    
    await storage.createActivity({
      userId: 1,
      activityType: "send_report",
      description: "Report sent to builder for INS-2023-0035",
      entityId: 1,
      entityType: "report"
    });
  };
  
  // Initialize demo data
  await demoData();
  
  return httpServer;
}
