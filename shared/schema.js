
const { pgTable, text, serial, integer, boolean, timestamp, jsonb, primaryKey, unique } = require("drizzle-orm/pg-core");
const { createInsertSchema } = require("drizzle-zod");
const { z } = require("zod");

// Departments table for organizational structure
const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  parentDepartmentId: integer("parent_department_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

// Export all tables and schemas
module.exports = {
  departments,
  insertDepartmentSchema,
  // Add other exports as needed
};
