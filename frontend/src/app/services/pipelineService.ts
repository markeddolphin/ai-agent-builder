import type { PipelineExecution } from '../../types/pipeline';

interface PipelineWithSteps {
  id: string;
  name: string;
  description?: string;
  userId: string;
  steps: Array<{
    id: string;
    type: string;
    config: any;
    order: number;
    createdAt: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CreatePipelineData {
  name: string;
  description?: string;
  userId: string;
  steps: Array<{
    type: string;
    config: any;
    order: number;
  }>;
}

interface UpdatePipelineData {
  name?: string;
  description?: string;
  steps?: Array<{
    type: string;
    config: any;
    order: number;
  }>;
}

interface PipelineExecutionWithOutputs extends PipelineExecution {
  outputs: Array<{
    stepId: string;
    output: string;
    processingTime: number;
  }>;
}



const API_BASE_URL = `http://localhost:${import.meta.env.VITE_PORT || 3001}/api`;

export class PipelineService {
  // create a new pipeline with steps
  async createPipeline(data: CreatePipelineData): Promise<PipelineWithSteps> {
    try {
      if (!data.name.trim()) {
        throw new Error('Pipeline name is required');
      }
      
      if (!data.userId) {
        throw new Error('User ID is required');
      }
      
      if (!data.steps || data.steps.length === 0) {
        throw new Error('At least one step is required');
      }

      const response = await fetch(`${API_BASE_URL}/pipelines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create pipeline');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating pipeline:', error);
      throw new Error(`Failed to create pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // get pipeline by id 
  async getPipelineById(id: string, userId?: string): Promise<PipelineWithSteps | null> {
    try {
      const url = new URL(`${API_BASE_URL}/pipelines/${id}`);
      if (userId) {
        url.searchParams.append('userId', userId);
      }

      const response = await fetch(url.toString());

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get pipeline');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // get all pipeline for user
  async getPipelinesByUserId(userId: string): Promise<PipelineWithSteps[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines?userId=${userId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get user pipelines');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get user pipelines: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // update existing pipeline
  async updatePipeline(id: string, userId: string, data: UpdatePipelineData): Promise<PipelineWithSteps | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update pipeline');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  // delete pipeline
  async deletePipeline(id: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.status === 404) {
        return false;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete pipeline');
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete pipeline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // create a pipeline execution
  async createPipelineExecution(data: {
    pipelineId: string;
    userId: string;
    input: string;
  }): Promise<PipelineExecutionWithOutputs> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to execute pipeline');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create pipeline execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // update pipeline execution status
  async updatePipelineExecution(id: string, data: {
    status?: 'pending' | 'running' | 'completed' | 'failed';
    totalProcessingTime?: number;
  }): Promise<Record<string, unknown> | null> {
    try {
      return {
        id,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to update pipeline execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  // add output for a pipeline execution step
  async addPipelineExecutionOutput(data: {
    executionId: string;
    stepId: string;
    output: string;
    processingTime: number;
  }): Promise<void> {
    try {
    } catch (error) {
      throw new Error(`Failed to add pipeline execution output: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // get pipeline execution with outputs
  async getPipelineExecutionWithOutputs(id: string): Promise<PipelineExecutionWithOutputs | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/executions/${id}`);

      if (response.status === 404) {
      return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get pipeline execution');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get pipeline execution: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  // get all executions for a user
  async getPipelineExecutionsByUserId(userId: string): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/pipelines/executions?userId=${userId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get user pipeline executions');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get user pipeline executions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // get user statistics
  async getUserStats(userId: string): Promise<{
    totalPipelines: number;
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
    averageProcessingTime: number;
  }> {
    try {
      const pipelines = await this.getPipelinesByUserId(userId);
      
      return {
        totalPipelines: pipelines.length,
        totalExecutions: 0, 
        completedExecutions: 0,
        failedExecutions: 0,
        averageProcessingTime: 0,
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // search pipelines by name
  async searchPipelines(userId: string, searchTerm: string): Promise<PipelineWithSteps[]> {
    try {
      const allPipelines = await this.getPipelinesByUserId(userId);
      
      return allPipelines.filter(pipeline => 
        pipeline.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      throw new Error(`Failed to search pipelines: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const pipelineService = new PipelineService(); 