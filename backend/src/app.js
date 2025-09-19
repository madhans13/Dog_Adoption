import express from 'express';
import path from 'path';
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

// Trust proxy for LoadBalancer/Ingress
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
//testing backend changes
// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});


// app.use(generalLimiter); // Temporarily disabled for LoadBalancer compatibility

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

// Static file serving with proper cache headers
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  setHeaders: (res, path) => {
    // Set cache headers for image files
    if (path.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year
      res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString()); // 1 year
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('ETag', `"${Date.now()}"`);
    }
  }
}));

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
