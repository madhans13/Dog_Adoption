import express from 'express';
import upload from '../utils/upload.js';
import { getDogs, createDog } from '../controllers/simpleDogController.js';

const router = express.Router();

// Simple routes without authentication for now
router.get('/dogs', getDogs);
router.post('/dogs', upload.single('image'), createDog);

export default router;
