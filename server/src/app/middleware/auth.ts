import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import type { JwtPayload } from "jsonwebtoken";
import type { Role } from "../../generated/prisma/enums";
import catchAsync from "../utils/catchAsync";
import config from "../config";
import { jwtUtils } from "../utils/jwt";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        fullName: string;
        email: string;
        role: Role;
      };
    }
  }
}

// auth()               -> any logged-in user
// auth(Role.ADMIN)     -> admins only
const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token =
      req.cookies?.accessToken || (header?.startsWith("Bearer ") ? header.split(" ")[1] : header);

    if (!token) {
      throw new AppError("You are not logged in. Please login to access resources.", httpStatus.UNAUTHORIZED);
    }

    const verified = jwtUtils.verifyToken(token as string, config.jwt_access_secret);
    if (!verified.success) {
      throw new AppError(verified.error, httpStatus.UNAUTHORIZED);
    }

    const { id, role } = verified.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role as Role)) {
      throw new AppError("Forbidden. You don't have permission to access this resource", httpStatus.FORBIDDEN);
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      throw new AppError("User not found. Please login again.", httpStatus.UNAUTHORIZED);
    }

    req.user = { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
    next();
  });
};

export default auth;
