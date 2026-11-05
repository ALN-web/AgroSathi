import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import chatRoutes from './routes/chat.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { registerAllModules } from './bootstrap/registerModules';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/agri-assistant', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'agri-assistant' });
});

// Global error handler (must be last)
app.use(errorHandler);

// Bootstrap: register all intelligent assistant modules
registerAllModules();

app.listen(PORT, () => {
  console.log(`Agri Assistant service is running on port ${PORT}`);
});
