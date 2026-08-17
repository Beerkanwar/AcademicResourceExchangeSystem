const request = require('supertest');
const jwt = require('jsonwebtoken');
const {
  app,
  ROLES,
  authHeader,
  createAuthenticatedUser,
  createDepartment,
  createSubject,
  createPdfBuffer,
} = require('./helpers');
const { RESOURCE_STATUS } = require('../src/utils/constants');
const AuditLog = require('../src/models/AuditLog');
const Resource = require('../src/models/Resource');
const env = require('../src/config/env');

describe('Signed download URLs', () => {
  let department;
  let subject;

  beforeEach(async () => {
    department = await createDepartment();
    subject = await createSubject(department._id);
  });

  async function uploadApprovedResource() {
    const { user, token } = await createAuthenticatedUser({
      email: 'teacher-dl@nitj.ac.in',
      role: ROLES.TEACHER,
      mustChangePassword: false,
    });

    const res = await request(app)
      .post('/api/resources')
      .set(authHeader(token))
      .field('title', 'Signed Download Notes')
      .field('department', department._id.toString())
      .field('subject', subject._id.toString())
      .attach('file', createPdfBuffer('signed download content'), {
        filename: 'signed-notes.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe(RESOURCE_STATUS.APPROVED);
    return { user, token, resource: res.body.data };
  }

  it('rejects unauthenticated sign requests', async () => {
    const res = await request(app).get('/api/downloads/sign/507f1f77bcf86cd799439011');
    expect(res.status).toBe(401);
  });

  it('blocks direct /uploads access', async () => {
    const { token, resource } = await uploadApprovedResource();
    const res = await request(app)
      .get(`/uploads/${resource.storedFilename}`)
      .set(authHeader(token));

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/signed download/i);
  });

  it('signs a URL and streams the file through /api/downloads/file', async () => {
    const { user, token, resource } = await uploadApprovedResource();

    const signRes = await request(app)
      .get(`/api/downloads/sign/${resource._id}`)
      .set(authHeader(token));

    expect(signRes.status).toBe(200);
    expect(signRes.body.data).toMatchObject({
      fileId: resource._id,
      purpose: 'download',
      expiresIn: env.DOWNLOAD_SIGNED_URL_EXPIRES_IN,
    });
    expect(signRes.body.data.token).toBeTruthy();
    expect(signRes.body.data.url).toContain('/api/downloads/file?token=');

    const fileRes = await request(app).get(signRes.body.data.url);

    expect(fileRes.status).toBe(200);
    expect(fileRes.headers['content-type']).toMatch(/pdf/);
    expect(fileRes.headers['content-disposition']).toMatch(/attachment/);
    expect(fileRes.headers['cache-control']).toMatch(/no-store/);

    const updated = await Resource.findById(resource._id);
    expect(updated.downloads).toBe(1);

    const audit = await AuditLog.findOne({
      actor: user._id,
      action: 'resource_downloaded',
      targetId: resource._id,
    });
    expect(audit).toBeTruthy();
    expect(audit.ipAddress).toBeDefined();
  });

  it('legacy /api/resources/:id/download returns a signed URL', async () => {
    const { token, resource } = await uploadApprovedResource();

    const res = await request(app)
      .get(`/api/resources/${resource._id}/download`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.url).toMatch(/^\/api\/downloads\/file\?token=/);
    expect(res.body.data.token).toBeTruthy();

    const fileRes = await request(app).get(res.body.data.url);
    expect(fileRes.status).toBe(200);
  });

  it('preview purpose does not increment download count or write download audit', async () => {
    const { user, token, resource } = await uploadApprovedResource();

    const signRes = await request(app)
      .get(`/api/downloads/sign/${resource._id}?purpose=preview`)
      .set(authHeader(token));

    expect(signRes.status).toBe(200);
    expect(signRes.body.data.purpose).toBe('preview');

    const fileRes = await request(app).get(signRes.body.data.url);
    expect(fileRes.status).toBe(200);
    expect(fileRes.headers['content-disposition']).toMatch(/inline/);

    const updated = await Resource.findById(resource._id);
    expect(updated.downloads).toBe(0);

    const audit = await AuditLog.findOne({
      actor: user._id,
      action: 'resource_downloaded',
      targetId: resource._id,
    });
    expect(audit).toBeNull();
  });

  it('rejects expired or tampered tokens', async () => {
    const { token, resource } = await uploadApprovedResource();

    const signRes = await request(app)
      .get(`/api/downloads/sign/${resource._id}`)
      .set(authHeader(token));

    const goodToken = signRes.body.data.token;

    const tampered = `${goodToken.slice(0, -4)}xxxx`;
    const badSig = await request(app).get(
      `/api/downloads/file?token=${encodeURIComponent(tampered)}`
    );
    expect(badSig.status).toBe(401);

    const expired = jwt.sign(
      {
        type: 'download',
        fileId: resource._id,
        userId: '507f1f77bcf86cd799439011',
        purpose: 'download',
      },
      env.JWT_SECRET,
      { expiresIn: -10 }
    );
    const expiredRes = await request(app).get(
      `/api/downloads/file?token=${encodeURIComponent(expired)}`
    );
    expect(expiredRes.status).toBe(403);

    const missing = await request(app).get('/api/downloads/file');
    expect(missing.status).toBe(400);
  });

  it('denies signing pending resources for non-owners', async () => {
    const { token: studentToken } = await createAuthenticatedUser({
      email: 'uploader@nitj.ac.in',
      role: ROLES.STUDENT,
      mustChangePassword: false,
    });

    const uploadRes = await request(app)
      .post('/api/resources')
      .set(authHeader(studentToken))
      .field('title', 'Pending Notes')
      .field('department', department._id.toString())
      .field('subject', subject._id.toString())
      .attach('file', createPdfBuffer('pending'), {
        filename: 'pending.pdf',
        contentType: 'application/pdf',
      });

    expect(uploadRes.body.data.status).toBe(RESOURCE_STATUS.PENDING);

    const { token: otherToken } = await createAuthenticatedUser({
      email: 'other@nitj.ac.in',
      role: ROLES.STUDENT,
      mustChangePassword: false,
    });

    const denied = await request(app)
      .get(`/api/downloads/sign/${uploadRes.body.data._id}`)
      .set(authHeader(otherToken));

    expect(denied.status).toBe(403);

    const allowed = await request(app)
      .get(`/api/downloads/sign/${uploadRes.body.data._id}`)
      .set(authHeader(studentToken));

    expect(allowed.status).toBe(200);
  });
});
