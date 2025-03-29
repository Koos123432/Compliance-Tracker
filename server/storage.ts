import { 
  type User, type InsertUser, users,
  type Inspection, type InsertInspection, inspections,
  type InspectionReview, type InsertInspectionReview, inspectionReviews,
  type Person, type InsertPerson, people,
  type Photo, type InsertPhoto, photos,
  type Breach, type InsertBreach, breaches,
  type Investigation, type InsertInvestigation, investigations,
  type Report, type InsertReport, reports,
  type Activity, type InsertActivity, activities,
  type Schedule, type InsertSchedule, schedules,
  type Notification, type InsertNotification, notifications,
  type Team, type InsertTeam, teams,
  type TeamMember, type InsertTeamMember, teamMembers,
  type TeamSchedule, type InsertTeamSchedule, teamSchedules,
  type TeamScheduleAssignment, type InsertTeamScheduleAssignment, teamScheduleAssignments,
  type OfficerNote, type InsertOfficerNote, officerNotes,
  type TrackingNotice, type InsertTrackingNotice, trackingNotices,
  type ElementOfProof, type InsertElementOfProof, elementsOfProof,
  type PersonRelationship, type InsertPersonRelationship, personRelationships,
  type TimelineEvent, type InsertTimelineEvent, timelineEvents,
  type ReportInvestigationLink, type InsertReportInvestigationLink, reportInvestigationLinks,
  type Role, type InsertRole, roles,
  type Permission, type InsertPermission, permissions,
  type RolePermission, type InsertRolePermission, rolePermissions,
  type InvestigationParticipant, type InsertInvestigationParticipant, investigationParticipants,
  type InspectionInvestigationLink, type InsertInspectionInvestigationLink, inspectionInvestigationLinks,
  type Offence, type InsertOffence, offences,
  type BurdenOfProof, type InsertBurdenOfProof, burdensOfProof,
  type Proof, type InsertProof, proofs,
  type BriefSection, type InsertBriefSection, briefSections,
  type Brief, type InsertBrief, briefs,
  type Department, type InsertDepartment, departments,
  type AccessLevel, type InsertAccessLevel, accessLevels
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // Department methods
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<boolean>;
  
  // Access Level methods
  getAccessLevels(): Promise<AccessLevel[]>;
  getAccessLevel(id: number): Promise<AccessLevel | undefined>;
  createAccessLevel(accessLevel: InsertAccessLevel): Promise<AccessLevel>;
  updateAccessLevel(id: number, accessLevel: Partial<InsertAccessLevel>): Promise<AccessLevel | undefined>;
  deleteAccessLevel(id: number): Promise<boolean>;

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inspection methods
  getInspections(): Promise<Inspection[]>;
  getInspection(id: number): Promise<Inspection | undefined>;
  getInspectionByNumber(number: string): Promise<Inspection | undefined>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: number, inspection: Partial<InsertInspection>): Promise<Inspection | undefined>;
  
  // Inspection Review methods
  getInspectionReviews(inspectionId: number): Promise<InspectionReview[]>;
  getInspectionReview(id: number): Promise<InspectionReview | undefined>;
  createInspectionReview(review: InsertInspectionReview): Promise<InspectionReview>;
  updateInspectionReview(id: number, review: Partial<InsertInspectionReview>): Promise<InspectionReview | undefined>;
  deleteInspectionReview(id: number): Promise<boolean>;
  
  // Person methods
  getPeople(inspectionId: number): Promise<Person[]>;
  getPerson(id: number): Promise<Person | undefined>;
  createPerson(person: InsertPerson): Promise<Person>;
  updatePerson(id: number, person: Partial<InsertPerson>): Promise<Person | undefined>;
  deletePerson(id: number): Promise<boolean>;
  
  // Photo methods
  getPhotos(inspectionId: number, breachId?: number): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(id: number): Promise<boolean>;
  
  // Breach methods
  getBreaches(inspectionId: number): Promise<Breach[]>;
  getBreach(id: number): Promise<Breach | undefined>;
  createBreach(breach: InsertBreach): Promise<Breach>;
  updateBreach(id: number, breach: Partial<InsertBreach>): Promise<Breach | undefined>;
  deleteBreach(id: number): Promise<boolean>;
  
  // Investigation methods
  getInvestigations(): Promise<Investigation[]>;
  getInvestigation(id: number): Promise<Investigation | undefined>;
  createInvestigation(investigation: InsertInvestigation): Promise<Investigation>;
  updateInvestigation(id: number, investigation: Partial<InsertInvestigation>): Promise<Investigation | undefined>;
  
  // Report methods
  getReports(inspectionId: number): Promise<Report[]>;
  getReport(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  
  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Schedule methods
  getSchedules(): Promise<Schedule[]>;
  getSchedule(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Team methods
  getTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  
  // Team Member methods
  getTeamMembers(teamId: number): Promise<TeamMember[]>;
  getUserTeams(userId: number): Promise<Team[]>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: number, userId: number): Promise<boolean>;
  updateTeamMember(teamId: number, userId: number, isTeamLead: boolean): Promise<TeamMember | undefined>;
  
  // Team Schedule methods
  getTeamSchedules(teamId: number): Promise<TeamSchedule[]>;
  getTeamSchedule(id: number): Promise<TeamSchedule | undefined>;
  createTeamSchedule(teamSchedule: InsertTeamSchedule): Promise<TeamSchedule>;
  updateTeamSchedule(id: number, teamSchedule: Partial<InsertTeamSchedule>): Promise<TeamSchedule | undefined>;
  deleteTeamSchedule(id: number): Promise<boolean>;
  
  // Team Schedule Assignment methods
  getTeamScheduleAssignments(teamScheduleId: number): Promise<TeamScheduleAssignment[]>;
  getUserAssignments(userId: number): Promise<TeamScheduleAssignment[]>;
  assignTeamSchedule(assignment: InsertTeamScheduleAssignment): Promise<TeamScheduleAssignment>;
  updateAssignmentStatus(id: number, status: string, notes?: string): Promise<TeamScheduleAssignment | undefined>;
  deleteAssignment(id: number): Promise<boolean>;
  
  // Officer Notes methods
  getOfficerNotes(entityId: number, entityType: string): Promise<OfficerNote[]>;
  getOfficerNotesByUser(userId: number): Promise<OfficerNote[]>;
  getOfficerNote(id: number): Promise<OfficerNote | undefined>;
  createOfficerNote(note: InsertOfficerNote): Promise<OfficerNote>;
  updateOfficerNote(id: number, note: Partial<InsertOfficerNote>): Promise<OfficerNote | undefined>;
  deleteOfficerNote(id: number): Promise<boolean>;
  
  // Tracking Notices methods
  getTrackingNotices(investigationId: number): Promise<TrackingNotice[]>;
  getTrackingNotice(id: number): Promise<TrackingNotice | undefined>;
  createTrackingNotice(notice: InsertTrackingNotice): Promise<TrackingNotice>;
  updateTrackingNotice(id: number, notice: Partial<InsertTrackingNotice>): Promise<TrackingNotice | undefined>;
  deleteTrackingNotice(id: number): Promise<boolean>;
  
  // Elements of Proof methods
  getElementsOfProof(investigationId: number): Promise<ElementOfProof[]>;
  getElementOfProof(id: number): Promise<ElementOfProof | undefined>;
  createElementOfProof(element: InsertElementOfProof): Promise<ElementOfProof>;
  updateElementOfProof(id: number, element: Partial<InsertElementOfProof>): Promise<ElementOfProof | undefined>;
  deleteElementOfProof(id: number): Promise<boolean>;
  
  // Person Relationship methods
  getPersonRelationships(personId: number, investigationId?: number): Promise<PersonRelationship[]>;
  getPersonRelationship(id: number): Promise<PersonRelationship | undefined>;
  createPersonRelationship(relationship: InsertPersonRelationship): Promise<PersonRelationship>;
  updatePersonRelationship(id: number, relationship: Partial<InsertPersonRelationship>): Promise<PersonRelationship | undefined>;
  deletePersonRelationship(id: number): Promise<boolean>;
  
  // Timeline Event methods
  getTimelineEvents(investigationId: number): Promise<TimelineEvent[]>;
  getTimelineEvent(id: number): Promise<TimelineEvent | undefined>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(id: number, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: number): Promise<boolean>;
  
  // Report Investigation Link methods
  getReportInvestigationLinks(reportId?: number, investigationId?: number): Promise<ReportInvestigationLink[]>;
  getReportInvestigationLink(id: number): Promise<ReportInvestigationLink | undefined>;
  createReportInvestigationLink(link: InsertReportInvestigationLink): Promise<ReportInvestigationLink>;
  deleteReportInvestigationLink(id: number): Promise<boolean>;
  
  // Role methods
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: number): Promise<boolean>;
  
  // Permission methods
  getPermissions(): Promise<Permission[]>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  
  // Role-Permission mapping methods
  getRolePermissions(roleId: number): Promise<RolePermission[]>;
  createRolePermission(rolePermission: InsertRolePermission): Promise<RolePermission>;
  deleteRolePermission(roleId: number, permissionId: number): Promise<boolean>;
  
  // User methods (extended)
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Investigation participants methods
  getInvestigationParticipants(investigationId: number): Promise<InvestigationParticipant[]>;
  getUserInvestigations(userId: number): Promise<Investigation[]>;
  createInvestigationParticipant(participant: InsertInvestigationParticipant): Promise<InvestigationParticipant>;
  getInvestigationParticipant(id: number): Promise<InvestigationParticipant | undefined>;
  updateInvestigationParticipant(id: number, participant: Partial<InsertInvestigationParticipant>): Promise<InvestigationParticipant | undefined>;
  deleteInvestigationParticipant(id: number): Promise<boolean>;
  
  // Inspection-Investigation Link methods
  getInspectionInvestigationLinks(inspectionId?: number, investigationId?: number): Promise<InspectionInvestigationLink[]>;
  getInspectionInvestigationLink(id: number): Promise<InspectionInvestigationLink | undefined>;
  createInspectionInvestigationLink(link: InsertInspectionInvestigationLink): Promise<InspectionInvestigationLink>;
  updateInspectionInvestigationLink(id: number, link: Partial<InsertInspectionInvestigationLink>): Promise<InspectionInvestigationLink | undefined>;
  deleteInspectionInvestigationLink(id: number): Promise<boolean>;
  getInspectionsForInvestigation(investigationId: number): Promise<Inspection[]>;
  getInvestigationsForInspection(inspectionId: number): Promise<Investigation[]>;
  
  // Offence methods
  getOffences(investigationId: number): Promise<Offence[]>;
  getOffence(id: number): Promise<Offence | undefined>;
  createOffence(offence: InsertOffence): Promise<Offence>;
  updateOffence(id: number, updateData: Partial<InsertOffence>): Promise<Offence | undefined>;
  deleteOffence(id: number): Promise<boolean>;
  
  // Burden of Proof methods
  getBurdensOfProof(offenceId: number): Promise<BurdenOfProof[]>;
  getBurdenOfProof(id: number): Promise<BurdenOfProof | undefined>;
  createBurdenOfProof(burden: InsertBurdenOfProof): Promise<BurdenOfProof>;
  updateBurdenOfProof(id: number, updateData: Partial<InsertBurdenOfProof>): Promise<BurdenOfProof | undefined>;
  deleteBurdenOfProof(id: number): Promise<boolean>;
  
  // Proof methods
  getProofs(burdenId: number): Promise<Proof[]>;
  getProof(id: number): Promise<Proof | undefined>;
  createProof(proof: InsertProof): Promise<Proof>;
  updateProof(id: number, updateData: Partial<InsertProof>): Promise<Proof | undefined>;
  deleteProof(id: number): Promise<boolean>;
  
  // Brief Section methods
  getBriefSections(investigationId: number): Promise<BriefSection[]>;
  getBriefSection(id: number): Promise<BriefSection | undefined>;
  createBriefSection(section: InsertBriefSection): Promise<BriefSection>;
  updateBriefSection(id: number, updateData: Partial<InsertBriefSection>): Promise<BriefSection | undefined>;
  deleteBriefSection(id: number): Promise<boolean>;
  
  // Brief methods
  getBriefs(investigationId: number): Promise<Brief[]>;
  getBrief(id: number): Promise<Brief | undefined>;
  createBrief(brief: InsertBrief): Promise<Brief>;
  updateBrief(id: number, updateData: Partial<InsertBrief>): Promise<Brief | undefined>;
  deleteBrief(id: number): Promise<boolean>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private departments: Map<number, Department>;
  private accessLevels: Map<number, AccessLevel>;
  private users: Map<number, User>;
  private inspections: Map<number, Inspection>;
  private inspectionReviews: Map<number, InspectionReview>;
  private people: Map<number, Person>;
  private photos: Map<number, Photo>;
  private breaches: Map<number, Breach>;
  private investigations: Map<number, Investigation>;
  private reports: Map<number, Report>;
  private activities: Map<number, Activity>;
  private schedules: Map<number, Schedule>;
  private notifications: Map<number, Notification>;
  private teams: Map<number, Team>;
  private teamMembers: Map<string, TeamMember>; // Composite key: `${teamId}-${userId}`
  private teamSchedules: Map<number, TeamSchedule>;
  private teamScheduleAssignments: Map<number, TeamScheduleAssignment>;
  private officerNotes: Map<number, OfficerNote>;
  private trackingNotices: Map<number, TrackingNotice>;
  private elementsOfProof: Map<number, ElementOfProof>;
  private personRelationships: Map<number, PersonRelationship>;
  private timelineEvents: Map<number, TimelineEvent>;
  private reportInvestigationLinks: Map<number, ReportInvestigationLink>;
  private roles: Map<number, Role>;
  private permissions: Map<number, Permission>;
  private rolePermissions: Map<string, RolePermission>; // Composite key: `${roleId}-${permissionId}`
  private investigationParticipants: Map<number, InvestigationParticipant>;
  private inspectionInvestigationLinks: Map<number, InspectionInvestigationLink>;
  private offences: Map<number, Offence>;
  private burdensOfProof: Map<number, BurdenOfProof>;
  private proofs: Map<number, Proof>;
  private briefSections: Map<number, BriefSection>;
  private briefs: Map<number, Brief>;
  
  private departmentId: number;
  private accessLevelId: number;
  private userId: number;
  private inspectionId: number;
  private inspectionReviewId: number;
  private personId: number;
  private photoId: number;
  private breachId: number;
  private investigationId: number;
  private reportId: number;
  private activityId: number;
  private scheduleId: number;
  private notificationId: number;
  private teamId: number;
  private teamScheduleId: number;
  private teamScheduleAssignmentId: number;
  private officerNoteId: number;
  private trackingNoticeId: number;
  private elementOfProofId: number;
  private personRelationshipId: number;
  private timelineEventId: number;
  private reportInvestigationLinkId: number;
  private roleId: number;
  private permissionId: number;
  private investigationParticipantId: number;
  private inspectionInvestigationLinkId: number;
  private offenceId: number;
  private burdenOfProofId: number;
  private proofId: number;
  private briefSectionId: number;
  private briefId: number;
  
  constructor() {
    this.departments = new Map();
    this.accessLevels = new Map();
    this.users = new Map();
    this.inspections = new Map();
    this.inspectionReviews = new Map();
    this.people = new Map();
    this.photos = new Map();
    this.breaches = new Map();
    this.investigations = new Map();
    this.reports = new Map();
    this.activities = new Map();
    this.schedules = new Map();
    this.notifications = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.teamSchedules = new Map();
    this.teamScheduleAssignments = new Map();
    this.officerNotes = new Map();
    this.trackingNotices = new Map();
    this.elementsOfProof = new Map();
    this.personRelationships = new Map();
    this.timelineEvents = new Map();
    this.reportInvestigationLinks = new Map();
    this.roles = new Map();
    this.permissions = new Map();
    this.rolePermissions = new Map();
    this.investigationParticipants = new Map();
    this.inspectionInvestigationLinks = new Map();
    
    // Initialize new maps for offence management
    this.offences = new Map();
    this.burdensOfProof = new Map();
    this.proofs = new Map();
    this.briefSections = new Map();
    this.briefs = new Map();
    
    this.departmentId = 1;
    this.accessLevelId = 1;
    this.userId = 1;
    this.inspectionId = 1;
    this.inspectionReviewId = 1;
    this.personId = 1;
    this.photoId = 1;
    this.breachId = 1;
    this.investigationId = 1;
    this.reportId = 1;
    this.activityId = 1;
    this.scheduleId = 1;
    this.notificationId = 1;
    this.teamId = 1;
    this.teamScheduleId = 1;
    this.teamScheduleAssignmentId = 1;
    this.officerNoteId = 1;
    this.trackingNoticeId = 1;
    this.elementOfProofId = 1;
    this.personRelationshipId = 1;
    this.timelineEventId = 1;
    this.reportInvestigationLinkId = 1;
    this.roleId = 1;
    this.permissionId = 1;
    this.investigationParticipantId = 1;
    this.inspectionInvestigationLinkId = 1;
    this.offenceId = 1;
    this.burdenOfProofId = 1;
    this.proofId = 1;
    this.briefSectionId = 1;
    this.briefId = 1;
    
    // Create default departments
    this.createDepartment({
      name: "Environmental Protection",
      description: "Handles environmental compliance and regulations",
      isActive: true,
      parentDepartmentId: null
    });
    
    this.createDepartment({
      name: "Building Compliance",
      description: "Manages building code compliance and inspections",
      isActive: true,
      parentDepartmentId: null
    });
    
    this.createDepartment({
      name: "Health and Safety",
      description: "Oversees health regulations and safety standards",
      isActive: true,
      parentDepartmentId: null
    });
    
    // Create default access levels
    this.createAccessLevel({
      name: "Administrator",
      level: 10,
      description: "Full system access with all privileges"
    });
    
    this.createAccessLevel({
      name: "Manager",
      level: 8,
      description: "Department level management access"
    });
    
    this.createAccessLevel({
      name: "Senior Officer",
      level: 5,
      description: "Advanced features access for experienced officers"
    });
    
    this.createAccessLevel({
      name: "Officer",
      level: 3,
      description: "Standard officer access level"
    });
    
    this.createAccessLevel({
      name: "Trainee",
      level: 1,
      description: "Limited access for training purposes"
    });
    
    // Create default users
    this.createUser({
      username: "officer1",
      password: "password123",
      fullName: "John Smith",
      email: "jsmith@example.com",
      phoneNumber: "0412345678",
      departmentId: 1,
      accessLevelId: 3
    });
    
    this.createUser({
      username: "officer2",
      password: "password123",
      fullName: "Jane Doe",
      email: "jdoe@example.com",
      phoneNumber: "0411222333",
      departmentId: 2,
      accessLevelId: 4
    });
  }
  
  // Department methods
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = this.departmentId++;
    const department: Department = {
      ...insertDepartment,
      id,
      createdAt: new Date()
    };
    this.departments.set(id, department);
    return department;
  }

  async updateDepartment(id: number, updateData: Partial<InsertDepartment>): Promise<Department | undefined> {
    const department = this.departments.get(id);
    if (!department) return undefined;

    const updatedDepartment: Department = {
      ...department,
      ...updateData
    };
    this.departments.set(id, updatedDepartment);
    return updatedDepartment;
  }

  async deleteDepartment(id: number): Promise<boolean> {
    // We should check if there are users assigned to this department
    const hasUsers = Array.from(this.users.values()).some(
      user => user.departmentId === id
    );
    
    if (hasUsers) {
      // Don't delete departments with assigned users
      return false;
    }
    
    return this.departments.delete(id);
  }

  // Access Level methods
  async getAccessLevels(): Promise<AccessLevel[]> {
    return Array.from(this.accessLevels.values());
  }

  async getAccessLevel(id: number): Promise<AccessLevel | undefined> {
    return this.accessLevels.get(id);
  }

  async createAccessLevel(insertAccessLevel: InsertAccessLevel): Promise<AccessLevel> {
    const id = this.accessLevelId++;
    const accessLevel: AccessLevel = {
      ...insertAccessLevel,
      id,
      createdAt: new Date()
    };
    this.accessLevels.set(id, accessLevel);
    return accessLevel;
  }

  async updateAccessLevel(id: number, updateData: Partial<InsertAccessLevel>): Promise<AccessLevel | undefined> {
    const accessLevel = this.accessLevels.get(id);
    if (!accessLevel) return undefined;

    const updatedAccessLevel: AccessLevel = {
      ...accessLevel,
      ...updateData
    };
    this.accessLevels.set(id, updatedAccessLevel);
    return updatedAccessLevel;
  }

  async deleteAccessLevel(id: number): Promise<boolean> {
    // We should check if there are users assigned to this access level
    const hasUsers = Array.from(this.users.values()).some(
      user => user.accessLevelId === id
    );
    
    if (hasUsers) {
      // Don't delete access levels with assigned users
      return false;
    }
    
    return this.accessLevels.delete(id);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      roleId: null,
      departmentId: null,
      accessLevelId: null,
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
      // Ensure all nullable fields are properly set to null instead of undefined
      email: insertUser.email || null,
      phoneNumber: insertUser.phoneNumber || null
    };
    this.users.set(id, user);
    return user;
  }
  
  // Inspection methods
  async getInspections(): Promise<Inspection[]> {
    return Array.from(this.inspections.values());
  }
  
  async getInspection(id: number): Promise<Inspection | undefined> {
    return this.inspections.get(id);
  }
  
  async getInspectionByNumber(number: string): Promise<Inspection | undefined> {
    return Array.from(this.inspections.values()).find(
      (inspection) => inspection.inspectionNumber === number
    );
  }
  
  async createInspection(insertInspection: InsertInspection): Promise<Inspection> {
    const id = this.inspectionId++;
    const inspection: Inspection = { 
      ...insertInspection, 
      id, 
      createdAt: new Date()
    };
    this.inspections.set(id, inspection);
    return inspection;
  }
  
  async updateInspection(id: number, updateData: Partial<InsertInspection>): Promise<Inspection | undefined> {
    const inspection = this.inspections.get(id);
    if (!inspection) return undefined;
    
    const updatedInspection: Inspection = { 
      ...inspection, 
      ...updateData 
    };
    this.inspections.set(id, updatedInspection);
    return updatedInspection;
  }
  
  // Inspection Review methods
  async getInspectionReviews(inspectionId: number): Promise<InspectionReview[]> {
    return Array.from(this.inspectionReviews.values()).filter(
      (review) => review.inspectionId === inspectionId
    );
  }
  
  async getInspectionReview(id: number): Promise<InspectionReview | undefined> {
    return this.inspectionReviews.get(id);
  }
  
  async createInspectionReview(insertReview: InsertInspectionReview): Promise<InspectionReview> {
    const id = this.inspectionReviewId++;
    const review: InspectionReview = {
      ...insertReview,
      id,
      createdAt: new Date()
    };
    this.inspectionReviews.set(id, review);
    return review;
  }
  
  async updateInspectionReview(id: number, updateData: Partial<InsertInspectionReview>): Promise<InspectionReview | undefined> {
    const review = this.inspectionReviews.get(id);
    if (!review) return undefined;
    
    const updatedReview: InspectionReview = {
      ...review,
      ...updateData
    };
    this.inspectionReviews.set(id, updatedReview);
    return updatedReview;
  }
  
  async deleteInspectionReview(id: number): Promise<boolean> {
    return this.inspectionReviews.delete(id);
  }
  
  // Person methods
  async getPeople(inspectionId: number): Promise<Person[]> {
    return Array.from(this.people.values()).filter(
      (person) => person.inspectionId === inspectionId
    );
  }
  
  async getPerson(id: number): Promise<Person | undefined> {
    return this.people.get(id);
  }
  
  async createPerson(insertPerson: InsertPerson): Promise<Person> {
    const id = this.personId++;
    const person: Person = { ...insertPerson, id };
    this.people.set(id, person);
    return person;
  }
  
  async updatePerson(id: number, updateData: Partial<InsertPerson>): Promise<Person | undefined> {
    const person = this.people.get(id);
    if (!person) return undefined;
    
    const updatedPerson: Person = { ...person, ...updateData };
    this.people.set(id, updatedPerson);
    return updatedPerson;
  }
  
  async deletePerson(id: number): Promise<boolean> {
    return this.people.delete(id);
  }
  
  // Photo methods
  async getPhotos(inspectionId: number, breachId?: number): Promise<Photo[]> {
    return Array.from(this.photos.values()).filter(
      (photo) => photo.inspectionId === inspectionId && 
                (breachId === undefined || photo.breachId === breachId)
    );
  }
  
  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }
  
  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.photoId++;
    const photo: Photo = { 
      ...insertPhoto, 
      id, 
      createdAt: new Date()
    };
    this.photos.set(id, photo);
    return photo;
  }
  
  async deletePhoto(id: number): Promise<boolean> {
    return this.photos.delete(id);
  }
  
  // Breach methods
  async getBreaches(inspectionId: number): Promise<Breach[]> {
    return Array.from(this.breaches.values()).filter(
      (breach) => breach.inspectionId === inspectionId
    );
  }
  
  async getBreach(id: number): Promise<Breach | undefined> {
    return this.breaches.get(id);
  }
  
  async createBreach(insertBreach: InsertBreach): Promise<Breach> {
    const id = this.breachId++;
    const breach: Breach = { 
      ...insertBreach, 
      id, 
      createdAt: new Date()
    };
    this.breaches.set(id, breach);
    return breach;
  }
  
  async updateBreach(id: number, updateData: Partial<InsertBreach>): Promise<Breach | undefined> {
    const breach = this.breaches.get(id);
    if (!breach) return undefined;
    
    const updatedBreach: Breach = { ...breach, ...updateData };
    this.breaches.set(id, updatedBreach);
    return updatedBreach;
  }
  
  async deleteBreach(id: number): Promise<boolean> {
    return this.breaches.delete(id);
  }
  
  // Investigation methods
  async getInvestigations(): Promise<Investigation[]> {
    return Array.from(this.investigations.values());
  }
  
  async getInvestigation(id: number): Promise<Investigation | undefined> {
    return this.investigations.get(id);
  }
  
  async createInvestigation(insertInvestigation: InsertInvestigation): Promise<Investigation> {
    const id = this.investigationId++;
    const investigation: Investigation = { 
      ...insertInvestigation, 
      id, 
      createdAt: new Date()
    };
    this.investigations.set(id, investigation);
    return investigation;
  }
  
  async updateInvestigation(id: number, updateData: Partial<InsertInvestigation>): Promise<Investigation | undefined> {
    const investigation = this.investigations.get(id);
    if (!investigation) return undefined;
    
    const updatedInvestigation: Investigation = { ...investigation, ...updateData };
    this.investigations.set(id, updatedInvestigation);
    return updatedInvestigation;
  }
  
  // Report methods
  async getReports(inspectionId: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.inspectionId === inspectionId
    );
  }
  
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }
  
  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.reportId++;
    const report: Report = { 
      ...insertReport, 
      id, 
      createdAt: new Date()
    };
    this.reports.set(id, report);
    return report;
  }
  
  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date()
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Schedule methods
  async getSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values());
  }
  
  async getSchedule(id: number): Promise<Schedule | undefined> {
    return this.schedules.get(id);
  }
  
  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleId++;
    const schedule: Schedule = { 
      ...insertSchedule, 
      id, 
      createdAt: new Date()
    };
    this.schedules.set(id, schedule);
    return schedule;
  }
  
  async updateSchedule(id: number, updateData: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const schedule = this.schedules.get(id);
    if (!schedule) return undefined;
    
    const updatedSchedule: Schedule = { ...schedule, ...updateData };
    this.schedules.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  async deleteSchedule(id: number): Promise<boolean> {
    return this.schedules.delete(id);
  }

  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date()
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;

    const updatedNotification: Notification = {
      ...notification,
      isRead: true
    };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Team methods
  async getTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.teamId++;
    const team: Team = {
      ...insertTeam,
      id,
      createdAt: new Date()
    };
    this.teams.set(id, team);
    return team;
  }

  async updateTeam(id: number, updateData: Partial<InsertTeam>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;

    const updatedTeam: Team = {
      ...team,
      ...updateData
    };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  async deleteTeam(id: number): Promise<boolean> {
    // Also delete team members
    const membersToDelete = Array.from(this.teamMembers.entries())
      .filter(([key]) => key.startsWith(`${id}-`));
    
    for (const [key] of membersToDelete) {
      this.teamMembers.delete(key);
    }
    
    // Also delete team schedules
    const teamSchedulesToDelete = Array.from(this.teamSchedules.values())
      .filter(schedule => schedule.teamId === id)
      .map(schedule => schedule.id);
    
    for (const scheduleId of teamSchedulesToDelete) {
      this.teamSchedules.delete(scheduleId);
      
      // Delete assignments for this schedule
      const assignmentsToDelete = Array.from(this.teamScheduleAssignments.values())
        .filter(assignment => assignment.teamScheduleId === scheduleId)
        .map(assignment => assignment.id);
      
      for (const assignmentId of assignmentsToDelete) {
        this.teamScheduleAssignments.delete(assignmentId);
      }
    }
    
    return this.teams.delete(id);
  }

  // Team Member methods
  async getTeamMembers(teamId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
      .filter(member => member.teamId === teamId);
  }

  async getUserTeams(userId: number): Promise<Team[]> {
    const teamIds = Array.from(this.teamMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.teamId);
    
    return Array.from(this.teams.values())
      .filter(team => teamIds.includes(team.id));
  }

  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const key = `${teamMember.teamId}-${teamMember.userId}`;
    const member: TeamMember = {
      ...teamMember,
      joinedAt: new Date()
    };
    this.teamMembers.set(key, member);
    return member;
  }

  async removeTeamMember(teamId: number, userId: number): Promise<boolean> {
    const key = `${teamId}-${userId}`;
    return this.teamMembers.delete(key);
  }

  async updateTeamMember(teamId: number, userId: number, isTeamLead: boolean): Promise<TeamMember | undefined> {
    const key = `${teamId}-${userId}`;
    const member = this.teamMembers.get(key);
    if (!member) return undefined;

    const updatedMember: TeamMember = {
      ...member,
      isTeamLead
    };
    this.teamMembers.set(key, updatedMember);
    return updatedMember;
  }

  // Team Schedule methods
  async getTeamSchedules(teamId: number): Promise<TeamSchedule[]> {
    return Array.from(this.teamSchedules.values())
      .filter(schedule => schedule.teamId === teamId);
  }

  async getTeamSchedule(id: number): Promise<TeamSchedule | undefined> {
    return this.teamSchedules.get(id);
  }

  async createTeamSchedule(insertTeamSchedule: InsertTeamSchedule): Promise<TeamSchedule> {
    const id = this.teamScheduleId++;
    const teamSchedule: TeamSchedule = {
      ...insertTeamSchedule,
      id,
      createdAt: new Date()
    };
    this.teamSchedules.set(id, teamSchedule);
    return teamSchedule;
  }

  async updateTeamSchedule(id: number, updateData: Partial<InsertTeamSchedule>): Promise<TeamSchedule | undefined> {
    const schedule = this.teamSchedules.get(id);
    if (!schedule) return undefined;

    const updatedSchedule: TeamSchedule = {
      ...schedule,
      ...updateData
    };
    this.teamSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }

  async deleteTeamSchedule(id: number): Promise<boolean> {
    // Also delete assignments for this schedule
    const assignmentsToDelete = Array.from(this.teamScheduleAssignments.values())
      .filter(assignment => assignment.teamScheduleId === id)
      .map(assignment => assignment.id);
    
    for (const assignmentId of assignmentsToDelete) {
      this.teamScheduleAssignments.delete(assignmentId);
    }
    
    return this.teamSchedules.delete(id);
  }

  // Team Schedule Assignment methods
  async getTeamScheduleAssignments(teamScheduleId: number): Promise<TeamScheduleAssignment[]> {
    return Array.from(this.teamScheduleAssignments.values())
      .filter(assignment => assignment.teamScheduleId === teamScheduleId);
  }

  async getUserAssignments(userId: number): Promise<TeamScheduleAssignment[]> {
    return Array.from(this.teamScheduleAssignments.values())
      .filter(assignment => assignment.userId === userId);
  }

  async assignTeamSchedule(insertAssignment: InsertTeamScheduleAssignment): Promise<TeamScheduleAssignment> {
    const id = this.teamScheduleAssignmentId++;
    const assignment: TeamScheduleAssignment = {
      ...insertAssignment,
      id,
      assignedAt: new Date(),
      updatedAt: null
    };
    this.teamScheduleAssignments.set(id, assignment);
    return assignment;
  }

  async updateAssignmentStatus(id: number, status: string, notes?: string): Promise<TeamScheduleAssignment | undefined> {
    const assignment = this.teamScheduleAssignments.get(id);
    if (!assignment) return undefined;

    const updatedAssignment: TeamScheduleAssignment = {
      ...assignment,
      assignmentStatus: status,
      notes: notes || assignment.notes,
      updatedAt: new Date()
    };
    this.teamScheduleAssignments.set(id, updatedAssignment);
    return updatedAssignment;
  }

  async deleteAssignment(id: number): Promise<boolean> {
    return this.teamScheduleAssignments.delete(id);
  }
  
  // Officer Notes methods
  async getOfficerNotes(entityId: number, entityType: string): Promise<OfficerNote[]> {
    return Array.from(this.officerNotes.values())
      .filter(note => note.entityId === entityId && note.entityType === entityType)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getOfficerNotesByUser(userId: number): Promise<OfficerNote[]> {
    return Array.from(this.officerNotes.values())
      .filter(note => note.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getOfficerNote(id: number): Promise<OfficerNote | undefined> {
    return this.officerNotes.get(id);
  }
  
  async createOfficerNote(insertNote: InsertOfficerNote): Promise<OfficerNote> {
    const id = this.officerNoteId++;
    const note: OfficerNote = {
      ...insertNote,
      id,
      createdAt: new Date()
    };
    this.officerNotes.set(id, note);
    return note;
  }
  
  async updateOfficerNote(id: number, updateData: Partial<InsertOfficerNote>): Promise<OfficerNote | undefined> {
    const note = this.officerNotes.get(id);
    if (!note) return undefined;
    
    const updatedNote: OfficerNote = {
      ...note,
      ...updateData
    };
    this.officerNotes.set(id, updatedNote);
    return updatedNote;
  }
  
  async deleteOfficerNote(id: number): Promise<boolean> {
    return this.officerNotes.delete(id);
  }
  
  // Tracking Notices methods
  async getTrackingNotices(investigationId: number): Promise<TrackingNotice[]> {
    return Array.from(this.trackingNotices.values())
      .filter(notice => notice.investigationId === investigationId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getTrackingNotice(id: number): Promise<TrackingNotice | undefined> {
    return this.trackingNotices.get(id);
  }
  
  async createTrackingNotice(insertNotice: InsertTrackingNotice): Promise<TrackingNotice> {
    const id = this.trackingNoticeId++;
    const notice: TrackingNotice = {
      ...insertNotice,
      id,
      createdAt: new Date()
    };
    this.trackingNotices.set(id, notice);
    return notice;
  }
  
  async updateTrackingNotice(id: number, updateData: Partial<InsertTrackingNotice>): Promise<TrackingNotice | undefined> {
    const notice = this.trackingNotices.get(id);
    if (!notice) return undefined;
    
    const updatedNotice: TrackingNotice = {
      ...notice,
      ...updateData
    };
    this.trackingNotices.set(id, updatedNotice);
    return updatedNotice;
  }
  
  async deleteTrackingNotice(id: number): Promise<boolean> {
    return this.trackingNotices.delete(id);
  }
  
  // Elements of Proof methods
  async getElementsOfProof(investigationId: number): Promise<ElementOfProof[]> {
    return Array.from(this.elementsOfProof.values())
      .filter(element => element.investigationId === investigationId)
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
  }
  
  async getElementOfProof(id: number): Promise<ElementOfProof | undefined> {
    return this.elementsOfProof.get(id);
  }
  
  async createElementOfProof(insertElement: InsertElementOfProof): Promise<ElementOfProof> {
    const id = this.elementOfProofId++;
    const element: ElementOfProof = {
      ...insertElement,
      id,
      createdAt: new Date()
    };
    this.elementsOfProof.set(id, element);
    return element;
  }
  
  async updateElementOfProof(id: number, updateData: Partial<InsertElementOfProof>): Promise<ElementOfProof | undefined> {
    const element = this.elementsOfProof.get(id);
    if (!element) return undefined;
    
    const updatedElement: ElementOfProof = {
      ...element,
      ...updateData
    };
    this.elementsOfProof.set(id, updatedElement);
    return updatedElement;
  }
  
  async deleteElementOfProof(id: number): Promise<boolean> {
    return this.elementsOfProof.delete(id);
  }
  
  // Person Relationship methods
  async getPersonRelationships(personId: number, investigationId?: number): Promise<PersonRelationship[]> {
    return Array.from(this.personRelationships.values())
      .filter(relationship => relationship.personId === personId && 
              (investigationId === undefined || relationship.investigationId === investigationId));
  }
  
  async getPersonRelationship(id: number): Promise<PersonRelationship | undefined> {
    return this.personRelationships.get(id);
  }
  
  async createPersonRelationship(relationship: InsertPersonRelationship): Promise<PersonRelationship> {
    const id = this.personRelationshipId++;
    const personRelationship: PersonRelationship = {
      ...relationship,
      id,
      createdAt: new Date()
    };
    this.personRelationships.set(id, personRelationship);
    return personRelationship;
  }
  
  async updatePersonRelationship(id: number, relationship: Partial<InsertPersonRelationship>): Promise<PersonRelationship | undefined> {
    const personRelationship = this.personRelationships.get(id);
    if (!personRelationship) return undefined;
    
    const updatedRelationship: PersonRelationship = {
      ...personRelationship,
      ...relationship
    };
    this.personRelationships.set(id, updatedRelationship);
    return updatedRelationship;
  }
  
  async deletePersonRelationship(id: number): Promise<boolean> {
    return this.personRelationships.delete(id);
  }
  
  // Timeline Event methods
  async getTimelineEvents(investigationId: number): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values())
      .filter(event => event.investigationId === investigationId)
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
  }
  
  async getTimelineEvent(id: number): Promise<TimelineEvent | undefined> {
    return this.timelineEvents.get(id);
  }
  
  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = this.timelineEventId++;
    const timelineEvent: TimelineEvent = {
      ...event,
      id,
      createdAt: new Date()
    };
    this.timelineEvents.set(id, timelineEvent);
    return timelineEvent;
  }
  
  async updateTimelineEvent(id: number, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const timelineEvent = this.timelineEvents.get(id);
    if (!timelineEvent) return undefined;
    
    const updatedEvent: TimelineEvent = {
      ...timelineEvent,
      ...event
    };
    this.timelineEvents.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteTimelineEvent(id: number): Promise<boolean> {
    return this.timelineEvents.delete(id);
  }
  
  // Report Investigation Link methods
  async getReportInvestigationLinks(reportId?: number, investigationId?: number): Promise<ReportInvestigationLink[]> {
    return Array.from(this.reportInvestigationLinks.values())
      .filter(link => 
        (reportId === undefined || link.reportId === reportId) && 
        (investigationId === undefined || link.investigationId === investigationId)
      );
  }
  
  async getReportInvestigationLink(id: number): Promise<ReportInvestigationLink | undefined> {
    return this.reportInvestigationLinks.get(id);
  }
  
  async createReportInvestigationLink(link: InsertReportInvestigationLink): Promise<ReportInvestigationLink> {
    const id = this.reportInvestigationLinkId++;
    const reportInvestigationLink: ReportInvestigationLink = {
      ...link,
      id,
      createdAt: new Date()
    };
    this.reportInvestigationLinks.set(id, reportInvestigationLink);
    return reportInvestigationLink;
  }
  
  async deleteReportInvestigationLink(id: number): Promise<boolean> {
    return this.reportInvestigationLinks.delete(id);
  }

  // Role methods
  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getRole(id: number): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const id = this.roleId++;
    const role: Role = {
      ...insertRole,
      id,
      createdAt: new Date()
    };
    this.roles.set(id, role);
    return role;
  }

  async updateRole(id: number, updateData: Partial<InsertRole>): Promise<Role | undefined> {
    const role = this.roles.get(id);
    if (!role) return undefined;
    
    const updatedRole: Role = {
      ...role,
      ...updateData,
    };
    this.roles.set(id, updatedRole);
    return updatedRole;
  }

  async deleteRole(id: number): Promise<boolean> {
    // Also delete role permissions
    const rolePermissionsToDelete = Array.from(this.rolePermissions.entries())
      .filter(([key]) => key.startsWith(`${id}-`))
      .map(([key]) => key);
    
    for (const key of rolePermissionsToDelete) {
      this.rolePermissions.delete(key);
    }
    
    return this.roles.delete(id);
  }

  // Permission methods
  async getPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }

  async createPermission(insertPermission: InsertPermission): Promise<Permission> {
    const id = this.permissionId++;
    const permission: Permission = {
      ...insertPermission,
      id,
      createdAt: new Date()
    };
    this.permissions.set(id, permission);
    return permission;
  }

  // Role-Permission mapping methods
  async getRolePermissions(roleId: number): Promise<RolePermission[]> {
    return Array.from(this.rolePermissions.values())
      .filter(rp => rp.roleId === roleId);
  }

  async createRolePermission(insertRolePermission: InsertRolePermission): Promise<RolePermission> {
    const key = `${insertRolePermission.roleId}-${insertRolePermission.permissionId}`;
    const rolePermission: RolePermission = {
      ...insertRolePermission,
      createdAt: new Date()
    };
    this.rolePermissions.set(key, rolePermission);
    return rolePermission;
  }

  async deleteRolePermission(roleId: number, permissionId: number): Promise<boolean> {
    const key = `${roleId}-${permissionId}`;
    return this.rolePermissions.delete(key);
  }
  
  // User methods (extended)
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, updateData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updateData
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Investigation participants methods
  async getInvestigationParticipants(investigationId: number): Promise<InvestigationParticipant[]> {
    return Array.from(this.investigationParticipants.values())
      .filter(participant => participant.investigationId === investigationId);
  }

  async getUserInvestigations(userId: number): Promise<Investigation[]> {
    const participantInvestigationIds = Array.from(this.investigationParticipants.values())
      .filter(participant => participant.userId === userId && participant.isActive)
      .map(participant => participant.investigationId);
    
    return Array.from(this.investigations.values())
      .filter(investigation => participantInvestigationIds.includes(investigation.id));
  }

  async createInvestigationParticipant(insertParticipant: InsertInvestigationParticipant): Promise<InvestigationParticipant> {
    const id = this.investigationParticipantId++;
    const participant: InvestigationParticipant = {
      ...insertParticipant,
      id,
      addedAt: new Date(),
      updatedAt: null,
      isActive: true
    };
    this.investigationParticipants.set(id, participant);
    return participant;
  }

  async getInvestigationParticipant(id: number): Promise<InvestigationParticipant | undefined> {
    return this.investigationParticipants.get(id);
  }

  async updateInvestigationParticipant(id: number, updateData: Partial<InsertInvestigationParticipant>): Promise<InvestigationParticipant | undefined> {
    const participant = this.investigationParticipants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant: InvestigationParticipant = {
      ...participant,
      ...updateData,
      updatedAt: new Date()
    };
    this.investigationParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async deleteInvestigationParticipant(id: number): Promise<boolean> {
    return this.investigationParticipants.delete(id);
  }

  // Inspection-Investigation Link methods
  async getInspectionInvestigationLinks(inspectionId?: number, investigationId?: number): Promise<InspectionInvestigationLink[]> {
    if (inspectionId && investigationId) {
      return Array.from(this.inspectionInvestigationLinks.values())
        .filter(link => link.inspectionId === inspectionId && link.investigationId === investigationId);
    } else if (inspectionId) {
      return Array.from(this.inspectionInvestigationLinks.values())
        .filter(link => link.inspectionId === inspectionId);
    } else if (investigationId) {
      return Array.from(this.inspectionInvestigationLinks.values())
        .filter(link => link.investigationId === investigationId);
    } else {
      return Array.from(this.inspectionInvestigationLinks.values());
    }
  }

  async getInspectionInvestigationLink(id: number): Promise<InspectionInvestigationLink | undefined> {
    return this.inspectionInvestigationLinks.get(id);
  }

  async createInspectionInvestigationLink(insertLink: InsertInspectionInvestigationLink): Promise<InspectionInvestigationLink> {
    const id = this.inspectionInvestigationLinkId++;
    const link: InspectionInvestigationLink = {
      ...insertLink,
      id,
      createdAt: new Date()
    };
    this.inspectionInvestigationLinks.set(id, link);
    return link;
  }

  async updateInspectionInvestigationLink(id: number, updateData: Partial<InsertInspectionInvestigationLink>): Promise<InspectionInvestigationLink | undefined> {
    const link = this.inspectionInvestigationLinks.get(id);
    if (!link) return undefined;
    
    const updatedLink: InspectionInvestigationLink = {
      ...link,
      ...updateData
    };
    this.inspectionInvestigationLinks.set(id, updatedLink);
    return updatedLink;
  }

  async deleteInspectionInvestigationLink(id: number): Promise<boolean> {
    return this.inspectionInvestigationLinks.delete(id);
  }

  async getInspectionsForInvestigation(investigationId: number): Promise<Inspection[]> {
    const links = await this.getInspectionInvestigationLinks(undefined, investigationId);
    const inspectionIds = links.map(link => link.inspectionId);
    
    return Array.from(this.inspections.values())
      .filter(inspection => inspectionIds.includes(inspection.id));
  }

  async getInvestigationsForInspection(inspectionId: number): Promise<Investigation[]> {
    const links = await this.getInspectionInvestigationLinks(inspectionId);
    const investigationIds = links.map(link => link.investigationId);
    
    return Array.from(this.investigations.values())
      .filter(investigation => investigationIds.includes(investigation.id));
  }
  
  // Removed duplicate implementations

  // Offence methods
  async getOffences(investigationId: number): Promise<Offence[]> {
    return Array.from(this.offences.values())
      .filter(offence => offence.investigationId === investigationId);
  }

  async getOffence(id: number): Promise<Offence | undefined> {
    return this.offences.get(id);
  }

  async createOffence(insertOffence: InsertOffence): Promise<Offence> {
    const id = this.offenceId++;
    const offence: Offence = {
      ...insertOffence,
      id,
      createdAt: new Date(),
      updatedAt: null
    };
    this.offences.set(id, offence);
    return offence;
  }

  async updateOffence(id: number, updateData: Partial<InsertOffence>): Promise<Offence | undefined> {
    const offence = this.offences.get(id);
    if (!offence) return undefined;

    const updatedOffence: Offence = { 
      ...offence, 
      ...updateData,
      updatedAt: new Date()
    };
    
    this.offences.set(id, updatedOffence);
    return updatedOffence;
  }

  async deleteOffence(id: number): Promise<boolean> {
    // Also delete related burdens of proof
    const burdensToDelete = Array.from(this.burdensOfProof.values())
      .filter(burden => burden.offenceId === id)
      .map(burden => burden.id);
    
    for (const burdenId of burdensToDelete) {
      await this.deleteBurdenOfProof(burdenId);
    }
    
    return this.offences.delete(id);
  }

  // Burden of Proof methods
  async getBurdensOfProof(offenceId: number): Promise<BurdenOfProof[]> {
    return Array.from(this.burdensOfProof.values())
      .filter(burden => burden.offenceId === offenceId);
  }

  async getBurdenOfProof(id: number): Promise<BurdenOfProof | undefined> {
    return this.burdensOfProof.get(id);
  }

  async createBurdenOfProof(insertBurden: InsertBurdenOfProof): Promise<BurdenOfProof> {
    const id = this.burdenOfProofId++;
    const burden: BurdenOfProof = {
      ...insertBurden,
      id,
      createdAt: new Date(),
      updatedAt: null
    };
    this.burdensOfProof.set(id, burden);
    return burden;
  }

  async updateBurdenOfProof(id: number, updateData: Partial<InsertBurdenOfProof>): Promise<BurdenOfProof | undefined> {
    const burden = this.burdensOfProof.get(id);
    if (!burden) return undefined;

    const updatedBurden: BurdenOfProof = { 
      ...burden, 
      ...updateData,
      updatedAt: new Date()
    };
    
    this.burdensOfProof.set(id, updatedBurden);
    return updatedBurden;
  }

  async deleteBurdenOfProof(id: number): Promise<boolean> {
    // Also delete related proofs
    const proofsToDelete = Array.from(this.proofs.values())
      .filter(proof => proof.burdenId === id)
      .map(proof => proof.id);
    
    for (const proofId of proofsToDelete) {
      this.proofs.delete(proofId);
    }
    
    return this.burdensOfProof.delete(id);
  }

  // Proof methods
  async getProofs(burdenId: number): Promise<Proof[]> {
    return Array.from(this.proofs.values())
      .filter(proof => proof.burdenId === burdenId);
  }

  async getProof(id: number): Promise<Proof | undefined> {
    return this.proofs.get(id);
  }

  async createProof(insertProof: InsertProof): Promise<Proof> {
    const id = this.proofId++;
    const proof: Proof = {
      ...insertProof,
      id,
      createdAt: new Date(),
      updatedAt: null
    };
    this.proofs.set(id, proof);
    return proof;
  }

  async updateProof(id: number, updateData: Partial<InsertProof>): Promise<Proof | undefined> {
    const proof = this.proofs.get(id);
    if (!proof) return undefined;

    const updatedProof: Proof = { 
      ...proof, 
      ...updateData,
      updatedAt: new Date()
    };
    
    this.proofs.set(id, updatedProof);
    return updatedProof;
  }

  async deleteProof(id: number): Promise<boolean> {
    return this.proofs.delete(id);
  }

  // Brief Section methods
  async getBriefSections(investigationId: number): Promise<BriefSection[]> {
    return Array.from(this.briefSections.values())
      .filter(section => section.investigationId === investigationId)
      .sort((a, b) => a.sectionOrder - b.sectionOrder);
  }

  async getBriefSection(id: number): Promise<BriefSection | undefined> {
    return this.briefSections.get(id);
  }

  async createBriefSection(insertSection: InsertBriefSection): Promise<BriefSection> {
    const id = this.briefSectionId++;
    const section: BriefSection = {
      ...insertSection,
      id,
      createdAt: new Date(),
      lastEditedAt: new Date()
    };
    this.briefSections.set(id, section);
    return section;
  }

  async updateBriefSection(id: number, updateData: Partial<InsertBriefSection>): Promise<BriefSection | undefined> {
    const section = this.briefSections.get(id);
    if (!section) return undefined;

    const updatedSection: BriefSection = { 
      ...section, 
      ...updateData,
      lastEditedAt: new Date(),
      lastEditedBy: updateData.lastEditedBy || section.lastEditedBy
    };
    
    this.briefSections.set(id, updatedSection);
    return updatedSection;
  }

  async deleteBriefSection(id: number): Promise<boolean> {
    return this.briefSections.delete(id);
  }

  // Brief methods
  async getBriefs(investigationId: number): Promise<Brief[]> {
    return Array.from(this.briefs.values())
      .filter(brief => brief.investigationId === investigationId);
  }

  async getBrief(id: number): Promise<Brief | undefined> {
    return this.briefs.get(id);
  }

  async createBrief(insertBrief: InsertBrief): Promise<Brief> {
    const id = this.briefId++;
    const brief: Brief = {
      ...insertBrief,
      id,
      createdAt: new Date(),
      updatedAt: null,
      approvedAt: null,
      submittedAt: null
    };
    this.briefs.set(id, brief);
    return brief;
  }

  async updateBrief(id: number, updateData: Partial<InsertBrief>): Promise<Brief | undefined> {
    const brief = this.briefs.get(id);
    if (!brief) return undefined;

    const updatedBrief: Brief = { 
      ...brief, 
      ...updateData,
      updatedAt: new Date()
    };
    
    // Handle status-specific date fields
    if (updateData.status === 'approved' && updateData.approvedBy) {
      updatedBrief.approvedAt = new Date();
    }
    
    if (updateData.status === 'submitted' && updateData.submittedTo) {
      updatedBrief.submittedAt = new Date();
    }
    
    this.briefs.set(id, updatedBrief);
    return updatedBrief;
  }

  async deleteBrief(id: number): Promise<boolean> {
    return this.briefs.delete(id);
  }
}

export const storage = new MemStorage();
