import { Router } from 'express';
import { chatWithAssistant } from '../controllers/chat.controller';

const router = Router();

router.post('/chat', chatWithAssistant);

export default router;
