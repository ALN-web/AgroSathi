import { Router } from 'express';
import { chatWithAssistant, clearChat } from '../controllers/chat.controller';

const router = Router();

router.post('/chat', chatWithAssistant);
router.delete('/chat/:conversationId', clearChat);

export default router;

