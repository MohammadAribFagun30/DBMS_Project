import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { eventController } from "./event.controller";
import { createEventSchema, updateEventSchema, updateEventStatusSchema } from "./event.validations";

const router = Router();

router.get("/", eventController.getAll);
router.get("/:id", eventController.getById);
router.post("/", auth(), validateRequest(createEventSchema), eventController.create);
router.patch("/:id", auth(Role.ADMIN), validateRequest(updateEventSchema), eventController.update);
router.patch("/:id/status", auth(Role.ADMIN), validateRequest(updateEventStatusSchema), eventController.updateStatus);
router.delete("/:id", auth(Role.ADMIN), eventController.remove);
router.get("/:id/registrations", auth(Role.ADMIN), eventController.getRegistrations);

export const eventRoutes = router;
