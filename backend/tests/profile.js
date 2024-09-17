// profileController.test.js
const request = require('supertest');
const express = require('express');
const app = express();
const User = require('../models/User');
const profileController = require('../controllers/profileController');

// Middleware for testing purposes
app.use(express.json());

// Mock middleware to simulate authenticated user
app.use((req, res, next) => {
  req.user = { id: 'user-id' };
  next();
});

app.get('/profile', profileController.getProfile);

// Mock User model
jest.mock('../models/User');

describe('Profile Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and user profile if profile is found', async () => {
    // Arrange
    const mockUser = { _id: 'user-id', name: 'John Doe', email: 'john@example.com' };
    User.findById.mockResolvedValue(mockUser);

    // Act
    const response = await request(app).get('/profile');

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
    expect(response.body.msg).toBe('Profile found successfully..');
    expect(response.body.user).toEqual(mockUser);
  });

  it('should return 500 if there is an internal server error', async () => {
    // Arrange
    User.findById.mockRejectedValue(new Error('Database error'));

    // Act
    const response = await request(app).get('/profile');

    // Assert
    expect(response.status).toBe(500);
    expect(response.body.status).toBe(false);
    expect(response.body.msg).toBe('Internal Server Error');
  });
});