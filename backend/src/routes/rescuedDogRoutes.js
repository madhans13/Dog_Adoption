import express from 'express';
import {
  getRescuedDogs,
  addRescuedDog,
  updateRescuedDogStatus,
  getRescuedDogById,
  deleteRescuedDog
} from '../controllers/rescuedDogController.js';
import { authenticateToken, requireRescuer } from '../middlewares/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

// All routes require authentication and rescuer role
router.use(authenticateToken, requireRescuer);

// Get all rescued dogs for the authenticated rescuer
router.get('/', getRescuedDogs);

// Add a new rescued dog
router.post('/', upload.single('image'), addRescuedDog);

// Get a specific rescued dog by ID
router.get('/:id', getRescuedDogById);

// Update rescued dog status
router.put('/:id/status', updateRescuedDogStatus);

// Delete a rescued dog
router.delete('/:id', deleteRescuedDog);

export default router;

