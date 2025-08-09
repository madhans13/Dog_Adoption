import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Submit rescue request (Users can report dogs that need rescue)
export const submitRescueRequest = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const {
      location,
      latitude,
      longitude,
      dogDescription,
      urgencyLevel = 'medium',
      contactInfo
    } = req.body;

    if (!location || !dogDescription) {
      return res.status(400).json({ error: 'Location and dog description are required' });
    }

    // Handle multiple image uploads
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }

    const query = `
      INSERT INTO "RescueRequest" (
        reporter_id, location, latitude, longitude, dog_description, 
        urgency_level, contact_info, image_urls
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, location, dog_description, urgency_level, status, created_at
    `;

    const values = [
      reporterId,
      location,
      latitude || null,
      longitude || null,
      dogDescription,
      urgencyLevel,
      contactInfo,
      imageUrls
    ];

    const result = await pool.query(query, values);
    const rescueRequest = result.rows[0];

    res.status(201).json({
      message: 'Rescue request submitted successfully',
      rescueRequest: {
        id: rescueRequest.id,
        location: rescueRequest.location,
        dogDescription: rescueRequest.dog_description,
        urgencyLevel: rescueRequest.urgency_level,
        status: rescueRequest.status,
        createdAt: rescueRequest.created_at,
        imageUrls: imageUrls.map(url => `${req.protocol}://${req.get('host')}${url}`)
      }
    });

  } catch (error) {
    console.error('Submit rescue request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get rescue requests for rescuers (location-based)
export const getRescueRequestsForRescuer = async (req, res) => {
  try {
    const { 
      status = 'reported',
      urgency,
      limit = 20,
      offset = 0,
      userLat,
      userLng,
      radius = 50 // kilometers
    } = req.query;

    let query = `
      SELECT 
        rr.id, rr.location, rr.latitude, rr.longitude, rr.dog_description,
        rr.urgency_level, rr.status, rr.contact_info, rr.image_urls, rr.created_at,
        u.first_name as reporter_first_name, u.last_name as reporter_last_name, u.phone as reporter_phone
    `;

    // Add distance calculation if user location is provided
    if (userLat && userLng) {
      query += `,
        (6371 * acos(cos(radians($${5})) * cos(radians(rr.latitude)) * 
         cos(radians(rr.longitude) - radians($${6})) + 
         sin(radians($${5})) * sin(radians(rr.latitude)))) AS distance
      `;
    }

    query += `
      FROM "RescueRequest" rr
      JOIN "User" u ON rr.reporter_id = u.id
      WHERE rr.status = $1
    `;

    const queryParams = [status];

    if (urgency) {
      query += ` AND rr.urgency_level = $${queryParams.length + 1}`;
      queryParams.push(urgency);
    }

    // Add distance filter if location is provided
    if (userLat && userLng) {
      queryParams.push(parseFloat(userLat), parseFloat(userLng));
      query += ` AND rr.latitude IS NOT NULL AND rr.longitude IS NOT NULL`;
      
      if (radius) {
        query += ` HAVING distance <= $${queryParams.length + 1}`;
        queryParams.push(parseFloat(radius));
      }
    }

    // Order by urgency and distance/creation time
    if (userLat && userLng) {
      query += ` ORDER BY 
        CASE rr.urgency_level 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        distance ASC
      `;
    } else {
      query += ` ORDER BY 
        CASE rr.urgency_level 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          WHEN 'low' THEN 4 
        END,
        rr.created_at DESC
      `;
    }

    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
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
      createdAt: row.created_at,
      distance: row.distance ? Math.round(row.distance * 100) / 100 : null,
      reporter: {
        firstName: row.reporter_first_name,
        lastName: row.reporter_last_name,
        phone: row.reporter_phone
      },
      imageUrls: row.image_urls ? row.image_urls.map(url => `${req.protocol}://${req.get('host')}${url}`) : []
    }));

    res.json({ rescueRequests });

  } catch (error) {
    console.error('Get rescue requests for rescuer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Assign rescue request to rescuer
export const assignRescueRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const rescuerId = req.user.id;

    // Check if request exists and is available
    const checkQuery = `
      SELECT id, status, assigned_rescuer_id 
      FROM "RescueRequest" 
      WHERE id = $1
    `;

    const checkResult = await pool.query(checkQuery, [requestId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rescue request not found' });
    }

    const request = checkResult.rows[0];

    if (request.status !== 'reported') {
      return res.status(400).json({ 
        error: `Cannot assign request. Current status: ${request.status}` 
      });
    }

    if (request.assigned_rescuer_id) {
      return res.status(409).json({ error: 'Request is already assigned to another rescuer' });
    }

    // Assign the request
    const updateQuery = `
      UPDATE "RescueRequest" 
      SET assigned_rescuer_id = $1, status = 'assigned', updated_at = NOW()
      WHERE id = $2
      RETURNING id, location, dog_description, urgency_level, status
    `;

    const result = await pool.query(updateQuery, [rescuerId, requestId]);
    const updatedRequest = result.rows[0];

    res.json({
      message: 'Rescue request assigned successfully',
      rescueRequest: {
        id: updatedRequest.id,
        location: updatedRequest.location,
        dogDescription: updatedRequest.dog_description,
        urgencyLevel: updatedRequest.urgency_level,
        status: updatedRequest.status
      }
    });

  } catch (error) {
    console.error('Assign rescue request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update rescue request status
export const updateRescueStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;
    const userId = req.user.id;

    const validStatuses = ['in_progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    // Check if user is assigned to this request or is admin
    let checkQuery;
    let checkParams;

    if (req.user.role === 'admin') {
      checkQuery = 'SELECT id, status FROM "RescueRequest" WHERE id = $1';
      checkParams = [requestId];
    } else {
      checkQuery = 'SELECT id, status FROM "RescueRequest" WHERE id = $1 AND assigned_rescuer_id = $2';
      checkParams = [requestId, userId];
    }

    const checkResult = await pool.query(checkQuery, checkParams);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Rescue request not found or you are not assigned to it' 
      });
    }

    // Update the request
    const updateQuery = `
      UPDATE "RescueRequest" 
      SET status = $1, admin_notes = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, status, updated_at
    `;

    const result = await pool.query(updateQuery, [status, adminNotes, requestId]);
    const updatedRequest = result.rows[0];

    res.json({
      message: 'Rescue request status updated successfully',
      rescueRequest: {
        id: updatedRequest.id,
        status: updatedRequest.status,
        updatedAt: updatedRequest.updated_at
      }
    });

  } catch (error) {
    console.error('Update rescue status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get rescuer's assigned requests
export const getMyRescueRequests = async (req, res) => {
  try {
    const rescuerId = req.user.id;

    const query = `
      SELECT 
        rr.id, rr.location, rr.latitude, rr.longitude, rr.dog_description,
        rr.urgency_level, rr.status, rr.contact_info, rr.image_urls, 
        rr.created_at, rr.updated_at,
        u.first_name as reporter_first_name, u.last_name as reporter_last_name, 
        u.phone as reporter_phone
      FROM "RescueRequest" rr
      JOIN "User" u ON rr.reporter_id = u.id
      WHERE rr.assigned_rescuer_id = $1
      ORDER BY rr.created_at DESC
    `;

    const result = await pool.query(query, [rescuerId]);

    const rescueRequests = result.rows.map(row => ({
      id: row.id,
      location: row.location,
      latitude: row.latitude,
      longitude: row.longitude,
      dogDescription: row.dog_description,
      urgencyLevel: row.urgency_level,
      status: row.status,
      contactInfo: row.contact_info,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reporter: {
        firstName: row.reporter_first_name,
        lastName: row.reporter_last_name,
        phone: row.reporter_phone
      },
      imageUrls: row.image_urls ? row.image_urls.map(url => `${req.protocol}://${req.get('host')}${url}`) : []
    }));

    res.json({ rescueRequests });

  } catch (error) {
    console.error('Get my rescue requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
