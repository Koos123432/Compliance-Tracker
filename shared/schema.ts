import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for officers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  phoneNumber: true,
});

// Inspections table
export const inspections = pgTable("inspections", {
  id: serial("id").primaryKey(),
  inspectionNumber: text("inspection_number").notNull().unique(),
  inspectionDate: timestamp("inspection_date").notNull(),
  inspectionType: text("inspection_type").notNull(),
  priority: text("priority").notNull(),
  status: text("status").notNull(),
  siteAddress: text("site_address").notNull(),
  daNumber: text("da_number"),
  principalContractor: text("principal_contractor"),
  licenseNumber: text("license_number"),
  pca: text("pca"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  notes: text("notes"),
  assignedOfficerId: integer("assigned_officer_id"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
});

// People on site
export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").notNull(),
  name: text("name").notNull(),
  licenseNumber: text("license_number"),
  role: text("role"),
  contactNumber: text("contact_number"),
  ocrData: jsonb("ocr_data"),
});

export const insertPersonSchema = createInsertSchema(people).omit({
  id: true,
});

// Photos for inspections
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").notNull(),
  breachId: integer("breach_id"),
  photoUrl: text("photo_url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  createdAt: true,
});

// Breaches found during inspections
export const breaches = pgTable("breaches", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  legislation: text("legislation"),
  daConditionNumber: text("da_condition_number"),
  recommendedAction: text("recommended_action"),
  resolutionDeadline: timestamp("resolution_deadline"),
  severity: text("severity").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertBreachSchema = createInsertSchema(breaches).omit({
  id: true,
  createdAt: true,
});

// Investigations
export const investigations = pgTable("investigations", {
  id: serial("id").primaryKey(),
  caseNumber: text("case_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  priority: text("priority").notNull(),
  assignedOfficerId: integer("assigned_officer_id"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertInvestigationSchema = createInsertSchema(investigations).omit({
  id: true,
  createdAt: true,
});

// Reports generated
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").notNull(),
  reportUrl: text("report_url").notNull(),
  sentToEmail: text("sent_to_email"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

// Activities for tracking actions
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  entityId: integer("entity_id"),
  entityType: text("entity_type"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Schedule entries
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  entityId: integer("entity_id"),
  entityType: text("entity_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Inspection = typeof inspections.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;

export type Person = typeof people.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

export type Breach = typeof breaches.$inferSelect;
export type InsertBreach = z.infer<typeof insertBreachSchema>;

export type Investigation = typeof investigations.$inferSelect;
export type InsertInvestigation = z.infer<typeof insertInvestigationSchema>;

export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Notifications for dispatch and job alerts
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'dispatch', 'schedule', 'alert', etc.
  entityId: integer("entity_id"),
  entityType: text("entity_type"),
  isRead: boolean("is_read").notNull().default(false),
  priority: text("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  createdAt: timestamp("created_at").notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Teams for officer grouping
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

// Team members (many-to-many)
export const teamMembers = pgTable("team_members", {
  teamId: integer("team_id").notNull(),
  userId: integer("user_id").notNull(),
  isTeamLead: boolean("is_team_lead").notNull().default(false),
  joinedAt: timestamp("joined_at").notNull(),
}, (t) => ({
  pk: primaryKey(t.teamId, t.userId),
}));

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  joinedAt: true,
});

// Team schedule (shared schedules)
export const teamSchedules = pgTable("team_schedules", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull(),
  createdBy: integer("created_by").notNull(),
});

export const insertTeamScheduleSchema = createInsertSchema(teamSchedules).omit({
  id: true,
  createdAt: true,
});

// Team schedule assignments
export const teamScheduleAssignments = pgTable("team_schedule_assignments", {
  id: serial("id").primaryKey(),
  teamScheduleId: integer("team_schedule_id").notNull(),
  userId: integer("user_id").notNull(),
  assignmentStatus: text("assignment_status").notNull().default("pending"), // pending, accepted, rejected
  assignedAt: timestamp("assigned_at").notNull(),
  updatedAt: timestamp("updated_at"),
  notes: text("notes"),
});

export const insertTeamScheduleAssignmentSchema = createInsertSchema(teamScheduleAssignments).omit({
  id: true,
  assignedAt: true,
  updatedAt: true,
});

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;

export type TeamSchedule = typeof teamSchedules.$inferSelect;
export type InsertTeamSchedule = z.infer<typeof insertTeamScheduleSchema>;

export type TeamScheduleAssignment = typeof teamScheduleAssignments.$inferSelect;
export type InsertTeamScheduleAssignment = z.infer<typeof insertTeamScheduleAssignmentSchema>;
