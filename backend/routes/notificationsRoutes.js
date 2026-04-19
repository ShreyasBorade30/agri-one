import express from 'express'
import { getFarmingNotifications } from '../controllers/notificationsController.js'

const router = express.Router();

router.get('/farming-notifications', getFarmingNotifications);

export default router;