import express from 'express';
import { getWeatherData } from '../controllers/weatherController.js';
import { verifyToken } from '../middleware/jwt.js';

const router = express.Router();

router.get('/', verifyToken, getWeatherData);

export default router;
