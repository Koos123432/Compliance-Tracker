import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey, unique } from "drizzle-orm/pg-core";
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
  // Enhanced status to support more stages in the legal process
  status: text("status").notNull(), // 'open', 'pending', 'under_investigation', 'awaiting_legal_action', 'prosecution', 'court', 'closed'
  statusDetails: text("status_details"), // Additional details about the current status
  priority: text("priority").notNull(),
  assignedOfficerId: integer("assigned_officer_id"),
  createdAt: timestamp("created_at").notNull(),
  // Added fields for legislation details
  offence: text("offence"),
  legislation: text("legislation"),
  legislationSection: text("legislation_section"),
  lawCode: text("law_code"),
  penalty: text("penalty"),
  offenceCategory: text("offence_category"),
  // Fine and legal action details
  fineAmount: text("fine_amount"), // Amount of fine imposed
  fineCurrency: text("fine_currency").default("USD"), // Currency of fine
  finePaid: boolean("fine_paid").default(false), // Whether fine has been paid
  fineDate: timestamp("fine_date"), // Date fine was imposed
  courtDate: timestamp("court_date"), // Date of court hearing
  courtLocation: text("court_location"), // Location of court hearing
  judgeName: text("judge_name"), // Name of presiding judge
  prosecutorName: text("prosecutor_name"), // Name of prosecutor
  legalOutcome: text("legal_outcome"), // Outcome of legal proceedings
  // Inspection report linking
  linkedInspectionIds: text("linked_inspection_ids").array(), // Array of inspection IDs linked to this investigation
  // Timeline management
  startDate: timestamp("start_date"), // When investigation officially began
  targetCompletionDate: timestamp("target_completion_date"), // Target date for completion
  actualCompletionDate: timestamp("actual_completion_date"), // Actual completion date
  lastUpdated: timestamp("last_updated"), // Last time investigation was updated
  updatedBy: integer("updated_by"), // ID of user who last updated
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

