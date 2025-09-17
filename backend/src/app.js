import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Route imports
import dogRoutes from './routes/dogRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adoptionRoutes from './routes/adoptionRoutes.js';
import rescueRoutes from './routes/rescueRoutes.js';
import rescuedDogRoutes from './routes/rescuedDogRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Resolve __dirname in ESM and set uploads directory robustly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads');

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// CORS configuration
const allowedOrigins = (process.env.FRONTEND_URL || '').split(',').filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static file serving for uploaded images
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', dogRoutes);
app.use('/api/adoptions', adoptionRoutes);
app.use('/api/rescue', rescueRoutes);
app.use('/api/rescued-dogs', rescuedDogRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler (catch-all). In Express 5, avoid '*' which breaks path-to-regexp.
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File size too large' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected field in file upload' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
