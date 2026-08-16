const request = require('supertest');
const {
  app,
  ROLES,
  authHeader,
  createAuthenticatedUser,
} = require('./helpers');

describe('RBAC', () => {
  it('blocks unauthenticated access to admin user management', async () => {
    const res = await request(app).get('/api/users');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('blocks students from admin-only user listing', async () => {
    const { token } = await createAuthenticatedUser({
      email: 'student@nitj.ac.in',
      role: ROLES.STUDENT,
      mustChangePassword: false,
    });

    const res = await request(app)
      .get('/api/users')
      .set(authHeader(token));

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/access denied/i);
  });

  it('blocks teachers from admin-only user listing', async () => {
    const { token } = await createAuthenticatedUser({
      email: 'teacher@nitj.ac.in',
      role: ROLES.TEACHER,
      mustChangePassword: false,
    });

    const res = await request(app)
      .get('/api/users')
      .set(authHeader(token));

    expect(res.status).toBe(403);
  });

  it('allows admins to list users', async () => {
    const { token } = await createAuthenticatedUser({
      email: 'admin@nitj.ac.in',
      role: ROLES.ADMIN,
      mustChangePassword: false,
    });

    const res = await request(app)
      .get('/api/users')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users).toEqual(expect.any(Array));
  });

  it('blocks students from the verification queue', async () => {
    const { token } = await createAuthenticatedUser({
      email: 'student@nitj.ac.in',
      role: ROLES.STUDENT,
      mustChangePassword: false,
    });

    const res = await request(app)
      .get('/api/verification/pending')
      .set(authHeader(token));

    expect(res.status).toBe(403);
  });

  it('allows teachers to access the verification queue', async () => {
    const { token } = await createAuthenticatedUser({
      email: 'teacher@nitj.ac.in',
      role: ROLES.TEACHER,
      mustChangePassword: false,
    });

    const res = await request(app)
      .get('/api/verification/pending')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('allows admins to access audit logs', async () => {
    const { token } = await createAuthenticatedUser({
      email: 'admin@nitj.ac.in',
      role: ROLES.ADMIN,
      mustChangePassword: false,
    });

    const res = await request(app)
      .get('/api/audit')
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('blocks students from audit logs', async () => {
    const { token } = await createAuthenticatedUser({
      email: 'student@nitj.ac.in',
      role: ROLES.STUDENT,
      mustChangePassword: false,
    });

    const res = await request(app)
      .get('/api/audit')
      .set(authHeader(token));

    expect(res.status).toBe(403);
  });
});