// Officer notes for collaborative documentation
export const officerNotes = pgTable("officer_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  entityId: integer("entity_id").notNull(),
  entityType: text("entity_type").notNull(), // 'inspection', 'investigation', 'person', etc.
  content: text("content").notNull(),
  tags: text("tags"),
  visibility: text("visibility").notNull().default("team"), // 'private', 'team', 'public'
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertOfficerNoteSchema = createInsertSchema(officerNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tracking notices for investigations
export const trackingNotices = pgTable("tracking_notices", {
  id: serial("id").primaryKey(),
  investigationId: integer("investigation_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  noticeType: text("notice_type").notNull(), // 'warning', 'infringement', 'stop work', etc.
  status: text("status").notNull().default("draft"), // 'draft', 'review', 'sent', 'acknowledged', 'closed'
  recipientName: text("recipient_name").notNull(),
  recipientEmail: text("recipient_email"),
  recipientPhone: text("recipient_phone"),
  issuedDate: timestamp("issued_date"),
  dueDate: timestamp("due_date"),
  closedDate: timestamp("closed_date"),
  assignedOfficerId: integer("assigned_officer_id").notNull(),
  reviewedById: integer("reviewed_by_id"),
  reviewNotes: text("review_notes"),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertTrackingNoticeSchema = createInsertSchema(trackingNotices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Elements of proof for investigations
export const elementsOfProof = pgTable("elements_of_proof", {
  id: serial("id").primaryKey(),
  investigationId: integer("investigation_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'document', 'witness', 'photo', 'video', etc.
  status: text("status").notNull().default("pending"), // 'pending', 'obtained', 'verified', 'rejected'
  source: text("source"),
  collectedBy: integer("collected_by").notNull(),
  collectedDate: timestamp("collected_date"),
  verifiedBy: integer("verified_by"),
  verifiedDate: timestamp("verified_date"),
  notes: text("notes"),
  fileUrl: text("file_url"),
  // Additional fields for enhanced proof tracking
  legislationReference: text("legislation_reference"), // Specific legislation section this evidence relates to
  burdenOfProof: text("burden_of_proof"), // 'beyond reasonable doubt', 'balance of probabilities', etc.
  evidenceStrength: text("evidence_strength"), // 'strong', 'moderate', 'weak'
  relevantPersonId: integer("relevant_person_id"), // Link to a person in the people table if relevant
  timelineDate: timestamp("timeline_date"), // For creating investigation timelines
  timelinePosition: integer("timeline_position"), // For ordering in timeline
  isKeyEvidence: boolean("is_key_evidence").default(false), // Marks evidence as key to the case
  offenceElement: text("offence_element"), // Which element of the offence this evidence proves
  dueDate: timestamp("due_date"), // When this element needs to be collected by
  createdAt: timestamp("created_at").notNull(),
});

export const insertElementOfProofSchema = createInsertSchema(elementsOfProof).omit({
  id: true,
  createdAt: true,
});

// Person relationships for tracking connections between people
export const personRelationships = pgTable("person_relationships", {
  id: serial("id").primaryKey(),
  personId: integer("person_id").notNull(), // The primary person
  relatedPersonId: integer("related_person_id").notNull(), // The person they're related to
  relationshipType: text("relationship_type").notNull(), // 'business_partner', 'employee', 'supervisor', 'witness', etc.
  investigationId: integer("investigation_id"), // Optional link to an investigation
  strength: text("strength"), // 'strong', 'moderate', 'weak'
  description: text("description"),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by"),
  verifiedDate: timestamp("verified_date"),
  createdAt: timestamp("created_at").notNull(),
});

export const insertPersonRelationshipSchema = createInsertSchema(personRelationships).omit({
  id: true,
  createdAt: true,
});

// Timeline events for tracking case chronology
export const timelineEvents = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  investigationId: integer("investigation_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  position: integer("position"), // For manual ordering if needed
  eventType: text("event_type").notNull(), // 'offence', 'inspection', 'notice', 'evidence', 'legal', etc.
  relatedEntityId: integer("related_entity_id"), // ID of related entity (proof, notice, etc.)
  relatedEntityType: text("related_entity_type"), // Type of related entity
  importance: text("importance").default("normal"), // 'low', 'normal', 'high', 'critical'
  addedBy: integer("added_by").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const insertTimelineEventSchema = createInsertSchema(timelineEvents).omit({
  id: true,
  createdAt: true,
});

// Report to Investigation links
export const reportInvestigationLinks = pgTable("report_investigation_links", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").notNull(),
  investigationId: integer("investigation_id").notNull(),
  linkType: text("link_type").notNull(), // 'evidence', 'reference', 'primary', etc.
  createdAt: timestamp("created_at").notNull(),
  createdBy: integer("created_by").notNull(),
  notes: text("notes"),
}, (t) => ({
  unq: unique().on(t.reportId, t.investigationId),
}));

export const insertReportInvestigationLinkSchema = createInsertSchema(reportInvestigationLinks).omit({
  id: true,
  createdAt: true,
});

// Type exports for new tables
export type OfficerNote = typeof officerNotes.$inferSelect;
export type InsertOfficerNote = z.infer<typeof insertOfficerNoteSchema>;

export type TrackingNotice = typeof trackingNotices.$inferSelect;
export type InsertTrackingNotice = z.infer<typeof insertTrackingNoticeSchema>;

export type ElementOfProof = typeof elementsOfProof.$inferSelect;
export type InsertElementOfProof = z.infer<typeof insertElementOfProofSchema>;

export type PersonRelationship = typeof personRelationships.$inferSelect;
export type InsertPersonRelationship = z.infer<typeof insertPersonRelationshipSchema>;

export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;

export type ReportInvestigationLink = typeof reportInvestigationLinks.$inferSelect;
export type InsertReportInvestigationLink = z.infer<typeof insertReportInvestigationLinkSchema>;
