import pkg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Get all rescued dogs for a specific rescuer
export const getRescuedDogs = async (req, res) => {
  try {
    const rescuerId = req.user.id;
    
    const query = `
      SELECT 
        rd.id, rd.name, rd.breed, rd.age, rd.gender, rd.size, rd.color,
        rd.health_status, rd.description, rd.rescue_notes, rd.image_url,
        rd.rescue_date, rd.status, rd.rescue_request_id, rd.location,
        rd.created_at, rd.updated_at,
        u.first_name as rescuer_first_name, u.last_name as rescuer_last_name
      FROM "RescuedDog" rd
      LEFT JOIN "User" u ON rd.rescuer_id = u.id
      WHERE rd.rescuer_id = $1
      ORDER BY rd.rescue_date DESC
    `;
    
    const result = await pool.query(query, [rescuerId]);
    
    res.json({
      success: true,
      rescuedDogs: result.rows.map(dog => ({
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        gender: dog.gender,
        size: dog.size,
        color: dog.color,
        healthStatus: dog.health_status,
        description: dog.description,
        rescueNotes: dog.rescue_notes,
        imageUrl: dog.image_url,
        rescueDate: dog.rescue_date,
        rescuerId: dog.rescuer_id,
        status: dog.status,
        rescueRequestId: dog.rescue_request_id,
        location: dog.location,
        createdAt: dog.created_at,
        updatedAt: dog.updated_at,
        rescuerName: `${dog.rescuer_first_name} ${dog.rescuer_last_name}`
      }))
    });
    
  } catch (error) {
    console.error('Get rescued dogs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add a new rescued dog
export const addRescuedDog = async (req, res) => {
  try {
    const rescuerId = req.user.id;
    const {
      name,
      breed,
      age,
      gender,
      size,
      color,
      healthStatus,
      description,
      rescueNotes,
      rescueRequestId,
      status = 'rescued',
      location
    } = req.body;

    // Validate required fields
    if (!name || !breed) {
      return res.status(400).json({ error: 'Dog name and breed are required' });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const query = `
      INSERT INTO "RescuedDog" (
        name, breed, age, gender, size, color, health_status, description,
        rescue_notes, image_url, rescue_date, rescuer_id, status, rescue_request_id, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, name, breed, age, gender, size, color, health_status, description,
                rescue_notes, image_url, rescue_date, status, rescue_request_id, location, created_at
    `;

    const values = [
      name,
      breed,
      age || null,
      gender || null,
      size || null,
      color || null,
      healthStatus || null,
      description || null,
      rescueNotes || null,
      imageUrl,
      new Date(),
      rescuerId,
      status,
      rescueRequestId || null,
      location || null
    ];

    const result = await pool.query(query, values);
    const rescuedDog = result.rows[0];

    // If there's a rescue request ID, update its status to completed
    if (rescueRequestId) {
      try {
        await pool.query(
          'UPDATE "RescueRequest" SET status = $1, completed_at = $2 WHERE id = $3',
          ['completed', new Date(), rescueRequestId]
        );
      } catch (updateError) {
        console.warn('Failed to update rescue request status:', updateError);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Rescued dog added successfully',
      rescuedDog: {
        id: rescuedDog.id,
        name: rescuedDog.name,
        breed: rescuedDog.breed,
        age: rescuedDog.age,
        gender: rescuedDog.gender,
        size: rescuedDog.size,
        color: rescuedDog.color,
        healthStatus: rescuedDog.health_status,
        description: rescuedDog.description,
        rescueNotes: rescuedDog.rescue_notes,
        imageUrl: rescuedDog.image_url,
        rescueDate: rescuedDog.rescue_date,
        status: rescuedDog.status,
        rescueRequestId: rescuedDog.rescue_request_id,
        location: rescuedDog.location,
        createdAt: rescuedDog.created_at
      }
    });

  } catch (error) {
    console.error('Add rescued dog error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update rescued dog status
export const updateRescuedDogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const rescuerId = req.user.id;

    if (!status || !['rescued', 'adopted', 'available_for_adoption'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const query = `
      UPDATE "RescuedDog" 
      SET status = $1, updated_at = $2
      WHERE id = $3 AND rescuer_id = $4
      RETURNING id, name, status
    `;

    const result = await pool.query(query, [status, new Date(), id, rescuerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rescued dog not found or access denied' });
    }

    res.json({
      success: true,
      message: 'Rescued dog status updated successfully',
      rescuedDog: result.rows[0]
    });

  } catch (error) {
    console.error('Update rescued dog status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific rescued dog by ID
export const getRescuedDogById = async (req, res) => {
  try {
    const { id } = req.params;
    const rescuerId = req.user.id;

    const query = `
      SELECT 
        rd.id, rd.name, rd.breed, rd.age, rd.gender, rd.size, rd.color,
        rd.health_status, rd.description, rd.rescue_notes, rd.image_url,
        rd.rescue_date, rd.status, rd.rescue_request_id, rd.location,
        rd.created_at, rd.updated_at,
        u.first_name as rescuer_first_name, u.last_name as rescuer_last_name
      FROM "RescuedDog" rd
      LEFT JOIN "User" u ON rd.rescuer_id = u.id
      WHERE rd.id = $1 AND rd.rescuer_id = $2
    `;

    const result = await pool.query(query, [id, rescuerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rescued dog not found or access denied' });
    }

    const dog = result.rows[0];
    res.json({
      success: true,
      rescuedDog: {
        id: dog.id,
        name: dog.name,
        breed: dog.breed,
        age: dog.age,
        gender: dog.gender,
        size: dog.size,
        color: dog.color,
        healthStatus: dog.health_status,
        description: dog.description,
        rescueNotes: dog.rescue_notes,
        imageUrl: dog.image_url,
        rescueDate: dog.rescue_date,
        rescuerId: dog.rescuer_id,
        status: dog.status,
        rescueRequestId: dog.rescue_request_id,
        location: dog.location,
        createdAt: dog.created_at,
        updatedAt: dog.updated_at,
        rescuerName: `${dog.rescuer_first_name} ${dog.rescuer_last_name}`
      }
    });

  } catch (error) {
    console.error('Get rescued dog by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a rescued dog (only by the rescuer who created it)
export const deleteRescuedDog = async (req, res) => {
  try {
    const { id } = req.params;
    const rescuerId = req.user.id;

    // First check if the dog exists and belongs to the rescuer
    const checkQuery = 'SELECT image_url FROM "RescuedDog" WHERE id = $1 AND rescuer_id = $2';
    const checkResult = await pool.query(checkQuery, [id, rescuerId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rescued dog not found or access denied' });
    }

    // Delete the image file if it exists
    const dog = checkResult.rows[0];
    if (dog.image_url) {
      const imagePath = path.join(process.cwd(), dog.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // Delete the database record
    const deleteQuery = 'DELETE FROM "RescuedDog" WHERE id = $1 AND rescuer_id = $2';
    await pool.query(deleteQuery, [id, rescuerId]);

    res.json({
      success: true,
      message: 'Rescued dog deleted successfully'
    });

  } catch (error) {
    console.error('Delete rescued dog error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

