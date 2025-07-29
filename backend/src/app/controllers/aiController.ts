import { Request, Response } from 'express';
import { AiService } from '../../services/aiService.js';

const aiService = new AiService();

export const executePipeline = async (req: Request, res: Response) => {
  try {
    const { steps, input } = req.body;


    // validate request
    if (!steps || !Array.isArray(steps)) {
      return res.status(400).json({ 
        error: 'Invalid request: steps array is required' 
      });
    }

    if (!input || typeof input !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request: input text is required' 
      });
    }

    // validate each step
    for (const step of steps) {
      if (!step.id || !step.type || !step.config) {
        return res.status(400).json({ 
          error: 'Invalid step format: each step must have id, type, and config' 
        });
      }
    }

    const result = await aiService.executePipeline(steps, input);

    res.json(result);

  } catch (error) {
 const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
 // check language restriction error
    if (errorMessage.includes('restricted')) {
      return res.status(400).json({ 
        error: 'Language restriction',
        message: errorMessage,
        status: 'failed'
      });
    }
    
    res.status(500).json({ 
      error: 'Pipeline execution failed',
      message: errorMessage,
      status: 'failed'
    });
  }
};

export const generatePipelineSteps = async (req: Request, res: Response) => {
  try {
    const { instruction } = req.body;

    if (!instruction || typeof instruction !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid request: instruction text is required' 
      });
    }

    const steps = await aiService.generatePipelineSteps(instruction);

    res.json({ steps });

  } catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('restricted')) {
      return res.status(400).json({ 
        error: 'Language restriction',
        message: errorMessage,
        status: 'failed'
      });
    }
    
    res.status(500).json({ 
      error: 'Pipeline step generation failed',
      message: errorMessage,
      status: 'failed'
    });
  }
}; 