import { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey, unique, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Type aliases
export type Json = unknown;

// User roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // 'admin', 'manager', 'officer', 'junior_officer', 'readonly'
  description: text("description"),
  permissionLevel: integer("permission_level").notNull(), // 1-100, higher means more permissions
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

// Permissions table
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., 'create_inspection', 'edit_investigation', etc.
  description: text("description"),
  category: text("category").notNull(), // 'inspection', 'investigation', 'admin', etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPermissionSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
});

// Role-Permission mapping (many-to-many)
export const rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id").notNull(),
  permissionId: integer("permission_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey(t.roleId, t.permissionId),
}));

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({
  createdAt: true,
});

// User table for officers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number"),
  roleId: integer("role_id"), // Reference to roles table
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
  // Team and user access
  ownerId: integer("owner_id"), // Primary officer responsible for investigation
  teamId: integer("team_id"), // Team assigned to investigation
  accessLevel: text("access_level").default("team"), // 'public', 'team', 'private', 'restricted'
  // Tagged users with specific access
  taggedUserIds: integer("tagged_user_ids").array(), // Users specifically tagged/assigned to this investigation
  taggedUserRoles: jsonb("tagged_user_roles"), // JSON mapping of userId to role within investigation
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
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

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

// Investigation participants (tagged users)
export const investigationParticipants = pgTable("investigation_participants", {
  id: serial("id").primaryKey(),
  investigationId: integer("investigation_id").notNull(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(), // 'lead', 'support', 'observer', 'advisor', 'legal', 'supervisor'
  permissions: text("permissions").array(), // Array of specific permission keys for this user in this investigation
  notes: text("notes"),
  addedBy: integer("added_by").notNull(), // Who added this person to the investigation
  addedAt: timestamp("added_at").notNull().defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at"),
  isActive: boolean("is_active").notNull().default(true), // Whether this participant is currently active
}, (t) => ({
  unq: unique().on(t.investigationId, t.userId), // One user can only be a participant once per investigation
}));

export const insertInvestigationParticipantSchema = createInsertSchema(investigationParticipants).omit({
  id: true,
  addedAt: true,
  updatedAt: true,
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

export type InvestigationParticipant = typeof investigationParticipants.$inferSelect;
export type InsertInvestigationParticipant = z.infer<typeof insertInvestigationParticipantSchema>;

// Inspection to Investigation links
export const inspectionInvestigationLinks = pgTable("inspection_investigation_links", {
  id: serial("id").primaryKey(),
  inspectionId: integer("inspection_id").notNull(),
  investigationId: integer("investigation_id").notNull(),
  linkType: text("link_type").notNull().default("standard"), // standard, breach, primary, etc.
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInspectionInvestigationLinkSchema = createInsertSchema(inspectionInvestigationLinks).omit({
  id: true,
  createdAt: true,
});

export type InspectionInvestigationLink = typeof inspectionInvestigationLinks.$inferSelect;
export type InsertInspectionInvestigationLink = z.infer<typeof insertInspectionInvestigationLinkSchema>;

// Offences for investigations (multiple offences per investigation)
export const offences = pgTable("offences", {
  id: serial("id").primaryKey(),
  investigationId: integer("investigation_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  offenceCode: text("offence_code"), // Specific legal code for the offence
  offenceAct: text("offence_act").notNull(), // Which act the offence falls under
  offenceSection: text("offence_section"), // Section of the act
  offenceClause: text("offence_clause"), // Specific clause
  offenceSeverity: text("offence_severity").notNull(), // 'low', 'medium', 'high', 'severe'
  offenceDate: timestamp("offence_date"), // When the offence occurred
  maxPenalty: text("max_penalty"), // Maximum penalty that can be applied
  status: text("status").notNull().default("draft"), // 'draft', 'review', 'filed', 'prosecuting', 'completed'
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at"),
});

export const insertOffenceSchema = createInsertSchema(offences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Burden of proof for each offence
export const burdensOfProof = pgTable("burdens_of_proof", {
  id: serial("id").primaryKey(),
  offenceId: integer("offence_id").notNull(),
  title: text("title").notNull(), // Short name of what needs to be proven
  description: text("description").notNull(), // Detailed description of the burden
  legalBasis: text("legal_basis").notNull(), // Legal basis requiring this proof
  standardOfProof: text("standard_of_proof").notNull(), // 'beyond reasonable doubt', 'balance of probabilities', etc.
  status: text("status").notNull().default("required"), // 'required', 'in progress', 'satisfied', 'failed'
  notes: text("notes"), // General notes
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at"),
});

export const insertBurdenOfProofSchema = createInsertSchema(burdensOfProof).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Proofs for each burden of proof
export const proofs = pgTable("proofs", {
  id: serial("id").primaryKey(),
  burdenId: integer("burden_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  proofType: text("proof_type").notNull(), // 'photo', 'document', 'testimony', 'expert_witness', 'physical_evidence', etc.
  status: text("status").notNull().default("pending"), // 'pending', 'collected', 'verified', 'admissible', 'inadmissible'
  confidentiality: text("confidentiality").notNull().default("normal"), // 'public', 'normal', 'sensitive', 'classified'
  collectionDate: timestamp("collection_date"),
  collectedBy: integer("collected_by").notNull(),
  verifiedBy: integer("verified_by"),
  verifiedDate: timestamp("verified_date"),
  source: text("source"), // Where the proof came from
  sourceContact: text("source_contact"), // Contact info for the source
  evidenceUrl: text("evidence_url"), // URL to the evidence file
  notes: text("notes"), // Notes about this piece of evidence
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertProofSchema = createInsertSchema(proofs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Brief sections - used to generate complete prosecution briefs
export const briefSections = pgTable("brief_sections", {
  id: serial("id").primaryKey(),
  investigationId: integer("investigation_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  sectionType: text("section_type").notNull(), // 'intro', 'facts', 'evidence', 'argument', 'conclusion', 'recommendation', etc.
  sectionOrder: integer("section_order").notNull(), // Order within the brief
  status: text("status").notNull().default("draft"), // 'draft', 'review', 'approved', 'final'
  assignedEditor: integer("assigned_editor"), // Officer assigned to edit this section
  tags: text("tags").array(), // Tags for organizing sections
  lastEditedBy: integer("last_edited_by"), 
  lastEditedAt: timestamp("last_edited_at"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBriefSectionSchema = createInsertSchema(briefSections).omit({
  id: true,
  lastEditedAt: true,
  createdAt: true,
});

// Complete brief documents
export const briefs = pgTable("briefs", {
  id: serial("id").primaryKey(),
  investigationId: integer("investigation_id").notNull(),
  title: text("title").notNull(),
  version: text("version").notNull().default("1.0"),
  status: text("status").notNull().default("draft"), // 'draft', 'review', 'final', 'submitted', 'approved'
  briefUrl: text("brief_url"), // URL to the generated PDF
  approvedBy: integer("approved_by"), // Who approved the brief
  approvedAt: timestamp("approved_at"),
  submittedTo: text("submitted_to"), // Who it was submitted to
  submittedAt: timestamp("submitted_at"),
  notes: text("notes"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at"),
});

export const insertBriefSchema = createInsertSchema(briefs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedAt: true,
  submittedAt: true,
});

// Export types for new tables
export type Offence = typeof offences.$inferSelect;
export type InsertOffence = z.infer<typeof insertOffenceSchema>;

export type BurdenOfProof = typeof burdensOfProof.$inferSelect;
export type InsertBurdenOfProof = z.infer<typeof insertBurdenOfProofSchema>;

export type Proof = typeof proofs.$inferSelect;
export type InsertProof = z.infer<typeof insertProofSchema>;

export type BriefSection = typeof briefSections.$inferSelect;
export type InsertBriefSection = z.infer<typeof insertBriefSectionSchema>;

export type Brief = typeof briefs.$inferSelect;
export type InsertBrief = z.infer<typeof insertBriefSchema>;
