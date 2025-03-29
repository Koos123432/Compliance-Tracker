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
  insertScheduleSchema,
  insertNotificationSchema,
  insertTeamSchema,
  insertTeamMemberSchema,
  insertTeamScheduleSchema,
  insertTeamScheduleAssignmentSchema,
  insertOfficerNoteSchema,
  insertTrackingNoticeSchema,
  insertElementOfProofSchema
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

  // Notification routes
  app.get("/api/users/:userId/notifications", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.get("/api/users/:userId/notifications/unread", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const notifications = await storage.getUnreadNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notifications" });
    }
  });

  app.post("/api/notifications", async (req: Request, res: Response) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ message: "Invalid notification data", error });
    }
  });

  app.patch("/api/notifications/:id/read", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const notification = await storage.getNotification(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(id);
      res.json(updatedNotification);
    } catch (error) {
      res.status(400).json({ message: "Failed to mark notification as read", error });
    }
  });

  app.delete("/api/notifications/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const notification = await storage.getNotification(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      await storage.deleteNotification(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });

  // Team routes
  app.get("/api/teams", async (req: Request, res: Response) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/:id", async (req: Request, res: Response) => {
    try {
      const team = await storage.getTeam(Number(req.params.id));
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.post("/api/teams", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedData);
      res.status(201).json(team);
    } catch (error) {
      res.status(400).json({ message: "Invalid team data", error });
    }
  });

  app.patch("/api/teams/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      const updatedTeam = await storage.updateTeam(id, req.body);
      res.json(updatedTeam);
    } catch (error) {
      res.status(400).json({ message: "Failed to update team", error });
    }
  });

  app.delete("/api/teams/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const team = await storage.getTeam(id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      await storage.deleteTeam(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  // Team members routes
  app.get("/api/teams/:teamId/members", async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.params.teamId);
      const members = await storage.getTeamMembers(teamId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team members" });
    }
  });

  app.get("/api/users/:userId/teams", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const teams = await storage.getUserTeams(userId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user teams" });
    }
  });

  app.post("/api/teams/:teamId/members", async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.params.teamId);
      const userId = Number(req.body.userId);
      const isTeamLead = req.body.isTeamLead || false;
      
      const validatedData = insertTeamMemberSchema.parse({
        teamId,
        userId,
        isTeamLead
      });
      
      const member = await storage.addTeamMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid team member data", error });
    }
  });

  app.delete("/api/teams/:teamId/members/:userId", async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.params.teamId);
      const userId = Number(req.params.userId);
      
      await storage.removeTeamMember(teamId, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove team member" });
    }
  });

  app.patch("/api/teams/:teamId/members/:userId", async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.params.teamId);
      const userId = Number(req.params.userId);
      const isTeamLead = req.body.isTeamLead || false;
      
      const updatedMember = await storage.updateTeamMember(teamId, userId, isTeamLead);
      if (!updatedMember) {
        return res.status(404).json({ message: "Team member not found" });
      }
      
      res.json(updatedMember);
    } catch (error) {
      res.status(400).json({ message: "Failed to update team member", error });
    }
  });

  // Team Schedules routes
  app.get("/api/teams/:teamId/schedules", async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.params.teamId);
      const schedules = await storage.getTeamSchedules(teamId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team schedules" });
    }
  });

  app.post("/api/teams/:teamId/schedules", async (req: Request, res: Response) => {
    try {
      const teamId = Number(req.params.teamId);
      const data = {
        ...req.body,
        teamId
      };
      
      const validatedData = insertTeamScheduleSchema.parse(data);
      const schedule = await storage.createTeamSchedule(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: validatedData.createdBy,
        activityType: "create_team_schedule",
        description: `Team schedule "${validatedData.title}" created`,
        entityId: schedule.id,
        entityType: "teamSchedule"
      });
      
      res.status(201).json(schedule);
    } catch (error) {
      res.status(400).json({ message: "Invalid team schedule data", error });
    }
  });

  app.get("/api/teamSchedules/:id/assignments", async (req: Request, res: Response) => {
    try {
      const scheduleId = Number(req.params.id);
      const assignments = await storage.getTeamScheduleAssignments(scheduleId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  app.get("/api/users/:userId/assignments", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const assignments = await storage.getUserAssignments(userId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user assignments" });
    }
  });

  app.post("/api/teamSchedules/:id/assignments", async (req: Request, res: Response) => {
    try {
      const teamScheduleId = Number(req.params.id);
      const data = {
        ...req.body,
        teamScheduleId,
        assignmentStatus: req.body.assignmentStatus || "pending"
      };
      
      const validatedData = insertTeamScheduleAssignmentSchema.parse(data);
      const assignment = await storage.assignTeamSchedule(validatedData);
      
      // Create notification for the assigned user
      await storage.createNotification({
        userId: validatedData.userId,
        title: "New Schedule Assignment",
        message: "You have been assigned a new inspection schedule",
        type: "schedule",
        entityId: teamScheduleId,
        entityType: "teamSchedule",
        priority: "high"
      });
      
      res.status(201).json(assignment);
    } catch (error) {
      res.status(400).json({ message: "Invalid assignment data", error });
    }
  });

  app.patch("/api/assignments/:id/status", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { status, notes } = req.body;
      
      const assignment = await storage.updateAssignmentStatus(id, status, notes);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      res.json(assignment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update assignment status", error });
    }
  });

  // Officer Notes routes
  app.get("/api/entity/:entityType/:entityId/notes", async (req: Request, res: Response) => {
    try {
      const entityId = Number(req.params.entityId);
      const entityType = req.params.entityType;
      const notes = await storage.getOfficerNotes(entityId, entityType);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch officer notes" });
    }
  });

  app.get("/api/users/:userId/notes", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const notes = await storage.getOfficerNotesByUser(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch officer notes" });
    }
  });

  app.post("/api/officer-notes", async (req: Request, res: Response) => {
    try {
      const validatedData = insertOfficerNoteSchema.parse(req.body);
      const note = await storage.createOfficerNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      res.status(400).json({ message: "Invalid officer note data", error });
    }
  });

  app.patch("/api/officer-notes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const note = await storage.getOfficerNote(id);
      if (!note) {
        return res.status(404).json({ message: "Officer note not found" });
      }
      
      const updatedNote = await storage.updateOfficerNote(id, req.body);
      res.json(updatedNote);
    } catch (error) {
      res.status(400).json({ message: "Failed to update officer note", error });
    }
  });

  app.delete("/api/officer-notes/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const note = await storage.getOfficerNote(id);
      if (!note) {
        return res.status(404).json({ message: "Officer note not found" });
      }
      
      await storage.deleteOfficerNote(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete officer note" });
    }
  });

  // Tracking Notices routes
  app.get("/api/investigations/:id/tracking-notices", async (req: Request, res: Response) => {
    try {
      const investigationId = Number(req.params.id);
      const notices = await storage.getTrackingNotices(investigationId);
      res.json(notices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracking notices" });
    }
  });

  app.post("/api/tracking-notices", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTrackingNoticeSchema.parse(req.body);
      const notice = await storage.createTrackingNotice(validatedData);
      res.status(201).json(notice);
    } catch (error) {
      res.status(400).json({ message: "Invalid tracking notice data", error });
    }
  });

  app.patch("/api/tracking-notices/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const notice = await storage.getTrackingNotice(id);
      if (!notice) {
        return res.status(404).json({ message: "Tracking notice not found" });
      }
      
      const updatedNotice = await storage.updateTrackingNotice(id, req.body);
      res.json(updatedNotice);
    } catch (error) {
      res.status(400).json({ message: "Failed to update tracking notice", error });
    }
  });

  app.delete("/api/tracking-notices/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const notice = await storage.getTrackingNotice(id);
      if (!notice) {
        return res.status(404).json({ message: "Tracking notice not found" });
      }
      
      await storage.deleteTrackingNotice(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tracking notice" });
    }
  });

  // Elements of Proof routes
  app.get("/api/investigations/:id/elements-of-proof", async (req: Request, res: Response) => {
    try {
      const investigationId = Number(req.params.id);
      const elements = await storage.getElementsOfProof(investigationId);
      res.json(elements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch elements of proof" });
    }
  });

  app.post("/api/elements-of-proof", async (req: Request, res: Response) => {
    try {
      const validatedData = insertElementOfProofSchema.parse(req.body);
      const element = await storage.createElementOfProof(validatedData);
      res.status(201).json(element);
    } catch (error) {
      res.status(400).json({ message: "Invalid element of proof data", error });
    }
  });

  app.patch("/api/elements-of-proof/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const element = await storage.getElementOfProof(id);
      if (!element) {
        return res.status(404).json({ message: "Element of proof not found" });
      }
      
      const updatedElement = await storage.updateElementOfProof(id, req.body);
      res.json(updatedElement);
    } catch (error) {
      res.status(400).json({ message: "Failed to update element of proof", error });
    }
  });

  app.delete("/api/elements-of-proof/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const element = await storage.getElementOfProof(id);
      if (!element) {
        return res.status(404).json({ message: "Element of proof not found" });
      }
      
      await storage.deleteElementOfProof(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete element of proof" });
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
    
    // Create a demo team
    const team = await storage.createTeam({
      name: "North Sydney Compliance Team",
      description: "Team responsible for compliance in North Sydney area"
    });
    
    // Add team members
    await storage.addTeamMember({
      teamId: team.id,
      userId: 1,
      isTeamLead: true
    });
    
    await storage.addTeamMember({
      teamId: team.id,
      userId: 2,
      isTeamLead: false
    });
    
    // Create team schedule
    const teamSchedule = await storage.createTeamSchedule({
      teamId: team.id,
      title: "Weekly Site Inspections",
      description: "Regular inspections for North Sydney area",
      scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
      status: "scheduled",
      createdBy: 1
    });
    
    // Assign schedule to members
    await storage.assignTeamSchedule({
      teamScheduleId: teamSchedule.id,
      userId: 1,
      assignmentStatus: "accepted"
    });
    
    await storage.assignTeamSchedule({
      teamScheduleId: teamSchedule.id,
      userId: 2,
      assignmentStatus: "pending"
    });
    
    // Create notifications
    await storage.createNotification({
      userId: 1,
      title: "New Inspection Required",
      message: "Urgent inspection needed at 123 Main St due to safety concerns",
      type: "dispatch",
      priority: "high",
      isRead: false
    });
    
    await storage.createNotification({
      userId: 2,
      title: "Schedule Assignment",
      message: "You've been assigned to the North Sydney area inspection schedule",
      type: "schedule",
      entityId: teamSchedule.id,
      entityType: "teamSchedule",
      priority: "medium",
      isRead: false
    });
    
    // Create officer notes
    await storage.createOfficerNote({
      userId: 1,
      entityId: 1,
      entityType: "inspection",
      content: "Spoke with site manager who confirmed all workers have valid inductions",
      visibility: "team",
      tags: "site visit,interview"
    });
    
    await storage.createOfficerNote({
      userId: 2,
      entityId: 1,
      entityType: "inspection",
      content: "Verified safety equipment is properly maintained and accessible",
      visibility: "team",
      tags: "safety,equipment"
    });
    
    // Create a tracking notice
    const investigation = await storage.getInvestigation(1);
    if (investigation) {
      await storage.createTrackingNotice({
        investigationId: investigation.id,
        assignedOfficerId: 1,
        title: "Initial Notice of Non-Compliance",
        noticeType: "warning",
        recipientName: "John Builder",
        recipientEmail: "john@builderexample.com",
        recipientAddress: "123 Builder St, Sydney NSW 2000",
        description: "Notice regarding unsafe scaffolding practices",
        status: "draft",
        sentDate: null,
        responseDate: null,
        dueDate: new Date(Date.now() + 7 * 86400000), // 7 days from now
        documentUrl: null
      });
      
      // Create elements of proof
      await storage.createElementOfProof({
        investigationId: investigation.id,
        title: "Site Photographs",
        description: "Photographs showing unsafe scaffolding conditions",
        category: "photographic",
        collectedBy: 1,
        status: "collected",
        notes: "Photos clearly show missing guardrails on third level scaffolding",
        source: "Site inspection",
        collectedDate: new Date(),
        verifiedBy: null,
        verifiedDate: null,
        dueDate: new Date(Date.now() + 3 * 86400000), // 3 days from now
        fileUrl: null
      });
      
      await storage.createElementOfProof({
        investigationId: investigation.id,
        title: "Worker Statement",
        description: "Statement from worker regarding safety practices",
        category: "testimony",
        collectedBy: 1,
        status: "pending",
        notes: "Need to collect formal statement from worker who reported issue",
        source: "Anonymous report",
        collectedDate: null,
        verifiedBy: null,
        verifiedDate: null,
        dueDate: new Date(Date.now() + 5 * 86400000), // 5 days from now
        fileUrl: null
      });
    }
  };
  
  // Initialize demo data
  await demoData();
  
  return httpServer;
}
