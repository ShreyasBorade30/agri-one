import express from 'express';
import { getRecommendations, getRecommendationHistory, getIotSensorData, aiChatbot } from '../controllers/recommendationController.js';
import { verifyToken } from '../middleware/jwt.js';

const router = express.Router();

router.post('/recommendations', verifyToken, getRecommendations);
router.get('/recommendations/history', verifyToken, getRecommendationHistory);
router.get('/iot-sensor-data', verifyToken, getIotSensorData);
router.post('/ai-chatbot', verifyToken, aiChatbot);

export default router;
