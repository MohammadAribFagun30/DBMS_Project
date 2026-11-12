import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { Role } from "../../../generated/prisma/enums";
import { eventSponsorController } from "./eventSponsor.controller";
import { createEventSponsorSchema, updateEventSponsorSchema } from "./eventSponsor.validations";

const router = Router();

router.get("/", auth(Role.ADMIN), eventSponsorController.getAll);
router.get("/:id", auth(Role.ADMIN), eventSponsorController.getById);
router.post("/", auth(Role.ADMIN), validateRequest(createEventSponsorSchema), eventSponsorController.create);
router.patch("/:id", auth(Role.ADMIN), validateRequest(updateEventSponsorSchema), eventSponsorController.update);
router.delete("/:id", auth(Role.ADMIN), eventSponsorController.remove);

export const eventSponsorRoutes = router;
