import express from 'express';
import { registerLabour, getAllLabours, hireLabour } from '../controllers/labourController.js';
import { verifyToken } from '../middleware/jwt.js';

const router = express.Router();

router.post('/register', verifyToken, registerLabour);
router.get('/all', verifyToken, getAllLabours);
router.post('/hire', verifyToken, hireLabour);

export default router;
