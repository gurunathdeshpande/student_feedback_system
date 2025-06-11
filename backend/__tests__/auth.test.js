const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

jest.mock('../models/User');

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'student'
      };

      User.create.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: 'password123'
      };

      User.findOne.mockResolvedValue({
        ...mockUser,
        matchPassword: jest.fn().mockResolvedValue(true),
        getSignedJwtToken: jest.fn().mockReturnValue('mocktoken')
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send(mockUser);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('token');
    });
  });
}); 