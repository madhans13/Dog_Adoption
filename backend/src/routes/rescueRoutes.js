import express from 'express';
import {
  submitRescueRequest,
  getRescueRequestsForRescuer,
  assignRescueRequest,
  updateRescueStatus,
  getMyRescueRequests
} from '../controllers/rescueController.js';
import { authenticateToken, requireUser, requireRescuer } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// User routes (can report rescue cases)
router.post('/request', authenticateToken, requireUser, upload.array('images', 5), submitRescueRequest);

// Rescuer routes
router.get('/available', authenticateToken, requireRescuer, getRescueRequestsForRescuer);
router.post('/assign/:requestId', authenticateToken, requireRescuer, assignRescueRequest);
router.get('/my-requests', authenticateToken, requireRescuer, getMyRescueRequests);
router.put('/status/:requestId', authenticateToken, requireRescuer, updateRescueStatus);

export default router;
