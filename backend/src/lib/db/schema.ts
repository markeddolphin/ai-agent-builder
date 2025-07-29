import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  name: text('name'),
  emailConfirmed: boolean('email_confirmed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pipelines = pgTable('pipelines', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pipelineSteps = pgTable('pipeline_steps', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pipelineId: text('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  config: jsonb('config').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pipelineExecutions = pgTable('pipeline_executions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pipelineId: text('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  input: text('input').notNull(),
  status: text('status').notNull(),
  totalProcessingTime: integer('total_processing_time'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const pipelineExecutionOutputs = pgTable('pipeline_execution_outputs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  executionId: text('execution_id').notNull().references(() => pipelineExecutions.id, { onDelete: 'cascade' }),
  stepId: text('step_id').notNull(),
  output: text('output').notNull(),
  processingTime: integer('processing_time').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  pipelines: many(pipelines),
  executions: many(pipelineExecutions),
}));

export const pipelinesRelations = relations(pipelines, ({ one, many }) => ({
  user: one(users, {
    fields: [pipelines.userId],
    references: [users.id],
  }),
  steps: many(pipelineSteps),
  executions: many(pipelineExecutions),
}));

export const pipelineStepsRelations = relations(pipelineSteps, ({ one }) => ({
  pipeline: one(pipelines, {
    fields: [pipelineSteps.pipelineId],
    references: [pipelines.id],
  }),
}));

export const pipelineExecutionsRelations = relations(pipelineExecutions, ({ one, many }) => ({
  pipeline: one(pipelines, {
    fields: [pipelineExecutions.pipelineId],
    references: [pipelines.id],
  }),
  user: one(users, {
    fields: [pipelineExecutions.userId],
    references: [users.id],
  }),
  outputs: many(pipelineExecutionOutputs),
}));

export const pipelineExecutionOutputsRelations = relations(pipelineExecutionOutputs, ({ one }) => ({
  execution: one(pipelineExecutions, {
    fields: [pipelineExecutionOutputs.executionId],
    references: [pipelineExecutions.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Pipeline = typeof pipelines.$inferSelect;
export type NewPipeline = typeof pipelines.$inferInsert;
export type PipelineStep = typeof pipelineSteps.$inferSelect;
export type NewPipelineStep = typeof pipelineSteps.$inferInsert;
export type PipelineExecution = typeof pipelineExecutions.$inferSelect;
export type NewPipelineExecution = typeof pipelineExecutions.$inferInsert;
export type PipelineExecutionOutput = typeof pipelineExecutionOutputs.$inferSelect;
export type NewPipelineExecutionOutput = typeof pipelineExecutionOutputs.$inferInsert; 