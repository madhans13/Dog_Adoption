import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts for various entities
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

    // Get recent activities
    const recentActivitiesQuery = `
      (
        SELECT 'adoption_request' as type, ar.requested_at as timestamp, 
               u.first_name || ' ' || u.last_name as user_name, d.name as dog_name
        FROM "AdoptionRequest" ar
        JOIN "User" u ON ar.user_id = u.id
        JOIN "Dog" d ON ar.dog_id = d.id
        ORDER BY ar.requested_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 'rescue_request' as type, rr.created_at as timestamp,
               u.first_name || ' ' || u.last_name as user_name, 
               'Rescue in ' || rr.location as dog_name
        FROM "RescueRequest" rr
        JOIN "User" u ON rr.reporter_id = u.id
        ORDER BY rr.created_at DESC
        LIMIT 5
      )
      ORDER BY timestamp DESC
      LIMIT 10
    `;

    const activitiesResult = await pool.query(recentActivitiesQuery);

    res.json({
      totalUsers: parseInt(stats.total_users),
      totalRescuers: parseInt(stats.total_rescuers),
      totalAdmins: parseInt(stats.total_admins),
      totalDogs: parseInt(stats.total_dogs),
      totalRescueRequests: parseInt(stats.total_rescue_requests),
      pendingRequests: parseInt(stats.pending_requests),
      completedRequests: parseInt(stats.completed_requests),
      recentActivity: activitiesResult.rows || []
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users with filtering
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, limit = 50, offset = 0, search } = req.query;

    let query = `
      SELECT id, email, first_name, last_name, phone, city, state, 
             role, is_active, is_verified, created_at
      FROM "User"
      WHERE 1=1
    `;

    const queryParams = [];

    if (role && role !== 'all') {
      query += ` AND role = $${queryParams.length + 1}`;
      queryParams.push(role);
    }

    if (isActive !== undefined) {
      query += ` AND is_active = $${queryParams.length + 1}`;
      queryParams.push(isActive === 'true');
    }

    if (search) {
      query += ` AND (first_name ILIKE $${queryParams.length + 1} OR last_name ILIKE $${queryParams.length + 1} OR email ILIKE $${queryParams.length + 1})`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, queryParams);

    const users = result.rows.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      city: user.city,
      state: user.state,
      role: user.role,
      isActive: user.is_active,
      isVerified: user.is_verified,
      createdAt: user.created_at
    }));

    res.json({ users });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    // Prevent admin from deactivating themselves
    if (req.user.id === parseInt(userId) && !isActive) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    const query = `
      UPDATE "User" 
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, first_name, last_name, role, is_active
    `;

    const result = await pool.query(query, [isActive, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        isActive: user.is_active
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'rescuer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
      });
    }

    // Prevent admin from changing their own role
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    const query = `
      UPDATE "User" 
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, first_name, last_name, role
    `;

    const result = await pool.query(query, [role, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all rescue requests (admin view)
export const getAllRescueRequests = async (req, res) => {
  try {
    const { status, urgency, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        rr.id, rr.location, rr.latitude, rr.longitude, rr.dog_description,
        rr.urgency_level, rr.status, rr.contact_info, rr.image_urls, 
        rr.admin_notes, rr.created_at, rr.updated_at,
        u.first_name as reporter_first_name, u.last_name as reporter_last_name, 
        u.email as reporter_email, u.phone as reporter_phone,
        r.first_name as rescuer_first_name, r.last_name as rescuer_last_name
      FROM "RescueRequest" rr
      JOIN "User" u ON rr.reporter_id = u.id
      LEFT JOIN "User" r ON rr.assigned_rescuer_id = r.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (status) {
      query += ` AND rr.status = $${queryParams.length + 1}`;
      queryParams.push(status);
    }

    if (urgency) {
      query += ` AND rr.urgency_level = $${queryParams.length + 1}`;
      queryParams.push(urgency);
    }

    query += ` ORDER BY rr.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, queryParams);

    const rescueRequests = result.rows.map(row => ({
      id: row.id,
      location: row.location,
      latitude: row.latitude,
      longitude: row.longitude,
      dogDescription: row.dog_description,
      urgencyLevel: row.urgency_level,
      status: row.status,
      contactInfo: row.contact_info,
      adminNotes: row.admin_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reporter: {
        firstName: row.reporter_first_name,
        lastName: row.reporter_last_name,
        email: row.reporter_email,
        phone: row.reporter_phone
      },
      assignedRescuer: row.rescuer_first_name ? {
        firstName: row.rescuer_first_name,
        lastName: row.rescuer_last_name
      } : null,
      imageUrls: row.image_urls ? row.image_urls.map(url => `${req.protocol}://${req.get('host')}${url}`) : []
    }));

    res.json({ rescueRequests });

  } catch (error) {
    console.error('Get all rescue requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
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

    // Delete user (cascade will handle related records)
    const deleteQuery = 'DELETE FROM "User" WHERE id = $1';
    await pool.query(deleteQuery, [userId]);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
