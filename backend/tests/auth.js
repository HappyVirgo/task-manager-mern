// authController.test.js
const request = require('supertest');
const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { createAccessToken } = require('../utils/token');
const { validateEmail } = require('../utils/validation');
const authController = require('../controllers/authController');

// Middleware
app.use(express.json());
app.post('/signup', authController.signup);
app.post('/login', authController.login);

// Mock external dependencies
jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('../utils/token');
jest.mock('../utils/validation');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /signup', () => {
    it('should return 400 if fields are missing', async () => {
      const response = await request(app).post('/signup').send({ name: 'John', email: '' });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Please fill all the fields');
    });

    it('should return 400 if non-string values are provided', async () => {
      const response = await request(app).post('/signup').send({ name: 123, email: 'test@test.com', password: '1234' });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Please send string values only');
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app).post('/signup').send({ name: 'John', email: 'test@test.com', password: '123' });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Password length must be atleast 4 characters');
    });

    it('should return 400 if email is invalid', async () => {
      validateEmail.mockReturnValue(false);
      const response = await request(app).post('/signup').send({ name: 'John', email: 'invalidemail', password: 'password' });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Invalid Email');
    });

    it('should return 400 if email is already registered', async () => {
      User.findOne.mockResolvedValue(true); // Simulate email already registered
      const response = await request(app).post('/signup').send({ name: 'John', email: 'test@test.com', password: 'password' });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('This email is already registered');
    });

    it('should create a new user and return success message', async () => {
      User.findOne.mockResolvedValue(null); // Email not found
      bcrypt.hash.mockResolvedValue('hashedpassword');
      User.create.mockResolvedValue({});
      const response = await request(app).post('/signup').send({ name: 'John', email: 'test@test.com', password: 'password' });
      expect(response.status).toBe(200);
      expect(response.body.msg).toBe('Congratulations!! Account has been created for you..');
    });

    it('should return 500 on server error', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));
      const response = await request(app).post('/signup').send({ name: 'John', email: 'test@test.com', password: 'password' });
      expect(response.status).toBe(500);
      expect(response.body.msg).toBe('Internal Server Error');
    });
  });

  describe('POST /login', () => {
    it('should return 400 if email or password is missing', async () => {
      const response = await request(app).post('/login').send({ email: 'test@test.com' });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Please enter all details!!');
    });

    it('should return 400 if email is not registered', async () => {
      User.findOne.mockResolvedValue(null);
      const response = await request(app).post('/login').send({ email: 'test@test.com', password: 'password' });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('This email is not registered!!');
    });

    it('should return 400 if password is incorrect', async () => {
      User.findOne.mockResolvedValue({ password: 'hashedpassword' });
      bcrypt.compare.mockResolvedValue(false);
      const response = await request(app).post('/login').send({ email: 'test@test.com', password: 'wrongpassword' });
      expect(response.status).toBe(400);
      expect(response.body.msg).toBe('Password incorrect!!');
    });

    it('should return 200 with token and user if login is successful', async () => {
      User.findOne.mockResolvedValue({ _id: 'user-id', password: 'hashedpassword' });
      bcrypt.compare.mockResolvedValue(true);
      createAccessToken.mockReturnValue('token');
      const response = await request(app).post('/login').send({ email: 'test@test.com', password: 'password' });
      expect(response.status).toBe(200);
      expect(response.body.token).toBe('token');
      expect(response.body.user._id).toBe('user-id');
      expect(response.body.status).toBe(true);
      expect(response.body.msg).toBe('Login successful..');
    });

    it('should return 500 on server error', async () => {
      User.findOne.mockRejectedValue(new Error('DB error'));
      const response = await request(app).post('/login').send({ email: 'test@test.com', password: 'password' });
      expect(response.status).toBe(500);
      expect(response.body.msg).toBe('Internal Server Error');
    });
  });
});