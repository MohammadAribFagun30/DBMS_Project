import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { auditLogController } from "./auditLog.controller";

const router = Router();

router.get("/", auth(Role.ADMIN), auditLogController.getAll);

export const auditLogRoutes = router;
