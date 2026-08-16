const request = require('supertest');
const {
  app,
  ROLES,
  authHeader,
  createUser,
  createAuthenticatedUser,
} = require('./helpers');

describe('Auth flows', () => {
  describe('Login & token generation', () => {
    it('logs in with valid credentials and returns a JWT + user payload', async () => {
      await createUser({
        email: 'student@nitj.ac.in',
        password: 'secret123',
        role: ROLES.STUDENT,
        mustChangePassword: false,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@nitj.ac.in', password: 'secret123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toEqual(expect.any(String));
      expect(res.body.data.user).toMatchObject({
        email: 'student@nitj.ac.in',
        role: ROLES.STUDENT,
      });
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('rejects invalid credentials', async () => {
      await createUser({
        email: 'student@nitj.ac.in',
        password: 'secret123',
        mustChangePassword: false,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student@nitj.ac.in', password: 'wrong-password' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('rejects login for deactivated accounts', async () => {
      await createUser({
        email: 'inactive@nitj.ac.in',
        password: 'secret123',
        mustChangePassword: false,
        isActive: false,
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'inactive@nitj.ac.in', password: 'secret123' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/deactivated/i);
    });  });

  describe('Admin user registration (account creation)', () => {
    it('allows an admin to register a new student account', async () => {
      const { token: adminToken } = await createAuthenticatedUser({
        email: 'admin@nitj.ac.in',
        role: ROLES.ADMIN,
        mustChangePassword: false,
      });

      const res = await request(app)
        .post('/api/users')
        .set(authHeader(adminToken))
        .send({
          email: 'newstudent@nitj.ac.in',
          role: ROLES.STUDENT,
          firstName: 'New',
          lastName: 'Student',
          rollNumber: '21105001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        email: 'newstudent@nitj.ac.in',
        role: ROLES.STUDENT,
        mustChangePassword: true,
      });
    });

    it('allows the newly registered user to log in with the default password', async () => {
      const { token: adminToken } = await createAuthenticatedUser({
        email: 'admin@nitj.ac.in',
        role: ROLES.ADMIN,
        mustChangePassword: false,
      });

      await request(app)
        .post('/api/users')
        .set(authHeader(adminToken))
        .send({
          email: 'rolluser@nitj.ac.in',
          role: ROLES.STUDENT,
          rollNumber: '21105002',
        })
        .expect(201);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'rolluser@nitj.ac.in', password: '21105002' });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.token).toEqual(expect.any(String));
      expect(loginRes.body.data.user.mustChangePassword).toBe(true);
    });
  });

  describe('mustChangePassword guard', () => {
    it('blocks protected routes until the password is changed', async () => {
      await createUser({
        email: 'mustchange@nitj.ac.in',
        password: 'temp123',
        role: ROLES.STUDENT,
        mustChangePassword: true,
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'mustchange@nitj.ac.in', password: 'temp123' });

      const token = loginRes.body.data.token;

      const blocked = await request(app)
        .get('/api/auth/profile')
        .set(authHeader(token));

      expect(blocked.status).toBe(403);
      expect(blocked.body.message).toMatch(/password change required/i);
    });

    it('allows change-password while mustChangePassword is true', async () => {
      await createUser({
        email: 'mustchange@nitj.ac.in',
        password: 'temp123',
        role: ROLES.STUDENT,
        mustChangePassword: true,
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'mustchange@nitj.ac.in', password: 'temp123' });

      const token = loginRes.body.data.token;

      const changeRes = await request(app)
        .post('/api/auth/change-password')
        .set(authHeader(token))
        .send({
          currentPassword: 'temp123',
          newPassword: 'newpass123',
          confirmPassword: 'newpass123',
        });

      expect(changeRes.status).toBe(200);

      const profileRes = await request(app)
        .get('/api/auth/profile')
        .set(authHeader(token));

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.mustChangePassword).toBe(false);
    });
  });
});
