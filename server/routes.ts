import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { broadcastMessage } from "./websocket";
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
  insertElementOfProofSchema,
  insertPersonRelationshipSchema,
  insertTimelineEventSchema,
  insertReportInvestigationLinkSchema,
  insertRoleSchema,
  insertPermissionSchema,
  insertRolePermissionSchema,
  insertUserSchema,
  insertInvestigationParticipantSchema,
  insertInspectionInvestigationLinkSchema,
  insertOffenceSchema,
  insertBurdenOfProofSchema,
  insertProofSchema,
  insertBriefSectionSchema,
  insertBriefSchema,
  insertDepartmentSchema,
  insertAccessLevelSchema
} from "@shared/schema";
import { format } from "date-fns";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time communication
  // The WebSocket server is now initialized in server/index.ts

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
  
  // Get schedules with filter by status (for dispatch)
  app.get("/api/schedules", async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string, 10) : undefined;
      
      let schedules = await storage.getTeamSchedules();
      
      // Apply filters if provided
      if (status) {
        schedules = schedules.filter(schedule => schedule.status === status);
      }
      
      if (teamId) {
        schedules = schedules.filter(schedule => schedule.teamId === teamId);
      }
      
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });
  
  // Create and update dispatch jobs with location data
  app.post("/api/teamSchedules", async (req: Request, res: Response) => {
    try {
      const { 
        title, 
        description, 
        scheduledDate, 
        teamId, 
        createdBy, 
        status = "pending",
        priority = "medium",
        location,
        assignedMembers = []
      } = req.body;
      
      // Validate required fields
      if (!title || !teamId || !scheduledDate || !createdBy) {
        return res.status(400).json({ 
          error: "Missing required fields. Required: title, teamId, scheduledDate, createdBy" 
        });
      }
      
      // Create the team schedule job
      const schedule = await storage.createTeamSchedule({
        title,
        description: description || null,
        scheduledDate: new Date(scheduledDate),
        teamId,
        createdBy,
        status,
        createdAt: new Date(),
      });
      
      // If there are assigned members, create assignments for each
      const assignments = [];
      for (const userId of assignedMembers) {
        try {
          const assignment = await storage.assignTeamSchedule({
            teamScheduleId: schedule.id,
            userId: parseInt(userId),
            assignmentStatus: "pending",
            notes: "Assigned during job creation",
          });
          
          // Create notification for each assigned user
          await storage.createNotification({
            userId: parseInt(userId),
            title: "New Job Assignment",
            message: `You have been assigned to job: ${title}`,
            type: "job_assignment",
            entityId: schedule.id,
            entityType: "team_schedule",
            priority,
            isRead: false,
          });
          
          assignments.push(assignment);
        } catch (assignmentError) {
          console.error(`Error assigning user ${userId}:`, assignmentError);
          // Continue with other assignments even if one fails
        }
      }
      
      // Also add a notification for the whole team
      const teamMembers = await storage.getTeamMembers(teamId);
      for (const member of teamMembers) {
        // Skip users who were directly assigned already
        if (assignedMembers.includes(member.userId.toString())) continue;
        
        await storage.createNotification({
          userId: member.userId,
          title: "New Team Job",
          message: `A new job has been scheduled for your team: ${title}`,
          type: "team_job",
          entityId: schedule.id,
          entityType: "team_schedule",
          priority: priority === "high" ? "high" : "medium",
          isRead: false,
          createdAt: new Date(),
        });
      }
      
      // Save location data if provided
      if (location) {
        // We'll store location as part of the activity for now
        await storage.createActivity({
          userId: createdBy,
          description: `Job created at location: ${location}`,
          activityType: "job_creation",
          entityId: schedule.id,
          entityType: "team_schedule",
          createdAt: new Date(),
        });
      }
      
      res.status(201).json({
        ...schedule,
        assignedMembers: assignments,
        location
      });
    } catch (error) {
      console.error("Error creating team schedule:", error);
      res.status(500).json({ error: "Failed to create team schedule" });
    }
  });
  
  // Update a team schedule/job (for dispatch status changes)
  app.patch("/api/schedules/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    const scheduleId = parseInt(id, 10);
    
    try {
      const { status, title, description, scheduledDate, priority, location } = req.body;
      
      // Get the current schedule to check for status change
      const currentSchedule = await storage.getTeamSchedule(scheduleId);
      if (!currentSchedule) {
        return res.status(404).json({ error: "Team schedule not found" });
      }
      
      // Update the team schedule
      const updatedData: any = {};
      if (status) updatedData.status = status;
      if (title) updatedData.title = title;
      if (description) updatedData.description = description;
      if (scheduledDate) updatedData.scheduledDate = new Date(scheduledDate);
      if (priority) updatedData.priority = priority;
      
      const updatedSchedule = await storage.updateTeamSchedule(scheduleId, updatedData);
      
      // If status has changed, create an activity and notifications
      if (status && status !== currentSchedule.status) {
        // Record the activity
        await storage.createActivity({
          userId: 1, // Should be the current user
          description: `Job status changed from ${currentSchedule.status} to ${status}`,
          activityType: "job_status_change",
          entityId: scheduleId,
          entityType: "team_schedule",
          createdAt: new Date(),
        });
        
        // If job was activated, notify assigned members
        if (status === "active" && currentSchedule.status === "pending") {
          const assignments = await storage.getTeamScheduleAssignments(scheduleId);
          
          for (const assignment of assignments) {
            await storage.createNotification({
              userId: assignment.userId,
              title: "Job Dispatched",
              message: `Job: ${currentSchedule.title} has been dispatched and is now active`,
              type: "job_dispatched",
              entityId: scheduleId,
              entityType: "team_schedule",
              priority: "high",
              isRead: false,
              createdAt: new Date(),
            });
          }
          
          // If no specific assignments, notify team members
          if (assignments.length === 0) {
            const teamMembers = await storage.getTeamMembers(currentSchedule.teamId);
            
            for (const member of teamMembers) {
              await storage.createNotification({
                userId: member.userId,
                title: "Team Job Dispatched",
                message: `Job: ${currentSchedule.title} for your team has been dispatched`,
                type: "job_dispatched",
                entityId: scheduleId,
                entityType: "team_schedule",
                priority: "high",
                isRead: false,
                createdAt: new Date(),
              });
            }
          }
        }
        
        // Handle completed or cancelled status
        if (status === "completed" || status === "cancelled") {
          const teamMembers = await storage.getTeamMembers(currentSchedule.teamId);
          
          for (const member of teamMembers) {
            await storage.createNotification({
              userId: member.userId,
              title: `Job ${status === "completed" ? "Completed" : "Cancelled"}`,
              message: `Job: ${currentSchedule.title} has been ${status === "completed" ? "completed" : "cancelled"}`,
              type: "job_" + status,
              entityId: scheduleId,
              entityType: "team_schedule",
              priority: "medium",
              isRead: false,
              createdAt: new Date(),
            });
          }
        }
      }
      
      // Save location data if provided
      if (location) {
        await storage.createActivity({
          userId: 1, // Should be the current user
          description: `Job location updated to: ${location}`,
          activityType: "job_location_update",
          entityId: scheduleId,
          entityType: "team_schedule",
          createdAt: new Date(),
        });
      }
      
      res.json(updatedSchedule);
    } catch (error) {
      console.error("Error updating team schedule:", error);
      res.status(500).json({ error: "Failed to update team schedule" });
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

  // Person Relationship API endpoints
  app.get("/api/people/:personId/relationships", async (req: Request, res: Response) => {
    try {
      const personId = Number(req.params.personId);
      const investigationId = req.query.investigationId ? Number(req.query.investigationId) : undefined;
      const relationships = await storage.getPersonRelationships(personId, investigationId);
      res.json(relationships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch person relationships" });
    }
  });

  app.post("/api/person-relationships", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPersonRelationshipSchema.parse(req.body);
      const relationship = await storage.createPersonRelationship(validatedData);
      res.status(201).json(relationship);
    } catch (error) {
      res.status(400).json({ message: "Invalid person relationship data", error });
    }
  });

  app.patch("/api/person-relationships/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const relationship = await storage.getPersonRelationship(id);
      if (!relationship) {
        return res.status(404).json({ message: "Person relationship not found" });
      }
      
      const updatedRelationship = await storage.updatePersonRelationship(id, req.body);
      res.json(updatedRelationship);
    } catch (error) {
      res.status(400).json({ message: "Failed to update person relationship", error });
    }
  });

  app.delete("/api/person-relationships/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const relationship = await storage.getPersonRelationship(id);
      if (!relationship) {
        return res.status(404).json({ message: "Person relationship not found" });
      }
      
      await storage.deletePersonRelationship(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete person relationship" });
    }
  });

  // Timeline Event API endpoints
  app.get("/api/investigations/:id/timeline-events", async (req: Request, res: Response) => {
    try {
      const investigationId = Number(req.params.id);
      const events = await storage.getTimelineEvents(investigationId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline events" });
    }
  });

  app.post("/api/timeline-events", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTimelineEventSchema.parse(req.body);
      const event = await storage.createTimelineEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid timeline event data", error });
    }
  });

  app.patch("/api/timeline-events/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const event = await storage.getTimelineEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      
      const updatedEvent = await storage.updateTimelineEvent(id, req.body);
      res.json(updatedEvent);
    } catch (error) {
      res.status(400).json({ message: "Failed to update timeline event", error });
    }
  });

  app.delete("/api/timeline-events/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const event = await storage.getTimelineEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Timeline event not found" });
      }
      
      await storage.deleteTimelineEvent(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete timeline event" });
    }
  });

  // Report-Investigation Link API endpoints
  app.get("/api/report-investigation-links", async (req: Request, res: Response) => {
    try {
      const reportId = req.query.reportId ? Number(req.query.reportId) : undefined;
      const investigationId = req.query.investigationId ? Number(req.query.investigationId) : undefined;
      const links = await storage.getReportInvestigationLinks(reportId, investigationId);
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report-investigation links" });
    }
  });

  app.post("/api/report-investigation-links", async (req: Request, res: Response) => {
    try {
      const validatedData = insertReportInvestigationLinkSchema.parse(req.body);
      const link = await storage.createReportInvestigationLink(validatedData);
      res.status(201).json(link);
    } catch (error) {
      res.status(400).json({ message: "Invalid report-investigation link data", error });
    }
  });

  app.delete("/api/report-investigation-links/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const link = await storage.getReportInvestigationLink(id);
      if (!link) {
        return res.status(404).json({ message: "Report-investigation link not found" });
      }
      
      await storage.deleteReportInvestigationLink(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete report-investigation link" });
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
      
      // Create demo person relationships
      const person1 = await storage.createPerson({
        inspectionId: inspection1.id,
        name: "John Builder",
        licenseNumber: "BLD-12345",
        role: "Site Manager",
        contactNumber: "0412 555 123",
        ocrData: null
      });
      
      const person2 = await storage.createPerson({
        inspectionId: inspection1.id,
        name: "Sarah Engineer",
        licenseNumber: "ENG-67890",
        role: "Structural Engineer",
        contactNumber: "0413 666 456",
        ocrData: null
      });
      
      await storage.createPersonRelationship({
        personId: person1.id,
        relatedPersonId: person2.id,
        relationshipType: "supervisor",
        description: "John supervises Sarah on this project",
        investigationId: investigation.id,
        strength: "strong",
        isVerified: true,
        verifiedBy: 1,
        verifiedDate: new Date()
      });
      
      // Create demo timeline events
      await storage.createTimelineEvent({
        investigationId: investigation.id,
        title: "Initial Complaint Received",
        description: "Anonymous complaint about unsafe scaffolding received via hotline",
        eventDate: new Date(Date.now() - 10 * 86400000), // 10 days ago
        position: 1,
        eventType: "complaint",
        relatedEntityId: null,
        relatedEntityType: null,
        importance: "high",
        addedBy: 1
      });
      
      await storage.createTimelineEvent({
        investigationId: investigation.id,
        title: "Initial Site Inspection",
        description: "Officer conducted first site inspection and documented issues",
        eventDate: new Date(Date.now() - 7 * 86400000), // 7 days ago
        position: 2,
        eventType: "inspection",
        relatedEntityId: inspection1.id,
        relatedEntityType: "inspection",
        importance: "medium",
        addedBy: 1
      });
      
      // Create demo report and link it to the investigation
      const report = await storage.createReport({
        inspectionId: inspection1.id,
        reportUrl: "/reports/INS-2023-0042-Report.pdf",
        sentToEmail: "builder@example.com",
        sentAt: new Date(Date.now() - 5 * 86400000) // 5 days ago
      });
      
      await storage.createReportInvestigationLink({
        reportId: report.id,
        investigationId: investigation.id,
        linkType: "evidence",
        notes: "Initial inspection report documenting safety issues",
        createdBy: 1
      });
    }
  };
  
  // Initialize demo data
  await demoData();

  // User Role routes
  app.get("/api/roles", async (req: Request, res: Response) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/:id", async (req: Request, res: Response) => {
    try {
      const role = await storage.getRole(Number(req.params.id));
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch role" });
    }
  });

  app.post("/api/roles", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ message: "Invalid role data", error });
    }
  });

  app.patch("/api/roles/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      const updatedRole = await storage.updateRole(id, req.body);
      res.json(updatedRole);
    } catch (error) {
      res.status(400).json({ message: "Failed to update role", error });
    }
  });

  app.delete("/api/roles/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const role = await storage.getRole(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      await storage.deleteRole(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Permissions routes
  app.get("/api/permissions", async (req: Request, res: Response) => {
    try {
      const category = req.query.category ? String(req.query.category) : undefined;
      const permissions = await storage.getPermissions(category);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch permissions" });
    }
  });

  app.post("/api/permissions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertPermissionSchema.parse(req.body);
      const permission = await storage.createPermission(validatedData);
      res.status(201).json(permission);
    } catch (error) {
      res.status(400).json({ message: "Invalid permission data", error });
    }
  });

  // Role-Permission mapping routes
  app.get("/api/roles/:roleId/permissions", async (req: Request, res: Response) => {
    try {
      const roleId = Number(req.params.roleId);
      const permissions = await storage.getRolePermissions(roleId);
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch role permissions" });
    }
  });

  app.post("/api/role-permissions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertRolePermissionSchema.parse(req.body);
      const rolePermission = await storage.createRolePermission(validatedData);
      res.status(201).json(rolePermission);
    } catch (error) {
      res.status(400).json({ message: "Invalid role-permission data", error });
    }
  });

  app.delete("/api/role-permissions", async (req: Request, res: Response) => {
    try {
      const roleId = Number(req.query.roleId);
      const permissionId = Number(req.query.permissionId);
      if (!roleId || !permissionId) {
        return res.status(400).json({ message: "Both roleId and permissionId are required" });
      }
      
      await storage.deleteRolePermission(roleId, permissionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete role-permission" });
    }
  });

  // User routes
  app.get("/api/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Never send password in response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      // In a real app, you would hash the password before storing
      const user = await storage.createUser(validatedData);
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      // Don't return password in response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user", error });
    }
  });

  // Investigation Participants (Tagged Users) routes
  app.get("/api/investigations/:id/participants", async (req: Request, res: Response) => {
    try {
      const investigationId = Number(req.params.id);
      const participants = await storage.getInvestigationParticipants(investigationId);
      res.json(participants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investigation participants" });
    }
  });

  app.get("/api/users/:userId/investigations", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.userId);
      const investigations = await storage.getUserInvestigations(userId);
      res.json(investigations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user investigations" });
    }
  });

  app.post("/api/investigation-participants", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInvestigationParticipantSchema.parse(req.body);
      const participant = await storage.createInvestigationParticipant(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: validatedData.addedBy,
        activityType: "tag_user_investigation",
        description: `User #${validatedData.userId} added to investigation #${validatedData.investigationId} as ${validatedData.role}`,
        entityId: validatedData.investigationId,
        entityType: "investigation"
      });
      
      res.status(201).json(participant);
    } catch (error) {
      res.status(400).json({ message: "Invalid investigation participant data", error });
    }
  });

  app.patch("/api/investigation-participants/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const participant = await storage.getInvestigationParticipant(id);
      if (!participant) {
        return res.status(404).json({ message: "Investigation participant not found" });
      }
      
      const updatedParticipant = await storage.updateInvestigationParticipant(id, {
        ...req.body,
        updatedAt: new Date(),
      });
      res.json(updatedParticipant);
    } catch (error) {
      res.status(400).json({ message: "Failed to update investigation participant", error });
    }
  });

  app.delete("/api/investigation-participants/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const participant = await storage.getInvestigationParticipant(id);
      if (!participant) {
        return res.status(404).json({ message: "Investigation participant not found" });
      }
      
      await storage.deleteInvestigationParticipant(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete investigation participant" });
    }
  });

  // Inspection-Investigation Links API routes
  app.get("/api/inspection-investigation-links", async (req: Request, res: Response) => {
    try {
      const inspectionId = req.query.inspectionId ? Number(req.query.inspectionId) : undefined;
      const investigationId = req.query.investigationId ? Number(req.query.investigationId) : undefined;
      
      const links = await storage.getInspectionInvestigationLinks(inspectionId, investigationId);
      res.status(200).json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspection-investigation links" });
    }
  });

  app.get("/api/inspection-investigation-links/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const link = await storage.getInspectionInvestigationLink(id);
      
      if (!link) {
        return res.status(404).json({ message: "Inspection-investigation link not found" });
      }
      
      res.status(200).json(link);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspection-investigation link" });
    }
  });

  app.post("/api/inspection-investigation-links", async (req: Request, res: Response) => {
    try {
      const validatedData = insertInspectionInvestigationLinkSchema.parse(req.body);
      
      // Check if inspection exists
      const inspection = await storage.getInspection(validatedData.inspectionId);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      // Check if investigation exists
      const investigation = await storage.getInvestigation(validatedData.investigationId);
      if (!investigation) {
        return res.status(404).json({ message: "Investigation not found" });
      }
      
      // Check if link already exists
      const existingLinks = await storage.getInspectionInvestigationLinks(
        validatedData.inspectionId, 
        validatedData.investigationId
      );
      
      if (existingLinks.length > 0) {
        return res.status(409).json({ 
          message: "Link between this inspection and investigation already exists",
          linkId: existingLinks[0].id
        });
      }
      
      const link = await storage.createInspectionInvestigationLink(validatedData);
      
      // Log activity
      await storage.createActivity({
        userId: req.body.userId || 1, // Default to first user if not specified
        activityType: "link_inspection_investigation",
        description: `Linked inspection #${validatedData.inspectionId} to investigation #${validatedData.investigationId}`,
        entityId: validatedData.investigationId,
        entityType: "investigation"
      });
      
      res.status(201).json(link);
    } catch (error) {
      res.status(400).json({ message: "Invalid inspection-investigation link data", error });
    }
  });

  app.patch("/api/inspection-investigation-links/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const link = await storage.getInspectionInvestigationLink(id);
      if (!link) {
        return res.status(404).json({ message: "Inspection-investigation link not found" });
      }
      
      const updatedLink = await storage.updateInspectionInvestigationLink(id, req.body);
      res.status(200).json(updatedLink);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inspection-investigation link" });
    }
  });

  app.delete("/api/inspection-investigation-links/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const link = await storage.getInspectionInvestigationLink(id);
      if (!link) {
        return res.status(404).json({ message: "Inspection-investigation link not found" });
      }
      
      // Log activity before deleting
      await storage.createActivity({
        userId: req.body.userId || 1, // Default to first user if not specified
        activityType: "unlink_inspection_investigation",
        description: `Unlinked inspection #${link.inspectionId} from investigation #${link.investigationId}`,
        entityId: link.investigationId,
        entityType: "investigation"
      });
      
      await storage.deleteInspectionInvestigationLink(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inspection-investigation link" });
    }
  });

  // Get all inspections for a specific investigation
  app.get("/api/investigations/:id/inspections", async (req: Request, res: Response) => {
    try {
      const investigationId = Number(req.params.id);
      
      // Check if investigation exists
      const investigation = await storage.getInvestigation(investigationId);
      if (!investigation) {
        return res.status(404).json({ message: "Investigation not found" });
      }
      
      const inspections = await storage.getInspectionsForInvestigation(investigationId);
      res.status(200).json(inspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspections for investigation" });
    }
  });

  // Get all investigations for a specific inspection
  app.get("/api/inspections/:id/investigations", async (req: Request, res: Response) => {
    try {
      const inspectionId = Number(req.params.id);
      
      // Check if inspection exists
      const inspection = await storage.getInspection(inspectionId);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      const investigations = await storage.getInvestigationsForInspection(inspectionId);
      res.status(200).json(investigations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investigations for inspection" });
    }
  });
  
  // Offence routes
  app.get("/api/investigations/:id/offences", async (req: Request, res: Response) => {
    try {
      const investigationId = Number(req.params.id);
      const offences = await storage.getOffences(investigationId);
      res.json(offences);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch offences" });
    }
  });

  app.get("/api/offences/:id", async (req: Request, res: Response) => {
    try {
      const offence = await storage.getOffence(Number(req.params.id));
      if (!offence) {
        return res.status(404).json({ message: "Offence not found" });
      }
      res.json(offence);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch offence" });
    }
  });

  app.post("/api/offences", async (req: Request, res: Response) => {
    try {
      const validatedData = insertOffenceSchema.parse(req.body);
      const offence = await storage.createOffence(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: validatedData.createdBy,
        activityType: "create_offence",
        description: `New offence "${offence.title}" added to investigation #${offence.investigationId}`,
        entityId: offence.id,
        entityType: "offence"
      });
      
      res.status(201).json(offence);
    } catch (error) {
      res.status(400).json({ message: "Invalid offence data", error });
    }
  });

  app.patch("/api/offences/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const offence = await storage.getOffence(id);
      if (!offence) {
        return res.status(404).json({ message: "Offence not found" });
      }
      
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const updatedOffence = await storage.updateOffence(id, updateData);
      res.json(updatedOffence);
    } catch (error) {
      res.status(400).json({ message: "Failed to update offence", error });
    }
  });

  app.delete("/api/offences/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const offence = await storage.getOffence(id);
      if (!offence) {
        return res.status(404).json({ message: "Offence not found" });
      }
      
      await storage.deleteOffence(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete offence" });
    }
  });

  // Burden of Proof routes
  app.get("/api/offences/:id/burdens", async (req: Request, res: Response) => {
    try {
      const offenceId = Number(req.params.id);
      const burdens = await storage.getBurdensOfProof(offenceId);
      res.json(burdens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch burdens of proof" });
    }
  });

  app.get("/api/burdens/:id", async (req: Request, res: Response) => {
    try {
      const burden = await storage.getBurdenOfProof(Number(req.params.id));
      if (!burden) {
        return res.status(404).json({ message: "Burden of proof not found" });
      }
      res.json(burden);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch burden of proof" });
    }
  });

  app.post("/api/burdens", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBurdenOfProofSchema.parse(req.body);
      const burden = await storage.createBurdenOfProof(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: validatedData.createdBy,
        activityType: "create_burden_of_proof",
        description: `New burden of proof "${burden.title}" added to offence #${burden.offenceId}`,
        entityId: burden.id,
        entityType: "burden_of_proof"
      });
      
      res.status(201).json(burden);
    } catch (error) {
      res.status(400).json({ message: "Invalid burden of proof data", error });
    }
  });

  app.patch("/api/burdens/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const burden = await storage.getBurdenOfProof(id);
      if (!burden) {
        return res.status(404).json({ message: "Burden of proof not found" });
      }
      
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const updatedBurden = await storage.updateBurdenOfProof(id, updateData);
      res.json(updatedBurden);
    } catch (error) {
      res.status(400).json({ message: "Failed to update burden of proof", error });
    }
  });

  app.delete("/api/burdens/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const burden = await storage.getBurdenOfProof(id);
      if (!burden) {
        return res.status(404).json({ message: "Burden of proof not found" });
      }
      
      await storage.deleteBurdenOfProof(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete burden of proof" });
    }
  });

  // Proof routes
  app.get("/api/burdens/:id/proofs", async (req: Request, res: Response) => {
    try {
      const burdenId = Number(req.params.id);
      const proofs = await storage.getProofs(burdenId);
      res.json(proofs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proofs" });
    }
  });

  app.get("/api/proofs/:id", async (req: Request, res: Response) => {
    try {
      const proof = await storage.getProof(Number(req.params.id));
      if (!proof) {
        return res.status(404).json({ message: "Proof not found" });
      }
      res.json(proof);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch proof" });
    }
  });

  app.post("/api/proofs", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProofSchema.parse(req.body);
      const proof = await storage.createProof(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: validatedData.collectedBy,
        activityType: "create_proof",
        description: `New proof "${proof.title}" added to burden #${proof.burdenId}`,
        entityId: proof.id,
        entityType: "proof"
      });
      
      res.status(201).json(proof);
    } catch (error) {
      res.status(400).json({ message: "Invalid proof data", error });
    }
  });

  app.patch("/api/proofs/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const proof = await storage.getProof(id);
      if (!proof) {
        return res.status(404).json({ message: "Proof not found" });
      }
      
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      const updatedProof = await storage.updateProof(id, updateData);
      res.json(updatedProof);
    } catch (error) {
      res.status(400).json({ message: "Failed to update proof", error });
    }
  });

  app.delete("/api/proofs/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const proof = await storage.getProof(id);
      if (!proof) {
        return res.status(404).json({ message: "Proof not found" });
      }
      
      await storage.deleteProof(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete proof" });
    }
  });

  // Brief Section routes
  app.get("/api/investigations/:id/brief-sections", async (req: Request, res: Response) => {
    try {
      const investigationId = Number(req.params.id);
      const sections = await storage.getBriefSections(investigationId);
      res.json(sections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brief sections" });
    }
  });

  app.get("/api/brief-sections/:id", async (req: Request, res: Response) => {
    try {
      const section = await storage.getBriefSection(Number(req.params.id));
      if (!section) {
        return res.status(404).json({ message: "Brief section not found" });
      }
      res.json(section);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brief section" });
    }
  });

  app.post("/api/brief-sections", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBriefSectionSchema.parse(req.body);
      const section = await storage.createBriefSection(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: validatedData.createdBy,
        activityType: "create_brief_section",
        description: `New brief section "${section.title}" added to investigation #${section.investigationId}`,
        entityId: section.id,
        entityType: "brief_section"
      });
      
      res.status(201).json(section);
    } catch (error) {
      res.status(400).json({ message: "Invalid brief section data", error });
    }
  });

  app.patch("/api/brief-sections/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const section = await storage.getBriefSection(id);
      if (!section) {
        return res.status(404).json({ message: "Brief section not found" });
      }
      
      const updateData = req.body;
      
      // Set the last edited time and user
      if (updateData.lastEditedBy && !updateData.lastEditedAt) {
        updateData.lastEditedAt = new Date();
      }
      
      const updatedSection = await storage.updateBriefSection(id, updateData);
      res.json(updatedSection);
    } catch (error) {
      res.status(400).json({ message: "Failed to update brief section", error });
    }
  });

  app.delete("/api/brief-sections/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const section = await storage.getBriefSection(id);
      if (!section) {
        return res.status(404).json({ message: "Brief section not found" });
      }
      
      await storage.deleteBriefSection(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete brief section" });
    }
  });

  // Brief routes
  app.get("/api/investigations/:id/briefs", async (req: Request, res: Response) => {
    try {
      const investigationId = Number(req.params.id);
      const briefs = await storage.getBriefs(investigationId);
      res.json(briefs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch briefs" });
    }
  });

  app.get("/api/briefs/:id", async (req: Request, res: Response) => {
    try {
      const brief = await storage.getBrief(Number(req.params.id));
      if (!brief) {
        return res.status(404).json({ message: "Brief not found" });
      }
      res.json(brief);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brief" });
    }
  });

  app.post("/api/briefs", async (req: Request, res: Response) => {
    try {
      const validatedData = insertBriefSchema.parse(req.body);
      const brief = await storage.createBrief(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: validatedData.createdBy,
        activityType: "create_brief",
        description: `New brief "${brief.title}" created for investigation #${brief.investigationId}`,
        entityId: brief.id,
        entityType: "brief"
      });
      
      res.status(201).json(brief);
    } catch (error) {
      res.status(400).json({ message: "Invalid brief data", error });
    }
  });

  app.patch("/api/briefs/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const brief = await storage.getBrief(id);
      if (!brief) {
        return res.status(404).json({ message: "Brief not found" });
      }
      
      const updateData = {
        ...req.body,
        updatedAt: new Date()
      };
      
      // Handle special statuses
      if (updateData.status === 'approved' && updateData.approvedBy) {
        updateData.approvedAt = new Date();
      }
      
      if (updateData.status === 'submitted' && updateData.submittedTo) {
        updateData.submittedAt = new Date();
      }
      
      const updatedBrief = await storage.updateBrief(id, updateData);
      res.json(updatedBrief);
    } catch (error) {
      res.status(400).json({ message: "Failed to update brief", error });
    }
  });

  app.delete("/api/briefs/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const brief = await storage.getBrief(id);
      if (!brief) {
        return res.status(404).json({ message: "Brief not found" });
      }
      
      await storage.deleteBrief(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete brief" });
    }
  });

  // Department routes
  app.get("/api/departments", async (req: Request, res: Response) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req: Request, res: Response) => {
    try {
      const department = await storage.getDepartment(Number(req.params.id));
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  app.post("/api/departments", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: 1, // Default to first user
        activityType: "create_department",
        description: `New department "${department.name}" created`,
        entityId: department.id,
        entityType: "department"
      });
      
      res.status(201).json(department);
    } catch (error) {
      res.status(400).json({ message: "Invalid department data", error });
    }
  });

  app.patch("/api/departments/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      const updatedDepartment = await storage.updateDepartment(id, req.body);
      
      // Create activity record
      await storage.createActivity({
        userId: 1, // Default to first user
        activityType: "update_department",
        description: `Department "${department.name}" updated`,
        entityId: id,
        entityType: "department"
      });
      
      res.json(updatedDepartment);
    } catch (error) {
      res.status(400).json({ message: "Failed to update department", error });
    }
  });

  app.delete("/api/departments/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      const deleted = await storage.deleteDepartment(id);
      if (!deleted) {
        return res.status(400).json({ message: "Cannot delete department with assigned users" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // Access Level routes
  app.get("/api/access-levels", async (req: Request, res: Response) => {
    try {
      const accessLevels = await storage.getAccessLevels();
      res.json(accessLevels);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch access levels" });
    }
  });

  app.get("/api/access-levels/:id", async (req: Request, res: Response) => {
    try {
      const accessLevel = await storage.getAccessLevel(Number(req.params.id));
      if (!accessLevel) {
        return res.status(404).json({ message: "Access level not found" });
      }
      res.json(accessLevel);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch access level" });
    }
  });

  app.post("/api/access-levels", async (req: Request, res: Response) => {
    try {
      const validatedData = insertAccessLevelSchema.parse(req.body);
      const accessLevel = await storage.createAccessLevel(validatedData);
      
      // Create activity record
      await storage.createActivity({
        userId: 1, // Default to first user
        activityType: "create_access_level",
        description: `New access level "${accessLevel.name}" created`,
        entityId: accessLevel.id,
        entityType: "access_level"
      });
      
      res.status(201).json(accessLevel);
    } catch (error) {
      res.status(400).json({ message: "Invalid access level data", error });
    }
  });

  app.patch("/api/access-levels/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const accessLevel = await storage.getAccessLevel(id);
      if (!accessLevel) {
        return res.status(404).json({ message: "Access level not found" });
      }
      
      const updatedAccessLevel = await storage.updateAccessLevel(id, req.body);
      
      // Create activity record
      await storage.createActivity({
        userId: 1, // Default to first user
        activityType: "update_access_level",
        description: `Access level "${accessLevel.name}" updated`,
        entityId: id,
        entityType: "access_level"
      });
      
      res.json(updatedAccessLevel);
    } catch (error) {
      res.status(400).json({ message: "Failed to update access level", error });
    }
  });

  app.delete("/api/access-levels/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const accessLevel = await storage.getAccessLevel(id);
      if (!accessLevel) {
        return res.status(404).json({ message: "Access level not found" });
      }
      
      const deleted = await storage.deleteAccessLevel(id);
      if (!deleted) {
        return res.status(400).json({ message: "Cannot delete access level with assigned users" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete access level" });
    }
  });

  return httpServer;
}
