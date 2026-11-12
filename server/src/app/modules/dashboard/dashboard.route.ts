import { Router } from "express";
import auth from "../../middleware/auth";
import { Role } from "../../../generated/prisma/enums";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get("/stats", auth(Role.ADMIN), dashboardController.getStats);

export const dashboardRoutes = router;
