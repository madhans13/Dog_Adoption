import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Simple getDogs function without User table dependency
export const getDogs = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const query = `
      SELECT * FROM "Dog" 
      ORDER BY "createdAt" DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await pool.query(query, [parseInt(limit), parseInt(offset)]);
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
      imageUrl: dog.imageUrl ? `${req.protocol}://${req.get('host')}${dog.imageUrl}` : null,
      createdAt: dog.createdAt
    }));
    
    res.json({ dogs: dogsWithImageUrls });
  } catch (err) {
    console.error('Error fetching dogs:', err);
    res.status(500).json({ error: 'Error fetching dogs' });
  }
};

// Simple createDog function
export const createDog = async (req, res) => {
  try {
    const {
      name,
      age,
      breed,
      description,
      gender,
      location,
    } = req.body;

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const query = `
      INSERT INTO "Dog" (name, age, breed, description, gender, location, "imageUrl", "createdAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
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
      new Date()
    ];

    const result = await pool.query(query, values);
    const newDog = result.rows[0];

    res.status(201).json({
      message: 'Dog added successfully',
      dog: {
        id: newDog.id,
        name: newDog.name,
        breed: newDog.breed,
        age: newDog.age,
        gender: newDog.gender,
        location: newDog.location,
        description: newDog.description,
        imageUrl: newDog.imageUrl ? `${req.protocol}://${req.get('host')}${newDog.imageUrl}` : null,
        createdAt: newDog.createdAt
      }
    });
  } catch (err) {
    console.error('Error adding dog:', err);
    res.status(500).json({ error: 'Error adding dog' });
  }
};
