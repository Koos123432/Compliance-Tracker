import { 
  type User, type InsertUser, users,
  type Inspection, type InsertInspection, inspections,
  type Person, type InsertPerson, people,
  type Photo, type InsertPhoto, photos,
  type Breach, type InsertBreach, breaches,
  type Investigation, type InsertInvestigation, investigations,
  type Report, type InsertReport, reports,
  type Activity, type InsertActivity, activities,
  type Schedule, type InsertSchedule, schedules
} from "@shared/schema";

// Storage interface
export interface IStorage {
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
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private inspections: Map<number, Inspection>;
  private people: Map<number, Person>;
  private photos: Map<number, Photo>;
  private breaches: Map<number, Breach>;
  private investigations: Map<number, Investigation>;
  private reports: Map<number, Report>;
  private activities: Map<number, Activity>;
  private schedules: Map<number, Schedule>;
  
  private userId: number;
  private inspectionId: number;
  private personId: number;
  private photoId: number;
  private breachId: number;
  private investigationId: number;
  private reportId: number;
  private activityId: number;
  private scheduleId: number;
  
  constructor() {
    this.users = new Map();
    this.inspections = new Map();
    this.people = new Map();
    this.photos = new Map();
    this.breaches = new Map();
    this.investigations = new Map();
    this.reports = new Map();
    this.activities = new Map();
    this.schedules = new Map();
    
    this.userId = 1;
    this.inspectionId = 1;
    this.personId = 1;
    this.photoId = 1;
    this.breachId = 1;
    this.investigationId = 1;
    this.reportId = 1;
    this.activityId = 1;
    this.scheduleId = 1;
    
    // Create default user
    this.createUser({
      username: "officer1",
      password: "password123",
      fullName: "John Smith",
      email: "jsmith@example.com",
      phoneNumber: "0412345678"
    });
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
    const user: User = { ...insertUser, id };
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
}

export const storage = new MemStorage();
