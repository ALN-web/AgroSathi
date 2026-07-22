import { Request, Response } from 'express';

export const chatWithAssistant = (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Placeholder response as requested
    const placeholderResponse = `AgroSaathi AI received your message: "${message}". I am currently in development, but soon I will be fully equipped to help you with all your agricultural needs!`;

    return res.status(200).json({
      success: true,
      message: placeholderResponse
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
