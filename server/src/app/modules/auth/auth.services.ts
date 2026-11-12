import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/appError";
import { jwtUtils } from "../../utils/jwt";
import { createAuditLog } from "../../utils/logger";
import { userPublicSelect } from "../../utils/userSelect";

type RegisterPayload = {
  studentId: string;
  fullName: string;
  email: string;
  password: string;
  departmentId?: number;
};

const register = async (payload: RegisterPayload) => {
  const exists = await prisma.user.findFirst({
    where: { OR: [{ email: payload.email }, { studentId: payload.studentId }] },
  });
  if (exists) throw new AppError("Email or Student ID already registered", httpStatus.CONFLICT);

  const passwordHash = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds) || 10);

  // Public registration always creates a STUDENT. Admins are promoted via /api/users/:id/role.
  const user = await prisma.user.create({
    data: {
      studentId: payload.studentId,
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      departmentId: payload.departmentId ?? null,
    },
    select: userPublicSelect,
  });

  await createAuditLog(user.id, "USER_REGISTERED", "users", user.id);
  return user;
};

const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError("Invalid email or password", httpStatus.UNAUTHORIZED);
  }

  const accessToken = jwtUtils.createToken(
    { id: user.id, role: user.role },
    config.jwt_access_secret,
    config.jwt_access_expires_in
  );

  await createAuditLog(user.id, "USER_LOGIN", "users", user.id);

  const { passwordHash, ...safeUser } = user;
  return { accessToken, user: safeUser };
};

const getMe = (userId: number) =>
  prisma.user.findUnique({
    where: { id: userId },
    select: { ...userPublicSelect, department: true },
  });

export const authServices = { register, login, getMe };
