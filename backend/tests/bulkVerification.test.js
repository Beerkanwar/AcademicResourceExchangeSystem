const request = require('supertest');
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
const Notification = require('../src/models/Notification');
const AuditLog = require('../src/models/AuditLog');
const Resource = require('../src/models/Resource');

describe('Bulk verification actions', () => {
  let department;
  let subject;

  beforeEach(async () => {
    department = await createDepartment();
    subject = await createSubject(department._id);
  });

  async function uploadPending(emailSuffix) {
    const { token, user } = await createAuthenticatedUser({
      email: `student-${emailSuffix}@nitj.ac.in`,
      role: ROLES.STUDENT,
      mustChangePassword: false,
    });

    const res = await request(app)
      .post('/api/resources')
      .set(authHeader(token))
      .field('title', `Pending ${emailSuffix}`)
      .field('department', department._id.toString())
      .field('subject', subject._id.toString())
      .attach('file', createPdfBuffer(`bulk-${emailSuffix}-${Date.now()}`), {
        filename: `pending-${emailSuffix}.pdf`,
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(201);
    return { resource: res.body.data, user };
  }

  it('bulk-approves multiple pending resources with notifications and audits', async () => {
    const a = await uploadPending('a');
    const b = await uploadPending('b');

    const { token: teacherToken } = await createAuthenticatedUser({
      email: 'teacher-bulk@nitj.ac.in',
      role: ROLES.TEACHER,
      mustChangePassword: false,
    });

    const res = await request(app)
      .post('/api/admin/resources/bulk-action')
      .set(authHeader(teacherToken))
      .send({
        resourceIds: [a.resource._id, b.resource._id],
        action: 'approve',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.succeededCount).toBe(2);
    expect(res.body.data.failedCount).toBe(0);
    expect(res.body.data.succeeded).toEqual(
      expect.arrayContaining([a.resource._id, b.resource._id])
    );

    const updated = await Resource.find({
      _id: { $in: [a.resource._id, b.resource._id] },
    });
    expect(updated.every((r) => r.status === RESOURCE_STATUS.APPROVED)).toBe(true);

    const notifications = await Notification.find({
      type: 'resource_approved',
      user: { $in: [a.user._id, b.user._id] },
    });
    expect(notifications).toHaveLength(2);

    const audits = await AuditLog.find({
      action: 'resource_approved',
      targetId: { $in: [a.resource._id, b.resource._id] },
    });
    expect(audits).toHaveLength(2);
    expect(audits.every((log) => log.details?.bulk === true)).toBe(true);
  });

  it('bulk-rejects with a shared reason and reports partial failures', async () => {
    const a = await uploadPending('c');
    const b = await uploadPending('d');
    const fakeId = '507f1f77bcf86cd799439011';

    const { token: teacherToken } = await createAuthenticatedUser({
      email: 'teacher-bulk-reject@nitj.ac.in',
      role: ROLES.TEACHER,
      mustChangePassword: false,
    });

    // Approve one first so it is no longer pending
    await request(app)
      .post(`/api/verification/${b.resource._id}/approve`)
      .set(authHeader(teacherToken));

    const res = await request(app)
      .post('/api/admin/resources/bulk-action')
      .set(authHeader(teacherToken))
      .send({
        resourceIds: [a.resource._id, b.resource._id, fakeId],
        action: 'reject',
        reason: 'Bulk quality issues',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.succeededCount).toBe(1);
    expect(res.body.data.succeeded).toEqual([a.resource._id]);
    expect(res.body.data.failedCount).toBe(2);
    expect(res.body.data.failed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ resourceId: b.resource._id }),
        expect.objectContaining({ resourceId: fakeId }),
      ])
    );

    const rejected = await Resource.findById(a.resource._id);
    expect(rejected.status).toBe(RESOURCE_STATUS.REJECTED);
    expect(rejected.rejectionReason).toBe('Bulk quality issues');

    const notification = await Notification.findOne({
      user: a.user._id,
      type: 'resource_rejected',
    });
    expect(notification).toBeTruthy();
    expect(notification.message).toContain('Bulk quality issues');
  });

  it('requires a reason for bulk reject', async () => {
    const a = await uploadPending('e');
    const { token: teacherToken } = await createAuthenticatedUser({
      email: 'teacher-bulk-reason@nitj.ac.in',
      role: ROLES.TEACHER,
      mustChangePassword: false,
    });

    const res = await request(app)
      .post('/api/admin/resources/bulk-action')
      .set(authHeader(teacherToken))
      .send({
        resourceIds: [a.resource._id],
        action: 'reject',
        reason: '   ',
      });

    expect(res.status).toBe(400);
  });

  it('blocks students from bulk actions', async () => {
    const a = await uploadPending('f');
    const { token: studentToken } = await createAuthenticatedUser({
      email: 'student-bulk@nitj.ac.in',
      role: ROLES.STUDENT,
      mustChangePassword: false,
    });

    const res = await request(app)
      .post('/api/admin/resources/bulk-action')
      .set(authHeader(studentToken))
      .send({
        resourceIds: [a.resource._id],
        action: 'approve',
      });

    expect(res.status).toBe(403);
  });
});
