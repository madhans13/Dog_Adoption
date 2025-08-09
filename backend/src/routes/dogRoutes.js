import express from 'express';
import upload from '../utils/upload.js';
import { 
  getDogs, 
  createDog, 
  getDogById, 
  updateDog, 
  deleteDog 
} from '../controllers/dogController.js';
import { 
  authenticateToken, 
  optionalAuth, 
  requireRescuer, 
  requireAdmin 
} from '../middlewares/auth.js';

const router = express.Router();

// Public routes (with optional authentication for enhanced experience)
router.get('/dogs', optionalAuth, getDogs);
router.get('/dogs/:id', optionalAuth, getDogById);

// Protected routes - Add dogs (Rescuers and Admins only)
router.post('/dogs', authenticateToken, requireRescuer, upload.single('image'), createDog);

// Protected routes - Update dogs (Rescuers can update their own, Admins can update any)
router.put('/dogs/:id', authenticateToken, requireRescuer, upload.single('image'), updateDog);

// Admin only routes
router.delete('/dogs/:id', authenticateToken, requireAdmin, deleteDog);

export default router;
