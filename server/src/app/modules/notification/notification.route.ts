import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { notificationController } from "./notification.controller";
import { sendNotificationSchema } from "./notification.validations";

const router = Router();

router.get("/my", auth(), notificationController.getMy);
router.patch("/read-all", auth(), notificationController.markAllRead);
router.patch("/:id/read", auth(), notificationController.markRead);
router.delete("/:id", auth(), notificationController.remove);
router.post("/", auth(Role.ADMIN), validateRequest(sendNotificationSchema), notificationController.send);

export const notificationRoutes = router;
