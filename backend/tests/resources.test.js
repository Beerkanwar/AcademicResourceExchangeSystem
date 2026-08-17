const fs = require('fs');
const path = require('path');
const request = require('supertest');
const {
  app,
  ROLES,
  authHeader,
  createAuthenticatedUser,
  createDepartment,
  createSubject,
  createPdfBuffer,
  createPngBuffer,
} = require('./helpers');
const { RESOURCE_STATUS } = require('../src/utils/constants');
const Notification = require('../src/models/Notification');

describe('Resource upload & verification', () => {
  let department;
  let subject;

  beforeEach(async () => {
    department = await createDepartment();
    subject = await createSubject(department._id);
  });

  describe('Upload', () => {
    it('uploads a valid PDF for a student as pending', async () => {
      const { token } = await createAuthenticatedUser({
        email: 'student@nitj.ac.in',
        role: ROLES.STUDENT,
        mustChangePassword: false,
      });

      const res = await request(app)
        .post('/api/resources')
        .set(authHeader(token))
        .field('title', 'Algorithms Notes')
        .field('description', 'Unit 1 notes')
        .field('department', department._id.toString())
        .field('subject', subject._id.toString())
        .field('semester', '3')
        .attach('file', createPdfBuffer('lecture notes'), {
          filename: 'algorithms.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        title: 'Algorithms Notes',
        status: RESOURCE_STATUS.PENDING,
        fileType: 'pdf',
        mimeType: 'application/pdf',
      });
      expect(fs.existsSync(res.body.data.filePath)).toBe(true);
    });

    it('auto-approves uploads from teachers', async () => {
      const { token } = await createAuthenticatedUser({
        email: 'teacher@nitj.ac.in',
        role: ROLES.TEACHER,
        mustChangePassword: false,
      });

      const res = await request(app)
        .post('/api/resources')
        .set(authHeader(token))
        .field('title', 'Teacher Notes')
        .field('department', department._id.toString())
        .field('subject', subject._id.toString())
        .attach('file', createPdfBuffer('teacher content'), {
          filename: 'teacher-notes.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe(RESOURCE_STATUS.APPROVED);
    });

    it('rejects disallowed file extensions', async () => {
      const { token } = await createAuthenticatedUser({
        email: 'student@nitj.ac.in',
        role: ROLES.STUDENT,
        mustChangePassword: false,
      });

      const res = await request(app)
        .post('/api/resources')
        .set(authHeader(token))
        .field('title', 'Malicious')
        .attach('file', Buffer.from('MZ fake exe'), {
          filename: 'payload.exe',
          contentType: 'application/octet-stream',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not allowed/i);
    });

    it('rejects files whose content MIME does not match the extension', async () => {
      const { token } = await createAuthenticatedUser({
        email: 'student@nitj.ac.in',
        role: ROLES.STUDENT,
        mustChangePassword: false,
      });

      const res = await request(app)
        .post('/api/resources')
        .set(authHeader(token))
        .field('title', 'Spoofed PDF')
        .attach('file', createPngBuffer(), {
          filename: 'notes.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/does not match|not allowed|Unable to determine/i);

      const uploadDir = path.resolve(process.env.UPLOAD_DIR);
      const leftover = fs.existsSync(uploadDir) ? fs.readdirSync(uploadDir) : [];
      expect(leftover).toHaveLength(0);
    });

    it('requires authentication to upload', async () => {
      const res = await request(app)
        .post('/api/resources')
        .field('title', 'No Auth')
        .attach('file', createPdfBuffer(), {
          filename: 'notes.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('Verification', () => {
    async function uploadPendingResource() {
      const { token: studentToken, user: student } = await createAuthenticatedUser({
        email: 'student@nitj.ac.in',
        role: ROLES.STUDENT,
        mustChangePassword: false,
      });

      const uploadRes = await request(app)
        .post('/api/resources')
        .set(authHeader(studentToken))
        .field('title', 'Pending Resource')
        .field('department', department._id.toString())
        .field('subject', subject._id.toString())
        .attach('file', createPdfBuffer(`unique-${Date.now()}`), {
          filename: 'pending.pdf',
          contentType: 'application/pdf',
        });

      expect(uploadRes.status).toBe(201);
      return { resource: uploadRes.body.data, student };
    }

    it('lists pending resources for teachers', async () => {
      await uploadPendingResource();

      const { token: teacherToken } = await createAuthenticatedUser({
        email: 'teacher@nitj.ac.in',
        role: ROLES.TEACHER,
        mustChangePassword: false,
      });

      const res = await request(app)
        .get('/api/verification/pending')
        .set(authHeader(teacherToken));

      expect(res.status).toBe(200);
      expect(res.body.data.resources.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.resources[0].status).toBe(RESOURCE_STATUS.PENDING);
    });

    it('allows a teacher to approve a pending resource', async () => {
      const { resource, student: uploader } = await uploadPendingResource();

      const { token: teacherToken } = await createAuthenticatedUser({
        email: 'teacher@nitj.ac.in',
        role: ROLES.TEACHER,
        mustChangePassword: false,
      });

      const res = await request(app)
        .post(`/api/verification/${resource._id}/approve`)
        .set(authHeader(teacherToken));

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(RESOURCE_STATUS.APPROVED);
      expect(res.body.data.verifiedBy).toBeTruthy();

      const notification = await Notification.findOne({
        user: uploader._id,
        type: 'resource_approved',
      });
      expect(notification).toBeTruthy();
      expect(notification.message).toContain(resource.title);
      expect(notification.link).toBe(`/resources/${resource._id}`);
      expect(notification.read).toBe(false);
    });

    it('allows a teacher to reject a pending resource with a reason', async () => {
      const { resource, student: uploader } = await uploadPendingResource();

      const { token: teacherToken } = await createAuthenticatedUser({
        email: 'teacher@nitj.ac.in',
        role: ROLES.TEACHER,
        mustChangePassword: false,
      });

      const res = await request(app)
        .post(`/api/verification/${resource._id}/reject`)
        .set(authHeader(teacherToken))
        .send({ reason: 'Incomplete notes' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(RESOURCE_STATUS.REJECTED);
      expect(res.body.data.rejectionReason).toBe('Incomplete notes');

      const notification = await Notification.findOne({
        user: uploader._id,
        type: 'resource_rejected',
      });
      expect(notification).toBeTruthy();
      expect(notification.message).toContain(resource.title);
      expect(notification.message).toContain('Incomplete notes');
      expect(notification.link).toBe(`/resources/${resource._id}`);
    });

    it('blocks students from approving resources', async () => {
      const { resource } = await uploadPendingResource();

      const { token: otherStudentToken } = await createAuthenticatedUser({
        email: 'other@nitj.ac.in',
        role: ROLES.STUDENT,
        mustChangePassword: false,
      });

      const res = await request(app)
        .post(`/api/verification/${resource._id}/approve`)
        .set(authHeader(otherStudentToken));

      expect(res.status).toBe(403);
    });
  });
});
