import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAllRescueRequests
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Dashboard and statistics
router.get('/dashboard', getDashboardStats);
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/status', updateUserStatus);
router.put('/users/:userId/role', updateUserRole);
router.delete('/users/:userId', deleteUser);

// Rescue management
router.get('/rescue-requests', getAllRescueRequests);

export default router;
