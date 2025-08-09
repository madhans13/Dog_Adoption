import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getDogs = async (req, res) => {
  try {
    const { status = 'available', limit = 20, offset = 0 } = req.query;
    
    // Only show available dogs to non-authenticated users
    // Authenticated users can see more based on their role
    let statusFilter = 'available';
    
    if (req.user) {
      if (req.user.role === 'admin') {
        // Admin can see all dogs
        statusFilter = status;
      } else if (req.user.role === 'rescuer') {
        // Rescuers can see available and rescued dogs
        statusFilter = ['available', 'rescued'].includes(status) ? status : 'available';
      } else {
        // Users can only see available dogs
        statusFilter = 'available';
      }
    }

    const query = `
      SELECT 
        d.*, 
        r.first_name as rescuer_first_name, 
        r.last_name as rescuer_last_name
      FROM "Dog" d
      LEFT JOIN "User" r ON d.rescuer_id = r.id
      WHERE d.status = $1
      ORDER BY d."createdAt" DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [statusFilter, parseInt(limit), parseInt(offset)]);
    const dogs = result.rows;
    
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
      imageUrl: dog.imageUrl ? `${req.protocol}://${req.get('host')}${dog.imageUrl}` : null,
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
};

export const createDog = async (req, res) => {
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
      imageUrl: newDog.imageUrl ? `${req.protocol}://${req.get('host')}${newDog.imageUrl}` : null,
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
};

// Get single dog by ID
export const getDogById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        d.*, 
        r.first_name as rescuer_first_name, 
        r.last_name as rescuer_last_name
      FROM "Dog" d
      LEFT JOIN "User" r ON d.rescuer_id = r.id
      WHERE d.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const dog = result.rows[0];

    const dogWithImageUrl = {
      id: dog.id,
      name: dog.name,
      breed: dog.breed,
      age: dog.age,
      gender: dog.gender,
      location: dog.location,
      description: dog.description,
      status: dog.status,
      isRescueCase: dog.is_rescue_case,
      imageUrl: dog.imageUrl ? `${req.protocol}://${req.get('host')}${dog.imageUrl}` : null,
      createdAt: dog.createdAt,
      rescuer: dog.rescuer_first_name ? {
        firstName: dog.rescuer_first_name,
        lastName: dog.rescuer_last_name
      } : null
    };

    res.json({ dog: dogWithImageUrl });
  } catch (err) {
    console.error('Error fetching dog:', err);
    res.status(500).json({ error: 'Error fetching dog' });
  }
};

// Update dog (Admin and Rescuer only)
export const updateDog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      breed,
      description,
      gender,
      location,
      status
    } = req.body;

    // Check if dog exists
    const checkResult = await pool.query('SELECT * FROM "Dog" WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    const currentDog = checkResult.rows[0];

    // Check permissions
    if (req.user.role === 'rescuer' && currentDog.rescuer_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update dogs you rescued' });
    }

    // Handle image upload
    let imageUrl = currentDog.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const query = `
      UPDATE "Dog" 
      SET name = $1, age = $2, breed = $3, description = $4, 
          gender = $5, location = $6, status = $7, "imageUrl" = $8, updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      name || currentDog.name,
      age ? Number(age) : currentDog.age,
      breed || currentDog.breed,
      description || currentDog.description,
      gender || currentDog.gender,
      location || currentDog.location,
      status || currentDog.status,
      imageUrl,
      id
    ];

    const result = await pool.query(query, values);
    const updatedDog = result.rows[0];

    res.json({
      message: 'Dog updated successfully',
      dog: {
        id: updatedDog.id,
        name: updatedDog.name,
        breed: updatedDog.breed,
        age: updatedDog.age,
        gender: updatedDog.gender,
        location: updatedDog.location,
        description: updatedDog.description,
        status: updatedDog.status,
        imageUrl: updatedDog.imageUrl ? `${req.protocol}://${req.get('host')}${updatedDog.imageUrl}` : null
      }
    });

  } catch (err) {
    console.error('Error updating dog:', err);
    res.status(500).json({ error: 'Error updating dog' });
  }
};

// Delete dog (Admin only)
export const deleteDog = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM "Dog" WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    res.json({ message: 'Dog deleted successfully' });
  } catch (err) {
    console.error('Error deleting dog:', err);
    res.status(500).json({ error: 'Error deleting dog' });
  }
};
