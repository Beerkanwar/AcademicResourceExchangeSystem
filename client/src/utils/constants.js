export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

export const RESOURCE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const STATUS_COLORS = {
  pending: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning' },
  approved: { bg: 'bg-success/10', text: 'text-success', border: 'border-success' },
  rejected: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger' },
};

export const ROLE_COLORS = {
  admin: { bg: 'bg-danger/10', text: 'text-danger' },
  teacher: { bg: 'bg-info/10', text: 'text-info' },
  student: { bg: 'bg-success/10', text: 'text-success' },
};
