import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const app = express();

// Basic middleware
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175','http://localhost:8080'],
//   credentials: true
// }));
// app.options('*', cors());
app.use(cors({ origin: '*', credentials: true }));
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '4.0' });
});

// Debug endpoint to test JWT tokens
app.get('/api/debug/token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.json({ error: 'No token provided' });
  }
  
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ 
      valid: true, 
      decoded: decoded,
      secret_used: JWT_SECRET.substring(0, 4) + '...'
    });
  } catch (error) {
    res.json({ 
      valid: false, 
      error: error.message,
      secret_used: (process.env.JWT_SECRET || 'test-secret-key').substring(0, 4) + '...'
    });
  }
});

// Get dogs from database (with optional auth for enhanced experience)
app.get('/api/dogs', async (req, res) => {
  try {
    const { status = 'available', limit = 20, offset = 0 } = req.query;
    
    // For now, show all available dogs (we can add auth logic later)
    const query = `
      SELECT 
        d.*, 
        u.first_name as rescuer_first_name, 
        u.last_name as rescuer_last_name
      FROM "Dog" d
      LEFT JOIN "User" u ON d.rescuer_id = u.id
      WHERE d.status = $1
      ORDER BY d."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [status, parseInt(limit), parseInt(offset)]);
    const dogs = result.rows;
    
    // Get server URL from environment or construct it
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    // Add full image URLs for frontend consumption
    const dogsWithImageUrls = dogs.map(dog => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      gender: dog.gender,
      location: dog.location,
      description: dog.description,
      status: dog.status,
      isRescueCase: dog.is_rescue_case,
      imageUrl: dog.imageUrl ? `${serverUrl}${dog.imageUrl}` : null,
      createdAt: dog.createdAt,
      rescuer: dog.rescuer_first_name ? {
        firstName: dog.rescuer_first_name,
        lastName: dog.rescuer_last_name
      } : null
    }));
    
    res.json({ dogs: dogsWithImageUrls });
  } catch (err) {
    console.error('Error fetching dogs:', err);
    res.status(500).json({ error: 'Error fetching dogs' });
  }
});

// Import controllers
import { register, login } from './controllers/simpleAuthController.js';
import upload from './utils/upload.js';

// Simple auth middleware for admin routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based middleware
const requireRescuer = (req, res, next) => {
  if (req.user.role !== 'rescuer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Rescuer access required' });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Auth endpoints
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);

// Create dog endpoint (with authentication)
app.post('/api/dogs', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      age,
      breed,
      description,
      gender,
      location,
      isRescueCase = false
    } = req.body;

    // Handle image upload - if file is uploaded, store the path
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Determine rescuer_id based on user role
    let rescuerId = null;
    if (req.user.role === 'rescuer') {
      rescuerId = req.user.id;
    }

    const query = `
      INSERT INTO "Dog" (
        name, age, breed, description, gender, location, 
        "imageUrl", rescuer_id, is_rescue_case, "createdAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      name,
      Number(age),
      breed,
      description,
      gender,
      location,
      imageUrl,
      rescuerId,
      isRescueCase,
      new Date()
    ];

    const result = await pool.query(query, values);
    const newDog = result.rows[0];

    // Get server URL from environment or construct it
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;

    // Return dog with full image URL
    const dogWithImageUrl = {
      id: newDog.id,
      name: newDog.name,
      breed: newDog.breed,
      age: newDog.age,
      gender: newDog.gender,
      location: newDog.location,
      description: newDog.description,
      status: newDog.status,
      isRescueCase: newDog.is_rescue_case,
      imageUrl: newDog.imageUrl ? `${serverUrl}${newDog.imageUrl}` : null,
      createdAt: newDog.createdAt
    };

    res.status(201).json({
      message: 'Dog added successfully',
      dog: dogWithImageUrl
    });
  } catch (err) {
    console.error('Error adding dog:', err);
    res.status(500).json({ error: 'Error adding dog' });
  }
});

