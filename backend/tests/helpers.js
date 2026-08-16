const createApp = require('../src/app');
const User = require('../src/models/User');
const Department = require('../src/models/Department');
const Subject = require('../src/models/Subject');
const AuthService = require('../src/services/authService');
const { ROLES } = require('../src/utils/constants');

const app = createApp();

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

async function createDepartment(overrides = {}) {
  return Department.create({
    name: overrides.name || 'Computer Science and Engineering',
    code: overrides.code || 'CSE',
    description: overrides.description || 'CSE Department',
    ...overrides,
  });
}

async function createSubject(departmentId, overrides = {}) {
  return Subject.create({
    name: overrides.name || 'Data Structures',
    code: overrides.code || 'CSE201',
    semester: overrides.semester || 3,
    department: departmentId,
    ...overrides,
  });
}

async function createUser({
  email,
  password = 'password123',
  role = ROLES.STUDENT,
  mustChangePassword = false,
  firstName = 'Test',
  lastName = 'User',
  rollNumber = '',
  department = undefined,
  isActive = true,
} = {}) {
  return User.create({
    email,
    password,
    role,
    mustChangePassword,
    firstName,
    lastName,
    rollNumber,
    department,
    isActive,
  });
}

async function loginAs(email, password = 'password123') {
  const result = await AuthService.login(email, password);
  return result.token;
}

async function createAuthenticatedUser(options = {}) {
  const email = options.email || `${options.role || 'student'}@test.nitj.ac.in`;
  const password = options.password || 'password123';
  const user = await createUser({ ...options, email, password });
  const token = await loginAs(email, password);
  return { user, token };
}

/** Minimal valid PDF bytes for magic-number detection */
function createPdfBuffer(content = 'NITJ test notes') {
  return Buffer.from(
    `%PDF-1.4
1 0 obj<< /Type /Catalog >>endobj
2 0 obj<< /Length ${content.length} >>stream
${content}
endstream
endobj
trailer<< /Root 1 0 R >>
%%EOF`,
    'utf8'
  );
}

/** Minimal 1x1 PNG for MIME mismatch tests */
function createPngBuffer() {
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
}

module.exports = {
  app,
  ROLES,
  authHeader,
  createDepartment,
  createSubject,
  createUser,
  loginAs,
  createAuthenticatedUser,
  createPdfBuffer,
  createPngBuffer,
};
