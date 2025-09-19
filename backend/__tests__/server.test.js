const request = require('supertest');
const express = require('express');

// Mock Express app for testing
const app = express();
app.use(express.json());

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

describe('Backend Server', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.message).toBe('Server is running');
  });

  it('should handle 404 for unknown routes', async () => {
    await request(app)
      .get('/unknown-route')
      .expect(404);
  });
});