// Admin routes - get system stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM "User") as total_users,
        (SELECT COUNT(*) FROM "User" WHERE role = 'rescuer') as total_rescuers,
        (SELECT COUNT(*) FROM "User" WHERE role = 'admin') as total_admins,
        (SELECT COUNT(*) FROM "Dog") as total_dogs,
        (SELECT COUNT(*) FROM "RescueRequest") as total_rescue_requests,
        (SELECT COUNT(*) FROM "RescueRequest" WHERE status = 'open') as pending_requests,
        (SELECT COUNT(*) FROM "RescueRequest" WHERE status = 'completed') as completed_requests
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    res.json({
      totalUsers: parseInt(stats.total_users || 0),
      totalRescuers: parseInt(stats.total_rescuers || 0),
      totalAdmins: parseInt(stats.total_admins || 0),
      totalDogs: parseInt(stats.total_dogs || 0),
      totalRescueRequests: parseInt(stats.total_rescue_requests || 0),
      pendingRequests: parseInt(stats.pending_requests || 0),
      completedRequests: parseInt(stats.completed_requests || 0),
      completedRescues: parseInt(stats.completed_requests || 0),
      recentActivity: []
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - get all users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT id, first_name, last_name, email, role, created_at, updated_at
      FROM "User"
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    const users = result.rows.map(user => ({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - update user role
app.put('/api/admin/users/:userId/role', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'rescuer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const query = `
      UPDATE "User" 
      SET role = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, first_name, last_name, email, role, updated_at
    `;

    const result = await pool.query(query, [role, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - delete user
app.delete('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const checkQuery = 'SELECT id, role FROM "User" WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = checkResult.rows[0];

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCountQuery = 'SELECT COUNT(*) as count FROM "User" WHERE role = \'admin\'';
      const adminCountResult = await pool.query(adminCountQuery);
      if (parseInt(adminCountResult.rows[0].count) <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    // Delete user
    const deleteQuery = 'DELETE FROM "User" WHERE id = $1';
    await pool.query(deleteQuery, [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin routes - get all dogs  
app.get('/api/admin/dogs', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT d.*, u.first_name as rescuer_first_name, u.last_name as rescuer_last_name
      FROM "Dog" d
      LEFT JOIN "User" u ON d.rescuer_id = u.id
      ORDER BY d."createdAt" DESC
    `;
    
    const result = await pool.query(query);
    const dogs = result.rows.map(dog => ({
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      gender: dog.gender,
      location: dog.location,
      description: dog.description,
      status: dog.status,
      imageUrl: dog.imageUrl,
      createdAt: dog.createdAt,
      rescuer: dog.rescuer_first_name ? {
        firstName: dog.rescuer_first_name,
        lastName: dog.rescuer_last_name
      } : null
    }));

    res.json({ dogs });
  } catch (error) {
    console.error('Get dogs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route - get all rescue requests
app.get('/api/admin/rescue-requests', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM "RescueRequest" 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    // Get server URL from environment or construct it
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    const requests = result.rows.map(row => ({
      id: row.id,
      reporterName: row.notes ? row.notes.replace('Reporter: ', '') : 'Anonymous',
      contactDetails: row.contact_phone,
      location: row.location,
      dogType: row.animal_type,
      description: row.description,
      imageUrls: row.image_urls ? row.image_urls.map(url => `${serverUrl}${url}`) : [],
      status: row.status,
      submittedAt: row.created_at
    }));
    
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching rescue requests for admin:', error);
    res.status(500).json({ error: 'Failed to fetch rescue requests' });
  }
});

// Database connection for rescue requests
import pkg from 'pg';
import dotenv from 'dotenv';



// Submit rescue request (store in database) - OLD ENDPOINT
app.post('/api/rescue', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { reporterName, contactDetails, location, dogType, description } = req.body;
    const userId = req.user.id;
    
    console.log('Received rescue request data:', req.body);
    console.log('Received files:', req.files);
    
    // Handle multiple image uploads
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Insert into database (using correct column names from schema)
    const query = `
      INSERT INTO "RescueRequest" 
      (user_id, location, description, animal_type, contact_phone, image_urls, status, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      userId,
      location,
      description,
      dogType,
      contactDetails,
      imageUrls,
      'open',
      `Reporter: ${reporterName}`,
      new Date()
    ];

    console.log('Executing rescue request query with values:', values);

    const result = await pool.query(query, values);
    const newRequest = result.rows[0];
    
    console.log('Rescue request result:', newRequest);
    
    // Get server URL from environment or construct it
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    res.status(201).json({
      message: 'Rescue request submitted successfully',
      request: {
        id: newRequest.id,
        reporterName: reporterName,
        contactDetails: newRequest.contact_phone,
        location: newRequest.location,
        dogType: newRequest.animal_type,
        description: newRequest.description,
        imageUrls: newRequest.image_urls ? newRequest.image_urls.map(url => `${serverUrl}${url}`) : [],
        status: newRequest.status,
        submittedAt: newRequest.created_at,
        reporterId: newRequest.user_id
      }
    });
  } catch (error) {
    console.error('Rescue request error:', error);
    res.status(500).json({ error: 'Failed to submit rescue request' });
  }
});

// NEW Submit rescue request endpoint (aligned with frontend form)
app.post('/api/rescue/submit', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { reporterName, contactDetails, location, dogType, description } = req.body;
    const userId = req.user.id;
    
    console.log('📝 NEW Rescue submit endpoint - Received data:', req.body);
    console.log('📝 NEW Rescue submit endpoint - Received files:', req.files?.length || 0);
    
    // Validate required fields
    if (!location || !description || !contactDetails || !reporterName) {
      return res.status(400).json({ error: 'Missing required fields: location, description, contactDetails, and reporterName are required' });
    }
    
    // Handle multiple image uploads
    const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Insert into database (using correct column names from schema)
    const query = `
      INSERT INTO "RescueRequest" 
      (user_id, location, description, animal_type, contact_phone, image_urls, status, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      userId,
      location,
      description,
      dogType || 'stray',
      contactDetails,
      imageUrls,
      'open',
      `Reporter: ${reporterName}`,
      new Date()
    ];

    console.log('📝 Executing NEW rescue request query with values:', values);

    const result = await pool.query(query, values);
    const newRequest = result.rows[0];
    
    console.log('📝 NEW Rescue request result:', newRequest);
    
    // Get server URL from environment or construct it
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    res.status(201).json({
      message: 'Rescue request submitted successfully',
      request: {
        id: newRequest.id,
        reporterName: reporterName,
        contactDetails: newRequest.contact_phone,
        location: newRequest.location,
        dogType: newRequest.animal_type,
        description: newRequest.description,
        imageUrls: newRequest.image_urls ? newRequest.image_urls.map(url => `${serverUrl}${url}`) : [],
        status: newRequest.status,
        submittedAt: newRequest.created_at,
        reporterId: newRequest.user_id
      }
    });
  } catch (error) {
    console.error('📝 NEW Rescue request error:', error);
    res.status(500).json({ error: 'Failed to submit rescue request' });
  }
});

// Get rescue requests from database (for rescuers)
app.get('/api/rescue', async (req, res) => {
  try {
    const query = `
      SELECT * FROM "RescueRequest" 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    // Get server URL from environment or construct it
    const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
    
    const requests = result.rows.map(row => ({
      id: row.id,
      reporterName: row.notes ? row.notes.replace('Reporter: ', '') : 'Anonymous',
      contactDetails: row.contact_phone,
      location: row.location,
      dogType: row.animal_type,
      description: row.description,
      imageUrls: row.image_urls ? row.image_urls.map(url => `${serverUrl}${url}`) : [],
      status: row.status,
      submittedAt: row.created_at
    }));
    
    res.json({ requests });
  } catch (error) {
    console.error('Error fetching rescue requests:', error);
    res.status(500).json({ error: 'Failed to fetch rescue requests' });
  }
});

// Start rescue (assign to rescuer and set to in_progress)
app.put('/api/rescue/:id/start', authenticateToken, requireRescuer, async (req, res) => {
  try {
    const { id } = req.params;
    const rescuerId = req.user.id;
    
    // Check if rescue request exists and is available
    const checkQuery = `
      SELECT * FROM "RescueRequest" 
      WHERE id = $1 AND (status = 'open' OR status = 'assigned')
    `;
    const checkResult = await pool.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue request not found or already in progress' });
    }
    
    // Update status to in_progress and assign rescuer
    const updateQuery = `
      UPDATE "RescueRequest" 
      SET status = 'in_progress', 
          assigned_rescuer_id = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [rescuerId, id]);
    
    res.json({ 
      message: 'Rescue started successfully',
      request: result.rows[0] 
    });
  } catch (error) {
    console.error('Error starting rescue:', error);
    res.status(500).json({ error: 'Failed to start rescue' });
  }
});

// Complete rescue with dog status update
app.put('/api/rescue/:id/complete', authenticateToken, requireRescuer, upload.single('rescuePhoto'), async (req, res) => {
  try {
    const { id } = req.params;
    const rescuerId = req.user.id;
    const { dogName, dogBreed, dogAge, dogGender, dogCondition, rescueNotes, dogLocation } = req.body;
    
    // Check if this rescuer owns this rescue and it's in progress
    const checkQuery = `
      SELECT * FROM "RescueRequest" 
      WHERE id = $1 AND assigned_rescuer_id = $2 AND status = 'in_progress'
    `;
    const checkResult = await pool.query(checkQuery, [id, rescuerId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'You can only complete rescues you started and are in progress' });
    }
    
    let rescuePhotoUrl = null;
    if (req.file) {
      rescuePhotoUrl = `/uploads/${req.file.filename}`;
    }
    
    // Start transaction
    await pool.query('BEGIN');
    
    try {
      // Add the rescued dog to the database
      const dogQuery = `
        INSERT INTO "Dog" (
          name, age, breed, description, gender, location, 
          "imageUrl", rescuer_id, is_rescue_case, "createdAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const dogValues = [
        dogName || 'Rescued Dog',
        Number(dogAge) || 0,
        dogBreed || 'Mixed',
        `Rescue case completed by rescuer. Condition: ${dogCondition}. Notes: ${rescueNotes || 'No additional notes.'}`,
        dogGender || 'unknown',
        dogLocation || 'Rescue Center',
        rescuePhotoUrl,
        rescuerId,
        true, // is_rescue_case
        new Date()
      ];
      
      const dogResult = await pool.query(dogQuery, dogValues);
      const newDog = dogResult.rows[0];
      
      // Update rescue request status to completed
      const rescueUpdateQuery = `
        UPDATE "RescueRequest" 
        SET status = 'completed',
            rescue_completion_notes = $1,
            rescue_photo_url = $2,
            rescued_dog_id = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
      `;
      
      const rescueResult = await pool.query(rescueUpdateQuery, [
        rescueNotes,
        rescuePhotoUrl,
        newDog.id,
        id
      ]);
      
      await pool.query('COMMIT');
      
      // Get server URL from environment or construct it
      const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3000}`;
      
      res.json({ 
        message: 'Rescue completed successfully',
        request: rescueResult.rows[0],
        rescuedDog: {
          ...newDog,
          imageUrl: newDog.imageUrl ? `${serverUrl}${newDog.imageUrl}` : null
        }
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error completing rescue:', error);
    res.status(500).json({ error: 'Failed to complete rescue' });
  }
});

// Update rescue request status (admin only)
app.put('/api/rescue/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['open', 'assigned', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const query = `
      UPDATE "RescueRequest" 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue request not found' });
    }
    
    res.json({ 
      message: 'Rescue request status updated successfully',
      request: result.rows[0] 
    });
  } catch (error) {
    console.error('Error updating rescue request status:', error);
    res.status(500).json({ error: 'Failed to update rescue request status' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Use PORT from environment variables with fallback to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;