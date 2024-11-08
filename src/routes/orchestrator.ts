import express from 'express';
import { OrchestratorService } from '../services/orchestrator';

const router = express.Router();
const orchestrator = new OrchestratorService();

router.post('/process', async (req, res) => {
  const { message } = req.body;
  const response = await orchestrator.processMessage(message);
  res.json({ response });
});

export { router as orchestratorRouter };