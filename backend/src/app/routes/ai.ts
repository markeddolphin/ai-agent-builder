import { Router } from 'express';
import { executePipeline, generatePipelineSteps } from '../controllers/aiController.js';

const router = Router();

router.post('/execute', executePipeline);

router.post('/generate-steps', generatePipelineSteps);

export default router; 