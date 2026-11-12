// Fields of the users table that are safe to return in responses.
export const userPublicSelect = {
  id: true,
  studentId: true,
  fullName: true,
  email: true,
  role: true,
  departmentId: true,
  createdAt: true,
} as const;
