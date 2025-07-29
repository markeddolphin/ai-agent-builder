import express from 'express';
import { PipelineController } from '../controllers/pipelineController.js';

const router = express.Router();

// pipeline routes
router.post('/', PipelineController.create);
router.get('/', PipelineController.getAllByUser);
router.get('/:id', PipelineController.getById);
router.put('/:id', PipelineController.update);
router.delete('/:id', PipelineController.delete);

// execution routes
router.post('/execute', PipelineController.execute);
router.get('/executions', PipelineController.getExecutions);
router.get('/executions/:id', PipelineController.getExecutionDetails);

export default router; 