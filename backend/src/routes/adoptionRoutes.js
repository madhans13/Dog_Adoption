import express from 'express';
import {
  submitAdoptionRequest,
  getUserAdoptionRequests,
  getAllAdoptionRequests,
  processAdoptionRequest
} from '../controllers/adoptionController.js';
import { authenticateToken, requireUser, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// User routes
router.post('/request', authenticateToken, requireUser, submitAdoptionRequest);
router.get('/my-requests', authenticateToken, requireUser, getUserAdoptionRequests);

// Admin routes
router.get('/all', authenticateToken, requireAdmin, getAllAdoptionRequests);
router.put('/process/:requestId', authenticateToken, requireAdmin, processAdoptionRequest);

export default router;
