import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { botRouter } from './routes/bot';
import { orchestratorRouter } from './routes/orchestrator';
import { tabRouter } from './routes/tab';

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/messages', botRouter);
app.use('/api/orchestrator', orchestratorRouter);

// Tab routes
app.use('/tab', tabRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});