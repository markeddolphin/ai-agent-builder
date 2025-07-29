import type { PipelineStep, PipelineExecution } from '../../types/pipeline';

export class RealAiService {
  private apiBaseUrl: string;

  constructor() {
    const port = import.meta.env.VITE_PORT || 3001;
    this.apiBaseUrl = `http://localhost:${port}/api`;
  }

  async executePipeline(steps: PipelineStep[], input: string): Promise<PipelineExecution> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          steps,
          input
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      throw error;
    }
  }

  async generateSteps(instruction: string): Promise<{ steps: PipelineStep[] }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai/generate-steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instruction
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      throw error;
    }
  }
}

export const realAiService = new RealAiService(); 