import express from 'express';
import { postJob, getAllJobs, getFarmerJobs, applyForJob, updateApplicantStatus } from '../controllers/jobController.js';
import { verifyToken } from '../middleware/jwt.js';

const router = express.Router();

router.post('/post', verifyToken, postJob);
router.get('/all', verifyToken, getAllJobs);
router.get('/my-jobs', verifyToken, getFarmerJobs);
router.post('/apply/:id', verifyToken, applyForJob);
router.post('/update-status', verifyToken, updateApplicantStatus);

export default router;
