import express from 'express';
import { db } from '../../lib/db/index.js';
import * as schema from '../../lib/db/schema.ts';
import { eq, and } from 'drizzle-orm';

type Request = express.Request;
type Response = express.Response;

export class PipelineController {
  // create a new pipeline
  static async create(req: Request, res: Response) {
    try {
      const { name, description, userId, steps } = req.body;
      
      if (!name?.trim()) {
        return res.status(400).json({ error: 'Pipeline name is required' });
      }
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      if (!steps || steps.length === 0) {
        return res.status(400).json({ error: 'At least one step is required' });
      }

      let user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);
      
      if (user.length === 0) {
        // create user
        const [newUser] = await db.insert(schema.users).values({
          id: userId,
          email: `${userId}@temp.com`, 
          name: `User ${userId.slice(0, 8)}`,
          emailConfirmed: true, 
        }).returning();
        user = [newUser];
      }

      // create pipeline
      const [pipeline] = await db.insert(schema.pipelines).values({
        name: name.trim(),
        description: description?.trim(),
        userId: userId,
      }).returning();

      // create steps
      const stepsData = steps.map((step: any, index: number) => ({
        pipelineId: pipeline.id,
        type: step.type,
        config: step.config,
        order: step.order || index + 1,
      }));

      const createdSteps = await db.insert(schema.pipelineSteps).values(stepsData).returning();

      res.json({
        ...pipeline,
        steps: createdSteps,
      });
    } catch (error) {
      console.error('Error creating pipeline:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      let errorMessage = 'Failed to create pipeline';
      if (error instanceof Error) { 
        if (error.message.includes('foreign key constraint')) {
          errorMessage = 'User not found. Please sign in again.';
        } else if (error.message.includes('duplicate key')) {
          errorMessage = 'Pipeline with this name already exists.';
        } else {
          errorMessage = error.message;
        }
      }
      
      res.status(500).json({ 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // get all pipelines for a user
  static async getAllByUser(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const pipelines = await db
        .select()
        .from(schema.pipelines)
        .where(eq(schema.pipelines.userId, userId as string))
        .orderBy(schema.pipelines.createdAt);

      // get steps for each pipeline
      const pipelinesWithSteps = await Promise.all(
        pipelines.map(async (pipeline) => {
          const steps = await db
            .select()
            .from(schema.pipelineSteps)
            .where(eq(schema.pipelineSteps.pipelineId, pipeline.id))
            .orderBy(schema.pipelineSteps.order);

          return {
            ...pipeline,
            steps,
          };
        })
      );

      res.json(pipelinesWithSteps);
    } catch (error) {
      console.error('Error getting pipelines:', error);
      res.status(500).json({ error: 'Failed to get pipelines' });
    }
  }

  // get a pipeline by id
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const [pipeline] = await db
        .select()
        .from(schema.pipelines)
        .where(userId 
          ? and(eq(schema.pipelines.id, id), eq(schema.pipelines.userId, userId as string))
          : eq(schema.pipelines.id, id)
        );

      if (!pipeline) {
        return res.status(404).json({ error: 'Pipeline not found' });
      }

      const steps = await db
        .select()
        .from(schema.pipelineSteps)
        .where(eq(schema.pipelineSteps.pipelineId, pipeline.id))
        .orderBy(schema.pipelineSteps.order);

      res.json({
        ...pipeline,
        steps,
      });
    } catch (error) {
      console.error('Error getting pipeline:', error);
      res.status(500).json({ error: 'Failed to get pipeline' });
    }
  }

  // update a pipeline
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, steps, userId } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({ error: 'Pipeline name is required' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }


      // check if pipeline exists
      const [existingPipeline] = await db
        .select()
        .from(schema.pipelines)
        .where(and(eq(schema.pipelines.id, id), eq(schema.pipelines.userId, userId)));

      if (!existingPipeline) {
        return res.status(404).json({ error: 'Pipeline not found' });
      }

      const [updatedPipeline] = await db
        .update(schema.pipelines)
        .set({
          name: name.trim(),
          description: description?.trim(),
          updatedAt: new Date(),
        })
        .where(eq(schema.pipelines.id, id))
        .returning();

      if (steps && steps.length > 0) {
        await db
          .delete(schema.pipelineSteps)
          .where(eq(schema.pipelineSteps.pipelineId, id));

        const stepsData = steps.map((step: any, index: number) => ({
          pipelineId: id,
          type: step.type,
          config: step.config,
          order: step.order || index + 1,
        }));

        await db.insert(schema.pipelineSteps).values(stepsData);
      }


      // get updated steps
      const updatedSteps = await db
        .select()
        .from(schema.pipelineSteps)
        .where(eq(schema.pipelineSteps.pipelineId, id))
        .orderBy(schema.pipelineSteps.order);

      res.json({
        ...updatedPipeline,
        steps: updatedSteps,
      });
    } catch (error) {
      console.error('Error updating pipeline:', error);
      res.status(500).json({ error: 'Failed to update pipeline' });
    }
  }


  // delete a pipeline
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const [pipeline] = await db
        .select()
        .from(schema.pipelines)
        .where(and(eq(schema.pipelines.id, id), eq(schema.pipelines.userId, userId)));

      if (!pipeline) {
        return res.status(404).json({ error: 'Pipeline not found' });
      }

      await db
        .delete(schema.pipelines)
        .where(eq(schema.pipelines.id, id));

      res.json({ message: 'Pipeline deleted successfully' });
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      res.status(500).json({ error: 'Failed to delete pipeline' });
    }
  }

  // execute a pipeline
  static async execute(req: Request, res: Response) {
    try {
      const { pipelineId, userId, input } = req.body;
      
      if (!pipelineId) {
        return res.status(400).json({ error: 'Pipeline ID is required' });
      }
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      if (!input?.trim()) {
        return res.status(400).json({ error: 'Input text is required' });
      }

      const [pipeline] = await db
        .select()
        .from(schema.pipelines)
        .where(and(eq(schema.pipelines.id, pipelineId), eq(schema.pipelines.userId, userId as string)));

      if (!pipeline) {
        return res.status(404).json({ error: 'Pipeline not found or access denied' });
      }

      const steps = await db
        .select()
        .from(schema.pipelineSteps)
        .where(eq(schema.pipelineSteps.pipelineId, pipelineId))
        .orderBy(schema.pipelineSteps.order);

      if (steps.length === 0) {
        return res.status(400).json({ error: 'Pipeline has no steps to execute' });
      }

      const [execution] = await db.insert(schema.pipelineExecutions).values({
        pipelineId,
        userId,
        input: input.trim(),
        status: 'running',
      }).returning();

      let currentInput = input.trim();
      const startTime = Date.now();
      const outputs: Array<{
        stepId: string;
        output: string;
        processingTime: number;
      }> = [];

      try {
        const { AiService } = await import('../../services/aiService.js');
        const aiService = new AiService();
        
        const aiSteps = steps.map(step => ({
          id: step.id,
          type: step.type as 'summarize' | 'translate' | 'rewrite' | 'extract',
          config: step.config as any,
        }));
        
        const result = await aiService.executePipeline(aiSteps, currentInput);

        const totalProcessingTime = Date.now() - startTime;
        await db
          .update(schema.pipelineExecutions)
          .set({
            status: result.status,
            totalProcessingTime,
            updatedAt: new Date(),
          })
          .where(eq(schema.pipelineExecutions.id, execution.id));

        for (const output of result.outputs) {
          await db.insert(schema.pipelineExecutionOutputs).values({
            executionId: execution.id,
            stepId: output.stepId,
            output: output.output,
            processingTime: output.processingTime,
          });
        }

        res.json({
          id: execution.id,
          pipelineId: execution.pipelineId,
          userId: execution.userId,
          input: execution.input,
          status: result.status,
          totalProcessingTime,
          outputs: result.outputs,
          createdAt: execution.createdAt,
        });

      } catch (error) {
        const totalProcessingTime = Date.now() - startTime;
        await db
          .update(schema.pipelineExecutions)
          .set({
            status: 'failed',
            totalProcessingTime,
            updatedAt: new Date(),
          })
          .where(eq(schema.pipelineExecutions.id, execution.id));

        console.error('Pipeline execution failed:', error);
        res.status(500).json({ 
          error: 'Pipeline execution failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }

    } catch (error) {
      console.error('Error executing pipeline:', error);
      res.status(500).json({ error: 'Failed to execute pipeline' });
    }
  }

  // get execution history for a user
  static async getExecutions(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const executions = await db
        .select()
        .from(schema.pipelineExecutions)
        .where(eq(schema.pipelineExecutions.userId, userId as string))
        .orderBy(schema.pipelineExecutions.createdAt);

      res.json(executions);
    } catch (error) {
      console.error('Error getting executions:', error);
      res.status(500).json({ error: 'Failed to get executions' });
    }
  }

  // get execution details
  static async getExecutionDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const [execution] = await db
        .select()
        .from(schema.pipelineExecutions)
        .where(userId 
          ? and(eq(schema.pipelineExecutions.id, id), eq(schema.pipelineExecutions.userId, userId as string))
          : eq(schema.pipelineExecutions.id, id)
        );

      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }

      const outputs = await db
        .select()
        .from(schema.pipelineExecutionOutputs)
        .where(eq(schema.pipelineExecutionOutputs.executionId, id))
        .orderBy(schema.pipelineExecutionOutputs.createdAt);

      res.json({
        ...execution,
        outputs,
      });
    } catch (error) {
      console.error('Error getting execution details:', error);
      res.status(500).json({ error: 'Failed to get execution details' });
    }
  }
} 