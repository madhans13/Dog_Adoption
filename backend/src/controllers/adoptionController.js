import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Submit adoption request (Users only)
export const submitAdoptionRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { dogId, message } = req.body;

    if (!dogId) {
      return res.status(400).json({ error: 'Dog ID is required' });
    }

    // Check if dog exists and is available
    const dogResult = await pool.query(
      'SELECT id, name, status FROM "Dog" WHERE id = $1',
      [dogId]
    );

    if (dogResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const dog = dogResult.rows[0];

    if (dog.status !== 'available') {
      return res.status(400).json({ 
        error: `Dog is not available for adoption. Current status: ${dog.status}` 
      });
    }

    // Check if user already has a pending request for this dog
    const existingRequest = await pool.query(
      'SELECT id FROM "AdoptionRequest" WHERE user_id = $1 AND dog_id = $2 AND status = $3',
      [userId, dogId, 'pending']
    );

    if (existingRequest.rows.length > 0) {
      return res.status(409).json({ 
        error: 'You already have a pending adoption request for this dog' 
      });
    }

    // Create adoption request
    const query = `
      INSERT INTO "AdoptionRequest" (user_id, dog_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, dog_id, status, message, requested_at
    `;

    const result = await pool.query(query, [userId, dogId, message]);
    const adoptionRequest = result.rows[0];

    res.status(201).json({
      message: 'Adoption request submitted successfully',
      adoptionRequest: {
        id: adoptionRequest.id,
        dogId: adoptionRequest.dog_id,
        status: adoptionRequest.status,
        message: adoptionRequest.message,
        requestedAt: adoptionRequest.requested_at
      }
    });

  } catch (error) {
    console.error('Submit adoption request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user's adoption requests
export const getUserAdoptionRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        ar.id, ar.status, ar.message, ar.requested_at, ar.processed_at,
        d.id as dog_id, d.name as dog_name, d.breed, d.age, d."imageUrl"
      FROM "AdoptionRequest" ar
      JOIN "Dog" d ON ar.dog_id = d.id
      WHERE ar.user_id = $1
      ORDER BY ar.requested_at DESC
    `;

    const result = await pool.query(query, [userId]);

    const adoptionRequests = result.rows.map(row => ({
      id: row.id,
      status: row.status,
      message: row.message,
      requestedAt: row.requested_at,
      processedAt: row.processed_at,
      dog: {
        id: row.dog_id,
        name: row.dog_name,
        breed: row.breed,
        age: row.age,
        imageUrl: row.imageUrl ? `${req.protocol}://${req.get('host')}${row.imageUrl}` : null
      }
    }));

    res.json({ adoptionRequests });

  } catch (error) {
    console.error('Get user adoption requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all adoption requests (Admin only)
export const getAllAdoptionRequests = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT 
        ar.id, ar.status, ar.message, ar.admin_notes, ar.requested_at, ar.processed_at,
        u.id as user_id, u.first_name, u.last_name, u.email, u.phone,
        d.id as dog_id, d.name as dog_name, d.breed, d.age, d."imageUrl"
      FROM "AdoptionRequest" ar
      JOIN "User" u ON ar.user_id = u.id
      JOIN "Dog" d ON ar.dog_id = d.id
    `;

    const queryParams = [];
    
    if (status) {
      query += ' WHERE ar.status = $1';
      queryParams.push(status);
    }

    query += ' ORDER BY ar.requested_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, queryParams);

    const adoptionRequests = result.rows.map(row => ({
      id: row.id,
      status: row.status,
      message: row.message,
      adminNotes: row.admin_notes,
      requestedAt: row.requested_at,
      processedAt: row.processed_at,
      user: {
        id: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone
      },
      dog: {
        id: row.dog_id,
        name: row.dog_name,
        breed: row.breed,
        age: row.age,
        imageUrl: row.imageUrl ? `${req.protocol}://${req.get('host')}${row.imageUrl}` : null
      }
    }));

    res.json({ adoptionRequests });

  } catch (error) {
    console.error('Get all adoption requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Process adoption request (Admin only)
export const processAdoptionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;
    const adminId = req.user.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be either "approved" or "rejected"' });
    }

    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update adoption request
      const updateQuery = `
        UPDATE "AdoptionRequest" 
        SET status = $1, admin_notes = $2, processed_at = NOW(), processed_by = $3
        WHERE id = $4
        RETURNING user_id, dog_id
      `;

      const updateResult = await client.query(updateQuery, [status, adminNotes, adminId, requestId]);

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Adoption request not found' });
      }

      const { dog_id } = updateResult.rows[0];

      // If approved, update dog status and reject other pending requests for this dog
      if (status === 'approved') {
        // Update dog status
        await client.query(
          'UPDATE "Dog" SET status = $1 WHERE id = $2',
          ['adopted', dog_id]
        );

        // Reject other pending requests for this dog
        await client.query(
          `UPDATE "AdoptionRequest" 
           SET status = 'rejected', admin_notes = 'Dog was adopted by another applicant', 
               processed_at = NOW(), processed_by = $1
           WHERE dog_id = $2 AND status = 'pending' AND id != $3`,
          [adminId, dog_id, requestId]
        );
      }

      await client.query('COMMIT');

      res.json({
        message: `Adoption request ${status} successfully`,
        status: status
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Process adoption request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
