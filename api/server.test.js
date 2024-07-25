const request = require('supertest');
const server = require('../api/server');
const db = require('../data/dbConfig');

beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

beforeEach(async () => {
  await db('users').truncate();
});

afterAll(async () => {
  await db.destroy();
});

describe('Auth Endpoints', () => {
  describe('[POST] /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'Captain Marvel', password: 'foobar' });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username', 'Captain Marvel');
      expect(res.body).toHaveProperty('password');
    });

    it('should return error if username or password is missing', async () => {
      let res = await request(server).post('/api/auth/register').send({ username: 'Captain Marvel' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');

      res = await request(server).post('/api/auth/register').send({ password: 'foobar' });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });

    it('should return error if username is taken', async () => {
      await request(server).post('/api/auth/register').send({ username: 'Captain Marvel', password: 'foobar' });
      const res = await request(server).post('/api/auth/register').send({ username: 'Captain Marvel', password: 'foobar' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username taken');
    });
  });

  describe('[POST] /api/auth/login', () => {
    it('should login an existing user', async () => {
      await request(server).post('/api/auth/register').send({ username: 'Captain Marvel', password: 'foobar' });
      const res = await request(server).post('/api/auth/login').send({ username: 'Captain Marvel', password: 'foobar' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'welcome, Captain Marvel');
      expect(res.body).toHaveProperty('token');
    });

    it('should return error if username or password is missing', async () => {
      const res = await request(server).post('/api/auth/login').send({ username: 'Captain Marvel' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });

    it('should return error if credentials are invalid', async () => {
      await request(server).post('/api/auth/register').send({ username: 'Captain Marvel', password: 'foobar' });
      let res = await request(server).post('/api/auth/login').send({ username: 'Captain Marvel', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid credentials');

      res = await request(server).post('/api/auth/login').send({ username: 'NonExistentUser', password: 'foobar' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid credentials');
    });
  });
});
