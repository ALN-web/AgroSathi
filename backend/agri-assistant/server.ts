import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001; // Using 5001 to avoid conflicts

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/agri-assistant', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'agri-assistant' });
});

app.listen(PORT, () => {
  console.log(`Agri Assistant service is running on port ${PORT}`);
});
